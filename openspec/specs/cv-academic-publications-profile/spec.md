## ADDED Requirements

### Requirement: Per-publication academic metadata
The system SHALL accept the following custom fields in each entry of the `publications` array: `url` (direct link to publisher or PubMed), `summary` (1-2 sentence context/caption), `cite` (full bibliographic citation in AMA/Vancouver style with DOI/PMID embedded in text).

#### Scenario: Academic publication with full metadata
- **WHEN** a publication represents peer-reviewed academic work (journal article, book chapter, official clinical guideline)
- **THEN** the entry SHALL include `url` pointing to the canonical access point (PubMed, DOI resolver, publisher, or society website)
- **AND** the entry SHALL include `summary` describing the research context and contribution
- **AND** the entry SHALL include `cite` containing the full citation string with author list, title, journal, year, volume, issue, pages, DOI, and PMID where applicable

### Requirement: h-index indicator in summary
The system SHALL surface the researcher's h-index in `basics.summary` when the CV includes peer-reviewed academic publications.

#### Scenario: h-index in clinical-academic CV
- **WHEN** the `publications` array contains ≥5 PubMed/Scholar-indexed papers
- **THEN** `basics.summary` SHALL include a sentence stating the h-index value with source attribution (e.g., "h-index: 5, fonte: stima su Scopus/PubMed, da verificare")
- **AND** the statement SHALL be visually adjacent to a sentence stating the total number of publications (e.g., "Autrice e co-autrice di N pubblicazioni scientifiche peer-reviewed")

### Requirement: Working group and society membership disclosure
The system SHALL disclose participation in research working groups and clinical society commissions in `basics.summary` when the researcher's publications include collaborative multi-centre studies.

#### Scenario: WAPM working group credit
- **WHEN** a publication is authored under a multi-centre working group (e.g., WAPM COVID-19)
- **THEN** `basics.summary` SHALL include an explicit mention of the working group membership
- **AND** the individual contribution SHALL be qualified as "membro del working group" (not as lead author)

#### Scenario: National society estensore credit
- **WHEN** a publication is an official clinical document endorsed by national medical societies (e.g., SIGO, AOGOI, AGUI)
- **THEN** `basics.summary` SHALL include a mention of the estensore role (e.g., "Estensore del documento SIGO-AOGOI-AGUI")

### Requirement: GDPR authorization clause
The system SHALL include a GDPR-compliant data processing authorization clause in `basics.summary` for CVs intended for Italian or EU recruiters.

#### Scenario: Standard Italian GDPR clause
- **WHEN** the CV `meta.language` is `it` (or any EU language)
- **THEN** `basics.summary` SHALL include the clause: "Autorizzo il trattamento dei miei dati personali presenti nel curriculum vitae ai sensi del Regolamento UE 2016/679 (GDPR) e della normativa italiana vigente (D.Lgs. 196/2003 coordinato con D.Lgs. 101/2018)"
- **AND** the clause SHALL be separated from the professional narrative by a `---` visual separator
- **AND** the clause SHALL be the last paragraph in `basics.summary`

### Requirement: CEFR-aligned language proficiency
The system SHALL use CEFR levels (A1, A2, B1, B2, C1, C2) for the `fluency` field of each language entry.

#### Scenario: Native language mapping
- **WHEN** a language is the researcher's mother tongue
- **THEN** `fluency` SHALL be `"C2 — Madrelingua"` (or equivalent in the CV's `meta.language`)

#### Scenario: Non-native language mapping
- **WHEN** a language is not the researcher's mother tongue
- **THEN** `fluency` SHALL be one of `"A1"`, `"A2"`, `"B1"`, `"B2"`, `"C1"`, `"C2"` (no free-text descriptors like "Excellent", "Good", "Fluent")
- **AND** certifications (e.g., Cambridge, DELF, Goethe) SHALL be stored in a separate `certificates` entry when provided by the user

### Requirement: Chronological descending publication order
The system SHALL order the `publications` array in chronological descending order (most recent first).

#### Scenario: Multi-year publication list
- **WHEN** the `publications` array contains entries with different `releaseDate` values
- **THEN** the array SHALL be ordered by `releaseDate` descending
- **AND** entries without `releaseDate` SHALL be placed at the end of the array (or sorted by `name` alphabetically if no date is available)

## REMOVED Requirements

*(none)*

## MODIFIED Requirements

*(none)*
