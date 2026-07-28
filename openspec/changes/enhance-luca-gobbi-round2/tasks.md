## 1. Skills: compatta Jira + Jira Tempo

- [x] 1.1 In `data/luca-gobbi.json`, sezione `skills[4].Metodologie & Leadership`, sostituire le due keyword `"Jira"` e `"Jira Tempo"` con una singola keyword `"Jira + Tempo"`

## 2. Interests: aggiungi Bash Scripting

- [x] 2.1 In `data/luca-gobbi.json`, sezione `interests[0].Linux & Open Source Ecosystem`, aggiungere `"Bash Scripting"` all'array `keywords`

## 3. Projects: rinomina Famiglia730 → Dichiaro

- [x] 3.1 Cambiare il `name` da `"Famiglia730 — Dashboard Fiscale Familiare"` a `"Dichiaro"`
- [x] 3.2 Riscrivere la `description` con riferimento a 730/RedditiPF, import in blocco, proiezioni future e alert
- [x] 3.3 Riscrivere i 4 `highlights` esistenti in 8 highlights più dettagliati
- [x] 3.4 Aggiornare i 7 `keywords` con versioni più recenti (Python 3.12+, SQLAlchemy 2.0, PyMuPDF)
- [x] 3.5 Cambiare l'`url` da `https://github.com/Crovax1990/dichiarazione730-analyzer` a `https://github.com/Crovax1990/dichiaro`

## 4. Projects: aggiungi draiver-resume-cli

- [x] 4.1 Aggiungere un nuovo oggetto in coda all'array `projects` con `name: "draiver-resume-cli"`
- [x] 4.2 Includere `description` (pipeline resume-as-code, multi-CV, IT+EN)
- [x] 4.3 Includere 5 `highlights` (multi-CV, pipeline, traduzione, OpenSpec, PII-safe)
- [x] 4.4 Includere 9 `keywords` (Node.js, Makefile, resumed, theme, schema, OpenSpec, GitHub Actions, Puppeteer, OpenAI API)
- [x] 4.5 Includere `url: "https://github.com/Crovax1990/draiver-resume-cli"`

## 5. Validation & Render

- [x] 5.1 Eseguire validazione JSON contro schema v1.0.0 (`node -e "jsonschema.validate(...)"`)
- [x] 5.2 Rigenerare PDF IT (`make pdf CV=luca-gobbi`)
- [x] 5.3 Rigenerare PDF EN (`make pdf CV=luca-gobbi.en` automatico)
- [x] 5.4 Verifica visiva di skills, interests, projects su PDF

## 6. Cleanup

- [x] 6.1 Rimuovere `.openspec/luca-gobbi-r2-diff.md` (proposta temporanea, ora incorporata in questa change)
