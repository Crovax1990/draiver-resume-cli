## ADDED Requirements

### Requirement: Add GitHub profile to profiles array
The system SHALL add a GitHub profile entry to the `basics.profiles` array with the user's GitHub account details.

#### Scenario: GitHub profile addition
- **WHEN** the existing profiles array contains only a LinkedIn profile
- **THEN** a new profile entry SHALL be added with `network: "GitHub"`, `username: "your-username"`, and `url: "https://github.com/your-username"`

### Requirement: Correct LinkedIn profile URL
The system SHALL update the LinkedIn profile URL to the verified URL from the user's GitHub README.

#### Scenario: LinkedIn URL correction
- **WHEN** the existing LinkedIn URL is `"https://www.linkedin.com/in/firstname-lastname"`
- **THEN** it SHALL be updated to `"https://www.linkedin.com/in/firstname-lastname-12345/"`

### Requirement: Rewrite summary with emphasis on agentic toolchain
The system SHALL rewrite the `basics.summary` field to emphasize the agentic development toolchain, llm-wiki pattern, and full-stack capabilities, while preserving the core professional identity.

#### Scenario: Summary rewrite
- **WHEN** the original summary mentions only "Agentic AI basati su protocollo MCP"
- **THEN** the new summary SHALL include explicit mentions of: llm-wiki pattern, OpenSpec, Opencode, GitHub Copilot CLI, and full-stack technological breadth, in Italian language

### Requirement: Update skills section with agentic development emphasis
The system SHALL update the `skills` array to add agentic development tools and technologies, and include React, Rust, TypeScript, and SQLite where appropriate.

#### Scenario: Skills category update — AI section renamed
- **WHEN** the original skills section has `"name": "AI & Automation"`
- **THEN** it SHALL be renamed to `"name": "AI & Agentic Development"` and SHALL include keywords: `["Agentic AI", "Model Context Protocol (MCP)", "Local LLM (Qwen, Gemma, Llama)", "ChromaDB / RAG", "OpenSpec", "Opencode", "GitHub Copilot CLI"]`

#### Scenario: Skills category update — Frontend adds React and TypeScript
- **WHEN** the original skills section has `"name": "Frontend & Web"` with `keywords: ["Angular", "JavaScript / TypeScript", "Vaadin", "REST / SOAP Web Services"]`
- **THEN** the keywords SHALL be updated to `["Angular", "JavaScript / TypeScript", "React", "Vaadin", "REST / SOAP Web Services"]`

#### Scenario: Skills category update — methodologies adds llm-wiki
- **WHEN** the original skills section has `"name": "Metodologie & Strumenti"`
- **THEN** `"llm-wiki"` SHALL be added to its keywords

#### Scenario: Skills category update — Database adds SQLite
- **WHEN** the original skills section has `"name": "Database & Persistence"`
- **THEN** `"SQLite"` SHALL be added to its keywords

#### Scenario: Skills category update — Languages adds Rust and TypeScript
- **WHEN** the original skills section has `"name": "Architetture e Linguaggi"`
- **THEN** `"Rust"` and `"TypeScript"` SHALL be added to its keywords

### Requirement: Replace projects section with maximum 2 entries
The system SHALL replace the existing `projects` array with exactly 2 projects that emphasize the required topics.

#### Scenario: Autonomous Educational Generator project
- **WHEN** the projects section is being reconstructed
- **THEN** the first project SHALL be "Autonomous Educational Generator" with description mentioning Agentic AI, RAG, ChromaDB, MCP, and highlights mentioning llm-wiki pattern, OpenSpec, and Opencode

#### Scenario: Smart Sales Calendar project
- **WHEN** the projects section is being reconstructed
- **THEN** the second project SHALL be "Smart Sales Calendar" with description mentioning Tauri + React + Rust + SQLite stack, and highlights mentioning GitHub Copilot CLI

### Requirement: Add interests section
The system SHALL add an `interests` array with entries extracted from the user's GitHub profile.

#### Scenario: Interests section creation
- **WHEN** the original JSON has no `interests` section
- **THEN** a new `interests` array SHALL be added with at minimum: `{ name: "Agentic AI & LLM Infrastructure", keywords: ["MCP", "Local LLM Inference", "RAG", "llm-wiki Pattern"] }` and `{ name: "Cycling & Outdoor", keywords: [] }`

### Requirement: Add meta section with locale and theme
The system SHALL add a `meta` object at the root level of the JSON.

#### Scenario: Meta section creation
- **WHEN** the original JSON has no `meta` object
- **THEN** a `meta` object SHALL be added with `theme: "even"`, `language: "it"`, and `version: "v1.0.0"`

### Requirement: Compact redundant keywords in skills
The system SHALL allow compaction of related/redundant keywords in skill sections to improve readability of the rendered PDF.

#### Scenario: Jira plugin keyword compaction
- **WHEN** a skill section contains both `"Jira"` and `"Jira Tempo"` as separate keywords
- **THEN** the section SHALL be updated to use a single combined keyword `"Jira + Tempo"` to avoid visual redundancy in the PDF

### Requirement: Add bash scripting to interests
The system SHALL allow adding technical interest keywords to existing interest entries when the user has a real affinity for the topic.

#### Scenario: Bash scripting in Linux interests
- **WHEN** the user develops primarily on Unix-like environments
- **THEN** the `interests[name="Linux & Open Source Ecosystem"].keywords` array SHALL include `"Bash Scripting"` as a relevant skill indicator

### Requirement: Project entry rewriting on repo rename
The system SHALL allow complete rewriting of a project entry when the underlying GitHub repo has been renamed, the URL is outdated, or the README has been substantially updated.

#### Scenario: Project entry rewritten after repo rename
- **WHEN** a project entry references a GitHub repo that has been renamed
- **THEN** the entry SHALL be completely rewritten with:
  - Updated `name` matching the new repo name
  - Updated `description` reflecting the current README scope
  - Expanded `highlights` covering the new features
  - Updated `keywords` with current tech stack versions
  - Updated `url` pointing to the new repo location