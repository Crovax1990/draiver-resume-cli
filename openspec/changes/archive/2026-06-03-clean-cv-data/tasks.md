## 1. Data Cleaning

- [x] 1.1 Remove all `[cite: N]` artifacts from every string field in `firstname-lastname-cv.json` (basics.name, basics.location.*, basics.profiles[*].*, work[*].name, work[*].position, work[*].summary, work[*].highlights[*], education[*].*, skills[*].name, skills[*].keywords[*], languages[*].*, projects[*].*)
- [x] 1.2 Remove `endDate` field for current positions: `work[0].endDate` ("Attuale") and `education[0].endDate` ("Attuale")
- [x] 1.3 Normalize phone number from `"(+39) +39 XXX XXX XXXX"` to `"+39 329 141 5445"`
- [x] 1.4 Simplify `basics.location.address` to `"Campi Bisenzio (FI), Toscana, Italia"` and set `basics.location.postalCode` to `""`
- [x] 1.5 Set `basics.image` to `"placeholder.png"`

## 2. Profile Enrichment

- [x] 2.1 Update LinkedIn profile URL from `"https://www.linkedin.com/in/firstname-lastname"` to `"https://www.linkedin.com/in/firstname-lastname-12345/"`
- [x] 2.2 Clean LinkedIn profile `network` and `username` fields from `[cite: 1]` artifacts
- [x] 2.3 Add GitHub profile entry: `{ network: "GitHub", username: "your-username", url: "https://github.com/your-username" }`

## 3. Content Enrichment

- [x] 3.1 Rewrite `basics.summary` to include mentions of: llm-wiki pattern, OpenSpec, Opencode, GitHub Copilot CLI, and full-stack breadth (keep Italian language)
- [x] 3.2 Update `skills` array: rename "AI & Automation" to "AI & Agentic Development" with keywords `["Agentic AI", "Model Context Protocol (MCP)", "Local LLM (Qwen, Gemma, Llama)", "ChromaDB / RAG", "OpenSpec", "Opencode", "GitHub Copilot CLI"]`
- [x] 3.3 Add "React" to "Frontend & Web" keywords
- [x] 3.4 Add "Rust" and "TypeScript" to "Architetture e Linguaggi" keywords
- [x] 3.5 Add "SQLite" to "Database & Persistence" keywords
- [x] 3.6 Add "llm-wiki" to "Metodologie & Strumenti" keywords
- [x] 3.7 Replace `projects` array with exactly 2 entries: "Autonomous Educational Generator" (AI/RAG/MCP focus with OpenSpec+Opencode highlights) and "Smart Sales Calendar" (Tauri+React+Rust+SQLite with GitHub Copilot CLI highlight)

## 4. New Sections

- [x] 4.1 Add `interests` array with: `{ name: "Agentic AI & LLM Infrastructure", keywords: ["MCP", "Local LLM Inference", "RAG", "llm-wiki Pattern"] }` and `{ name: "Cycling & Outdoor", keywords: [] }`
- [x] 4.2 Add `meta` object with `{ theme: "even", language: "it", version: "v1.0.0" }`

## 5. Placeholder and Validation

- [x] 5.1 Create `placeholder.png` file in project root (placeholder image for CV rendering)
- [x] 5.2 Validate the cleaned JSON file against JSON Resume schema via `resume test --resume firstname-lastname-cv.json` (once Docker pipeline is available) or manual schema review
- [x] 5.3 Final review: verify all `[cite: 1]` markers are removed, no empty string values where not intended, and all new sections are properly formatted JSON