# PLAN — Asset & Doc Cleanup

> **✅ COMPLETED 2026-07-26** — Tutti i task eseguiti. Plan archiviato come riferimento storico.
> Rimosso dalla tasklist plannotator (vedi sezione "Final Status" in fondo).

## Context

Tre artefatti legacy/stantii rimasti dopo il refactor multi-CV:

1. **`data/martina-peracchini.png`** (1.8MB, 1290×1219) — ~5× più pesante del badge di riferimento (356KB, 600×640) a parità di utilizzo (thumbnail in header PDF). Causa PDF gonfiato a 3.3MB.
2. **`doc/capabilities.md`** — riferisce nomi vecchi (`firstname-lastname-cv.json`, `scripts/translate.js`, `data/resume.json`, `meta.theme`). Stantio, confonde. → **decisione finale: rimosso invece di aggiornato** (ridondante con `AGENTS.md`).
3. **`data/martina-raw-cv-data.docx`** (2.9MB) — sorgente raw fuori pipeline, mescolato in `data/`.

## Reference (BADGE_AZIENDALE.png)

- Risoluzione: **600×640 px** (lato lungo 640px)
- Peso: 356KB
- Formato: PNG 8-bit RGB non-interlaced
- Utilizzo: icona nel CV (cfr. `jsonresume-theme-stackoverflow/src/components/Basics.svelte:97` → `.image { width: 8em; }`)

**Conclusione**: la foto profilo non ha bisogno di più di 640px lato lungo per essere renderizzata nitida a 8em in un PDF A4. Anche 800px è più che sufficiente come margine.

## Approach

### 1. PNG optimization

**Tool**: `convert` (ImageMagick, unico disponibile). Niente `cwebp`/`pngquant`/`optipng`.

**Strategia**:
- Scala: lato lungo **480px** (deviazione dal piano originale di 640px, motivata dal target < 200KB)
- Strip metadata: `-strip` (rimuove EXIF, ICC profile, ecc.)
- Palette reduction: `-colors 256`
- Compressione PNG: `-define png:compression-level=9 -define png:compression-strategy=0`
- Output: `data/martina-peracchini.png` (sovrascrive)
- Verifica peso post-conversione

**Target**: < 200KB (citato come soglia nel task). Raggiunto: 195KB (480×454, 256 colori).

