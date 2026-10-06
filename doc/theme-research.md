# Theme & engine research — discovery 2026-10-06

Ricerca online (web + registry npm + smoke test locale) su: temi JSON Resume più
recenti/usati per un eventuale switch, e progetti di generazione CV più
manutenuti di `resumed`.

## 1. Rendering engine (chi genera HTML/PDF)

| Engine | Versione / data | Download/mese | Stato manutenzione | Note per noi |
|---|---|---|---|---|
| `resumed` (attuale) | **7.0.0** / 2026-09-04 | ~2.300 | **ATTIVO** (smentita nota "fermo da 10 mesi": valeva per la 6.1.0 del 2025-09) | Breaking 7.x: richiede **Node 24+** (locale: v24.15.0 ✓). Novità: supporto Puppeteer 25, `--puppeteer-arg` (già in 6.1.0). Upgrade a basso rischio: stessa CLI, stesso caricamento temi via `import()` → il wrapper `themes/stackoverflow-fix.js` resta valido |
| `resume-cli` (ufficiale) | **3.7.3** / 2026-09-09 | ~2.700 | **RESUSCITATO nel 2026**, ora nel monorepo `jsonresume/jsonresume.org` (`packages/cli`) | Nuovi comandi utili: `audit` (score ATS del CV — allineato al nostro obiettivo HR), `themes`, export anche `.md`/`.txt`. Contro: CLI diversa (`resume export --format`), il Makefile va riscritto; da verificare supporto `meta.pdfRenderOptions` custom e `meta.theme` object |
| `resuml` | 3.2.0 / 2026-06-01 | ~290 | Attivo (stesso autore del nostro tema, phoinixi) | Input **YAML** (non JSON) + 300+ temi dichiarati, ATS-match vs job description, server MCP per agenti AI. Contro: ecosistema piccolo (11 star), cambio formato sorgente → riscrittura pipeline e `translate.cjs`. Da osservare, non adottare |
| Reactive Resume | v4.5.6 (web app) | n/a (42k star) | Attivissimo, ma **altro paradigma** (web app self-hosted, formato proprio, import da JSON Resume) | Adottarlo = abbandonare resume-as-code (niente più JSON in `data/`, niente `translate.cjs`, niente diff). Scartato per incompatibilità architetturale |

## 2. Temi npm (download ultimi 30gg + freschezza)

| Tema | Download/mese | Ultima release | Giudizio |
|---|---|---|---|
| `jsonresume-theme-even` | **~3.500** (più usato) | 0.26.1 / 2025-10-04 | Classico di riferimento (stesso autore di `resumed`). Ultimo update ~1 anno fa. Look datato, nessun vantaggio concreto sul nostro |
| `jsonresume-theme-elegant` | ~2.650 | 1.16.1 / **2021** | Download alti per inerzia, **morto dal 2021**. No |
| `jsonresume-theme-stackoverflow` (attuale) | ~1.200 | 3.3.0 / 2026-04-30 | Attivo, stesso autore di `resuml`. Bug chip SKILLS noto → già mitigato dal nostro wrapper (vedi `doc/skills-rendering.md`) |
| `jsonresume-theme-flat` | ~850 | 2014–2022 | Morto. No |
| `jsonresume-theme-modern` | ~700 | 2014–2022 | Morto. No |
| `jsonresume-theme-kendall` | ~650 | 2020–2022 | Morto. No |
| `jsonresume-theme-paper` | ~300 | 2021–2022 | Morto. No |
| `jsonresume-theme-jacrys` | ~150 | 2021–2022 | Morto. No |
| `@jsonresume/jsonresume-theme-class` | ~110 | **0.7.0 / ~2026-09** (nuovo) | **Ufficiale JSON Resume Team**. Self-contained/offline (zero CDN), ATS-friendly, spec 1.0.0, dark mode. Adozione ancora bassa (appena nato) |
| Temi gallery registry (`Desert Modern`, `Elegant Pink`, …) | n/a | 2026 | Decine di temi ufficiali ma **React per il registry hostato**, non caricabili da CLI (`resumed`/`resume-cli` richiedono `render()`). Non un'opzione per la pipeline |

## 3. Smoke test: `@jsonresume/jsonresume-theme-class` sui nostri dati

