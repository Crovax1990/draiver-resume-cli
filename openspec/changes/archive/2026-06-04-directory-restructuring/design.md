## Context

Current root directory has 18 entries including 7 generated/stale artifacts. The two rendering scripts (`render-html.mjs`, `render-pdf.mjs`) accept file paths as CLI arguments, so they don't need code changes — only the Makefile invocation paths change. The translation script (`translate.js`) has 3 hardcoded path constants that must be updated.

Stale files to delete:
- `public/index.html` — hand-generated, stale content, out of sync with current JSON
- `profile-image.png` — not referenced by any script; base64 is embedded in the JSON

## Goals / Non-Goals

**Goals:**
- Root directory reduced to ~10 entries (config, scripts, docs, metadata)
- All generated files gitignored under their new paths
- `data/` contains all JSON resume artifacts
- `output/` contains all rendered PDFs and HTMLs
- Stale/unreferenced files removed

**Non-Goals:**
- Changing the behavior of any script or Makefile target
- Renaming files (except normalizing `firstname-lastname-cv-en.json` → `firstname-lastname-cv.en.json` which is already done)
- Changing the OpenSpec or .opencode directories
- Modifying the rendering scripts' logic

## Decisions

### D1: `data/` for JSON, `output/` for renders
**Decision**: Two flat directories rather than nested hierarchies.

**Rationale**: Simple, sufficient. The project has exactly 2 source JSONs and 2-4 rendered outputs. Subdirectories per type would be over-engineering.

**Alternative**: Single `artifacts/` directory — rejected because it would mix source (Italian JSON) with generated outputs, making `.gitignore` harder.

### D2: Delete `public/index.html` rather than move
**Decision**: Delete the stale HTML rather than archive it.

**Rationale**: The content is out of sync with the current resume data and was hand-generated rather than produced by the pipeline. Keeping it would create confusion about which HTML is canonical.

**Alternative**: Move to `doc/` — rejected because it's not documentation, it's a stale render.

### D3: Delete `profile-image.png` rather than keep
**Decision**: Delete the PNG file. The image data is already embedded as base64 in the JSON `basics.image` field.

**Rationale**: The file is not referenced by any script or configuration. Keeping it wastes 356K and invites confusion about whether it's used.

### D4: Keep `firstname-lastname-cv.translateme.json` as generated artifact in `data/`
**Decision**: Move it to `data/` alongside the other JSONs, gitignore it.

**Rationale**: It's a legitimate generated artifact from the `--extract` workflow. If the user uses that workflow, the file should be in the data directory. If never used, it's just a small (12K) gitignored file.

## Risks / Trade-offs

- **[Breaking all existing paths]** — Any script, alias, or workflow referencing absolute paths like `./firstname-lastname-cv.json` will break. → **Mitigation**: Update `Makefile` and `translate.js` in the same atomic change. The rendering scripts accept arguments, so only Makefile invocations need updating.
- **[forgetting to gitignore new paths]** — Generated files could accidentally be committed. → **Mitigation**: Update `.gitignore` in the same change with explicit paths for `data/firstname-lastname-cv.en.json`, `data/firstname-lastname-cv.translateme.json`, and `output/`.
- **[profile-image.png deletion regret]** — If the base64 needs to be regenerated from a higher-quality source, the PNG is gone. → **Mitigation**: The PNG was exported from the same source as the base64; both exist in git history if recovery is needed.
