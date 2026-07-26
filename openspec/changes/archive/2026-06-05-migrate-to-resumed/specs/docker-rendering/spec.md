## REMOVED Requirements

### Requirement: Docker image with resume-cli and Chromium
**Reason**: Replaced by native `resumed` CLI with local Puppeteer. Docker adds ~300MB overhead and CJS/ESM compatibility patches that are unnecessary with the modern toolchain.
**Migration**: Run `npm install` instead of `docker compose build`. All rendering commands use `npx resumed` natively.

### Requirement: Docker Compose service configuration
**Reason**: No longer needed without Docker. Puppeteer runs natively on the host.
**Migration**: Remove `docker-compose.yml` and `docker/Dockerfile`.

### Requirement: Makefile build target (Docker)
**Reason**: `make build` previously built the Docker image. Now it runs `npm install` to ensure dependencies are available.
**Migration**: `make build` now runs `npm install`.

### Requirement: Makefile valid target (Docker)
**Reason**: Validation now runs natively via `npx resumed validate`.
**Migration**: `make valid` now runs `npx resumed validate firstname-lastname-cv.json`.

### Requirement: Makefile html/pdf/serve targets (Docker)
**Reason**: All rendering targets now use `npx resumed` natively instead of `docker compose run --rm resume`.
**Migration**: Commands updated to use `npx resumed render` (HTML) and `npx resumed export` (PDF) with theme `jsonresume-theme-stackoverflow`.

### Requirement: Makefile html-en/pdf-en targets (Docker)
**Reason**: Same as above — translation prerequisite preserved, rendering commands use native `npx resumed`.
**Migration**: Commands updated to use native `npx resumed` with the new theme.

## MODIFIED Requirements

### Requirement: Makefile clean target
The system SHALL provide a `make clean` target that removes all generated output files.

#### Scenario: Clean removes all outputs
- **WHEN** `make clean` is executed
- **THEN** it SHALL remove `cv-output.html`, `cv-output.pdf`, `cv-output.en.html`, `cv-output.en.pdf`, and `firstname-lastname-cv.en.json`

(No change to behavior — preserved for completeness.)

### Requirement: Pretarget for translation
The Makefile SHALL include `firstname-lastname-cv.en.json` as a prerequisite target that runs the translation script to generate the English CV file when it doesn't exist or when the Italian source has changed.

#### Scenario: Translation prerequisite
- **WHEN** `make html-en` or `make pdf-en` is executed and `firstname-lastname-cv.en.json` does not exist
- **THEN** the translation script SHALL be executed automatically before the rendering step

(No change to behavior — preserved for completeness.)