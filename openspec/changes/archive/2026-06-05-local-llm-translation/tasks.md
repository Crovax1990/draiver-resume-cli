## 1. Cleanup

- [x] 1.1 Delete `firstname-lastname-cv-en.json` (corrupted output file)
- [x] 1.2 Remove `@vitalets/google-translate-api` from `package.json` dependencies and run `npm install` to update lockfile
- [x] 1.3 Remove all Google Translate functions from `scripts/translate.js`: `translateWithGoogle`, `translateStringsWithGoogle`, `translateSectionWithGoogle`, `translateAllWithGoogle`, `sleep`
- [x] 1.4 Make `--fallback` flag print an error message and exit with non-zero code

## 2. Robust JSON Parser

- [x] 2.1 Add `extractJSON(content)` function that: strips markdown fences (` ```json ... ``` `), finds the first `{` or `[`, matches to the closing bracket using a bracket counter, and parses the extracted substring as JSON
- [x] 2.2 Add `parseLLMResponse(response)` function that: reads `choices[0].message.content`, calls `extractJSON()`, and returns the parsed object; throws with raw content on parse failure
- [x] 2.3 Add `finish_reason` check: if `"length"`, log warning about possible truncation and throw error

## 3. Structured Prompt Builder

- [x] 3.1 Create `buildLocalPrompt(sectionName, sectionData)` function that generates a prompt with `[TASK]`, `[RULES]`, `[GLOSSARY]`, `[EXAMPLE]`, `[INPUT]` sections
- [x] 3.2 Implement the `[GLOSSARY]` section: extract all technology names and proper nouns from the input `sectionData` (any word matching known tech brands, or capitalized terms not at sentence start), plus a static list of common terms (Kubernetes, Kafka, etc.)
- [x] 3.3 Implement the `[EXAMPLE]` section: provide a hardcoded input→output pair per section type (basics, work, education, skills, languages, projects, interests)
- [x] 3.4 Implement the `[RULES]` section: include all translation rules (preserve keys, keep technical terms, no markdown, return only JSON, fluency mappings)

## 4. Local LLM Translation Path

- [x] 4.1 Add `--local` flag parsing to `parseArgs()`
- [x] 4.2 Add `checkLocalServer()` function: GET `/health` on `OPENAI_BASE_URL`, exit with error if unreachable
- [x] 4.3 Add `checkLocalModel()` function: GET `/v1/models`, verify configured model ID exists in response
- [x] 4.4 Add `translateWithLocalLLM(sections)` function: create OpenAI client with `baseURL` from `OPENAI_BASE_URL`, `apiKey: "sk-no-key-needed"`, model from `LOCAL_LLM_MODEL`; for each section, call `buildLocalPrompt()`, send request with `max_tokens: 4096` and NO `response_format`, parse response with `parseLLMResponse()`
- [x] 4.5 Update `main()` to route to `translateWithLocalLLM()` when `--local` is set

## 5. Extract / Merge Workflow

- [x] 5.1 Add `--extract` flag parsing to `parseArgs()`
- [x] 5.2 Add `--merge <file>` flag parsing to `parseArgs()`
- [x] 5.3 Add `--output <path>` flag parsing to `parseArgs()`
- [x] 5.4 Add `--source <path>` flag parsing to `parseArgs()`
- [x] 5.5 Implement `extractTranslatable(source)`: generate JSON with only translatable fields (using existing whitelist), add `_instructions` key, omit `meta` and `profiles` sections
- [x] 5.6 Implement `mergeTranslated(source, translated)`: read translated JSON, merge values back using same whitelist logic as existing `mergeTranslations()`, set `meta.language` to `"en"`
- [x] 5.7 Add structural validation in `mergeTranslated()`: compare output keys, types, and array lengths against source for all translatable sections; throw on mismatch
- [x] 5.8 Update `main()` to handle `--extract` path: call `extractTranslatable()`, write to output file (default: `firstname-lastname-cv.translateme.json`)
- [x] 5.9 Update `main()` to handle `--merge` path: call `mergeTranslated()`, write to output file (default: `firstname-lastname-cv.en.json`)

## 6. Environment & Configuration

- [x] 6.1 Update `.env.example`: add `OPENAI_BASE_URL=http://localhost:8080/v1` and `LOCAL_LLM_MODEL=gemma-4-12b-it-Q8_0` entries
- [x] 6.2 Update error message for missing `OPENAI_API_KEY`: suggest `--local` or `--extract` as alternatives

## 7. Makefile

- [x] 7.1 Add `translate-local` target: `node scripts/translate.js --local`
- [x] 7.2 Add `translate-extract` target: `node scripts/translate.js --extract`
- [x] 7.3 Add `translate-merge` target: `node scripts/translate.js --merge $(FILE)`
- [x] 7.4 Update `.PHONY` to include new targets
- [x] 7.5 Remove `translate-fallback` target (Google Translate removed)

## 8. Verification

- [x] 8.1 Run `node scripts/translate.js --local` and verify `firstname-lastname-cv-en.json` is generated with complete English translation
- [x] 8.2 Run `node scripts/translate.js --extract` and verify `firstname-lastname-cv.translateme.json` contains only translatable fields with `_instructions` key
- [x] 8.3 Manually test `--merge` flow: extract → translate externally → merge back
- [x] 8.4 Verify `make translate-local`, `make translate-extract`, `make translate-merge` targets work
- [x] 8.5 Verify `--fallback` exits with error message
