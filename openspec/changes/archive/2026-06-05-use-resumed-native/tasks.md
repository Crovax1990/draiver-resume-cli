## 1. JSON Data Updates

- [x] 1.1 Remove `meta.theme` styling object and rename `meta.themePackage` → `meta.theme` in `data/firstname-lastname-cv.json`
- [x] 1.2 Remove `meta.theme` styling object and rename `meta.themePackage` → `meta.theme` in `data/firstname-lastname-cv.en.json`
- [x] 1.3 Rename `meta.themePackage` → `meta.theme` in `data/resume.example.json`
- [x] 1.4 Rename `meta.themePackage` → `meta.theme` in `data/resume.json` (gitignored user copy)

## 2. Custom Script Cleanup

- [x] 2.1 Delete `scripts/render-html.mjs`
- [x] 2.2 Delete `scripts/render-pdf.mjs`
- [x] 2.3 Update `scripts/translate.js` default `SOURCE_FILE` and `OUTPUT_FILE` from `resume` to `firstname-lastname-cv`
- [x] 2.4 Fix `scripts/translate.js` `mergeTranslations()` fallback from `'even'` to `'jsonresume-theme-stackoverflow'`

## 3. Makefile Rewrite

- [x] 3.1 Replace fixed `RESUME`/`RESUME_EN` variables with `CV_PREFIX`-based wildcard discovery
- [x] 3.2 Rewrite `valid` target to iterate over all matching CV sources
- [x] 3.3 Rewrite `html` target with pattern rule `output/%.html: data/%.json` using `resumed render`
- [x] 3.4 Rewrite `pdf` target with pattern rule `output/%.pdf: data/%.json` using `resumed export` with `SANDBOX_FLAG`
- [x] 3.5 Update `serve` target to use `resumed render` for the primary CV
- [x] 3.6 Update `translate` targets to pass `--source` and `--output` with `CV_PREFIX`
- [x] 3.7 Update `clean` target to remove all prefix-matching artifacts

## 4. Dependency Cleanup

- [x] 4.1 Remove `@vitalets/google-translate-api` from `package.json`

## 5. Documentation Update

- [x] 5.1 Update `README.md` — replace `meta.themePackage` with `meta.theme`, remove render script references, update workflow diagram and command examples
- [x] 5.2 Update `CONTRIBUTING.md` — remove render scripts from project structure, update theme setup to use `meta.theme`
- [x] 5.3 Update `doc/capabilities.md` — reflect removed `changeLanguage()`, updated theme field, removed render scripts
- [x] 5.4 Update `doc/pdf-generation.md` — replace script references with native `resumed export`, update field references
- [x] 5.5 Update `openspec/specs/theme-configuration/spec.md` — apply the delta (MODIFIED + REMOVED requirements)
- [x] 5.6 Update `openspec/specs/artifact-organization/spec.md` — apply the delta (MODIFIED requirements)

## 6. Validation

- [x] 6.1 Run `npm install` and verify no dependency errors
- [x] 6.2 Run `make valid` and verify all JSON files pass validation
- [x] 6.3 Run `make html` and verify HTML files generated for all matching CVs
- [x] 6.4 Run `make pdf` and verify PDF files generated for all matching CVs
- [x] 6.5 Run `make clean` and verify all artifacts are removed
- [x] 6.6 Verify `make serve` starts a preview server on port 4000
