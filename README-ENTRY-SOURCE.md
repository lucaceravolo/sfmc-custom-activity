# Custom Entry Source Netlify v1 — aggiunta non distruttiva

Questa è una **base di sviluppo verificata sintatticamente**, non ancora testata all'interno di una BU Salesforce reale. È stata creata sulla struttura dell'archivio `sfmc-custom-activity-netlify-diagnostica-v3.zip` precedentemente consegnato.

## 0. Scopo e limiti

- NON modifica la tua Custom Activity su `/activity-v3/`.
- Aggiunge un editor Custom Entry Source basato su Postmonger (`initEvent`, `updateEvent`).
- Nel wizard si inserisce l'**ObjectID** di una Data Extension sendable esistente: **NON** la CustomerKey/External Key.
- Passa `dataExtensionId` al livello ROOT del payload `updateEvent` (requisito Salesforce).
- NON crea una Data Extension, NON invia contatti automaticamente, NON crea un'autenticazione OAuth sul browser.
- Per inviare gli ingressi si usa la REST API Marketing Cloud `/interaction/v1/events`, direttamente da un client/server autorizzato.
- Non include callback lifecycle, che non sono obbligatori per la dimostrazione base di Custom Event.

## 1. Aggiungi i file

Copia NELLA ROOT DEL REPOSITORY i seguenti nuovi file:

```
public/entry-source-v1/index.html
public/entry-source-v1/customEvent.js
public/entry-source-v1/images/icon.svg
netlify/lib/entry-config.mjs
netlify/functions/config-entry.mjs
```

**Non sostituire** `public/activity-v3/`, `netlify/functions/execute.mjs`, `netlify/functions/lifecycle.mjs`, `netlify/lib/base-config.mjs`.

## 2. Modifica UNA SOLA SEZIONE del tuo `netlify.toml`

In FONDO al file aggiungi, preservando le regole attuali:

```toml
[[redirects]]
  from = "/entry-source-v1/config.json"
  to = "/.netlify/functions/config-entry"
  status = 200
  force = true
```

## 3. Variabile d'ambiente

Mantieni **inalterate** `APP_URL`, `JB_ACTIVITY_KEY`, `SFMC_JWT_SECRET`.

Aggiungi una nuova variabile Netlify:

```
JB_ENTRY_KEY=<UNIQUE KEY DEL NUOVO COMPONENTE ENTRY SOURCE>
```

Questa chiave è DIFFERENTE da `JB_ACTIVITY_KEY` e DIFFERENTE da `EventDefinitionKey`.

Per evitare il problema di JSON salvato con chiave fittizia incontrato in passato, `config-entry.mjs` restituisce **503** fino alla configurazione di `JB_ENTRY_KEY`, anziché pubblicare una configurazione sbagliata. Prima di registrare il componente, prepara il deploy; poi registra la sorgente, ottieni la Unique Key, configura la variabile e ripubblica. Se Salesforce conserva una configurazione errata, usa un NUOVO percorso versionato dopo il completamento delle variabili (come già fatto per la Custom Activity v3).

## 4. URLs da verificare dopo il deploy

- https://sfmcustom.netlify.app/entry-source-v1/
- https://sfmcustom.netlify.app/entry-source-v1/index.html
- https://sfmcustom.netlify.app/entry-source-v1/config.json
- https://sfmcustom.netlify.app/entry-source-v1/images/icon.svg

`config.json` deve contenere `type: EVENT`, `key` e `configurationArguments.applicationExtensionKey` entrambi uguali a `JB_ENTRY_KEY`, e `userInterfaces.configModal.url` con HTTPS.

## 5. Configurazione Salesforce

