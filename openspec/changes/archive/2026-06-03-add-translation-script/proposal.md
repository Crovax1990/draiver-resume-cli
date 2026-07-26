## Why

Il CV italiano pulito (`firstname-lastname-cv.json`) è ora pronto come ground-truth, ma per il mercato internazionale serve una versione inglese (`firstname-lastname-cv.en.json`). La traduzione manuale è error-prone e non ripetibile; uno script automatizzato garantisce coerenza terminologica e permette rigenerazione su modifica del sorgente IT. Lo script sarà inoltre riutilizzabile per future traduzioni IT→EN di altri CV JSON Resume.

## What Changes

- Creazione di `scripts/translate.js` — script Node.js che legge `firstname-lastname-cv.json`, traduce i campi testuali dall'italiano all'inglese usando un LLM API, e scrive `firstname-lastname-cv.en.json`
- Aggiunta di dipendenze nel progetto: `package.json` con `openai` (SDK ufficiale OpenAI per chiamate LLM) e eventuali altre dipendenze
- Lo script implementa un JSON walker ricorsivo che:
  - Attraversa ricorsivamente il JSON identificando i campi da tradurre
  - Salta campi non traducibili (date, URL, email, phone, countryCode, keyword tecniche)
  - Traduce solo i valori stringa nei campi facoltativi (summary, highlights, position, name per work/education, description, ecc.)
  - Preseerva la struttura JSON identica al sorgente
- Lo script supporta fallback da OpenAI API a `@vitalets/google-translate-api` per ambiente offline/free
- Il file `firstname-lastname-cv.en.json` generato usa `meta.language: "en"` e mantiene `meta.theme: "even"`
- Aggiornamento del Makefile per target di traduzione (`make translate`)

## Capabilities

### New Capabilities
- `cv-translation`: Script Node.js per la traduzione automatizzata IT→EN di CV in formato JSON Resume, con walker ricorsivo, preservazione struttura, e fallback a traduzione gratuita

### Modified Capabilities
- `cv-data-cleaning`: Il Makefile viene esteso con nuovi target (`translate`, `html-en`, `pdf-en`) che dipendono dal file EN generato

## Impact

- **Nuovi file**: `scripts/translate.js`, `package.json`, `package-lock.json`
- **File generati**: `firstname-lastname-cv.en.json` (output dello script, aggiunto a `.gitignore` per evitare drift)
- **File modificati**: `Makefile` (aggiunta target `translate`, `html-en`, `pdf-en`)
- **Nuove dipendenze**: `openai` (npm), `@vitalets/google-translate-api` (npm, fallback), `dotenv` (npm, configurazione API key)
- **Requisiti sistema**: Node.js 18+ per esecuzione script; chiave API OpenAI per traduzione LLM (opzionale se si usa il fallback Google)
- **File esistenti non modificati**: `firstname-lastname-cv.json` rimane intatto come fonte di verità