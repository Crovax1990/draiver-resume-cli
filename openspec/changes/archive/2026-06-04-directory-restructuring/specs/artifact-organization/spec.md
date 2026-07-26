## ADDED Requirements

### Requirement: Standardized directory layout
The system SHALL organize project files into a standardized directory layout with separate directories for source data, rendered outputs, and documentation.

#### Scenario: Data directory structure
- **WHEN** the project is initialized
- **THEN** a `data/` directory SHALL exist at the project root containing JSON resume files: `firstname-lastname-cv.json` (Italian source), `firstname-lastname-cv.en.json` (English translation output)

#### Scenario: Output directory structure
- **WHEN** the project is initialized
- **THEN** an `output/` directory SHALL exist at the project root containing rendered resume outputs: PDFs, HTMLs

### Requirement: Generated files are gitignored
The system SHALL ensure all generated files in `data/` and `output/` are listed in `.gitignore` to prevent accidental commits.

#### Scenario: English JSON gitignored
- **WHEN** `.gitignore` is read
- **THEN** it SHALL contain an entry that ignores `data/firstname-lastname-cv.en.json`

#### Scenario: Translation extract gitignored
- **WHEN** `.gitignore` is read
- **THEN** it SHALL contain an entry that ignores `data/firstname-lastname-cv.translateme.json`

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

### Requirement: Path constants point to new directories
The translation script SHALL point its file path constants to the new `data/` and `output/` directories.

#### Scenario: Translation source path
- **WHEN** `scripts/translate.js` reads the source file
- **THEN** it SHALL read from `data/firstname-lastname-cv.json`

#### Scenario: Translation output path
- **WHEN** `scripts/translate.js` writes the English translation
- **THEN** it SHALL write to `data/firstname-lastname-cv.en.json`

#### Scenario: Translation extract path
- **WHEN** `scripts/translate.js --extract` writes the extract file
- **THEN** it SHALL write to `data/firstname-lastname-cv.translateme.json`

### Requirement: Makefile paths point to new directories
The Makefile SHALL reference all files using the new directory layout.

#### Scenario: Make pdf target
- **WHEN** `make pdf` is executed
- **THEN** it SHALL read from `data/firstname-lastname-cv.json` and write to `output/cv-output.pdf`

#### Scenario: Make html target
- **WHEN** `make html` is executed
- **THEN** it SHALL read from `data/firstname-lastname-cv.json` and write to `output/cv-output.html`

#### Scenario: Make pdf-en target
- **WHEN** `make pdf-en` is executed
- **THEN** it SHALL read from `data/firstname-lastname-cv.en.json` and write to `output/cv-output.en.pdf`
