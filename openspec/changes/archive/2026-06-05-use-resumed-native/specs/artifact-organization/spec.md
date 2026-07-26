# Artifact Organization

## MODIFIED Requirements

### Requirement: Standardized directory layout
The system SHALL organize project files into a standardized directory layout with separate directories for source data, rendered outputs, and documentation.

#### Scenario: Data directory structure
- **WHEN** the project is initialized
- **THEN** a `data/` directory SHALL exist at the project root containing: `resume.example.json` (sample template, tracked), user's CV files matching the prefix pattern (tracked or gitignored per `.gitignore`), and `output/` for rendered artifacts

#### Scenario: Output directory structure
- **WHEN** the project is initialized
- **THEN** an `output/` directory SHALL exist at the project root containing rendered resume outputs: PDFs, HTMLs

### Requirement: Path constants point to prefix-based files
The translation script SHALL point its file path constants to files matching the CV prefix pattern.

#### Scenario: Translation source path
- **WHEN** `scripts/translate.js` reads the source file
- **THEN** it SHALL read from `data/firstname-lastname-cv.json`

#### Scenario: Translation output path
- **WHEN** `scripts/translate.js` writes the English translation
- **THEN** it SHALL write to `data/firstname-lastname-cv.en.json`

#### Scenario: Translation extract path
- **WHEN** `scripts/translate.js --extract` writes the extract file
- **THEN** it SHALL write to `data/firstname-lastname-cv.translateme.json`

### Requirement: Makefile uses prefix discovery
The Makefile SHALL discover resume JSON files by prefix pattern instead of fixed variable names.

#### Scenario: Make pdf generates for all matching sources
- **WHEN** `make pdf` is executed with `CV_PREFIX=firstname-lastname-cv`
- **THEN** it SHALL render PDFs for all matching `data/firstname-lastname-cv*.json` files (excluding `.example.json` and `.translateme.json`)

#### Scenario: Make with custom prefix
- **WHEN** `make pdf CV_PREFIX=my-cv` is executed
- **THEN** it SHALL render PDFs for all matching `data/my-cv*.json` files

#### Scenario: Make validate validates all matching sources
- **WHEN** `make valid` is executed
- **THEN** it SHALL validate all resume JSON files matching the current `CV_PREFIX` pattern

### Requirement: Custom render scripts removed
The project SHALL NOT contain custom render scripts that duplicate `resumed` CLI functionality.

#### Scenario: No custom render HTML script
- **WHEN** the project is initialized
- **THEN** `scripts/render-html.mjs` SHALL NOT exist

#### Scenario: No custom render PDF script
- **WHEN** the project is initialized
- **THEN** `scripts/render-pdf.mjs` SHALL NOT exist
