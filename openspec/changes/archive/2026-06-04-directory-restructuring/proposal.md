## Why

The project root is cluttered with 7 generated artifacts (JSONs, PDFs, PNG, stale HTML) alongside source files and configuration. This makes navigation confusing, risks committing generated files to git, and conflates build outputs with source artifacts. A clear directory structure solves all three problems.

## What Changes

**BREAKING**: All file paths change. The `Makefile` and `scripts/translate.js` must be updated to new paths. Existing shell workflows referencing absolute paths will break until updated.

- **Move JSON artifacts** (`firstname-lastname-cv.json`, `firstname-lastname-cv.en.json`, `firstname-lastname-cv.translateme.json`) into a new `data/` directory
- **Move rendered outputs** (`cv-output.pdf`, `cv-output.en.pdf`, plus future `.html` files) into a new `output/` directory
- **Delete** stale files: `public/index.html`, `profile-image.png`, `firstname-lastname-cv.translateme.json`
- **Update** `.gitignore` to cover all generated files under their new paths
- **Update** `scripts/translate.js` constants to point to `data/` and `output/`
- **Update** `Makefile` paths for all targets
- Normalize `Makefile` `RESUME_EN` filename to `firstname-lastname-cv.en.json` (already done in prior change)

## Capabilities

### New Capabilities
- `artifact-organization`: Standardized directory layout separating source data, generated outputs, and documentation

### Modified Capabilities
None — no spec-level behavior changes. All existing requirements (translate IT→EN, render PDF, etc.) are unchanged. Only file paths change.

## Impact

- **`data/`** — New directory, created. Contains `firstname-lastname-cv.json` (source), `firstname-lastname-cv.en.json` (generated)
- **`output/`** — New directory, created. Contains rendered PDFs
- **`public/`** — Deleted entirely (stale HTML)
- **`profile-image.png`** — Deleted (unreferenced, base64 embedded in JSON)
- **`scripts/translate.js`** — 3 constants updated: `SOURCE_FILE`, `OUTPUT_FILE`, `EXTRACT_FILE`
- **`Makefile`** — All path references updated, `.PHONY` unchanged
- **`.gitignore`** — Updated with new paths and removed stale comments
- **No dependency changes** — `package.json` unaffected
