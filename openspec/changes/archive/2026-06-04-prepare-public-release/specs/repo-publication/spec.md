# Repo Publication

## ADDED Requirements

### Requirement: Personal data removed from git tracking
The system SHALL NOT track personal CV data in the git repository to protect privacy and allow the repo to be used as a public template.

#### Scenario: Personal CV not tracked
- **WHEN** `git ls-files data/` is executed
- **THEN** it SHALL NOT list any file matching `data/firstname-lastname-cv.json`
- **AND** the file SHALL be removed from git tracking via `git rm --cached`

### Requirement: Sample resume template provided
The system SHALL provide a sample resume JSON file (`data/resume.example.json`) following the JSON Resume schema, with placeholder data, so users can quickly start using the project.

#### Scenario: Sample file exists
- **WHEN** the project is cloned
- **THEN** `data/resume.example.json` SHALL exist at the project root

#### Scenario: Sample file is valid JSON Resume
- **WHEN** the sample file is validated against the JSON Resume schema via `npx resumed validate`
- **THEN** validation SHALL pass

#### Scenario: Sample file can be rendered
- **WHEN** `cp data/resume.example.json data/resume.json && make pdf` is executed
- **THEN** a PDF SHALL be generated in `output/resume.pdf` without errors

### Requirement: Quick-start documentation exists
The system SHALL provide a README.md at the project root that explains the project's purpose, references upstream projects, and documents the workflow.

#### Scenario: README references upstream CLI
- **WHEN** README.md is read
- **THEN** it SHALL contain a reference to `https://github.com/jsonresume/resume-cli`

#### Scenario: README references JSON Resume schema
- **WHEN** README.md is read
- **THEN** it SHALL contain a reference to `https://jsonresume.org/schema/`

#### Scenario: README references available themes
- **WHEN** README.md is read
- **THEN** it SHALL contain a reference to `https://jsonresume.org/themes/` or `https://www.npmjs.com/search?q=jsonresume-theme`

#### Scenario: README documents workflow commands
- **WHEN** README.md is read
- **THEN** it SHALL document the key Makefile targets: `make build`, `make pdf`, `make html`, `make translate-local`, `make clean`

#### Scenario: README documents translation
- **WHEN** README.md is read
- **THEN** it SHALL describe the translation capability (OpenAI API or local llama-server)

### Requirement: Contribution guide exists
The system SHALL provide a CONTRIBUTING.md at the project root that guides potential contributors.

#### Scenario: CONTRIBUTING exists
- **WHEN** the project is cloned
- **THEN** `CONTRIBUTING.md` SHALL exist at the project root

#### Scenario: CONTRIBUTING includes setup instructions
- **WHEN** CONTRIBUTING.md is read
- **THEN** it SHALL include instructions for local setup
