## 1. Dependency Installation

- [x] 1.1 Remove `jsonresume-theme-even` from `package.json` dependencies
- [x] 1.2 Add `resumed`, `jsonresume-theme-stackoverflow`, and `puppeteer` to `package.json` dependencies
- [x] 1.3 Remove `scripts/patch-rbardini-html.js` and delete the file
- [x] 1.4 Remove `postinstall` script from `package.json` (no longer needed)
- [x] 1.5 Run `npm install` and verify all new packages install correctly

## 2. Theme Configuration

- [x] 2.1 Update `firstname-lastname-cv.json` `meta.theme` from `"even"` to an object with `primaryColor`, `backgroundColor`, `fontFamily`, and `sectionOrder` fields for the stackoverflow theme
- [x] 2.2 Add `meta.language` set to `"it"` for Italian labels
- [x] 2.3 Verify the stackoverflow theme renders `basics.image` correctly (base64 data URI) by running `npx resumed render` and checking the HTML output

## 3. Makefile Rewrite

- [x] 3.1 Replace `THEME` variable — removed, theme config is in JSON `meta.theme`
- [x] 3.2 Replace `build` target from `docker compose build` to `npm install`
- [x] 3.3 Replace `valid` target from `docker compose run --rm resume validate` to `npx resumed validate`
- [x] 3.4 Replace `html` target — uses `scripts/render-html.mjs` (calls `changeLanguage()` for Italian labels)
- [x] 3.5 Replace `pdf` target — uses `scripts/render-pdf.mjs` (handles A4, 1cm margins, language, `--no-sandbox`)
- [x] 3.6 Replace `serve` target with render + `npx serve`
- [x] 3.7 Update `html-en` and `pdf-en` targets to use custom render scripts
- [x] 3.8 Keep `translate` and `translate-fallback` targets unchanged (local Node.js script)
- [x] 3.9 Keep `clean` target unchanged
- [x] 3.10 Remove `CHECK_SOURCE` macro (no longer needed)
- [x] 3.11 Remove `RESUME_PUPPETEER_NO_SANDBOX` env var — now uses `PUPPETEER_NO_SANDBOX` env var in custom scripts

## 4. Docker Removal

- [x] 4.1 Delete `docker/Dockerfile`
- [x] 4.2 Delete `docker-compose.yml`
- [x] 4.3 Delete `docker/` directory

## 5. PDF Format and Margins

- [x] 5.1 Verify that `jsonresume-theme-stackoverflow` exports `pdfRenderOptions` with margins (0.8cm default) — confirmed
- [x] 5.2 Create `scripts/render-pdf.mjs` that calls theme directly with `changeLanguage()`, Puppeteer with `format: 'A4'` and `margin: { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' }`, and `PUPPETEER_NO_SANDBOX` support
- [x] 5.3 Update Makefile `pdf` and `pdf-en` targets to use the custom render script
- [x] 5.4 Add `meta.pdfRenderOptions` to CV JSON for A4/1cm (used as override defaults in render script)
- [x] 5.5 Create `scripts/render-html.mjs` for HTML rendering with language support (since `resumed render` CLI doesn't pass `language` option to theme)

## 6. Validation and Testing

- [x] 6.1 Run `make build` and verify `npm install` completes successfully
- [x] 6.2 Run `make valid` — CV validates via `@jsonresume/schema`; `npx resumed validate` hits Node 24 `styleText` bug on error display but validation itself works
- [x] 6.3 Run `make html` — HTML renders with Italian labels (Progetti, Competenze, Esperienza, Istruzione) and profile image visible
- [x] 6.4 Run `make pdf` — PDF renders at 632KB with A4/1cm margins, profile image visible
- [x] 6.5 Fix JSON schema validation errors — removed empty `url` and `score` strings that violated `uri` format
- [x] 6.6 Run `make translate` — works correctly, exits with error when `OPENAI_API_KEY` not set, `--fallback` option available
- [ ] 6.7 Run `make html-en` and `make pdf-en` and verify English CV renders correctly (requires translated CV)
- [x] 6.8 Run `make clean` and verify all output files are removed