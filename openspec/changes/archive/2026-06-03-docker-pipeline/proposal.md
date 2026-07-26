## Why

Il progetto ha ora un CV italiano pulito (`firstname-lastname-cv.json`) e uno script di traduzione funzionante, ma manca l'infrastruttura Docker per renderizzare il CV in HTML/PDF e validarlo contro lo schema JSON Resume. La specifica `doc/spec-v1.md` definisce chiaramente l'architettura target: un container Docker con `resume-cli`, Chromium per il rendering PDF, e un Makefile che orchestri build, validazione, esportazione e preview. Il Makefile esistente contiene solo i target di traduzione (`translate`, `html-en`, `pdf-en`) e va integrato con i target della pipeline Docker.

## What Changes

- Creazione di `docker/Dockerfile` basato su `node:20-alpine` con Chromium, dipendenze di sistema, e installazione globale di `resume-cli` + `jsonresume-theme-even`
- Creazione di `docker-compose.yml` con servizio `resume` che monta il workspace, espone la porta 4000, e configura le variabili d'ambiente per Puppeteer
- **BREAKING**: Riscrittura completa del `Makefile` esistente per unire i target di traduzione (gia' presenti) con i target della pipeline Docker (build, valid, html, pdf, serve, clean) definiti nella specifica
- Aggiunta di target Docker-wrapped per validazione, rendering HTML/PDF (IT e EN), e live preview
- Aggiornamento del `.gitignore` con le entry per i file di output Docker

## Capabilities

### New Capabilities
- `docker-rendering`: Infrastruttura Docker per rendering e validazione del CV tramite resume-cli con tema even, inclusi Dockerfile, docker-compose.yml, e Makefile target per build/valid/html/pdf/serve

### Modified Capabilities
- `cv-data-cleaning`: Il Makefile viene ulteriormente esteso con i target Docker per validazione e rendering IT (valid, html, pdf, serve) e il target clean viene aggiornato per rimuovere tutti gli output
- `cv-translation`: Il Makefile gia' esistente viene fuso nel Makefile unificato, mantenendo i target translate/html-en/pdf-en/clean-en esistenti

## Impact

- **Nuovi file**: `docker/Dockerfile`, `docker-compose.yml`
- **File modificato**: `Makefile` (riscrittura completa — fusione dei target esistenti con i nuovi target Docker)
- **File modificato**: `.gitignore` (aggiunta entry per output Docker)
- **Dipendenze sistema**: Docker e Docker Compose devono essere installati sull'host per eseguire i target di rendering
- **Compatibilità**: I target `translate` e `translate-fallback` esistenti vengono preservati; i nuovi target Docker non sostituiscono i comandi locali ma li avvolgono in container