## 1. Docker Infrastructure

- [x] 1.1 Create `docker/` directory in the project root
- [x] 1.2 Create `docker/Dockerfile` based on `node:20-alpine` with Chromium, system dependencies, Puppeteer env vars, and global install of `resume-cli` + `jsonresume-theme-even`
- [x] 1.3 Create `docker-compose.yml` with `resume` service: build context `.`, dockerfile `docker/Dockerfile`, image `local/resume-cli:latest`, volume `.:/workspace`, ports `4000:4000`, Puppeteer env vars, `stdin_open: true`, `tty: true`

## 2. Makefile — Italian Targets

- [x] 2.1 Add `.PHONY` declaration for all targets: `build valid html pdf serve translate translate-fallback html-en pdf-en clean clean-en`
- [x] 2.2 Add `build` target: `docker compose build`
- [x] 2.3 Add `valid` target: `docker compose run --rm resume test --resume firstname-lastname-cv.json`
- [x] 2.4 Add `html` target: `docker compose run --rm resume export cv-output.html --resume firstname-lastname-cv.json --theme even`
- [x] 2.5 Add `pdf` target: `docker compose run --rm resume export cv-output.pdf --resume firstname-lastname-cv.json --theme even --no-sandbox`
- [x] 2.6 Add `serve` target: `docker compose run --rm --service-ports resume serve --port 4000 --hostname 0.0.0.0 --resume firstname-lastname-cv.json --theme even`

## 3. Makefile — English Targets

- [x] 3.1 Preserve existing `translate` target: `node scripts/translate.js`
- [x] 3.2 Preserve existing `translate-fallback` target: `node scripts/translate.js --fallback`
- [x] 3.3 Update `html-en` target to use Docker: `docker compose run --rm resume export cv-output.en.html --resume firstname-lastname-cv.en.json --theme even` (depends on `firstname-lastname-cv.en.json`)
- [x] 3.4 Update `pdf-en` target to use Docker: `docker compose run --rm resume export cv-output.en.pdf --resume firstname-lastname-cv.en.json --theme even --no-sandbox` (depends on `firstname-lastname-cv.en.json`)
- [x] 3.5 Keep `firstname-lastname-cv.en.json` prerequisite target that runs `node scripts/translate.js`

## 4. Makefile — Clean Targets

- [x] 4.1 Update `clean` target to remove all generated files: `cv-output.html cv-output.pdf cv-output.en.html cv-output.en.pdf firstname-lastname-cv.en.json`
- [x] 4.2 Remove standalone `clean-en` target (merged into `clean`)

## 5. Source File Verification

- [x] 5.1 Add a Makefile variable `RESUME_IT := firstname-lastname-cv.json` and `RESUME_EN := firstname-lastname-cv.en.json` for DRY
- [x] 5.2 Add a prerequisite check in `html`, `pdf`, `valid`, and `serve` targets that verifies `$(RESUME_IT)` exists before running Docker commands

## 6. Gitignore Update

- [x] 6.1 Add `cv-output.html`, `cv-output.pdf`, `cv-output.en.html`, `cv-output.en.pdf` to `.gitignore` (if not already present)

## 7. Build and Validation

- [x] 7.1 Run `make build` and verify the Docker image builds successfully
- [x] 7.2 Run `make valid` and verify the Italian CV JSON validates against the JSON Resume schema
- [x] 7.3 Run `make html` and verify `cv-output.html` is generated from the Italian CV
- [x] 7.4 Run `make pdf` and verify `cv-output.pdf` is generated from the Italian CV