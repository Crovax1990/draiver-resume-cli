# draiver-resume-cli

Pipeline **resume-as-code**: genera CV in PDF partendo da JSON conformi allo schema [JSON Resume](https://jsonresume.org/schema/), con traduzione automatica IT→EN.

Tema di rendering: **`jsonresume-theme-stackoverflow`** (configurabile via `THEME` nel Makefile).

- **Multi-CV**: supporta qualsiasi numero di CV in `data/`, scoperti automaticamente
- **2 output per CV**: `.pdf` (IT) + `.en.pdf` (EN, se la traduzione esiste)
- **HTML come intermedio**: generato e poi cancellato automaticamente
- **Flag `KEEP_HTML=1`** (o `make debug`): mantiene gli HTML per ispezione
- **Traduzione IT→EN** via OpenAI API o LLM locale (llama-server)
- **Fork-friendly** sul rendering engine: swap a un fork di `resumed` con un `npm install`

> **Agenti AI**: vedi [AGENTS.md](AGENTS.md) per la guida operativa al repository (convenzioni, gotchas, workflow).
> **Contributori umani**: vedi [CONTRIBUTING.md](CONTRIBUTING.md).

## Quick Start

```bash
# 1. Prepara i tuoi dati
cp data/resume.example.json data/mio-nome.json
# Modifica data/mio-nome.json con i tuoi dati

# 2. Installa dipendenze
npm install

# 3. Genera i PDF del tuo CV (HTML temporanei cancellati)
make pdf CV=mio-nome

# 4. (Opzionale) Traduci in inglese
make translate CV=mio-nome              # via OpenAI API
make translate-local CV=mio-nome        # via llama-server locale

# 5. Rigenera dopo la traduzione (produce .pdf + .en.pdf)
make pdf CV=mio-nome

# 6. (Debug) Mantieni gli HTML per ispezione rendering
make debug CV=mio-nome                  # equivalente a KEEP_HTML=1 make pdf CV=mio-nome
```

## Workflow

```
┌─────────────────────────┐     ┌──────────────┐     ┌──────────────────────┐
│ data/<nome-cv>.json     │────▶│ npx resumed  │────▶│ output/<nome-cv>     │
│  (JSON Resume, IT)      │     │ render +     │     │   .html (intermedio) │
│                         │     │ export       │     │      ↓               │
│                         │     │              │     │ output/<nome-cv>     │
│                         │     │              │     │   .pdf (finale)      │
└─────────────────────────┘     └──────────────┘     └──────────────────────┘

┌─────────────────────────┐     ┌──────────────────┐
│ data/<nome-cv>.json     │────▶│ translate.cjs    │────▶│ data/<nome-cv>.en.json
│  (IT)                   │     │ (OpenAI / local) │     │  (EN) → stesso flow
└─────────────────────────┘     └──────────────────┘     └──────────────────────┘
```

## Naming convention

| File | Contenuto | Git tracked? |
|---|---|---|
| `data/<stem>.json` | Sorgente CV (IT) | ❌ (gitignored) |
| `data/<stem>.en.json` | Traduzione EN | ❌ (gitignored) |
| `data/<stem>.translateme.json` | Solo campi traducibili, per traduzione manuale | ❌ (gitignored) |
| `data/resume.example.json` | Template CV di esempio | ✅ |
| `output/<stem>-<YYYY-MM-DD>.pdf` | PDF finale IT (data = ultima modifica JSON, come nel footer) | ❌ (gitignored) |
| `output/<stem>.en-<YYYY-MM-DD>.pdf` | PDF finale EN | ❌ (gitignored) |
| `output/<stem>.html` | HTML intermedio (cancellato di default) | ❌ (gitignored) |

`<stem>` = qualsiasi nome file, es. `firstname-lastname`, `martina-peracchini`. Il Makefile tratta ogni `data/<stem>.json` come un CV (esclusi `*.en.json`, `*.translateme.json`, `certifications*`, `resume.example.json`).

## Versionamento locale (rollback senza git)

I JSON in `data/` sono gitignored (privacy), ma ogni `make pdf`/`make html`
salva in automatico uno snapshot in `.snapshots/` (solo se il contenuto è
cambiato; tenuti gli ultimi 20). Per annullare: `make rollback CV=<stem>`
(doppio rollback = redo), `make snapshots CV=<stem>` per listare,
`make rollback CV=<stem> SNAP=<file>` per uno snapshot esplicito.

## `meta` standard per tutti i CV

Tutti i JSON in `data/` dovrebbero avere:

```json
{
  "meta": {
    "language": "it",
    "themePackage": "jsonresume-theme-stackoverflow",
    "pdfRenderOptions": {
      "format": "A4",
      "margin": {
        "top": "1cm",
        "bottom": "1cm",
        "left": "1cm",
        "right": "1cm"
      }
    }
  }
}
```

Opzionale: `meta.theme` (object) per personalizzare colori e ordine sezioni supportate dal tema:

```json
{
  "meta": {
    "theme": {
      "sectionOrder": ["basics", "work", "projects", "certificates", ...],
      "primaryColor": "#1e3a52",
      "backgroundAltColor": "#f5f2ed"
    }
  }
}
```

## Tema

Default: wrapper locale `themes/stackoverflow-fix.js` (il tema npm
`jsonresume-theme-stackoverflow` + fix del wrapping keyword nella sezione SKILLS —
vedi [doc/skills-rendering.md](doc/skills-rendering.md)).

Per usare un tema npm diverso:
1. `npm install jsonresume-theme-<nome>`
2. `THEME=jsonresume-theme-<nome> make pdf CV=<stem>`

Per tornare al tema npm puro: `THEME=jsonresume-theme-stackoverflow make pdf CV=<stem>`.

## Comandi Makefile

| Comando | Descrizione |
|---------|-------------|
| `make` o `make build` | `make pdf-all` (default) |
| `make list` | Lista i CV scoperti in `data/` |
| `make pdf CV=<stem>` | PDF del singolo CV (IT + EN se presente) |
| `make pdf-all` | PDF per tutti i CV scoperti |
| `make html CV=<stem>` | HTML del singolo CV (mantiene il file) |
| `make html-all` | HTML per tutti |
| `make validate CV=<stem>` | Valida JSON contro schema |
| `make validate-all` | Valida tutti |
| `make translate CV=<stem>` | Traduce via OpenAI API |
| `make translate-local CV=<stem>` | Traduce via LLM locale |
| `make translate-all` / `make translate-all-local` | Traduce tutti |
| `make debug` | Come `build` ma mantiene HTML (KEEP_HTML=1) |
| `make snapshots CV=<stem>` | Lista gli snapshot del JSON (storico locale) |
| `make rollback CV=<stem> [SNAP=<file>]` | Annulla ultima modifica (doppio = redo) o ripristina snapshot |
| `make clean` | Rimuove `output/*.{html,pdf}` |
| `make clean-all` | `clean` + `data/*.{en,translateme}.json` + `node_modules` |
| `make help` | Mostra l'aiuto completo |

### Variabili Makefile

| Variabile | Default | Descrizione |
|---|---|---|
| `CV` | primo CV scoperto | Stem del CV (no `.json`); usato dai target singoli |
| `THEME` | `themes/stackoverflow-fix.js` (wrapper locale) | Tema: path wrapper o nome npm |
| `CV_PLACE` | `Firenze` | Luogo del footer "Luogo, data ultima modifica JSON" |
| `RESUMED` | `resumed` | Package `resumed` da usare (vedi sotto per fork) |
| `KEEP_HTML` | `0` | Se `1`, mantiene HTML intermedi |

### Usare un fork di `resumed` o aggiornare versione

L'upstream (`rbardini/resumed`) è di nuovo attivo dalla v7.0.0 (2026-09, richiede Node 24+).
Per aggiornare: `npm install resumed@7` + 1 PDF di prova. Per swappare a un fork:

```bash
npm install github:<user>/<resumed-fork>#main
npm uninstall resumed
make pdf CV=firstname-lastname    # usa automaticamente il fork via `npx $(RESUMED)`
```

## Struttura del progetto

```
draiver-resume-cli/
├── data/                          # JSON sorgente CV (es. firstname-lastname.json, martina-peracchini.json)
│   ├── resume.example.json        # template tracciato
│   ├── firstname-lastname.json            # CV l'utente (gitignored)
│   ├── firstname-lastname.en.json         # traduzione EN (gitignored)
│   └── martina-peracchini.json    # CV Martina (gitignored)
├── output/                        # PDF/HTML generati (gitignored)
├── .snapshots/                    # storico JSON per rollback (gitignored)
├── themes/
│   └── stackoverflow-fix.js       # wrapper tema: fix wrapping keyword SKILLS
├── scripts/
│   └── translate.cjs              # Traduzione IT→EN multi-CV
├── doc/                           # Documentazione (`skills-rendering.md`, `theme-research.md`, …)
├── openspec/                      # Specifiche OpenSpec
├── Makefile                       # Orchestratore multi-CV
├── package.json
└── README.md
```

## Riferimenti

| Risorsa | URL |
|---------|------|
| JSON Resume schema | <https://jsonresume.org/schema/> |
| resumed (rendering engine) | <https://www.npmjs.com/package/resumed> |
| jsonresume-theme-stackoverflow | <https://github.com/phoinixi/jsonresume-theme-stackoverflow> |
| Temi alternativi | <https://www.npmjs.com/search?q=jsonresume-theme> |
| Puppeteer | <https://pptr.dev/> |

## Licenza

MIT — vedi file `LICENSE` per i dettagli.

## Documentazione

| File | Per chi |
|---|---|
| [README.md](README.md) | Utenti del progetto |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contributori umani |
| [AGENTS.md](AGENTS.md) | Agenti AI (Claude Code, Cursor, OpenCode, …) |
| [doc/pdf-generation.md](doc/pdf-generation.md) | Dettagli rendering PDF/HTML |
| [openspec/specs/](openspec/specs/) | Capability canoniche (sorgente) |
