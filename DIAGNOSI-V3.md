# Endpoint di diagnostica v3 per Salesforce Journey Builder

Questa variante crea un endpoint indipendente:

- `https://sfmcustom.netlify.app/activity-v3/` (index.html statico)
- `https://sfmcustom.netlify.app/activity-v3/config.json` (Netlify Function `config-v3`)
- `https://sfmcustom.netlify.app/activity-v3/images/icon.svg` (icona)

La logica `execute` e `lifecycle` è invariata. Il nuovo `config.json` punta a
`activity-v3/index.html` per la finestra di configurazione. La variabile
`JB_ACTIVITY_KEY` deve restare uguale alla Unique Key del componente SFMC
che si vuole diagnosticare, attualmente:
`eaa738a7-825e-44a0-abe1-ab8bf17d7928`.

1. Pubblica questo progetto sullo STESSO sito Netlify (stesse environment variables).
2. Verifica `activity-v3/config.json` e assicurati che `key`,
   `configurationArguments.applicationExtensionKey`, `icon`, `configModal.url`
   puntino alla nuova configurazione; non devono esserci `localhost` o `SET_UNIQUE_KEY`.
3. In SFMC modifica **solo** Endpoint URL del componente v2 esistente in
   `https://sfmcustom.netlify.app/activity-v3/` e salva.
4. Riapri Journey Builder su una nuova Journey di test e controlla nel Network
   `/applicationExtensions/activities` e il record relativo alla Unique Key.
5. Se il JSON resta obsoleto anche cambiando l'endpoint, non creare nuovi
   componenti in serie: documenta la risposta e apri un caso Salesforce.

NOTA: non è garantito che la modifica dell'Endpoint URL aggiorni la config
che Salesforce ha già memorizzato. Serve come test diagnostico mirato.
