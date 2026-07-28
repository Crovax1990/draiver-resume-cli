## Why

Round 2 di miglioramenti al CV di Luca Gobbi, applicando le conoscenze acquisite nel refactoring del CV di Martina (CEFR, GitHub profile enrichment, project enrichement) e raccogliendo un cambio di scope ridotto emerso durante la review del CV:

1. **Skills compatto**: "Jira · Jira Tempo" è ridondante (Jira è un tool, Jira Tempo è un suo plugin). Compattare in "Jira + Tempo".
2. **Bash scripting**: aggiunto a `interests.Linux & Open Source Ecosystem` come interesse reale (l'utente sviluppa su ambienti Unix-like).
3. **Project rename**: il progetto era chiamato "Famiglia730" con URL `dichiarazione730-analyzer`. Il repo è stato rinominato in `dichiaro` e l'URL era sbagliato. Riscrivo l'intera entry con il contenuto del README aggiornato.
4. **New project**: `draiver-resume-cli` (la pipeline resume-as-code usata per buildare questo stesso CV) va aggiunto alla sezione projects come credito professionale.

## What Changes

- **MODIFIED**: `data/luca-gobbi.json`:
  - `skills[4].keywords`: `"Jira"` + `"Jira Tempo"` → `"Jira + Tempo"` (compattato)
  - `interests[0].keywords`: aggiunto `"Bash Scripting"` all'entry Linux
  - `projects[2]`: rinominato `Famiglia730 — Dashboard Fiscale Familiare` → `Dichiaro`, URL corretto, contenuto completamente riscritto con 8 highlights e 7 keywords aggiornati
  - `projects[4]` (nuovo, in coda): aggiunto `draiver-resume-cli` con 5 highlights e 9 keywords

## Capabilities

### New Capabilities

*(nessuna — capability `cv-data-enrichment` esistente, capability `cv-data-enrichment-mod` esistente, modifica additiva)*

### Modified Capabilities

- `cv-data-enrichment`: aggiunto pattern "compattazione di keyword ridondanti" e "aggiunta di interesse basato su profilo professionale reale (sviluppatore Unix-like)"

## Impact

- **Modified data**: `data/luca-gobbi.json` (gitignored, modifiche locali)
- **Regenerated output**: `output/luca-gobbi.pdf` + `output/luca-gobbi.en.pdf` (IT + EN, gitignored)
- **New diff file**: `.openspec/luca-gobbi-r2-diff.md` (markdown document con il diff proposto)
- **No tooling changes**: Makefile e theme invariati
- **No spec changes**: capability `cv-data-enrichment` modificata (delta da sincronizzare in fase di archive)

## Open Items (deferred)

- Lingue: nessuna modifica in questo round (già CEFR da R1)
- Summary: nessuna modifica in questo round
- GDPR: invariato in `references[]` (decisione utente in R1)
