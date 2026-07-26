## ADDED Requirements

### Requirement: Extract translatable content to file
The system SHALL provide an `--extract` flag on `scripts/translate.js` that generates a JSON file containing only the translatable fields from the source CV, with all non-translatable fields removed.

#### Scenario: Extract to default file
- **WHEN** the script is invoked with `--extract`
- **THEN** it SHALL read `firstname-lastname-cv.json`, collect all translatable fields (as defined by the existing translatable field whitelist), and write them to `firstname-lastname-cv.translateme.json` in the project root

#### Scenario: Extract with custom output file
- **WHEN** the script is invoked with `--extract --output=<path>`
- **THEN** it SHALL write the extracted content to the specified file path

#### Scenario: Extracted file structure
- **WHEN** the extract output file is generated
- **THEN** it SHALL contain the same JSON structure as the source, but with only the translatable fields populated; non-translatable fields (url, email, phone, countryCode, startDate, endDate, score, image, network, username) SHALL be omitted; the `meta` and `profiles` sections SHALL be omitted entirely

#### Scenario: Extracted file includes instruction header
- **WHEN** the extract output file is generated
- **THEN** it SHALL include a `_instructions` top-level key with the value: "Translate all string values from Italian to English. Keep all JSON keys unchanged. Preserve technical terms, brand names, and technology names as-is. Return this JSON with translated values only."

### Requirement: Merge translated content back into full JSON
The system SHALL provide a `--merge <file>` flag on `scripts/translate.js` that reads a translated JSON file and merges it back into the full source JSON structure.

#### Scenario: Merge from translated file
- **WHEN** the script is invoked with `--merge translated.json`
- **THEN** it SHALL read the source file `firstname-lastname-cv.json`, read the translated file, merge the translated values into the source structure using the same field whitelist, set `meta.language` to `"en"`, and write the result to `firstname-lastname-cv.en.json`

#### Scenario: Merge with custom source and output
- **WHEN** the script is invoked with `--merge translated.json --source=custom.json --output=result.json`
- **THEN** it SHALL use the specified source and output files

#### Scenario: Merge file not found
- **WHEN** the specified merge file does not exist
- **THEN** the script SHALL exit with a non-zero code and print an error message to stderr

#### Scenario: Merged JSON structure validation
- **WHEN** the merge is complete
- **THEN** the script SHALL validate that the output JSON has the same keys, types, and array lengths as the source JSON for all translatable sections; if any structural mismatch is detected, it SHALL report the mismatch and exit with a non-zero code

### Requirement: Makefile targets for extract and merge
The system SHALL provide `translate-extract` and `translate-merge` Makefile targets.

#### Scenario: make translate-extract
- **WHEN** `make translate-extract` is executed
- **THEN** it SHALL run `node scripts/translate.js --extract`

#### Scenario: make translate-merge
- **WHEN** `make translate-merge` is executed with a file argument (e.g., `make translate-merge FILE=translated.json`)
- **THEN** it SHALL run `node scripts/translate.js --merge $(FILE)`
