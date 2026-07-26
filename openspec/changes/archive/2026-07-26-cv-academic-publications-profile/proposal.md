## Why

A medical/clinical CV (e.g. CPS Ostetrica, Medico specializzando) needs more than the bare JSON Resume schema. The base `publications` field is minimal (`name`, `publisher`, `releaseDate`) and provides no place for academic identity markers — h-index, full citations with DOI/PMID, abstracts/captions, GDPR-mandated privacy notice, CEFR language levels.

For a healthcare professional with a research track, the rendered PDF currently shows:
- Publications as bare title lists, with no journal, no date precision, no author order, no DOI
- No way to communicate academic impact (h-index, citation counts)
- Languages in vague self-assessments ("Excellent", "Good") that don't match European standards
- No GDPR authorization clause required by Italian recruiters for CV processing

This change enriches the JSON data layer with the fields healthcare CVs need. The `jsonresume-theme-stackoverflow` theme doesn't render some of these fields directly — they live in JSON as a single source of truth for future export pipelines (other themes, registries, programmatic use).

## What Changes

- **ADDED**: Per-publication fields `url`, `summary`, `cite` (full bibliographic citation in AMA/Vancouver style) to all 6 existing publications in `data/martina-peracchini.json`
- **ADDED**: 1 new publication (WAPM COVID-19 2021 multicentre study, `Ultrasound Obstet Gynecol 2021;57:232-241`) verified via PubMed/ResearchGate as co-authorship
- **ADDED**: All 7 publications reordered in chronological descending order (newest first)
- **MODIFIED**: `basics.summary` extended to include h-index (5, est. from PubMed/Scholar), 7-publication count, WAPM working group membership, SIGO-AOGOI-AGUI estensore credit
- **ADDED**: GDPR authorization clause appended to `basics.summary` (separated by `---` rule), referencing Reg. UE 2016/679 and D.Lgs. 196/2003 coord. D.Lgs. 101/2018
- **MODIFIED**: `languages[]` fluency values converted from free-text to CEFR levels (C2/C1/B2/A2)

## Capabilities

### New Capabilities

- `cv-academic-publications-profile`: A capability for medical/clinical CVs that adds academic publication metadata, h-index indicators, GDPR authorization, and CEFR language levels to the JSON Resume data layer

### Modified Capabilities

*(none — this is a new capability, all changes are additive to a specific CV's data layer)*

## Impact

- **Modified data**: `data/martina-peracchini.json` (gitignored — personal data, but visible locally)
- **Regenerated output**: `output/martina-peracchini.pdf` (gitignored, 3 pages)
- **New spec**: `openspec/specs/cv-academic-publications-profile/spec.md`
- **No tooling changes**: existing Makefile (`make validate CV=...`, `make pdf CV=...`) handles the enriched data without changes
- **No theme changes**: the `jsonresume-theme-stackoverflow` v3.3.0 theme continues to render standard fields only; `cite`/`url` are stored but not rendered (acceptable: theme customization would be lost on every `npm install`)

## Open Items (deferred to user)

- Book chapter page numbers: placeholder `p. XX–XX` pending user retrieval
- 2 co-authors of Tech Coloproctol 2023: placeholder `[autori da completare]` pending user retrieval
- h-index: value `5` is a manual estimate from PubMed/Scholar; user should verify on Scopus/Google Scholar when convenient
- Language certifications (English C1, French B2, German A2): pending user retrieval of Cambridge/DELF/Goethe certificates
- English translation: `data/martina-peracchini.en.json` not yet generated
