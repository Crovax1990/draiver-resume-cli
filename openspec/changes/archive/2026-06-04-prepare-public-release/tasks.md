## 1. Cleanup and git configuration

- [x] 1.1 Remove `data/firstname-lastname-cv.json` from git tracking: `git rm --cached data/firstname-lastname-cv.json`
- [x] 1.2 Update `.gitignore`: replace `data/firstname-lastname-cv.en.json` and `data/firstname-lastname-cv.translateme.json` with generic patterns `data/resume.json`, `data/*.en.json`, `data/*.translateme.json`

## 2. Sample resume template

- [x] 2.1 Create `data/resume.example.json` with all JSON Resume sections (basics, work, education, skills, languages, projects, interests) using placeholder data, `meta.themePackage` set to `jsonresume-theme-stackoverflow`, no base64 image

## 3. Makefile generalization

- [x] 3.1 Rename `RESUME_IT` to `RESUME` (default `data/resume.json`) and derive `RESUME_EN` from it: `$(RESUME:.json=.en.json)`
- [x] 3.2 Rename `PDF_IT` to `PDF` and derive automatically: `$(OUTPUT_DIR)/$(notdir $(RESUME:.json=.pdf))`
- [x] 3.3 Rename `PDF_EN` to derive from `RESUME_EN`: `$(OUTPUT_DIR)/$(notdir $(RESUME_EN:.json=.pdf))`
- [x] 3.4 Update all targets (`valid`, `html`, `pdf`, `serve`, `translate`, `html-en`, `pdf-en`, `clean`) to use new variable names

## 4. Translate script path update

- [x] 4.1 Update `SOURCE_FILE` in `scripts/translate.js` from `firstname-lastname-cv.json` to `resume.json`
- [x] 4.2 Update `OUTPUT_FILE` in `scripts/translate.js` from `firstname-lastname-cv.en.json` to `resume.en.json`
- [x] 4.3 Update `EXTRACT_FILE` in `scripts/translate.js` from `firstname-lastname-cv.translateme.json` to `resume.translateme.json`

## 5. README creation

- [x] 5.1 Create `README.md` with: project description, reference to jsonresume/resume-cli, reference to jsonresume schema, features list (HTML/PDF rendering, custom themes, translation), quick start commands, theme switching guide, links to themes/schema/upstream, license

## 6. CONTRIBUTING creation

- [x] 6.1 Create `CONTRIBUTING.md` with: local setup instructions, how to test changes, how to add a new theme, PR guidelines

## 7. Documentation updates

- [x] 7.1 Update `doc/pdf-generation.md`: replace `firstname-lastname-cv` references with `resume` in paths and examples
- [x] 7.2 Update `doc/capabilities.md`: update artifact-organization capability description to reflect new generic file names

## 8. Verification

- [x] 8.1 Verify `data/resume.example.json` is tracked by git and `data/resume.json` is gitignored
- [x] 8.2 Verify `make pdf` works with the sample file
- [x] 8.3 Verify `make clean` removes generated artifacts without errors
- [x] 8.4 Run `git status` to confirm no sensitive files are staged for commit
