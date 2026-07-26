## MODIFIED Requirements

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
- **THEN** the script SHALL parse the response using the mode-appropriate parser: for remote OpenAI, parse `content` as JSON directly; for local LLM, use the robust JSON extraction parser that handles thinking tokens and markdown fences

## REMOVED Requirements

### Requirement: Google Translate fallback engine (original)
**Reason**: Google Translate produces poor quality for technical CV content (technology names get mangled) and sends personal data to an external service, contradicting the privacy goal of this change.
**Migration**: Use `--local` for local LLM translation, or `--extract`/`--merge` for external chatbot-assisted translation.

### Requirement: Google Translate rate limiting
**Reason**: Removed along with the Google Translate fallback engine.
**Migration**: Not applicable — no replacement needed.
