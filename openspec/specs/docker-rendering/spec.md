# Docker Rendering

## Requirements

### Requirement: Makefile clean target
The system SHALL provide a `make clean` target that removes all generated output files.

#### Scenario: Clean removes all outputs
- **WHEN** `make clean` is executed
- **THEN** it SHALL remove `cv-output.html`, `cv-output.pdf`, `cv-output.en.html`, `cv-output.en.pdf`, and `firstname-lastname-cv.en.json`

### Requirement: Pretarget for translation
The Makefile SHALL include `firstname-lastname-cv.en.json` as a prerequisite target that runs the translation script to generate the English CV file when it doesn't exist or when the Italian source has changed.

#### Scenario: Translation prerequisite
- **WHEN** `make html-en` or `make pdf-en` is executed and `firstname-lastname-cv.en.json` does not exist
- **THEN** the translation script SHALL be executed automatically before the rendering step
