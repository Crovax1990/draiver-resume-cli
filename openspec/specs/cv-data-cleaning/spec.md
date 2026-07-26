## ADDED Requirements

### Requirement: Remove all citation artifacts from JSON fields
The system SHALL remove all occurrences of the pattern `[cite: N]` (where N is any integer) from every string value in the JSON file. This includes fields in `basics`, `work`, `education`, `skills`, `languages`, `projects`, and any nested objects or arrays.

#### Scenario: Citation artifact removal
- **WHEN** the JSON file contains string values with `[cite: 1]` or similar citation markers
- **THEN** all such markers SHALL be stripped, leaving only the clean text content (e.g., `"Campi Bisenzio[cite: 1]"` becomes `"Campi Bisenzio"`)

#### Scenario: No residual whitespace from removal
- **WHEN** a citation marker is removed from a string
- **THEN** no leading or trailing whitespace SHALL be introduced by the removal (e.g., `"Java (1.8 - 21+)[cite: 1]"` becomes `"Java (1.8 - 21+)"`, not `"Java (1.8 - 21+) "`)

### Requirement: Normalize endDate for current positions
The system SHALL omit the `endDate` field entirely for any work or education entry where the original value was `"Attuale"` or equivalent indicating a present/ongoing position.

#### Scenario: Current work position
- **WHEN** a work entry has `endDate: "Attuale"` or similar
- **THEN** the `endDate` field SHALL be removed from that entry, and no `endDate` key SHALL be present in the JSON output

#### Scenario: Current education
- **WHEN** an education entry has `endDate: "Attuale"` or similar
- **THEN** the `endDate` field SHALL be removed from that entry

### Requirement: Normalize phone number to international format
The system SHALL convert the phone number to E.164 international format with spaces for readability.

#### Scenario: Phone number conversion
- **WHEN** the original phone field is `"(+39) +39 XXX XXX XXXX"`
- **THEN** it SHALL be normalized to `"+39 329 141 5445"`

### Requirement: Simplify physical address
The system SHALL replace the detailed street address with a simplified city-level address.

#### Scenario: Address simplification
- **WHEN** the original `basics.location.address` is `"Via XIII Martiri 108/A"` and `postalCode` is `"50013"`
- **THEN** the `address` field SHALL become `"Campi Bisenzio (FI), Toscana, Italia"` and `postalCode` SHALL be set to `""`

### Requirement: Set placeholder image
The system SHALL set `basics.image` to `"placeholder.png"` when the original value is empty.

#### Scenario: Empty image field
- **WHEN** the original `basics.image` is `""`
- **THEN** it SHALL be set to `"placeholder.png"`

### Requirement: Create placeholder image file
The system SHALL create a `placeholder.png` file in the project root as a temporary image for CV rendering until the user replaces it with an actual photo.

#### Scenario: Placeholder file exists
- **WHEN** the CV references `placeholder.png` as `basics.image`
- **THEN** a file named `placeholder.png` SHALL exist in the project root directory

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

### Requirement: Source file verification before Docker operations
The Makefile SHALL verify that the source JSON file (`firstname-lastname-cv.json`) exists before executing any Docker-based rendering commands.

#### Scenario: Missing source file
- **WHEN** `make html`, `make pdf`, `make valid`, or `make serve` is executed and `firstname-lastname-cv.json` does not exist in the project root
- **THEN** the target SHALL fail with an error message indicating that the source file is missing