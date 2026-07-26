## MODIFIED Requirements

### Requirement: Make translate target extension
The Makefile SHALL include additional targets for translation and English rendering alongside the existing cleaning/rendering targets.

#### Scenario: Translate target
- **WHEN** `make translate` is executed
- **THEN** it SHALL run `node scripts/translate.js` to generate `firstname-lastname-cv.en.json` from `firstname-lastname-cv.json`

#### Scenario: HTML English target
- **WHEN** `make html-en` is executed
- **THEN** it SHALL first run the translation to generate `firstname-lastname-cv.en.json`, then generate `cv-output.en.html` using `resume-cli export` with `--resume firstname-lastname-cv.en.json --theme even`

#### Scenario: PDF English target
- **WHEN** `make pdf-en` is executed
- **THEN** it SHALL first run the translation to generate `firstname-lastname-cv.en.json`, then generate `cv-output.en.pdf` using `resume-cli export` with `--resume firstname-lastname-cv.en.json --theme even --no-sandbox`

#### Scenario: Clean target update
- **WHEN** `make clean` is executed
- **THEN** it SHALL remove `cv-output.html`, `cv-output.pdf`, `cv-output.en.html`, `cv-output.en.pdf`, and `firstname-lastname-cv.en.json`

## ADDED Requirements

### Requirement: Source file verification before Docker operations
The Makefile SHALL verify that the source JSON file (`firstname-lastname-cv.json`) exists before executing any Docker-based rendering commands.

#### Scenario: Missing source file
- **WHEN** `make html`, `make pdf`, `make valid`, or `make serve` is executed and `firstname-lastname-cv.json` does not exist in the project root
- **THEN** the target SHALL fail with an error message indicating that the source file is missing