## Why

The current theme is hardcoded in two render scripts (`scripts/render-html.mjs`, `scripts/render-pdf.mjs`) and `package.json`. Switching themes requires modifying three files and understanding the internals of each theme's API (some support `changeLanguage()`, others don't). This makes experimentation with different layouts tedious and error-prone.

A dynamic theme selection from the resume JSON itself would allow instant theme switching via config, with safe fallback and capability detection.

## What Changes

- Add `meta.themePackage` field to the resume JSON schema specifying the npm theme package name
- Update `scripts/render-html.mjs` and `scripts/render-pdf.mjs` to read theme from `resume.meta.themePackage` instead of hardcoding
- Add capability detection for `theme.changeLanguage()` — guard the call with `typeof` check
- Update documentation with theme switching instructions
- Remove stale sidebar references from `doc/pdf-generation.md`

## Capabilities

### New Capabilities
- `theme-configuration`: Dynamic theme selection from resume JSON with safe capability detection and fallback to default

### Modified Capabilities
None — no existing requirement changes. Rendering behavior stays the same; only theme selection becomes configurable.

## Impact

- **`data/firstname-lastname-cv.json`** — add `meta.themePackage` field with current theme name
- **`data/firstname-lastname-cv.en.json`** — add same field
- **`scripts/render-html.mjs`** — read theme from JSON, guard `changeLanguage()`, fallback to default
- **`scripts/render-pdf.mjs`** — same changes
- **`doc/pdf-generation.md`** — update with theme switching instructions, remove stale sidebar references
- **No new dependencies** — existing `jsonresume-theme-stackoverflow` stays as default