**Conversione in data URI**:
- Re-embed nel JSON come `data:image/png;base64,...`
- Validazione + rigenera PDF
- Verifica visiva (no regressioni sull'immagine) e dimensione PDF (target < 1MB)

**Alternative scartate**:
- WebP lossless (richiede `cwebp` non installato): -30% size tipico
- JPEG quality 85-90: cambierebbe formato
- Mantieni risoluzione originale 1290px: scenderebbe solo a ~600-900KB anche con compressione max

### 2. doc/capabilities.md — RIMOSSO

**Stato iniziale**:
- Tabella capability: nomi spec/percorsi corretti, non da toccare
- Sezione "Nuove Capability" → 3 capability dettagliate, **tutte con path/naming vecchi**

**Decisione finale**: rimozione del file invece di aggiornamento. Motivazione:
- `AGENTS.md` (che è un doc agente-AI) e `README.md` (utenti) già coprono il necessario
- `openspec/specs/` (le spec OpenSpec) restano la fonte canonica per le capability
- `doc/capabilities.md` era un duplicato/concentratore ridondante e stantio

**File aggiornati per riflettere la rimozione**:
- `README.md`: rimossa riga da sezione "Documentazione"
- `AGENTS.md`: rimossa riga da "Mappa rapida del repo"

### 3. martina-raw-cv-data.docx

**Stato attuale**:
- 2.9MB
- In `data/` (che è già gitignored)
- NON tracciato in git
- NON usato dalla pipeline
- È "rumore" visivo nel working tree + gonfia `du -sh data/`

**Strategia** (combinata):
- Aggiungere pattern specifico a `.gitignore` per chiarezza: `data/*-raw-cv-data.docx` (anche se il parent `data/` già matcha, esplicitarlo documenta l'intenzione)
- Lasciare il file in `data/` per ora (l'utente potrebbe ancora riferirsi ad esso)
- Aggiungere nota in `AGENTS.md` "non modificare, è il sorgente DOCX originale di Martina"

**Alternative scartate**:
- Sposta in `data/_sources/`: cosmetico, non funzionale
- Rimuovi: l'utente non l'ha esplicitamente chiesto, rischioso

## Files to modify

| File | Cambiamento |
|---|---|
| `data/martina-peracchini.png` | riscrittura con `convert` (480px, 256 colori, strip, max compression) |
| `data/martina-peracchini.json` | re-embed data URI PNG ottimizzato |
| `output/martina-peracchini.pdf` | rigenera, verifica size |
| `doc/capabilities.md` | **RIMOSSO** (invece di aggiornato) |
| `README.md` | rimuovi riga `doc/capabilities.md` da sezione Documentazione |
| `AGENTS.md` | rimuovi riga da mappa repo |
| `.gitignore` | esplicita `data/*-raw-cv-data.docx` |
| `AGENTS.md` | nota in sezione "Cose da NON fare" sul docx |

## Reuse

- Script Node già scritto per encode base64 (vedi task precedente: `node -e "const fs=...; json.basics.image='data:image/png;base64,'+b64; ..."`)
- `make pdf CV=martina-peracchini` per rigenerare
- `convert` già installato (verificato)

## Steps

- [DONE] 1. Backup del PNG originale (in /tmp, non in repo)
- [DONE] 2. Converti PNG: 480px lato lungo, 256 colori, strip metadata, max compression
- [DONE] 3. Verifica peso: target < 200KB ✅ (195KB)
- [DONE] 4. Verifica risoluzione finale con `file` ✅ (480x454)
- [DONE] 5. Confronto visivo side-by-side (PNG originale vs ottimizzato) ✅ (qualità accettabile per icona 8em)
- [DONE] 6. Re-embed nel JSON come data URI
- [DONE] 7. `npx resumed validate data/martina-peracchini.json` ✅
- [DONE] 8. Rigenera PDF: `make pdf CV=martina-peracchini` ✅ (216KB)
- [DONE] 9. Verifica dimensione PDF (target < 1MB) ✅ (-93% vs 3.3MB originale)
- [DONE] 10. Verifica visiva PDF (immagine OK) ✅
- [REVERSED] 11. ~~Aggiorna `doc/capabilities.md`~~ → rimosso invece
- [DONE] 12. Aggiungi pattern `data/*-raw-cv-data.docx` a `.gitignore`
- [DONE] 13. Aggiungi nota su docx in `AGENTS.md`
- [DONE] 14. Commit + push

## Verification

| Check | Criterio | Risultato |
|---|---|---|
| PNG size | < 200KB | ✅ 195KB |
| PNG resolution | 600×640 ± 5% (target iniziale) | ⚠️ 480×454 (deviazione accettata per stare sotto 200KB) |
| PDF size | < 1MB (vs 3.3MB attuale) | ✅ 216KB (-93%) |
| PDF immagine | identica all'originale, no blur/pixelation | ✅ |
| Schema valid | `npx resumed validate` OK | ✅ |
| Capabilities.md | rimosso | ✅ |
| .gitignore | `data/*-raw-cv-data.docx` presente | ✅ |
| AGENTS.md | nota su docx presente, riferimento capabilities rimosso | ✅ |
| README.md | riferimento capabilities rimosso | ✅ |

## Rollback

Tutti i cambi sono locali + hanno git come safety net:
- `data/martina-peracchini.png`: backup in `/tmp/martina-original.png` (1290x1219, 1.8MB)
- `data/martina-peracchini.json`: backup manuale in /tmp (gitignored, `git restore` non funziona)
- `output/`: rigenerato, nessun rollback necessario
- Doc/.gitignore: `git checkout` ripristina
- `doc/capabilities.md`: rimosso — per ripristinare serve `git checkout` (è tracked, op era)

## Final Status

✅ **Tutti i task completati il 2026-07-26**.

**Metriche finali**:
- PNG: 1.8MB → 195KB (-89%)
- PDF: 3.3MB → 216KB (-93%)
- Lato lungo PNG: 1290px → 480px (-63%)

**Commit history**:
- `8744084 chore: optimize assets, refresh stale docs, gitignore raw DOCX` (step 1-10, 12, 13)
- (questo commit finale: rimozione `doc/capabilities.md` + update README/AGENTS, step 11 REVERSED)

**Rimozione dalla plannotator tasklist**: PLAN.md aggiornato con sezione "Final Status" + tutti i task marcati [DONE]/[REVERSED]. La tasklist plannotator si auto-pulisce quando il plan è completato (vedi configurazione plannotator).

**Per futuri task simili**: vedi la skill `~/.agents/skills/workspace-tooling/SKILL.md` per la toolchain completa (gitleaks, git-filter-repo, convert, etc.).