1. In Business Unit di test crea prima una **Data Extension sendable** con campi: `SubscriberKey` Text(100) (sendable verso Subscriber Key), `Email` EmailAddress, `message` Text(500). Utilizza solo contatti di test.
2. Recupera **Data Extension ObjectID GUID**, non External Key. Se la UI non lo mostra, usane la Retrieve SOAP API (oggetto `DataExtension`, proprietà `ObjectID`) oppure un tool autorizzato.
3. Marketing Cloud > Setup > Apps > Installed Packages > il package già esistente.
4. **Add Component > Journey Builder Entry Source**. Nome: `External API Entry Source`; Endpoint URL: `https://sfmcustom.netlify.app/entry-source-v1/`.
5. Salva e copia **Unique Key** del nuovo componente (non copiare quella della Activity).
6. Imposta `JB_ENTRY_KEY` su Netlify con la Unique Key; redeploy.
7. Verifica che il `config.json` pubblico abbia chiavi e URL corretti. Se Salesforce avesse già memorizzato una vecchia config, registra una route versionata pulita anziché ricreare ripetutamente componenti.
8. In una NUOVA Journey di test seleziona la `External API Entry Source`. Nel wizard inserisci il GUID ObjectID della Data Extension. Completa gli eventuali passi aggiuntivi di Salesforce, salva e prova a validare la Journey.

> **Nota di compatibilità:** il framework Journey Builder ha varianti tra account/tenant. Il contratto di `updateEvent` con `dataExtensionId` è documentato, ma la semplice associazione di una DE esistente potrebbe richiedere ulteriori proprietà del trigger o Event Definition. Senza accesso a un tenant non posso garantire la pubblicazione di una Journey reale. Per questo considera questo codice un primo prototipo e verifica la risposta di `initEvent`, `updateEvent` ed eventuali errori di validazione nel Network.

## 6. API: inviare un contatto alla Journey dopo aver attivato l'evento

A) Crea un componente API Integration server-to-server **con i permessi necessari** nel Package (eventualmente separato). Conserva ID/secret solo nel client server-side o in Postman; MAI in `index.html`/`customEvent.js`.

B) Richiedi token:

```
POST https://YOUR_AUTH_SUBDOMAIN.auth.marketingcloudapis.com/v2/token
Content-Type: application/json

{ "grant_type":"client_credentials", "client_id":"...", "client_secret":"...", "account_id": 12345678 }
```

Usa `rest_instance_url` restituito dall'autenticazione.

C) Recupera la vera **Event Definition Key** da Journey Builder (Event Administration/configurazione), dopo aver creato e salvato l'entry event. NON usare `JB_ENTRY_KEY`.

D) Invia con Postman o sistema esterno:

```
POST {rest_instance_url}/interaction/v1/events
Authorization: Bearer {access_token}
Content-Type: application/json; charset=UTF-8
```

Il body è in `examples/fire-event.json` e va adattato allo schema reale della Data Extension. `201 Created` con `eventInstanceId` conferma l'accettazione, ma l'effettivo ingresso dipende anche dalle regole di re-entry e dallo stato della Journey.

## 7. Debug

- **Config 503:** manca `JB_ENTRY_KEY` (atteso prima di impostarlo).
- **Config con localhost:** `APP_URL` errata o non disponibile alla Function.
- **Config valida ma errore in Journey Builder:** controlla `GET /applicationExtensions/activities` / risposta della registrazione, come fatto per la v3.
- **Next disabilitato:** l'ObjectID non ha il formato GUID; deve anche esistere realmente e essere compatibile.
- **Journey non si attiva:** verificare Data Extension sendability, Event Definition, payload `updateEvent` e messaggi della validazione. La `dataExtensionId` da sola non assicura che l'account supporti esattamente la stessa configurazione.
- **API 400:** controlla EventDefinitionKey, stato del contatto, nomi/tipi campi della DE.

## Documentazione Salesforce

- https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/creating-events.html
- https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/internationalize-events.html
- https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/using-postmonger
- https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/define-jb-extension-app-center.html
- https://developer.salesforce.com/docs/marketing/marketing-cloud/references/mc_rest_interaction/postEvent.html
