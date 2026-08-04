# AGENTS.md

Guida operativa per agenti AI (Claude Code, Cursor, OpenCode, ecc.) che lavorano su questo repository.

## Cosa fa questo progetto

Pipeline **resume-as-code** multi-CV:
- Input: uno o più JSON conformi a [JSON Resume](https://jsonresume.org/schema/) in `data/`
- Output: PDF (e HTML opzionale) per ogni CV, in IT e (opzionalmente) EN
- Stack: `resumed` CLI + Puppeteer + tema `jsonresume-theme-stackoverflow`
- Traduzione: OpenAI API o LLM locale (llama-server, OpenAI-compatible)

Un singolo CV = un singolo file `data/<stem>.json`. Lo stem è il nome del file senza `.json` (es. `firstname-lastname`, `martina-peracchini`).

## Mappa rapida del repo

```
draiver-resume-cli/
├── data/                          # CV sorgenti (gitignored tranne resume.example.json)
│   ├── resume.example.json        # template tracciato, da cui partire
│   ├── firstname-lastname.json            # CV l'utente
│   ├── firstname-lastname.en.json         # traduzione EN (gitignored)
│   ├── firstname-lastname.translateme.json # (gitignored, generato da --extract)
│   └── martina-peracchini.json    # CV Martina
├── output/                        # PDF/HTML generati (gitignored)
├── scripts/translate.cjs          # traduzione IT→EN multi-CV
├── doc/
│   ├── pdf-generation.md          # dettagli rendering
│   └── resume-schema.json         # schema JSON Resume locale
├── openspec/                      # snapshot storici delle change (NON toccare)
├── Makefile                       # orchestratore: build, pdf, validate, translate
└── package.json
```

## Convenzioni fisse (rispettare sempre)

### Naming file
- **NO suffisso `-cv`**: i file sono `data/<stem>.json`, MAI `data/<stem>-cv.json`
- Stem = `<first>-<last>` per CV personali, `<ruolo>` per CV generici
- File generati (gitignored): `<stem>.en.json`, `<stem>.translateme.json`, `output/<stem>.pdf`, `output/<stem>.en.pdf`

### `meta` standard obbligatorio in ogni JSON CV

Ogni `data/<stem>.json` deve avere:

```json
{
  "meta": {
    "language": "it",
    "themePackage": "jsonresume-theme-stackoverflow",
    "pdfRenderOptions": {
      "format": "A4",
      "margin": { "top": "1cm", "bottom": "1cm", "left": "1cm", "right": "1cm" }
    }
  }
}
```

Opzionale ma supportato: `meta.theme` (object) per colori/sectionOrder custom del tema.

### Auto-discovery Makefile
Il Makefile scopre i CV in `data/*.json` ed **esclude**:
- `*.en.json`, `*.translateme.json`
- `certifications*` (file di supporto, non CV)
- `resume.example.json` (template, non CV reale)

Se aggiungi un file in `data/`, viene pickato automaticamente. Se aggiungi un file che sembra un CV ma non vuoi che sia trattato come tale, rinominalo (es. `certifications` → `certs-data`).

## Comandi che userai

| Cosa vuoi fare | Comando |
|---|---|
| Vedere i CV scoperti | `make list` |
| Validare tutti i JSON | `make validate-all` |
| Validare un singolo CV | `make validate CV=<stem>` |
| Generare PDF per tutti | `make pdf-all` |
| Generare PDF per un CV | `make pdf CV=<stem>` |
| Generare HTML (mantiene file) | `make html CV=<stem>` |
| Tradurre un CV in EN | `make translate CV=<stem>` (OpenAI) o `make translate-local CV=<stem>` (llama-server) |
| Pulire artefatti | `make clean` |
| Pulire tutto + dipendenze | `make clean-all` |
| Rigenerare e ispezionare HTML | `KEEP_HTML=1 make pdf CV=<stem>` oppure `make debug` |

**Dopo OGNI modifica a un JSON**, esegui in sequenza:
```bash
make validate CV=<stem>
make pdf CV=<stem>
```
Poi ispeziona visivamente il PDF (`output/<stem>.pdf`) — il validatore non becca problemi di layout.

## Validazione qualitativa CV (skill `cv-quality-check`)

Skill di progetto in `.opencode/skills/cv-quality-check/SKILL.md` (indipendente da OpenSpec: non è una capability della pipeline, si invoca solo su richiesta).

- **Invocazione**: chiedi all'agente "valida la qualità del CV `<stem>` con la skill cv-quality-check" (input: `data/<stem>.json`)
- **Cosa verifica** (rubric "Dove sono le prove?"): P1 affermazioni generiche senza supporto, P2 ogni qualità provata da un'esperienza concreta, P3 risultati misurabili (numeri, obiettivi, miglioramenti), P4 contesto (scala azienda/sistema, complessità), P5 soft skill dimostrate con esempi, P6 self-check finale
- **Output**: report violazioni per scope dot-notation con severità `critical` / `minor` / `info` — la skill NON modifica i file CV
- **Quando usarla**: dopo modifiche al contenuto di un CV, prima di una candidatura, o per raccogliere le metriche mancanti (le evidenze mancanti sono elencate come domande da rispondere con dati reali, non vengono inventate)
- **Complementare a**: `make validate` (solo schema JSON) e ispezione visiva del PDF (solo layout)

## Gotchas noti (leggere prima di toccare codice)

### 1. `resumed validate` ha un bug su JSON invalidi
Su Node 20+, `npx resumed validate <file>` crasha con `TypeError: styleText` se il JSON ha errori. Funziona solo su JSON validi. **Workaround per validazione completa**:
```bash
node -e "
const v = require('jsonschema').validate;
const s = JSON.parse(require('fs').readFileSync('doc/resume-schema.json', 'utf8'));
const d = JSON.parse(require('fs').readFileSync('data/<stem>.json', 'utf8'));
const r = v(d, s);
console.log('valid:', r.valid);
r.errors.forEach(e => console.log('-', e.property, ':', e.message));
"
```

### 2. Immagini: SEMPRE data URI, MAI `file://`
`resumed` carica la pagina con `page.setContent(html)` → origin = `about:blank` → Chromium blocca `file://` per same-origin policy. Soluzione: embed dell'immagine come data URI base64 in `basics.image`:
```json
{ "basics": { "image": "data:image/jpeg;base64,<base64-encoding>" } }
```
Non provare a patchare `node_modules/resumed` (si perde a ogni `npm install`).

### 3. Puppeteer su Linux: serve `--no-sandbox`
Il Makefile aggiunge `SANDBOX_FLAG` automaticamente. Se lanci `npx resumed export` a mano, ricordati di passare `--puppeteer-arg=--no-sandbox`.

### 4. Output PDF pieno di HTML puliti
Di default `make pdf` cancella gli HTML dopo aver generato i PDF. Per ispezionare il rendering intermedio, usa `KEEP_HTML=1 make pdf CV=<stem>` o `make debug`.

### 5. `resumed` upstream è inattivo
`rbardini/resumed` non rilascia da 10 mesi (v6.1.0 = ultima release). Per swappare a un fork:
```bash
npm install github:<user>/<resumed-fork>#main
npm uninstall resumed
```
Il Makefile continua a funzionare (usa `npx $(RESUMED)`).

### 6. `scripts/translate.cjs` ha uno `STATIC_GLOSSARY` vuoto
È stato svuotato perché era hardcoded sul tech stack dell'utente. Per CV medici/di nicchia, i termini specifici (es. BLSD, PBLSD per Martina) non vengono protetti automaticamente — se servono, aggiungere un meccanismo per-CV glossary in `scripts/translate.cjs` (attualmente non esiste, ask se necessario).

## Workflow tipico per aggiungere un nuovo CV

1. Copia template: `cp data/resume.example.json data/<nuovo-stem>.json`
2. Modifica con dati reali
3. Aggiungi blocco `meta` standard (vedi sopra)
4. Aggiungi immagine come data URI se presente (NON `file://`)
5. `make validate CV=<nuovo-stem>` → fix errori
6. `make pdf CV=<nuovo-stem>` → genera PDF
7. Ispeziona visivamente `output/<nuovo-stem>.pdf`
8. (Opzionale) `make translate CV=<nuovo-stem>` per la versione EN
9. Commit SOLO il file `data/<nuovo-stem>.json` (gli `.en.json` e `.translateme.json` sono gitignored)

## Cose da NON fare

- ❌ Modificare `node_modules/` (si perde a ogni `npm install`)
- ❌ Modificare file in `openspec/` (snapshot storici, protetti)
- ❌ Committare `data/<stem>.json` se contiene dati personali reali (è gitignored ma verifica `.gitignore`)
- ❌ Committare `output/` o `data/*.en.json` (gitignored)
- ❌ Aggiungere il suffisso `-cv` ai nomi file
- ❌ Usare `file://` per le immagini
- ❌ Inventare dipendenze non in `package.json` (es. Puppeteer è già lì come sub-dep di `resumed`)
- ❌ Rimuovere `meta.pdfRenderOptions` dai JSON esistenti (lo standard è parte del contratto)
- ❌ Modificare `data/*-raw-cv-data.docx` (sono sorgenti raw originali dei CV, tenuti per reference; non usati dalla pipeline)

## Quando chiedere conferma

- Vuoi cambiare tema di default per tutti i CV
- Vuoi aggiungere una nuova sezione a `scripts/translate.cjs` (es. glossary per-CV)
- Vuoi toccare `node_modules/resumed` (patch + postinstall)
- Vuoi rinominare uno stem esistente (rompe la compat dei file EN già generati)
- Vuoi togliere lo standard `meta` da qualche CV

## Riferimenti interni

- [README.md](README.md) — entry point utenti
- [CONTRIBUTING.md](CONTRIBUTING.md) — come contribuire
- [doc/pdf-generation.md](doc/pdf-generation.md) — dettagli rendering
- [doc/resume-schema.json](doc/resume-schema.json) — schema JSON Resume locale
- [package.json](package.json) — dipendenze
- [Makefile](Makefile) — sorgente Makefile
- [CHANGELOG.md](CHANGELOG.md) — **gitignored**, storico modifiche CV (vedi sezione dedicata)
- [.opencode/skills/cv-quality-check/SKILL.md](.opencode/skills/cv-quality-check/SKILL.md) — skill di validazione qualitativa CV (rubric "Dove sono le prove?")

## Workflow CHANGELOG.md per modifiche CV

Ogni modifica al CV (in `data/martina-peracchini.json`, `data/luca-gobbi.json`,
`data/luca-gobbi.en.json`, o altri CV futuri in `data/`) **deve** essere registrata in
`CHANGELOG.md` alla radice del repo.

### Perché un changelog dedicato (e non il git log)

- I file in `data/` sono **gitignored** per privacy → `git log` non li traccia
- Abbiamo bisogno di uno storico strutturato per ricostruire l'evoluzione del CV
- Lo standard di riferimento per i changelog è [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) v1.1.0

### Formato di una riga

Ogni modifica produce **una sola riga** in `CHANGELOG.md`:

```
- <scope>: <descrizione sintetica>
```

- **scope** = path JSON in dot notation (es. `basics.email`, `publications[0]`, `work[3]`)
- **descrizione** = cosa è cambiato, ~120 caratteri max, no gergo

Se la modifica è troppo complessa (es. riscrittura completa di un work entry), si usa
un multi-linea con sub-bullet o si rimanda al diff git.

### Categorie (Conventional Commits-style)

- **Added**: nuovo campo, entry, file
- **Changed**: modifica a campo esistente
- **Removed**: campo o entry eliminato/a
- **Fixed**: bug fix (URL errato, formattazione rotta)

### Date e ordering

- Sezione più recente **in cima** (ordine discendente)
- Date in formato **ISO 8601** (`YYYY-MM-DD`)
- Modifiche multiple nello stesso giorno e stesso scope: **aggregare in un'unica riga**

### Quando aggiungere una riga

- ✅ Modifica di un campo esistente (rinominato, URL fixato, valore cambiato)
- ✅ Aggiunta/rimozione di un campo, una entry, un'evidenza
- ✅ Riordino di array
- ✅ Aggiornamento di keywords, highlights, descriptions
- ❌ Modifiche a `data/resume.example.json` (template tracciato, non è un CV reale)
- ❌ Modifiche a `doc/resume-schema.json` (è lo schema stesso, non un dato)
- ❌ Modifiche al solo rendering (template, Makefile) senza cambio nei dati CV

### Commit message per le modifiche CV

Usa [Conventional Commits](https://www.conventionalcommits.org/) con scope dedicato:

```
fix(cv-martina): PEC email moved to basics.email for icon visibility
feat(cv-luca): add draiver-resume-cli project
refactor(cv-martina): unify 3 Santo Spirito entries into 1
docs(cv-changelog): add CHANGELOG.md workflow section
```

Scope consigliati:
- `cv-martina` per modifiche a `data/martina-peracchini.json`
- `cv-luca` per modifiche a `data/luca-gobbi.json` e `data/luca-gobbi.en.json`
- `cv-changelog` per modifiche a `CHANGELOG.md` stesso

### Privacy: perché `CHANGELOG.md` è gitignored

`CHANGELOG.md` è **gitignored** (riga in `.gitignore`). Anche se non contiene PII
dirette (nome, email, telefono), descrive la **struttura** del CV in modo granulare,
rendendo possibile la ricostruzione automatica del profilo professionale. Meglio
tenerlo locale.

Il file vive come storico di lavoro per l'utente e l'agente che modifica i CV, ma non
viene versionato nel repo pubblico.

## Pre-push hook (gitleaks)

Il repo include un pre-push hook in `.githooks/pre-push` che blocca il push se trova secrets. Si attiva con:

```bash
make install-hooks
# oppure: git config core.hooksPath .githooks
```

- Se `gitleaks` è in PATH → scansiona prima di ogni push, blocca se trova leaks
- Se `gitleaks` non è installato → warning, push procede
- Bypass di emergenza: `git push --no-verify`
- CI-side: `.github/workflows/gitleaks.yml` scansiona anche su PR e schedule weekly

Per installare gitleaks: vedi la skill `~/.agents/skills/workspace-tooling/SKILL.md`.
