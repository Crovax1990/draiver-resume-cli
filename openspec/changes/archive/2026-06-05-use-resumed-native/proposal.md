## Why

The project currently maintains two custom render scripts (`scripts/render-html.mjs` and `scripts/render-pdf.mjs`) that duplicate functionality already provided by the `resumed` CLI (v6.1.0). These scripts exist solely to call `theme.changeLanguage()` before rendering. Since English labels in the Italian CV are now accepted, this dependency is eliminated. Moving to `resumed` native rendering reduces code debt, aligns with the JSON Resume ecosystem standard (`meta.theme`), and simplifies maintenance.

## What Changes

- **BREAKING**: Remove `scripts/render-html.mjs` and `scripts/render-pdf.mjs` — replaced by `resumed render` and `resumed export` CLI commands
- **BREAKING**: Rename `meta.themePackage` → `meta.theme` in all resume JSON files (resumed standard)
- **BREAKING**: Remove `meta.theme` styling object from CV JSONs (the `primaryColor`, `sectionOrder`, etc. block — unused by stackoverflow theme v3+)
- Rewrite `Makefile` with prefix-based CV discovery (`CV_PREFIX=firstname-lastname-cv`) instead of fixed `RESUME`/`RESUME_EN` variables
- Remove dead dependency `@vitalets/google-translate-api` from `package.json`
- Update `scripts/translate.js` defaults to use the CV prefix path

## Capabilities

### New Capabilities

*(none — all capabilities exist, some are modified)*

### Modified Capabilities

- `theme-configuration`: Switch from `meta.themePackage` (custom field) to `meta.theme` (resumed standard); remove `changeLanguage()` capability detection requirement
- `artifact-organization`: Remove custom render scripts from project structure; update Makefile targets from script invocations to native `resumed` CLI commands

## Impact

- **Deleted files**: `scripts/render-html.mjs`, `scripts/render-pdf.mjs`
- **Modified JSON**: `data/firstname-lastname-cv.json`, `data/firstname-lastname-cv.en.json`, `data/resume.example.json`, `data/resume.json`
- **Modified scripts**: `scripts/translate.js` (default paths)
- **Modified build**: `Makefile` (complete rewrite), `package.json` (remove unused dep)
- **Modified docs**: `README.md`, `CONTRIBUTING.md`, `doc/capabilities.md`, `doc/pdf-generation.md`
- **Modified specs**: `openspec/specs/theme-configuration/spec.md`, `openspec/specs/artifact-organization/spec.md`
