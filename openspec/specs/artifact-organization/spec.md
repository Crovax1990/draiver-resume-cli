# Artifact Organization

## Requirements

### Requirement: Standardized directory layout
The system SHALL organize project files into a standardized directory layout with separate directories for source data, rendered outputs, and documentation.

#### Scenario: Data directory structure
- **WHEN** the project is initialized
- **THEN** a `data/` directory SHALL exist at the project root containing: `resume.example.json` (sample template, tracked), user's CV files matching the prefix pattern (tracked or gitignored per `.gitignore`), and `output/` for rendered artifacts

#### Scenario: Output directory structure
- **WHEN** the project is initialized
- **THEN** an `output/` directory SHALL exist at the project root containing rendered resume outputs: PDFs, HTMLs

### Requirement: Generated files are gitignored
The system SHALL ensure all generated files in `data/` and `output/` are listed in `.gitignore` to prevent accidental commits.

#### Scenario: User resume gitignored
- **WHEN** `.gitignore` is read
- **THEN** it SHALL contain an entry that ignores `data/resume.json` (user's personal CV)

#### Scenario: Generated translations gitignored
- **WHEN** `.gitignore` is read
- **THEN** it SHALL contain a pattern that ignores `data/*.en.json`

#### Scenario: Translation extract gitignored
- **WHEN** `.gitignore` is read
- **THEN** it SHALL contain a pattern that ignores `data/*.translateme.json`

#### Scenario: Output directory gitignored
- **WHEN** `.gitignore` is read
- **THEN** it SHALL contain an entry that ignores `output/`

### Requirement: Stale files removed
The system SHALL remove unreferenced and stale files from the project root to reduce clutter.

#### Scenario: Public directory removed
- **WHEN** the project is initialized
- **THEN** the `public/` directory SHALL NOT exist (contains stale hand-generated HTML)

#### Scenario: Profile image removed
- **WHEN** the project is initialized
- **THEN** the `profile-image.png` file SHALL NOT exist at the project root (image data is embedded as base64 in the JSON)

#### Scenario: Custom render scripts removed
- **WHEN** the project is initialized
- **THEN** `scripts/render-html.mjs` and `scripts/render-pdf.mjs` SHALL NOT exist (replaced by native `resumed` CLI)

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
