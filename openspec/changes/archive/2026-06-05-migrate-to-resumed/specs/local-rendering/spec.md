## ADDED Requirements

### Requirement: Native rendering with resumed CLI
The system SHALL use `resumed` as the CLI tool for all CV rendering operations (render, export, validate), replacing `resume-cli` inside Docker.

#### Scenario: Validate CV JSON
- **WHEN** `make valid` is executed
- **THEN** it SHALL run `npx resumed validate firstname-lastname-cv.json` to validate the JSON against the JSON Resume schema

#### Scenario: Generate HTML from Italian CV
- **WHEN** `make html` is executed
- **THEN** it SHALL run `npx resumed render firstname-lastname-cv.json -o cv-output.html -t jsonresume-theme-stackoverflow` to produce `cv-output.html`

#### Scenario: Generate PDF from Italian CV
- **WHEN** `make pdf` is executed
- **THEN** it SHALL run `npx resumed export firstname-lastname-cv.json -o cv-output.pdf -t jsonresume-theme-stackoverflow` with Puppeteer args `--format A4` and `--margin 1cm` to produce `cv-output.pdf`

#### Scenario: Generate HTML from English CV
- **WHEN** `make html-en` is executed and `firstname-lastname-cv.en.json` exists
- **THEN** it SHALL run `npx resumed render firstname-lastname-cv.en.json -o cv-output.en.html -t jsonresume-theme-stackoverflow` to produce `cv-output.en.html`

#### Scenario: Generate PDF from English CV
- **WHEN** `make pdf-en` is executed and `firstname-lastname-cv.en.json` exists
- **THEN** it SHALL run `npx resumed export firstname-lastname-cv.en.json -o cv-output.en.pdf -t jsonresume-theme-stackoverflow` with Puppeteer args `--format A4` and `--margin 1cm` to produce `cv-output.en.pdf`

### Requirement: Puppeteer for PDF generation
The system SHALL install `puppeteer` as a local npm dependency to provide Chromium for PDF rendering without Docker.

#### Scenario: Puppeteer installation
- **WHEN** `npm install` is executed in the project root
- **THEN** `puppeteer` SHALL be installed and its bundled Chromium SHALL be downloaded automatically

#### Scenario: No-sandbox flag on Linux
- **WHEN** `make pdf` or `make pdf-en` is executed on a Linux system where Chromium requires `--no-sandbox`
- **THEN** the Makefile SHALL pass `--puppeteer-arg --no-sandbox` to the `resumed export` command

### Requirement: Makefile build target replaced
The `build` Makefile target SHALL run `npm install` instead of `docker compose build` to ensure all dependencies (including puppeteer's Chromium) are available.

#### Scenario: Build target
- **WHEN** `make build` is executed
- **THEN** it SHALL run `npm install` to install or update all project dependencies including puppeteer and the theme

### Requirement: theme-stackoverflow configuration
The system SHALL configure `jsonresume-theme-stackoverflow` via the `meta.theme` field in the resume JSON for colors, language, and section ordering.

#### Scenario: Italian language
- **WHEN** the Italian CV (`firstname-lastname-cv.json`) is rendered
- **THEN** the theme SHALL use Italian labels and date formats as specified by the `language` field in `meta.theme`

#### Scenario: Custom colors
- **WHEN** the CV is rendered
- **THEN** the theme SHALL apply the custom colors defined in `meta.theme` (primaryColor, backgroundColor, etc.)

#### Scenario: Section ordering
- **WHEN** the CV is rendered
- **THEN** sections SHALL appear in the order specified by `meta.theme.sectionOrder`

### Requirement: PDF format A4 with margins
The system SHALL generate PDF output in A4 format with 1cm margins on all sides.

#### Scenario: PDF format and margins
- **WHEN** a PDF is generated via `make pdf` or `make pdf-en`
- **THEN** the PDF SHALL use A4 paper size (210mm x 297mm) with 1cm margins on all sides