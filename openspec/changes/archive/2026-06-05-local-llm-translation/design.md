## Context

The project uses a Node.js script (`scripts/translate.js`) to translate a JSON Resume from Italian to English. The current implementation uses the OpenAI API (GPT-4o-mini) as the primary engine and Google Translate as a fallback. A llama-server instance is available at `http://localhost:8080` with the `gemma-4-12b-it-Q8_0` model loaded, exposing an OpenAI-compatible `/v1/chat/completions` endpoint.

Key constraints discovered during exploration:

- **Gemma 4 has built-in thinking**: Every response includes `reasoning_content` that consumes ~90% of the `max_tokens` budget. For a simple 11-token JSON output, 227 tokens were consumed by reasoning.
- **`response_format: { type: "json_object" }` is supported but problematic**: The thinking tokens interfere — the model reasons inside the JSON structure, producing incomplete/corrupted JSON. Without `json_object`, the model outputs clean JSON after its thinking phase.
- **The existing EN file is corrupted**: `firstname-lastname-cv-en.json` contains a mix of Italian and English (e.g., "Use of GitHub Copilot CLI e framework SDD" — half-translated).
- **The `openai` npm package supports custom `baseURL`**: This means the local llama-server can be used with minimal code changes via `new OpenAI({ baseURL: "http://localhost:8080/v1" })`.

## Goals / Non-Goals

**Goals:**
- Enable zero-cost, privacy-preserving translation via local llama-server
- Provide an extract/merge workflow for external chatbot translation (Gemini, ChatGPT)
- Produce a correct, complete English JSON Resume
- Handle Gemma 4's thinking mode gracefully without output corruption
- Validate output against `doc/resume-schema.json`

**Non-Goals:**
- Streaming responses or progress bars
- Supporting multiple target languages (only IT→EN)
- Auto-retry with different models on failure
- Web UI for translation
- Translation of the `references` section (GDPR legal text stays in original language)

## Decisions

### D1: Use OpenAI client with custom baseURL for local LLM

**Decision**: Reuse the existing `openai` npm package, pointing `baseURL` to `http://localhost:8080/v1`.

**Rationale**: The llama-server exposes an OpenAI-compatible API. Using the same client avoids new dependencies and keeps the code path consistent between remote and local modes.

**Alternative considered**: Using `fetch()` directly — rejected because it would require re-implementing retry logic, error handling, and response parsing that the `openai` client already provides.

### D2: Do NOT use `response_format: { type: "json_object" }`

**Decision**: Send requests without `response_format` and parse JSON from the raw content string.

**Rationale**: Testing showed that with `json_object` mode enabled, Gemma 4's thinking tokens interfere with JSON output — producing truncated or corrupted JSON. Without it, the model outputs clean JSON after its thinking phase, separated by newlines.

**Parsing strategy**: Extract JSON using a regex that finds the first `{` or `[` to the last matching `}` or `]`, handling nested brackets.

**Alternative considered**: Using `json_object` mode with very high `max_tokens` — rejected because it wastes ~90% of tokens on reasoning and still produces unreliable output.

### D3: Set `max_tokens: 4096` per section request

**Decision**: Use 4096 max tokens per section translation request.

**Rationale**: The largest section (`work` with 4 entries, each with 5-8 highlights) produced ~1074 content tokens + ~500 reasoning tokens in testing. 4096 provides a 2x safety margin. For smaller sections (languages, interests), this is wasteful but harmless — the model stops early when done.

### D4: Structured prompt format with glossary and few-shot examples

**Decision**: Restructure the translation prompt into tagged sections: `[TASK]`, `[RULES]`, `[GLOSSARY]`, `[EXAMPLE]`, `[INPUT]`.

**Rationale**: Smaller models like Gemma 4 12B benefit from explicit structure. The current prose-style prompt works well for GPT-4 but causes Gemma 4 to ramble or miss rules. The glossary explicitly lists terms that must NOT be translated (Kubernetes, Kafka, ArgoCD, etc.), and the example provides a concrete input→output mapping.

### D5: Extract/merge uses JSON format, not flat text

**Decision**: The `--extract` flag outputs a JSON file containing only the translatable fields (same structure as the source, but with non-translatable fields stripped). The `--merge` flag reads back a JSON file with the same structure.

**Rationale**: JSON is easier to merge programmatically (key-path matching is trivial). Flat text would require a custom parser and is error-prone. Users can paste the extracted JSON into any chatbot and ask "translate the values to English, keep keys unchanged" — this is a common, well-understood prompt.

**Alternative considered**: Markdown key-value format — rejected because it loses array structure (critical for `highlights` and `keywords`), making re-parsing fragile.

### D6: Remove Google Translate fallback entirely

**Decision**: Remove the `@vitalets/google-translate-api` dependency and all Google Translate code. On failure, the script reports the error and exits.

**Rationale**: The Google Translate fallback produces poor quality for technical CV content (technology names get mangled). It also sends data to an external service, contradicting the privacy goal. The `--fallback` flag is replaced by `--local` and `--extract/merge` as the alternatives.

### D7: Schema validation after merge

**Decision**: After merging translations, validate the output JSON against `doc/resume-schema.json` using Ajv (or a simple structural check if Ajv is too heavy).

**Rationale**: Catches structural errors (missing required fields, wrong types) before the file is used for rendering. Prevents another corrupted EN file situation.

**Alternative considered**: No validation — rejected because it's exactly what allowed the current corrupted file to go unnoticed.

## Risks / Trade-offs

- **[Gemma 4 translation quality]** — A 12B model may produce less natural English than GPT-4o-mini, especially for long highlights with mixed Italian/English. → **Mitigation**: The extract/merge workflow allows manual review and correction via external chatbots. The prompt includes few-shot examples to improve consistency.

- **[Thinking token overhead]** — ~90% of tokens are reasoning, making each request ~10x slower/more expensive than a non-thinking model. → **Mitigation**: `max_tokens: 4096` with early stop. Average section takes ~15-40 seconds locally. Acceptable for a one-time translation.

- **[JSON parsing fragility]** — Without `json_object` mode, the model might wrap JSON in markdown fences or add explanatory text. → **Mitigation**: Robust JSON extraction that strips markdown fences and finds the outermost JSON structure.

- **[Local server availability]** — The llama-server must be running with the model loaded. → **Mitigation**: Script checks server health before starting; clear error message if unavailable.

- **[Schema validation adds dependency]** — Ajv adds ~200KB to node_modules. → **Mitigation**: Use a lightweight structural check instead (verify keys exist, types match, array lengths consistent) — no new dependency needed.
