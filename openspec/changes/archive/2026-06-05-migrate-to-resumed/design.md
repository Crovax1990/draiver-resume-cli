## Context

The project currently uses a Docker-based pipeline with `resume-cli` + `jsonresume-theme-even` for CV rendering. This setup has accumulated significant technical debt:

- **CJS/ESM conflicts**: `jsonresume-theme-even` depends on `@rbardini/html` (ESM-only), requiring runtime patches (`scripts/patch-rbardini-html.js`) and Dockerfile sed patches to resume-cli's `getThemePkg()`
- **Docker overhead**: ~300MB image for generating a single PDF; translation script runs outside Docker anyway
- **PDF rendering issues**: `resume-cli` hardcodes `format: 'Letter'` and default Puppeteer margins (~1cm); theme `even` uses `mediaType: "print"` which switches to a 2-column layout that looks broken without the profile image
- **Background color loss**: Chromium headless in Docker doesn't render CSS backgrounds reliably with `--no-sandbox`

The `jsonresume-theme-stackoverflow` theme (v3.3.0) by Francesco Esposito solves these problems: zero dependencies, built-in PDF margins (0.8cm), profile image support with `float: right`, i18n including Italian, customizable colors/fonts via `meta.theme`, section ordering, and a Svelte SSR architecture that's fully CJS-compatible.

The `resumed` CLI by Rafael Bardini (same author as `jsonresume-theme-even`) is a modern, lightweight (~180 LOC) alternative to `resume-cli` with native ESM support, `--puppeteer-arg` for PDF options, and no compatibility issues with modern themes.

Current file state:
- `Makefile` — 48 lines with Docker-wrapped commands, CHECK_SOURCE macro, THEME variable
- `package.json` — dependencies: openai, @vitalets/google-translate-api, dotenv, jsonresume-theme-even; postinstall: patch-rbardini-html.js
- `docker/Dockerfile` — node:20-alpine + Chromium + resume-cli + sed patches
- `docker-compose.yml` — resume service with volume mount
- `scripts/patch-rbardini-html.js` — CJS compatibility patch for @rbardini/html
- `firstname-lastname-cv.json` — Italian CV with base64 profile image, meta.theme: "even"

## Goals / Non-Goals

**Goals:**
- Replace `resume-cli` with `resumed` for all CV rendering operations
- Replace `jsonresume-theme-even` with `jsonresume-theme-stackoverflow`
- Remove Docker infrastructure entirely
- Remove all CJS/ESM compatibility patches
- Make PDF output match HTML preview (same layout, margins, colors)
- Configure the theme for Italian language, custom colors, and A4 format
- Keep all existing Makefile targets with the same names and semantics

**Non-Goals:**
- Custom theme development or forking (use stackoverflow theme as-is)
- CI/CD pipeline for automated CV generation (future scope)
- Translation script changes (already local, not affected)
- Hosting or publishing the CV online (future scope)
- Changing the CV content (only meta.theme config is added)

## Decisions

**1. CLI: `resumed` over `resume-cli`**

Choice: **`resumed`** (npm package `resumed`)

Rationale: Same author as the current theme (`jsonresume-theme-even`), pure ESM with CJS compatibility, ~180 LOC, no patches needed, `--puppeteer-arg` flag for PDF customization, active maintenance. Eliminates all CJS/ESM issues and Docker requirement.

Alternative rejected: Continue with `resume-cli` — would require maintaining Docker + patches with no benefit.

**2. Theme: `jsonresume-theme-stackoverflow` over `jsonresume-theme-even`**

Choice: **`jsonresume-theme-stackoverflow`** v3.3.0

Rationale: Zero dependencies (no @rbardini/html), built-in `pdfRenderOptions` with 0.8cm margins, profile image support (`float: right`), i18n with Italian, customizable via `meta.theme`, section ordering. Styled after Stack Overflow's familiar developer CV layout. Weekly downloads: ~285, actively maintained.

Alternative rejected: Continue with `jsonresume-theme-even` — requires patches, no PDF margins, problematic CJS/ESM mix, no i18n.

**3. Docker removal: native Puppeteer over Docker**

Choice: **Native `puppeteer`** installation via `npm install puppeteer`

Rationale: Puppeteer auto-downloads Chromium (~170MB). No Docker needed. Better GPU access for background colors. Simpler Makefile. Translation already runs natively. Total `node_modules` size is comparable to Docker image but shared across all commands.

Alternative rejected: Keep Docker — adds complexity for no benefit; the Docker image was a workaround for Puppeteer/Chromium installation friction that `npm install puppeteer` solves natively.

**4. PDF format: A4 with explicit margins**

Choice: **A4 format with 1cm margins** via `--puppeteer-arg`

Rationale: A4 is the European standard. Theme's default 0.8cm margins are tight; 1cm provides better readability. `resumed` supports `--puppeteer-arg` for passing Puppeteer launch args, and the theme's `pdfRenderOptions` can be extended with a custom rendering step for format and margins.

**5. Theme customization via `meta.theme` in resume JSON**

Choice: Configure colors, fonts, language, and section ordering in `firstname-lastname-cv.json` under `meta.theme`

Rationale: `jsonresume-theme-stackoverflow` reads `meta.theme` for customization. This keeps configuration in the data file, not in build scripts. Italian language via `changeLanguage('it')` — need to verify if this can be triggered via `meta.theme` or requires a wrapper script.

**6. Makefile: native commands over Docker wrappers**

Choice: **`npx resumed` commands** with source file verification

Rationale: All targets keep their names (`build`, `valid`, `html`, `pdf`, `serve`, `translate`, `clean`). `build` becomes `npm install` (or a no-op if already installed). Docker-specific flags (`--rm`, `--service-ports`) are removed. `RESUME_PUPPETEER_NO_SANDBOX` env var is replaced by `--puppeteer-arg --no-sandbox` on Linux.

## Risks / Trade-offs

- **[Risk] Puppeteer Chromium download size**: ~170MB on first `npm install`. Mitigation: documented in README, cached after first install.
- **[Risk] `resumed` CLI maturity**: At ~180 LOC it's simpler than `resume-cli`, which means fewer features (no `serve` command built-in). Mitigation: use `resumed render --watch` for dev preview, or a simple static file server.
- **[Risk] Theme `stackoverflow` Italian support**: The theme supports `changeLanguage('it')` but this may need to be called programmatically. If not available via `meta.theme`, a small wrapper script may be needed. Mitigation: verify during implementation; worst case, add a thin render script.
- **[Risk] PDF background color rendering**: Still depends on Puppeteer/Chromium. Should be better natively than in Docker. Mitigation: test on target platform; `printBackground: true` is already set in theme's `pdfRenderOptions`.
- **[Trade-off] PDF layout difference**: The stackoverflow theme has a different visual design than even (Stack Overflow style vs. flat minimal). This is intentional and desired — better PDF output with proper margins and image support.
- **[Trade-off] `resumed` has no `serve` command**: The live preview will use `resumed render --watch` + a simple HTTP server, or just `npx http-server` on the output directory.

## Open Questions

- Does `resumed` support a web server / live preview mode, or do we need a separate tool? → Research needed during implementation.
- Can the `stackoverflow` theme's `changeLanguage('it')` be triggered via `meta.theme` or environment variable, or does it require a custom render script? → Verify during implementation.
- Should we keep the `--puppeteer-arg --no-sandbox` flag on all Linux systems or detect when it's needed? → Add to Makefile conditionally.
- What happens to the `build` Makefile target? It was `docker compose build`. Options: `npm install` (idempotent) or remove it entirely.