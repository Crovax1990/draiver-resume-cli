# Theme Configuration

## MODIFIED Requirements

### Requirement: Theme configurable from resume JSON
The system SHALL support dynamic theme selection by reading the npm theme package name from `resume.meta.theme`.

#### Scenario: Theme specified in JSON
- **WHEN** a resume JSON contains `meta.theme` set to a valid npm theme package name
- **THEN** the `resumed` CLI SHALL use that package to render the resume

#### Scenario: No theme specified (fallback)
- **WHEN** a resume JSON does NOT contain `meta.theme`
- **THEN** the `resumed` CLI SHALL fall back to `jsonresume-theme-stackoverflow`

#### Scenario: Theme specified across languages
- **WHEN** both Italian and English resume JSONs are rendered
- **THEN** each SHALL use its own `meta.theme` value independently

### Requirement: Graceful error on missing theme package
The system SHALL throw a clear error when the configured theme package is not installed, guiding the user to install it.

#### Scenario: Missing theme package
- **WHEN** `resumed` loads the theme package and the package is not installed
- **THEN** the error message SHALL include the package name and suggest running `npm install <package>`

## REMOVED Requirements

### Requirement: Safe capability detection for changeLanguage
**Reason**: English labels are now accepted for the Italian CV. The custom render scripts that called `changeLanguage()` have been removed in favor of native `resumed` CLI commands, which do not call this method.
**Migration**: No action needed. Themed labels will appear in English for all CVs regardless of `meta.language`.
