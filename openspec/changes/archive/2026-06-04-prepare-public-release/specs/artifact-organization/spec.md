# Artifact Organization

## MODIFIED Requirements

### Requirement: Standardized directory layout
The system SHALL organize project files into a standardized directory layout with separate directories for source data, rendered outputs, and documentation.

#### Scenario: Data directory structure
- **WHEN** the project is initialized
- **THEN** a `data/` directory SHALL exist at the project root containing: `resume.example.json` (sample template, tracked), and user's `resume.json` (gitignored)

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

### Requirement: Addressed in repo-publication
- **NOTE**: The `stale files removed` requirement is unchanged — `public/` and `profile-image.png` were already removed in the original artifact-organization change.

### Requirement: Path constants point to new directories
The translation script SHALL point its file path constants to generic resume file names.

#### Scenario: Translation source path
- **WHEN** `scripts/translate.js` reads the source file
- **THEN** it SHALL read from `data/resume.json`

#### Scenario: Translation output path
- **WHEN** `scripts/translate.js` writes the English translation
- **THEN** it SHALL write to `data/resume.en.json`

#### Scenario: Translation extract path
- **WHEN** `scripts/translate.js --extract` writes the extract file
- **THEN** it SHALL write to `data/resume.translateme.json`

### Requirement: Makefile paths point to new directories
The Makefile SHALL reference all files using generic variable names derived from the input resume file.

#### Scenario: Make pdf target
- **WHEN** `make pdf RESUME=data/resume.json` is executed
- **THEN** it SHALL read from `data/resume.json` and write to `output/resume.pdf`

#### Scenario: Make pdf with custom input
- **WHEN** `make pdf RESUME=data/my-cv.json` is executed
- **THEN** it SHALL read from `data/my-cv.json` and write to `output/my-cv.pdf`

#### Scenario: Make pdf-en target
- **WHEN** `make pdf-en RESUME=data/resume.json` is executed
- **THEN** it SHALL read from `data/resume.en.json` and write to `output/resume.en.pdf`
