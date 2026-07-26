## 1. Project Setup

- [x] 1.1 Create `package.json` with dependencies: `openai`, `@vitalets/google-translate-api`, `dotenv`
- [x] 1.2 Create `.env.example` file with `OPENAI_API_KEY=your-key-here`
- [x] 1.3 Add `.env` and `node_modules/` to `.gitignore`
- [x] 1.4 Add `firstname-lastname-cv.en.json` to `.gitignore`
- [x] 1.5 Run `npm install` to install dependencies

## 2. Translation Engine — Core Walker

- [x] 2.1 Create `scripts/translate.js` with file I/O skeleton: read `firstname-lastname-cv.json`, write `firstname-lastname-cv.en.json`
- [x] 2.2 Implement translatable field whitelist map (which JSON Resume paths to translate vs preserve)
- [x] 2.3 Implement recursive JSON walker that traverses the CV structure and collects translatable strings grouped by section
- [x] 2.4 Implement output merger: walk the original JSON and replace translatable fields with their translations, preserving structure and non-translatable fields verbatim

## 3. Translation Engine — OpenAI Provider

- [x] 3.1 Implement OpenAI API client using the `openai` SDK with GPT-4o-mini as default model
- [x] 3.2 Implement section-batched prompt: send one prompt per section (basics, work, education, skills, languages, projects, interests) requesting structured JSON output
- [x] 3.3 Implement response parsing: validate LLM JSON response structure matches expected output for each section
- [x] 3.4 Add `--model` CLI flag to override the default OpenAI model
- [x] 3.5 Add error handling: log OpenAI API errors and fall back to Google Translate engine

## 4. Translation Engine — Google Translate Fallback

- [x] 4.1 Implement Google Translate client using `@vitalets/google-translate-api` with `from: 'it', to: 'en'`
- [x] 4.2 Add `--fallback` CLI flag to force Google Translate usage
- [x] 4.3 Implement retry with exponential backoff (3 attempts) for rate-limit 429 responses
- [x] 4.4 Implement field-by-field translation mode for Google Translate (no batching, each field individually)

## 5. Meta and Output Handling

- [x] 5.1 Set `meta.language` to `"en"` in the output file regardless of source value
- [x] 5.2 Preserve `meta.theme` and `meta.version` verbatim from source
- [x] 5.3 Write output to `firstname-lastname-cv.en.json` with 2-space indentation (matching source formatting)

## 6. Makefile Integration

- [x] 6.1 Add `translate` target: run `node scripts/translate.js` (with Docker wrapper matching existing patterns)
- [x] 6.2 Add `html-en` target: translate then `resume export cv-output.en.html --resume firstname-lastname-cv.en.json --theme even`
- [x] 6.3 Add `pdf-en` target: translate then `resume export cv-output.en.pdf --resume firstname-lastname-cv.en.json --theme even --no-sandbox`
- [x] 6.4 Update `clean` target to remove `cv-output.en.html`, `cv-output.en.pdf`, and `firstname-lastname-cv.en.json`

## 7. Testing and Validation

- [x] 7.1 Run the translation script with `--fallback` flag and verify `firstname-lastname-cv.en.json` is generated
- [x] 7.2 Verify structure preservation: compare keys/types/lengths between IT and EN JSON
- [x] 7.3 Verify non-translatable fields are preserved (urls, dates, email, phone, countryCode)
- [x] 7.4 Verify `meta.language` is `"en"` and `meta.theme` is `"even"`
- [x] 7.5 Test `make translate` target executes successfully