Eseguito 2026-10-06 in `/tmp/theme-smoke` (non committato) con `data/luca-gobbi-cv.json`:

- `render()` compatibile con `resumed` (export named, `namespace.render` risolvibile) ✓
- **Zero dipendenze esterne**: gli unici URL nell'HTML sono i link del CV (niente CDN Font Awesome come nel tema attuale) ✓
- **Nessuna regola `white-space`**: le keyword non sono chip nowrap → il bug di sovrapposizione **non esiste** in questo tema ✓
- Headings restati in inglese nonostante `meta.language: "it"` → localizzazione IT **da verificare** (README dichiara i18n via `meta.language`)
- Resa visiva molto più spartana del tema attuale (nome grigio chiaro, layout minimale) → da valutare con HR, non è un upgrade estetico
- Artefatti: `/tmp/theme-smoke/class.{html,pdf,png}` (scartati, non in repo)

## 4. Considerazioni per la migrazione

| Switch | Costo | Beneficio | Rischi |
|---|---|---|---|
| `resumed` 6.1.0 → **7.0.0** | Basso (`npm install`, Node 24 ✓ già presente) | Fix bug `styleText` su JSON invalidi (gotcha AGENTS #1), Puppeteer 25, upstream di nuovo vivo | Verificare che `export`/`--puppeteer-arg` si comportino uguale (1 PDF di prova) |
| Tema attuale → **`@jsonresume/jsonresume-theme-class`** | Medio (install + `THEME=`, rimozione wrapper, verifica visiva IT/EN, check headings IT) | Ufficiale, offline, ATS-friendly, niente più bug chip | Estetica spartana; i18n IT non confermata; adozione bassa (rischio bug giovani) |
| Engine → **`resume-cli`** | Alto (riscrittura target Makefile, verifica `meta.*` custom) | Ufficiale + `resume audit` (score ATS nativo, utile per l'obiettivo HR del CV) | Regressioni su traduzione locale e wrapper; da prototipare a parte |
| Tema attuale → **`even`** | Basso | Tema più scaricato, autore affidabile | Nessun vantaggio reale; look datato; update fermo al 2025 |
| Qualsiasi altro tema npm | Basso | — | Tutti morti dal 2021–2022 |

## 5. Raccomandazione

1. **Subito**: upgrade `resumed` → 7.0.0 (costo minimo, chiude il gotcha #1 e riallinea a upstream vivo).
   ✅ **Eseguito 2026-10-06**: `npm install resumed@7`, `validate` + `pdf` ok,
   `output/luca-gobbi-cv.pdf` rigenerato (635K, identico), wrapper ancora valido.
2. **Poi**: pilota `class` con `THEME=@jsonresume/jsonresume-theme-class make pdf` su un branch, confronto visivo HR, verifica headings IT; se promosso, si elimina il wrapper.
   ✅ **Pilotato 2026-10-06** (`--no-save`, nessuna traccia in `package.json`):
   render ok, zero CDN, niente bug chip, ma resa molto più spartana (nome grigio,
   niente foto, headings in inglese nonostante `meta.language: "it"`, 4 pagine vs 3).
   **Verdetto: si resta sul tema attuale + wrapper** (migliore per audience HR).
   PDF reale ripristinato con tema default.
3. **Valutare**: spike `resume-cli` + `resume audit` come quality-gate ATS in pipeline.
   ❌ **Spike 2026-10-06** (install in `/tmp/cli-spike`, scartato): `resume validate`
   funziona (output più ricco: conteggio sezioni), ma `export` e `audit` **crashano**
   entrambi per bug di packaging upstream — `@rbardini/html@1.0.1` dichiara
   `exports: {".": {"import": …}}` solo-ESM mentre `resume-cli/build` lo carica via
   `require()` → `ERR_PACKAGE_PATH_NOT_EXPORTED`. **Non adottabile finché upstream
   non fixa** (da segnalare come issue su `jsonresume/jsonresume.org`).
4. **Sorvegliare**: `resuml` (stesso autore del tema, feature ATS/MCP interessanti ma formato YAML incompatibile).

Fonti: registry npm (api.npmjs.org, 2026-10-06), release notes GitHub `rbardini/resumed`,
README `jsonresume/jsonresume.org` (`packages/cli`), README `phoinixi/resuml`,
gallery https://www.jsonresume.org/themes, smoke test locale.
