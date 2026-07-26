## ADDED Requirements

### Requirement: Docker image with resume-cli and Chromium
The system SHALL provide a Dockerfile based on `node:20-alpine` that installs Chromium via apk, configures Puppeteer environment variables, and installs `resume-cli` and `jsonresume-theme-even` globally.

#### Scenario: Docker image build
- **WHEN** `docker compose build` or `make build` is executed
- **THEN** a Docker image `local/resume-cli:latest` SHALL be built from `node:20-alpine` with Chromium, nss, freetype, harfbuzz, ca-certificates, ttf-freefont, and bash installed, with `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` and `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser` environment variables set, and `resume-cli` + `jsonresume-theme-even` installed globally via npm

#### Scenario: Dockerfile location and context
- **WHEN** the project is built
- **THEN** the Dockerfile SHALL be located at `docker/Dockerfile` and the docker-compose build context SHALL be the project root (`.`)

### Requirement: Docker Compose service configuration
The system SHALL provide a `docker-compose.yml` with a `resume` service that builds the Docker image, mounts the project directory, exposes port 4000, and configures Puppeteer environment variables.

#### Scenario: Service configuration
- **WHEN** `docker compose up` or any Makefile target using Docker is executed
- **THEN** the `resume` service SHALL be configured with: build context `.`, dockerfile `docker/Dockerfile`, image `local/resume-cli:latest`, volume mount `.` to `/workspace`, port mapping `4000:4000`, environment variables `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` and `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser`, `stdin_open: true`, and `tty: true`

#### Scenario: Volume mount for file output
- **WHEN** resume-cli generates output files (HTML, PDF) inside the container
- **THEN** the files SHALL be written to `/workspace/` which is mounted to the host project directory, making them immediately accessible on the host filesystem

### Requirement: Makefile build target
The system SHALL provide a `make build` target that builds the Docker image.

#### Scenario: Build target
- **WHEN** `make build` is executed
- **THEN** it SHALL run `docker compose build` to build the `local/resume-cli:latest` image

### Requirement: Makefile valid target
The system SHALL provide a `make valid` target that validates the Italian CV JSON against the JSON Resume schema.

#### Scenario: Validation of Italian CV
- **WHEN** `make valid` is executed
- **THEN** it SHALL run `docker compose run --rm resume test --resume firstname-lastname-cv.json` inside the container to validate the JSON structure

### Requirement: Makefile html target
The system SHALL provide a `make html` target that generates an HTML file from the Italian CV.

#### Scenario: HTML generation (Italian)
- **WHEN** `make html` is executed
- **THEN** it SHALL run `docker compose run --rm resume export cv-output.html --resume firstname-lastname-cv.json --theme even` to produce `cv-output.html`

### Requirement: Makefile pdf target
The system SHALL provide a `make pdf` target that generates a PDF file from the Italian CV.

#### Scenario: PDF generation (Italian)
- **WHEN** `make pdf` is executed
- **THEN** it SHALL run `docker compose run --rm resume export cv-output.pdf --resume firstname-lastname-cv.json --theme even --no-sandbox` to produce `cv-output.pdf`

### Requirement: Makefile serve target
The system SHALL provide a `make serve` target that starts a live-preview web server for the Italian CV on port 4000.

#### Scenario: Live preview (Italian)
- **WHEN** `make serve` is executed
- **THEN** it SHALL run `docker compose run --rm --service-ports resume serve --port 4000 --hostname 0.0.0.0 --resume firstname-lastname-cv.json --theme even` to start a local server at http://localhost:4000

#### Scenario: Port 4000 already in use
- **WHEN** port 4000 is already occupied on the host
- **THEN** the command SHALL fail with an error indicating the port conflict

### Requirement: Makefile clean target
The system SHALL provide a `make clean` target that removes all generated output files.

#### Scenario: Clean removes all outputs
- **WHEN** `make clean` is executed
- **THEN** it SHALL remove `cv-output.html`, `cv-output.pdf`, `cv-output.en.html`, `cv-output.en.pdf`, and `firstname-lastname-cv.en.json`

### Requirement: Makefile html-en target
The system SHALL provide a `make html-en` target that first translates the CV to English, then generates an HTML file from the English CV.

#### Scenario: HTML generation (English)
- **WHEN** `make html-en` is executed
- **THEN** it SHALL first ensure `firstname-lastname-cv.en.json` exists (by running the translation), then run `docker compose run --rm resume export cv-output.en.html --resume firstname-lastname-cv.en.json --theme even` to produce `cv-output.en.html`

### Requirement: Makefile pdf-en target
The system SHALL provide a `make pdf-en` target that first translates the CV to English, then generates a PDF file from the English CV.

#### Scenario: PDF generation (English)
- **WHEN** `make pdf-en` is executed
- **THEN** it SHALL first ensure `firstname-lastname-cv.en.json` exists (by running the translation), then run `docker compose run --rm resume export cv-output.en.pdf --resume firstname-lastname-cv.en.json --theme even --no-sandbox` to produce `cv-output.en.pdf`

### Requirement: Pretarget for translation
The Makefile SHALL include `firstname-lastname-cv.en.json` as a prerequisite target that runs the translation script to generate the English CV file when it doesn't exist or when the Italian source has changed.

#### Scenario: Translation prerequisite
- **WHEN** `make html-en` or `make pdf-en` is executed and `firstname-lastname-cv.en.json` does not exist
- **THEN** the translation script SHALL be executed automatically before the rendering step