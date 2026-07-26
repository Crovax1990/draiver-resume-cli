# Local LLM Translation

## Requirements

### Requirement: Local LLM translation via llama-server
The system SHALL provide a `--local` flag on `scripts/translate.js` that routes translation requests to a local llama-server instance via the OpenAI-compatible `/v1/chat/completions` endpoint.

#### Scenario: Translation with --local flag
- **WHEN** the script is invoked with `--local`
- **THEN** it SHALL connect to `OPENAI_BASE_URL` (default: `http://localhost:8080/v1`) using the `openai` npm client with `baseURL` set to that value, and use `LOCAL_LLM_MODEL` (default: `LFM2.5-8B-A1B-Q8_0`) as the model

#### Scenario: Local server health check
- **WHEN** the script is invoked with `--local`
- **THEN** it SHALL check the server health endpoint (`/health`) before starting translation, and exit with a non-zero code and clear error message if the server is unreachable

#### Scenario: Local model availability check
- **WHEN** the script is invoked with `--local`
- **THEN** it SHALL verify the configured model exists in the server's `/v1/models` response, and exit with a non-zero code if the model is not available

### Requirement: Thinking-mode compatible JSON parsing
The system SHALL NOT use `response_format: { type: "json_object" }` when translating with a local LLM. Instead, it SHALL parse JSON from the raw response content using a robust extraction method.

#### Scenario: JSON extraction from raw response
- **WHEN** the local LLM returns a response containing thinking tokens in `reasoning_content` and the actual JSON in `content`
- **THEN** the script SHALL extract JSON from the `content` field by finding the first `{` or `[` and matching closing bracket, stripping any markdown fences (```json ... ```), and parsing the result

#### Scenario: Malformed JSON response
- **WHEN** the extracted content cannot be parsed as valid JSON
- **THEN** the script SHALL report the section name, the raw response, and exit with a non-zero code (no fallback)

#### Scenario: Response with markdown fences
- **WHEN** the local LLM wraps JSON output in markdown code fences (e.g., ```json\n{...}\n```)
- **THEN** the script SHALL strip the fences before parsing

### Requirement: Overestimated max_tokens for thinking models
The system SHALL set `max_tokens: 8192` per section request when using `--local` mode.

#### Scenario: Token budget for thinking models
- **WHEN** translating with `--local` mode
- **THEN** each section translation request SHALL use `max_tokens: 8192` to accommodate the model's reasoning tokens (which consume a significant portion of the budget)

#### Scenario: Truncated response
- **WHEN** the model response has `finish_reason: "length"` (truncated due to token limit)
- **THEN** the script SHALL report a warning indicating the section may be incomplete and exit with a non-zero code

### Requirement: Structured prompt with glossary and few-shot examples
The system SHALL use a structured prompt format for local LLM translation with the following sections: `[TASK]`, `[RULES]`, `[GLOSSARY]`, `[EXAMPLE]`, `[INPUT]`.

#### Scenario: Prompt structure
- **WHEN** building a translation prompt for a local LLM
- **THEN** the prompt SHALL contain tagged sections: `[TASK]` describing the translation task, `[RULES]` listing constraints, `[GLOSSARY]` listing terms that must NOT be translated, `[EXAMPLE]` showing a concrete input→output pair, and `[INPUT]` containing the actual data to translate

#### Scenario: Glossary content
- **WHEN** the glossary is generated
- **THEN** it SHALL include all technology names, brand names, and proper nouns present in the CV data

#### Scenario: Few-shot example per section type
- **WHEN** translating a section
- **THEN** the `[EXAMPLE]` block SHALL contain a short, representative input→output pair for that section type

### Requirement: Environment configuration for local LLM
The system SHALL support `OPENAI_BASE_URL` and `LOCAL_LLM_MODEL` environment variables for local LLM configuration.

#### Scenario: Default base URL
- **WHEN** `OPENAI_BASE_URL` is not set and `--local` is used
- **THEN** the script SHALL default to `http://localhost:8080/v1`

#### Scenario: Default local model
- **WHEN** `LOCAL_LLM_MODEL` is not set and `--local` is used
- **THEN** the script SHALL default to `LFM2.5-8B-A1B-Q8_0`

#### Scenario: API key for local mode
- **WHEN** `--local` is used
- **THEN** the script SHALL set `apiKey` to `"sk-no-key-needed"` (or any non-empty value) since the local server does not require authentication

### Requirement: Makefile target for local translation
The system SHALL provide a `translate-local` Makefile target.

#### Scenario: make translate-local
- **WHEN** `make translate-local` is executed
- **THEN** it SHALL run `node scripts/translate.js --local`
