## 1. Research & Discovery

- [x] 1.1 Verify all 6 existing publications in CV via PubMed, ResearchGate, IRIS CNR, journal websites
- [x] 1.2 Discover 1 additional publication (WAPM COVID-19 2021) not listed in original CV
- [x] 1.3 Confirm authorship position, full author list, and citation count for each publication
- [x] 1.4 Identify reference standards: JSON Resume schema v1.0.0, AMA/Vancouver citation style, CEFR language levels
- [x] 1.5 Identify online platforms used for medical/midwifery bibliographic verification (PubMed, Scopus, Cochrane, MIDIRS, IRIS CNR, SIGO, FNCO, MDPI, Springer)
- [x] 1.6 Identify standard Italian GDPR authorization template (Adecco, livecareer, zety confirmed)

## 2. Publications Data Enrichment

- [x] 2.1 Add `url` field to all 6 existing publications (direct link to PubMed, MDPI, Springer, AGUI, Amazon)
- [x] 2.2 Add `summary` field (1-2 sentence context/caption) to all 6 existing publications
- [x] 2.3 Add `cite` field (full AMA/Vancouver citation) to all 6 existing publications
- [x] 2.4 Add 7th publication (WAPM COVID-19 2021) with `url`, `summary`, `cite`
- [x] 2.5 Reorder all 7 publications in chronological descending order (newest first: 2024-01 → 2023-07 → 2023-03 → 2023-02 → 2023-01 → 2021-01 → 2016-06)
- [x] 2.6 Keep placeholders for book chapter page numbers (`p. XX–XX`) and Tech Coloproctol 2 missing co-authors

## 3. Academic Identity Markers

- [x] 3.1 Calculate h-index from 5 PubMed/Scholar-indexed publications: **5** (5 papers with ≥5 citations each: WAPM ~100+, Tech Coloproctol 11, Riv Psichiatr 9, Clin Ter 8, Vaccines 7)
- [x] 3.2 Add h-index mention to `basics.summary` with source attribution and verification caveat
- [x] 3.3 Add 7-publication count to `basics.summary`
- [x] 3.4 Add WAPM-COVID-19 working group membership mention to `basics.summary`
- [x] 3.5 Add SIGO-AOGOI-AGUI estensore credit to `basics.summary`

## 4. GDPR Authorization

- [x] 4.1 Add standard Italian GDPR authorization clause to `basics.summary` after a `---` separator
- [x] 4.2 Use text: "Autorizzo il trattamento dei miei dati personali presenti nel curriculum vitae ai sensi del Regolamento UE 2016/679 (GDPR) e della normativa italiana vigente (D.Lgs. 196/2003 coordinato con D.Lgs. 101/2018)"

## 5. CEFR Language Levels

- [x] 5.1 Convert `fluency` from free-text to CEFR: Italian → C2 (Madrelingua), English → C1, French → B2, German → A2
- [x] 5.2 Preserve language ordering (Italian, English, French, German)

## 6. Validation & Render

- [x] 6.1 Run `make validate CV=martina-peracchini` — pass
- [x] 6.2 Run `make pdf CV=martina-peracchini` — generated `output/martina-peracchini.pdf` (237K, 3 pages)
- [x] 6.3 Convert PDF to images and visually verify all sections: summary with h-index + GDPR, publications in chronological order, languages with CEFR
- [x] 6.4 Verify JSON validity via `node -e "JSON.parse(...)"` — pass

## 7. Documentation

- [x] 7.1 Create `openspec/changes/cv-academic-publications-profile/proposal.md`
- [x] 7.2 Create `openspec/changes/cv-academic-publications-profile/tasks.md`
- [x] 7.3 Create `openspec/changes/cv-academic-publications-profile/design.md`
- [x] 7.4 Create `openspec/changes/cv-academic-publications-profile/specs/cv-academic-publications-profile/spec.md`
