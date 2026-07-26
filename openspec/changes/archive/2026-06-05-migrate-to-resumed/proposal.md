## Why

The current Docker-based pipeline using `resume-cli` with `jsonresume-theme-even` has significant problems: the theme has CJS/ESM compatibility issues requiring runtime patches, the Docker image is ~300MB for generating a single PDF, and resume-cli provides no control over PDF margins or format (hardcoded Letter with default Puppeteer margins). The generated PDF differs substantially from the HTML preview — tight margins, missing background colors in headless Chromium, and a print layout that looks broken without the profile image. Meanwhile, `jsonresume-theme-stackoverflow` is a zero-dependency, actively maintained theme with built-in PDF margins, i18n support (including Italian), customizable colors/fonts, profile image support, and is fully compatible with `resumed` — the modern CLI alternative by the same author as `jsonresume-theme-even`.

## What Changes

- **BREAKING**: Replace `resume-cli` with `resumed` for all rendering commands (validate, render, export, serve)
- **BREAKING**: Replace `jsonresume-theme-even` with `jsonresume-theme-stackoverflow`
- **BREAKING**: Remove Docker infrastructure (`docker/Dockerfile`, `docker-compose.yml`) — `resumed` + `puppeteer` run natively
- Remove `scripts/patch-rbardini-html.js` postinstall script (no longer needed)
- Rewrite Makefile to use `npx resumed` commands instead of Docker-wrapped `resume` commands
- Update `package.json` to replace `jsonresume-theme-even` with `jsonresume-theme-stackoverflow` and add `resumed` + `puppeteer`
- Add `meta.theme` configuration in `firstname-lastname-cv.json` for colors, fonts, i18n, and section ordering
- Add A4 format and margin controls for PDF generation

## Capabilities

### New Capabilities
- `local-rendering`: Native rendering pipeline using `resumed` CLI + `puppeteer` without Docker, with A4 format and configurable margins

### Modified Capabilities
- `docker-rendering`: Removing Docker pipeline in favor of local rendering; requirement changes from Docker-based to native `resumed` commands
- `cv-data-cleaning`: Makefile targets change from Docker-wrapped commands to `npx resumed` commands

## Impact

- **Removed files**: `docker/Dockerfile`, `docker-compose.yml`, `scripts/patch-rbardini-html.js`
- **Major rewrite**: `Makefile` (all targets change from `docker compose run` to `npx resumed`)
- **Major rewrite**: `package.json` (swap theme, add `resumed` + `puppeteer`, remove postinstall patch)
- **Modified**: `firstname-lastname-cv.json` (add `meta.theme` color/font/i18n/section config)
- **Dependencies added**: `resumed`, `jsonresume-theme-stackoverflow`, `puppeteer`
- **Dependencies removed**: `jsonresume-theme-even` (and its transitive deps)
- **Build requirement**: System must have `npm` available; Puppeteer downloads Chromium automatically on install