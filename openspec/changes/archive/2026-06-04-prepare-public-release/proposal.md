## Why

Il repository contiene dati personali (CV di l'utente) e path hardcoded che impediscono di pubblicarlo come template pubblico per collaboratori. Serve ripulire i dati riservati, generalizzare l'infrastruttura e fornire documentazione di onboarding (README, CONTRIBUTING) per attrarre contributor.

## What Changes

- Rimuovere `data/firstname-lastname-cv.json` dal tracking git (dati personali)
- Aggiungere `data/resume.example.json` come template di esempio
- Generalizzare il Makefile: variabili derivate automaticamente dal nome del file JSON in input
- Aggiornare `scripts/translate.js` con path generici (`resume.json`)
- Aggiornare `.gitignore` con pattern generici
- Creare `README.md` con riferimento a jsonresume/resume-cli, schema, temi, e workflow
- Creare `CONTRIBUTING.md` per guidare i collaboratori
- Aggiornare `doc/pdf-generation.md` e `doc/capabilities.md` con i nuovi path

## Capabilities

### New Capabilities
- `repo-publication`: Preparazione del repository per pubblicazione open-source — pulizia dati sensibili, generalizzazione path, documentazione di onboarding (README, CONTRIBUTING), template resume di esempio

### Modified Capabilities
- `artifact-organization`: Requirements update — `.gitignore` passa da pattern espliciti (`firstname-lastname-cv.*`) a pattern generici; `data/` ora contiene `resume.example.json` come template tracciato e `resume.json` come file utente gitignorato
- `theme-configuration`: Requirements update — riferimenti nei doc aggiornati da `firstname-lastname-cv.json` a `resume.json`

## Impact

| Area | Impatto |
|------|---------|
| `data/firstname-lastname-cv.json` | Rimosso dal tracking git (il file esiste ancora localmente ma non viene più tracciato) |
| `scripts/translate.js` | Path costanti aggiornate da `firstname-lastname-cv.*` a `resume.*` |
| `Makefile` | Variabili rinominate: `RESUME_IT` → `RESUME`, `PDF_IT` → `PDF`; nomi derivati automaticamente |
| `.gitignore` | Pattern specifici sostituiti con generici |
| Root directory | Nuovi file: `README.md`, `CONTRIBUTING.md` |
| `data/` | Nuovo file: `resume.example.json` |
| `doc/` | Riferimenti aggiornati nei file esistenti |
