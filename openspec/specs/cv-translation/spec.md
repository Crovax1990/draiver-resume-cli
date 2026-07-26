## ADDED Requirements

### Requirement: Translate CV JSON from Italian to English
The system SHALL provide a Node.js script (`scripts/translate.js`) that reads `firstname-lastname-cv.json` (Italian) and produces `firstname-lastname-cv.en.json` (English) with all translatable text fields translated.

#### Scenario: Successful translation
- **WHEN** the script is invoked with `node scripts/translate.js`
- **THEN** it SHALL read `firstname-lastname-cv.json` from the project root, translate all translatable fields from Italian to English, and write the result to `firstname-lastname-cv.en.json` in the project root

#### Scenario: Source file not found
- **WHEN** `firstname-lastname-cv.json` does not exist in the project root
- **THEN** the script SHALL exit with a non-zero code and print an error message to stderr

### Requirement: Recursive JSON walker with translatable field whitelist
The system SHALL implement a recursive JSON walker that identifies translatable fields using a section-based whitelist and preserves all non-translatable fields verbatim.

#### Scenario: Translatable fields are translated
- **WHEN** the walker encounters a field in the translatable whitelist (basics.name, basics.label, basics.summary, basics.location.address/city/region, work[*].name, work[*].position, work[*].summary, work[*].highlights[], education[*].institution, education[*].area, education[*].studyType, skills[*].name, languages[*].language, languages[*].fluency, projects[*].name, projects[*].description, projects[*].highlights[], interests[*].name, interests[*].keywords[])
- **THEN** the field SHALL be translated from Italian to English

#### Scenario: Non-translatable fields are preserved
- **WHEN** the walker encounters a non-translatable field (url, email, phone, countryCode, startDate, endDate, score, image, meta, or any keyword that is a technology name)
- **THEN** the field SHALL be copied verbatim without translation

#### Scenario: JSON structure preservation
- **WHEN** the translation is complete
- **THEN** the output JSON SHALL have the exact same keys, types, array lengths, and nesting structure as the input JSON

### Requirement: OpenAI API as primary translation engine
The system SHALL use the OpenAI API (GPT-4o-mini model by default) as the primary translation engine when `--local` and `--fallback` are not used, sending section-grouped translation requests and receiving structured JSON responses.

#### Scenario: Translation with OpenAI API
- **WHEN** the `OPENAI_API_KEY` environment variable is set and neither `--local` nor `--fallback` is used
- **THEN** the script SHALL translate each section by sending a prompt to OpenAI GPT-4o-mini requesting translation with instructions to preserve technical terms and return structured JSON

#### Scenario: Missing API key without --local
- **WHEN** `OPENAI_API_KEY` is not set and `--local` is not used
- **THEN** the script SHALL exit with a non-zero code and print an error message indicating that `OPENAI_API_KEY` is required or `--local` can be used for local LLM translation

#### Scenario: Custom model selection
- **WHEN** the script is invoked with `--model <model-name>` flag
- **THEN** it SHALL use the specified OpenAI model instead of GPT-4o-mini

### Requirement: Google Translate fallback engine
The system SHALL NOT include Google Translate as a fallback engine. The `@vitalets/google-translate-api` dependency SHALL be removed. When translation fails (local or remote), the script SHALL report the error and exit with a non-zero code.

#### Scenario: Translation failure handling
- **WHEN** any translation request fails (network error, invalid response, parse error)
- **THEN** the script SHALL log the section name, the error details, and exit with a non-zero code — no fallback to any other engine

#### Scenario: --fallback flag removed
- **WHEN** the script is invoked with `--fallback` flag
- **THEN** it SHALL print an error message indicating that Google Translate fallback has been removed, and suggest using `--local` or `--extract` instead, then exit with a non-zero code

### Requirement: Section-batched translation
The system SHALL group translatable fields by JSON Resume section and send one LLM request per section to reduce API calls and maintain contextual coherence within sections.

#### Scenario: Batched translation per section
- **WHEN** translating the CV
- **THEN** the script SHALL group fields into sections (basics, work, education, skills, languages, projects, interests) and send one translation request per section

#### Scenario: LLM response parsing
- **WHEN** the LLM returns a response
- **THEN** the script SHALL parse the response using the mode-appropriate parser: for remote OpenAI, parse `content` as JSON directly; for local LLM, use the robust JSON extraction parser that handles thinking tokens and markdown fences, and validate that the structure matches the expected output for that section before merging into the output document

### Requirement: Meta section update for English locale
The system SHALL set the `meta.language` field to `"en"` in the output file, overwriting or creating the field regardless of the source value.

#### Scenario: Language field update
- **WHEN** the translation is complete
- **THEN** `meta.language` in the output file SHALL be `"en"` regardless of the source value

### Requirement: Makefile integration
The system SHALL provide Makefile targets for translation and English rendering.

#### Scenario: Make translate target
- **WHEN** `make translate` is executed
- **THEN** it SHALL run the translation script via Node.js inside the Docker container (or locally if Docker is not available)

#### Scenario: Make html-en target
- **WHEN** `make html-en` is executed
- **THEN** it SHALL first run the translation, then generate `cv-output.en.html` using `resume-cli` with `--resume firstname-lastname-cv.en.json --theme even`

#### Scenario: Make pdf-en target
- **WHEN** `make pdf-en` is executed
- **THEN** it SHALL first run the translation, then generate `cv-output.en.pdf` using `resume-cli` with `--resume firstname-lastname-cv.en.json --theme even --no-sandbox`

### Requirement: Environment configuration via .env file
The system SHALL support a `.env` file for API key configuration, with `.env` added to `.gitignore`.

#### Scenario: .env file loading
- **WHEN** the script is executed
- **THEN** it SHALL load environment variables from a `.env` file in the project root using the `dotenv` package

#### Scenario: .env in gitignore
- **WHEN** the project repository is initialized
- **THEN** `.env` SHALL be listed in `.gitignore` to prevent API key exposure

### Requirement: Docker-aware translation targets
The translation targets SHALL work both locally (with Node.js installed on the host) and inside Docker (if the translation script is run within the resume container).

#### Scenario: Local translation execution
- **WHEN** `make translate` is executed
- **THEN** it SHALL run `node scripts/translate.js` directly on the host without Docker, as the translation script requires npm dependencies not present in the resume container