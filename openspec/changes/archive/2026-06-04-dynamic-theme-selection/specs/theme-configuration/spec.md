## ADDED Requirements

### Requirement: Theme configurable from resume JSON
The system SHALL support dynamic theme selection by reading the npm theme package name from `resume.meta.themePackage`.

#### Scenario: Theme specified in JSON
- **WHEN** a resume JSON contains `meta.themePackage` set to a valid npm theme package name
- **THEN** the render scripts SHALL use that package to render the resume

#### Scenario: No theme specified (fallback)
- **WHEN** a resume JSON does NOT contain `meta.themePackage`
- **THEN** the render scripts SHALL fall back to `jsonresume-theme-stackoverflow`

#### Scenario: Theme specified across languages
- **WHEN** both Italian and English resume JSONs are rendered
- **THEN** each SHALL use its own `meta.themePackage` value independently

### Requirement: Safe capability detection for changeLanguage
The render scripts SHALL guard the `theme.changeLanguage()` call with a capability check to avoid runtime errors on themes that do not export this method.

#### Scenario: Theme supports changeLanguage
- **WHEN** a theme exports a `changeLanguage` function
- **THEN** the render scripts SHALL call it with the resume language

#### Scenario: Theme does not support changeLanguage
- **WHEN** a theme does NOT export a `changeLanguage` function
- **THEN** the render scripts SHALL skip the call without error

### Requirement: Graceful fallback on missing theme package
The system SHALL throw a clear error when the configured theme package is not installed, guiding the user to install it.

#### Scenario: Missing theme package
- **WHEN** `require(themePackageName)` fails because the package is not installed
- **THEN** the error message SHALL include the package name and suggest running `npm install <package>`
