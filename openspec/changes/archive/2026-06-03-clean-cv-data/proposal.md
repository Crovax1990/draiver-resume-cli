## Why

Il file `firstname-lastname-cv.json` contiene artefatti di citation `[cite: 1]` in ogni campo testuale, valori non conformi allo schema JSON Resume (come `"Attuale"` per i campi data), e dati incompleti (immagine vuota, profilo GitHub mancante, sezione `interests` assente). Il CV non può essere validato né renderizzato correttamente da `resume-cli` nello stato attuale. Questa change prepara il ground-truth italiano pulito da cui derivare la versione inglese e avviare la pipeline Docker di rendering.

## What Changes

- Rimozione sistematica di tutti i suffissi `[cite: 1]` da ogni valore testuale nel JSON
- Omissione del campo `endDate` per ruoli/periodi correnti (sostituisce `"Attuale"` con campo assente, conforme allo schema)
- Impostazione di `basics.image` a `"placeholder.png"` come placeholder per la foto
- Semplificazione dell'indirizzo fisico a `"Campi Bisenzio (FI), Toscana, Italia"`
- Formattazione internazionale del telefono: `+39 329 141 5445`
- Correzione URL LinkedIn a `https://www.linkedin.com/in/firstname-lastname-12345/`
- Aggiunta profilo GitHub (`your-username`) alla sezione `profiles`
- Riscrittura del `summary` per enfatizzare: llm-wiki, OpenSpec, Opencode, GitHub Copilot CLI, smart-sales-calendar, full-stack tecnologico
- Aggiornamento sezione `skills` con enfasi su AI & Agentic Development (MCP, OpenSpec, Opencode, GitHub Copilot CLI) e aggiunta di React, Rust, TypeScript, SQLite
- Sostituzione sezione `projects` con massimo 2 progetti: Autonomous Educational Generator e Smart Sales Calendar
- Aggiunta sezione `interests` con Agentic AI & LLM Infrastructure e Cycling & Outdoor
- Aggiunta sezione `meta` con `theme: "even"`, `language: "it"`, `version: "v1.0.0"`
- Creazione file `placeholder.png` come immagine placeholder temporanea

## Capabilities

### New Capabilities
- `cv-data-cleaning`: Pulizia e normalizzazione del file JSON Resume esistente per conformità allo schema, rimozione artefatti, arricchimento con dati dal profilo GitHub
- `cv-data-enrichment`: Arricchimento del CV con sezioni mancanti (interests, meta, GitHub profile) e riscrittura di summary/skills/projects per enfatizzare gli argomenti richiesti

### Modified Capabilities


## Impact

- **File modificato**: `firstname-lastname-cv.json` (riscrittura sostanziale di quasi ogni sezione)
- **Nuovo file**: `placeholder.png` (immagine placeholder per `basics.image`)
- **Impatto downstream**: Il JSON pulito diventa il ground-truth italiano per lo script di traduzione IT→EN (change successiva)
- **Validazione**: Dopo la pulizia, il file deve superare `resume test` (validazione schema JSON Resume)
- **Dipendenze**: Nessuna dipendenza da codice esistente; il JSON è il punto di partenza per l'intera pipeline