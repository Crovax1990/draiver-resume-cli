## Context

Il repository parte come fork/derivazione di `jsonresume/resume-cli` ma si è specializzato come pipeline resume-as-code con traduzione IT→EN e rendering PDF/HTML. Attualmente è monouso: path hardcoded a `firstname-lastname-cv.json`, `.gitignore` con pattern specifici, nessuna documentazione di onboarding. Per renderlo un template pubblico che altri possano forkare e usare subito servono generalizzazione e documentazione.

Stato attuale di ciò che va modificato:
- `data/firstname-lastname-cv.json` — tracciato in git, contiene dati personali
- `Makefile` — variabili `RESUME_IT`, `RESUME_EN` hardcoded
- `scripts/translate.js` — costanti `SOURCE_FILE`, `OUTPUT_FILE`, `EXTRACT_FILE` hardcoded
- `.gitignore` — pattern specifici per `firstname-lastname-cv.*`
- Root — nessun README.md o CONTRIBUTING.md
- `doc/` — riferimenti a `firstname-lastname-cv.json`

## Goals / Non-Goals

**Goals:**
- Eliminare dati personali dal tracking git
- Fornire template resume di esempio (`resume.example.json`)
- Generalizzare Makefile, translate.js e .gitignore per funzionare con qualsiasi file JSON
- Documentare onboarding (README.md) e contribuzione (CONTRIBUTING.md)
- Aggiornare doc esistenti per coerenza

**Non-Goals:**
- NON cambiare il workflow di rendering (render-html.mjs, render-pdf.mjs già generici)
- NON modificare la struttura delle directory (già consolidata da artifact-organization)
- NON aggiungere nuove funzionalità di traduzione o rendering
- NON modificare la licenza o la configurazione npm di package.json

## Decisions

### 1. Nome del file di input generico: `data/resume.json`
**Scelta:** Il Makefile usa `RESUME := data/resume.json`. L'utente copia `data/resume.example.json` → `data/resume.json`.
**Alternativa considerata:** `data/cv.json` — meno standard nel ecosistema JSON Resume. `resume.json` è il nome canonico usato da upstream.
**Alternativa considerata:** Tenere variabile personalizzabile via CLI (`make pdf RESUME=data/mio.json`) — già supportata, la variabile `RESUME` è overrideabile.

### 2. Derivazione automatica dei nomi output
**Scelta:** `RESUME_EN` = `$(RESUME:.json=.en.json)`, `PDF` = `$(OUTPUT_DIR)/$(notdir $(RESUME:.json=.pdf))`.
**Perché:** L'utente specifica solo il sorgente; tutto il resto deriva. `make pdf RESUME=data/mio.json` produce `output/mio.pdf`.

### 3. .gitignore con pattern generici
**Scelta:** Pattern `data/resume.json`, `data/*.en.json`, `data/*.translateme.json`.
**Perché:** Copre il file utente e tutti i generati. `data/resume.example.json` (`.example` nel nome) non viene matchato.
**Alternativa considerata:** Ignorare tutto `data/*.json` eccetto `*.example.json` — più complesso, pattern espliciti sono più chiari.

### 4. Sample resume example minimale ma completo
**Scelta:** `resume.example.json` contiene tutte le sezioni JSON Resume (basics, work, education, skills, languages, projects, interests) con placeholder. Nessuna immagine base64. Include `meta.themePackage`.
**Perché:** L'utente deve poter testare `make pdf` subito dopo aver copiato il file.

## Risks / Trade-offs

| Rischio | Mitigazione |
|---------|-------------|
| Utenti esistenti con `data/firstname-lastname-cv.json` custom perdono il tracking git | `git rm --cached` mantiene il file localmente; istruzioni in README |
| Breaking change per chi ha forkato e modificato il Makefile | Versione bump in package.json; changelog nella commit |
| translate.js vecchi path rompono traduzioni automatiche | Aggiornamento diretto delle costanti; `--source=` override funziona sempre |
