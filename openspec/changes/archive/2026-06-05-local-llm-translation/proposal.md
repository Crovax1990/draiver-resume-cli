## Why

The current translation engine relies on the OpenAI API (GPT-4o-mini) with Google Translate as fallback. This requires an API key, sends personal CV data to external services, and the existing English output (`firstname-lastname-cv-en.json`) is a broken mix of Italian and English from a failed translation. A local LLM server (llama-server with gemma-4-12b-it-Q8_0) is available at `http://localhost:8080` and exposes an OpenAI-compatible API — enabling zero-cost, privacy-preserving translation. Additionally, there is no workflow for users who prefer to translate via external chatbots (Gemini, ChatGPT) with a structured extract/merge cycle.

## What Changes

- **BREAKING**: Remove Google Translate fallback engine (`@vitalets/google-translate-api` dependency and all related code). When translation fails, the script now reports the error and halts — no silent fallback.
- Add `--local` flag to `translate.js` that routes translation requests to a local llama-server instance via the OpenAI-compatible API, using model `gemma-4-12b-it-Q8_0` by default.
- Add `--extract` flag that generates a text file containing only the translatable content from the source JSON, formatted for easy paste into external chatbots.
- Add `--merge <file>` flag that reads a translated text/JSON file and merges it back into the full JSON structure using the resume schema.
- Strengthen the translation prompt for local models: explicit glossary of non-translatable terms, few-shot examples per section type, structured prompt format.
- Remove the corrupted `firstname-lastname-cv-en.json` output file.
- Handle Gemma 4's built-in thinking mode: do NOT use `response_format: { type: "json_object" }` (causes thinking tokens to consume output budget); instead use a robust JSON parser that extracts JSON from the response content.
- Overestimate `max_tokens` (~4096 per section) to account for Gemma 4's reasoning tokens (~90% of completion budget).
- Add schema validation after merge using `doc/resume-schema.json`.
- Update `.env.example` with `OPENAI_BASE_URL` and `LOCAL_LLM_MODEL` variables.
- Add Makefile targets: `translate-local`, `translate-extract`, `translate-merge`.

## Capabilities

### New Capabilities
- `local-llm-translation`: Translation via local llama-server (OpenAI-compatible API) with prompt engineering for Gemma 4 thinking models
- `extract-merge-translation`: Extract translatable content to a file, merge translated content back into the JSON resume structure

### Modified Capabilities
- `cv-translation`: Remove Google Translate fallback, change error handling to halt-on-failure, update prompt format, add JSON extraction parser for thinking-model output

## Impact

- **scripts/translate.js**: Major refactor — new flags, new translation path, prompt rewrite, parser changes, removal of Google Translate code
- **package.json**: Remove `@vitalets/google-translate-api` dependency
- **.env.example**: Add `OPENAI_BASE_URL`, `LOCAL_LLM_MODEL`
- **Makefile**: Add `translate-local`, `translate-extract`, `translate-merge` targets; update `translate` and `translate-fallback`
- **firstname-lastname-cv-en.json**: Deleted (corrupted output to be regenerated)
- **doc/resume-schema.json**: Read-only reference for validation (no changes)
