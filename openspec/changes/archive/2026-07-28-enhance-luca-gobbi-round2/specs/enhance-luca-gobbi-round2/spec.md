## MODIFIED Requirements

### Requirement: Compact redundant keywords in skills
The system SHALL allow compaction of related/redundant keywords in skill sections to improve readability of the rendered PDF.

#### Scenario: Jira plugin keyword compaction
- **WHEN** a skill section contains both `"Jira"` and `"Jira Tempo"` as separate keywords
- **THEN** the section SHALL be updated to use a single combined keyword `"Jira + Tempo"` to avoid visual redundancy in the PDF

### Requirement: Add bash scripting to Linux interests
The system SHALL allow adding technical interest keywords to existing interest entries when the user has a real affinity for the topic.

#### Scenario: Bash scripting in Linux & Open Source Ecosystem
- **WHEN** the user develops primarily on Unix-like environments
- **THEN** the `interests[name="Linux & Open Source Ecosystem"].keywords` array SHALL include `"Bash Scripting"` as a relevant skill indicator

## ADDED Requirements

### Requirement: Project entry rewriting on repo rename
The system SHALL allow complete rewriting of a project entry when the underlying GitHub repo has been renamed, the URL is outdated, or the README has been substantially updated.

#### Scenario: Famiglia730 → Dichiaro rename
- **WHEN** a project entry references a GitHub repo that has been renamed
- **THEN** the entry SHALL be completely rewritten with:
  - Updated `name` matching the new repo name
  - Updated `description` reflecting the current README scope
  - Expanded `highlights` covering the new features (multi-upload, auto-detect, projections)
  - Updated `keywords` with current tech stack versions
  - Updated `url` pointing to the new repo location

## REMOVED Requirements

*(nessuna)*

## RENAMED Requirements

*(nessuna)*
