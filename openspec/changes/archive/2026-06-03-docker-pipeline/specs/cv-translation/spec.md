## MODIFIED Requirements

### Requirement: Environment configuration via .env file
The system SHALL support a `.env` file for API key configuration, with `.env` added to `.gitignore`.

#### Scenario: .env file loading
- **WHEN** the translation script is executed
- **THEN** it SHALL load environment variables from a `.env` file in the project root using the `dotenv` package

#### Scenario: .env in gitignore
- **WHEN** the project repository is initialized
- **THEN** `.env` SHALL be listed in `.gitignore` to prevent API key exposure

## ADDED Requirements

### Requirement: Docker-aware translation targets
The translation targets SHALL work both locally (with Node.js installed on the host) and inside Docker (if the translation script is run within the resume container).

#### Scenario: Local translation execution
- **WHEN** `make translate` is executed
- **THEN** it SHALL run `node scripts/translate.js` directly on the host without Docker, as the translation script requires npm dependencies not present in the resume container