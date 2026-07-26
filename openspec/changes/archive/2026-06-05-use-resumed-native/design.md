## Context

The project currently maintains two custom render scripts (`scripts/render-html.mjs`, `scripts/render-pdf.mjs`) that load a theme, call `changeLanguage()` if available, and render HTML/PDF. These scripts were created because `resumed` v6.1.0 does not call `theme.changeLanguage()`. With the decision to accept English themed labels in the Italian CV, this dependency on `changeLanguage()` is eliminated, allowing us to use resumed's CLI commands (`render`, `export`, `validate`) directly.

The JSON resume files currently use a non-standard `meta.themePackage` field for the npm theme name, while resumed natively reads `meta.theme`. Additionally, the build system relies on fixed `RESUME`/`RESUME_EN` Makefile variables rather than auto-discovery.

## Goals / Non-Goals

**Goals:**
- Drop `scripts/render-html.mjs` and `scripts/render-pdf.mjs` entirely
- Use `resumed render`, `resumed export`, and `resumed validate` CLI commands natively
- Rename `meta.themePackage` → `meta.theme` in all resume JSON files
- Remove the `meta.theme` styling object from CV JSONs (unused by stackoverflow theme v3+)
- Rewrite Makefile with prefix-based CV discovery (`CV_PREFIX=firstname-lastname-cv`)
- Update `scripts/translate.js` default paths to match the new prefix convention
- Remove dead dependency `@vitalets/google-translate-api`

**Non-Goals:**
- Changing the translation workflow (translate.js stays, only path defaults updated)
- Docker infrastructure (already removed)
- Adding new themes or changing the current theme
- Modifying the JSON Resume schema validation
- changeLanguage() support (English labels accepted for Italian CV)

## Decisions

### 1. CLI: `resumed` native over custom wrapper scripts

**Choice:** Drop `scripts/render-html.mjs` and `scripts/render-pdf.mjs`; use `resumed render` and `resumed export` directly.

**Rationale:** The scripts exist solely for `changeLanguage()` support. Without that requirement, they are pure boilerplate wrapping resumed's API. Resumed's `export` command already handles `pdfRenderOptions` merging natively (`{...themeModule.pdfRenderOptions, ...resume.meta?.pdfRenderOptions}`) and supports `--puppeteer-arg` for sandbox configuration.

### 2. Theme field: `meta.theme` over `meta.themePackage`

**Choice:** Rename `meta.themePackage` to `meta.theme` in all JSON files.

**Rationale:** `resumed` v6.1.0 natively reads `meta.theme` via `getThemeModule()`. This is the JSON Resume ecosystem standard. The `meta.themePackage` field was a custom convention introduced in a previous change. Migration is straightforward: rename the field in all JSON files.

### 3. Makefile: prefix-based wildcard over fixed variables

**Choice:** Replace `RESUME`/`RESUME_EN` fixed variables with `CV_PREFIX`-based wildcard discovery.

**Rationale:** Eliminates the need for separate `html`/`html-en` and `pdf`/`pdf-en` targets. The wildcard `data/$(CV_PREFIX)*.json` automatically discovers both Italian (`.json`) and English (`.en.json`) versions. Template/example files are excluded via `filter-out`.

### 4. Styling object removal: delete `meta.theme` object

**Choice:** Remove the `meta.theme` styling object (with `primaryColor`, `sectionOrder`, etc.) from CV JSONs.

**Rationale:** The `jsonresume-theme-stackoverflow` v3.3.0 ignores these custom styling fields in its rendering. They are dead configuration that adds noise to the JSON files. The section order and color scheme are defined by the theme's own defaults.

## Risks / Trade-offs

- **[Risk] PDF margins differ from current output**: Resumed's `export` merges `themeModule.pdfRenderOptions` then `resume.meta?.pdfRenderOptions`. Our CV JSONs already set `pdfRenderOptions` with A4/1cm margins, so output will remain identical.
- **[Trade-off] No `changeLanguage()` for future themes**: If a future theme is added that depends on `changeLanguage()` for proper rendering, we would need to reintroduce a wrapper. This is unlikely — most JSON Resume themes are English-only.
- **[Risk] `resumed validate` error display on Node 24**: Known issue with `styleText` usage. Does not affect validation correctness, only error display formatting. Acceptable for now.
