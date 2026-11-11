# SFMC Journey Builder su Netlify — progetto pulito

Due componenti nello stesso repository:

- **Custom Activity v3**: `https://sfmcustom.netlify.app/activity-v3/` — attivita' con `execute` e callback JWT.
- **Custom Entry Source v2**: `https://sfmcustom.netlify.app/entry-source-v2/` — wizard Postmonger per una Data Extension sendable esistente.

Leggi `GUIDA-VERSIONAMENTO-E-PULIZIA.md` prima di effettuare il deploy o eliminare le vecchie cartelle.

## Variabili Netlify
- `APP_URL=https://sfmcustom.netlify.app`
- `JB_ACTIVITY_KEY`: chiave del componente Journey Builder Activity, distinta da quella della Entry Source
- `JB_ENTRY_KEY=fda8fc62-adf5-4072-aab8-ea99092ad652`: chiave attuale della Entry Source come ricavata dal precedente HAR, da verificare nell'Installed Package
- `SFMC_JWT_SECRET`: segreto JWT usato solo dalle Function dell'Activity

Nessun secret va inserito nel frontend, nel config.json pubblico o nel repository.

## Test
- `/activity-v3/config.json` deve includere la chiave della Custom Activity e URL v3 HTTPS.
- `/entry-source-v2/config.json` deve includere la chiave della Entry Source e URL v2 HTTPS.
- `/entry-source-v2/index.html` deve rispondere con pagina HTML.
- Non cancellare le risorse legacy se ci sono Journey attive collegate ai vecchi URL.
