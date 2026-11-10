# Journey Builder Custom Activity su Netlify (Node.js Functions)

Demo derivata dal progetto Heroku: la UI e Postmonger sono statici, le API sono Netlify Functions. **Non usare `server.js`/Express/app.listen`: Netlify non è un server tradizionale.**

## Cosa fa
- `/activity/` e `/activity/index.html`: finestra HTML che Journey Builder apre, con Postmonger.
- `/activity/config.json`: JSON dinamico generato dalla Function `config` tramite rewrite Netlify.
- `/.netlify/functions/execute`: riceve e valida un JWT HS256, legge `inArguments`, logga soltanto la presenza di ContactKey e message e risponde 200.
- `/.netlify/functions/lifecycle?event=save|validate|publish|stop|unpublish`: valida JWT e conferma le azioni.

## Pubblicazione tramite GitHub e Netlify
1. Crea un repository GitHub privato o pubblico. Non includere `.env` o segreti nel repository.
2. Carica **il contenuto di questa cartella**, includendo `public`, `netlify` (Functions e moduli condivisi), `netlify.toml`, `package.json`.
3. Netlify Dashboard → Add new project → Import an existing project → GitHub → seleziona repo.
4. Impostazioni build: **Publish directory = `public`**, **Functions directory = `netlify/functions`**, build command vuoto (oppure `npm install`). Netlify installa automaticamente le dipendenze se trova `package.json`.
5. Seleziona piano Free, pubblica. Prendi nota dell'URL, ad es. `https://sfmc-demo.netlify.app`.
6. Netlify → Site/Project configuration → Environment variables → Add a variable:
   - `APP_URL` = `https://sfmc-demo.netlify.app` (senza slash finale)
7. Se non si è già attivato un deploy dopo la modifica, esegui **Trigger deploy**.
8. Verifica in browser:
   - `https://sfmc-demo.netlify.app/activity/`
   - `https://sfmc-demo.netlify.app/activity/config.json`
   - `https://sfmc-demo.netlify.app/.netlify/functions/execute` (con GET deve restituire 405, NON 404)

## Marketing Cloud Engagement
1. Vai nella BU di test → Setup → Apps → Installed Packages → New.
2. Add Component → Journey Builder Activity; configura Name e Category = `Custom`.
3. Endpoint URL = `https://sfmc-demo.netlify.app/activity/` (la cartella, **non** il file `config.json`).
4. Recupera dal package la **Unique Key** del componente e il **JWT Signing Secret**.
5. Su Netlify aggiungi due Environment variables (scope di runtime Functions):
   - `JB_ACTIVITY_KEY` = la Unique Key
   - `SFMC_JWT_SECRET` = il JWT Signing Secret (non il Client Secret OAuth!)
6. Riprova `.../activity/config.json` e controlla che `applicationExtensionKey` sia la Unique Key, e che tutti gli URL siano HTTPS `netlify.app`.
7. Crea una Journey di test, trascina la Custom Activity, configura `message`, salva, valida e attiva con contatti fittizi.
8. Controlla i log in Netlify → Logs/Functions.

## Test locale
Richiede Node.js 20+, npm e Netlify CLI.

```bash
npm install
npm install -g netlify-cli
# copia .env.example in .env e inserisci chiavi locali adeguate
netlify dev
```

Prova `/activity/config.json` su `http://localhost:8888`. Per Marketing Cloud, serve invece un dominio **pubblico HTTPS**.

## Note importanti
- `/execute` su Netlify è `/.netlify/functions/execute` (non la route Express `/execute`).
- `useJwt: true`: ogni chiamata operativa richiede una firma JWT valida; senza segreto ottieni 503, senza token 401.
- Il token può essere postato come testo semplice, JSON `{ "JWT": "..." }` oppure form-urlencoded `JWT=...`.
- Le Functions sono stateless: non conservare stato in variabili di processo o filesystem. Per persistenza usare un datastore esterno.
- Questa demo NON chiama API esterne e NON è adatta da sola alla produzione: valutare gestione errori, deduplicazione, limiti, tempi, privacy, rate limit e disponibilità dell'hosting.
- Netlify Free usa crediti e ha un limite rigido mensile. Una Journey ad alto volume può superarlo e bloccare le esecuzioni.
- Il file `config.json` è pubblico e NON deve contenere segreti.
- Per una funzione asincrona di business, non confermare a Journey Builder l'avvenuta elaborazione finché non sia realmente avvenuta o sia stata durabilmente accodata.

## Documentazione
- https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/creating-activities.html
- https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/custom-activity-config.html
- https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/encode-custom-activities-using-jwt-app-signature.html
- https://docs.netlify.com/build/functions/get-started/
- https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/

## Correzione v2 — registrazione attività
Questa versione include `key` al livello principale di `config.json`, oltre a `configurationArguments.applicationExtensionKey`. Entrambi vengono compilati da `JB_ACTIVITY_KEY` e devono coincidere con la **Unique Key del componente Journey Builder Activity**, non con l'ID o il Client Secret dell'Installed Package.

Se Journey Builder mostra «Failed to load custom activity configuration (endpoint index URL is invalid)», ricontrolla nel componente Salesforce che **Endpoint URL** sia esattamente `https://TUO-SITO.netlify.app/activity/` e non `.../activity/index.html` oppure `.../activity/config.json`. Pubblica il commit aggiornato su Netlify e, dopo il deploy, verifica il JSON pubblico.
