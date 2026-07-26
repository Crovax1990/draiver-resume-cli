## Context

Il progetto `draiver-resume-cli` ha ora un CV italiano pulito e conforme allo schema (`firstname-lastname-cv.json`), uno script di traduzione (`scripts/translate.js`) che genera la versione inglese, e un Makefile parziale con solo i target di traduzione. La specifica `doc/spec-v1.md` definisce un'architettura Docker-based con `resume-cli` + tema `even` per validazione, rendering HTML/PDF e live preview. Il Makefile esistente va fuso con i nuovi target Docker mantenendo la retrocompatibilità dei target di traduzione.

Stato attuale dei file:
- `Makefile` — contiene solo target `translate`, `translate-fallback`, `html-en`, `pdf-en`, `clean-en`
- `package.json` — dipendenze Node.js per lo script di traduzione
- `scripts/translate.js` — script di traduzione IT→EN
- Mancano: `docker/Dockerfile`, `docker-compose.yml`
- Mancano: target Makefile per build Docker, validazione, rendering IT, preview

## Goals / Non-Goals

**Goals:**
- Creare il Dockerfile per l'immagine `local/resume-cli:latest` con Chromium e resume-cli
- Creare il docker-compose.yml con il servizio `resume`
- Fondere il Makefile esistente con i target della pipeline Docker (build, valid, html, pdf, serve, clean)
- Aggiungere target per rendering IT e EN (html, html-en, pdf, pdf-en)
- Aggiornare .gitignore con i file di output
- Implementare le direttive della specifica (verifica file sorgente, permessi volume, retry npm, porta 4000)

**Non-Goals:**
- Customizzazione del tema `even` (fuori scope)
- CI/CD pipeline automatizzata (futura)
- Supporto per altri temi oltre `even`
- Pubblicazione del CV su un hosting servizio (futuro)
- Containerizzazione dello script di traduzione Node.js (lo script gira localmente, non in Docker)

## Decisions

**1. Dockerfile: node:20-alpine con Chromium vs immagine Puppeteer pre-costruita**

Scelta: **node:20-alpine con installazione Chromium via apk**

Rationale: La specifica richiede esplicitamente `node:20-alpine` con Chromium installato tramite `apk`. Questo approccio evita il download dei binari Puppeteer (che sarebbero incompatibili con l'architettura host) e garantisce compatibilità. Le variabili `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` e `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser` assicurano che resume-cli usi il Chromium di sistema.

Alternativa scartata: Usare `ghcr.io/puppeteer/puppeteer` — più pesante, non allineata alla specifica, e il tema anche non richiede un browser headless complesso.

**2. Makefile: fusione vs file separati**

Scelta: **Makefile unificato** che include sia i target Docker (IT) sia i target di traduzione (EN).

Rationale: Il Makefile esistente ha solo 5 target. Invece di avere due Makefile separati o include complesse, uno singolo Makefile è più semplice da mantenere e allineato con la specifica che definisce tutti i target in un unico file. I target esistenti vengono preservati e integrati nel nuovo formato.

**3. Traduzione: locale vs Docker-wrapped**

Scelta: **Lo script di traduzione gira localmente** (`node scripts/translate.js`), non dentro il container Docker.

Rationale: Lo script richiede API key OpenAI e dipendenze npm che sono gia' installate localmente. Il container Docker serve per resume-cli, non per Node.js generico. I target `translate` e `translate-fallback` nel Makefile usano `node` locale, mentre i target di rendering usano `docker compose run`.

**4. Flag --no-sandbox per PDF rendering**

Scelta: **Passare `--no-sandbox` ai target PDF** sia IT che EN, come specificato in `doc/spec-v1.md`.

Rationale: Il container Docker gira come root per default. Chromium rifiuta di partire senza `--no-sandbox` in questi contesti. La specifica lo richiede esplicitamente.

## Risks / Trade-offs

- **[Rischio] Permessi file Docker volume**: I file generati dal container Docker saranno di proprietà root → Mitigazione: aggiungere `-u $(shell id -u):$(shell id -g)` al docker compose run per mantenere i permessi dell'utente host
- **[Rischio] Porta 4000 occupata**: Il target `serve` fallira' se la porta 4000 e' gia' in uso → Mitigazione: il Makefile include un check opzionale con `lsof` prima di avviare il serve (come suggerito dalla specifica, sezione 5.4)
- **[Trade-off] Dimensione immagine Docker**: L'immagine include Chromium e dipendenze (~300MB) → Accettabile: e' un'immagine di build monouso, non un servizio in produzione
- **[Rischio] npm install fallisce per timeout**: La specifica suggerisce retry logic per npm install → Mitigazione: il Dockerfile usa `--unsafe-perm` e potrebbe essere esteso con un retry wrapper; per ora si affida al meccanismo di retry di Docker stesso
- **[Rischio] Compatibilità tema anche**: Il tema `jsonresume-theme-even` deve essere compatibile con la versione di resume-cli installata → Mitigazione: entrambi installati nello stesso `npm install -g` garantendo compatibilità

## Open Questions

- I target `html-en` e `pdf-en` devono dipendere dal target `translate` (mandando la traduzione prima del rendering) o assumere che il file EN sia gia' presente? Il design attuale usa dipendenze Make (`html-en: firstname-lastname-cv.en.json`), che triggera la traduzione solo se il file EN manca.
- Il Dockerfile deve includere anche le dipendenze npm per lo script di traduzione? No — lo script gira localmente, non in Docker.