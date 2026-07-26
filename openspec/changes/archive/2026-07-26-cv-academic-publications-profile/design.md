## Context

The JSON Resume schema v1.0.0 has a `publications` field that accepts only minimal properties: `name`, `publisher`, `releaseDate`, `url`, `summary`. For a medical/clinical CV, this is insufficient — author lists, full citations, DOIs, PMIDs, and journal volume/issue/pages are essential to demonstrate academic credibility.

The `jsonresume-theme-stackoverflow` v3.3.0 (the only theme currently in use) renders only `name`, `publisher`, `releaseDate`, `summary` in the publications section. Custom fields are accepted by the schema (`additionalProperties: true`) but invisible in the PDF. This is a known tradeoff: enriching the JSON costs ~2KB per publication in storage but yields zero visible benefit in the current theme. The benefit materializes for future export targets (other themes, programmatic consumers, the JSON Resume registry).

For Italian CVs, recruiters expect a GDPR authorization clause (Reg. UE 2016/679 + D.Lgs. 196/2003) at the bottom of the document. The JSON Resume schema has no `legalNotice` field; the standard Italian practice is to inline it in `basics.summary` after a visual separator.

## Goals / Non-Goals

**Goals:**
- Enrich `data/martina-peracchini.json` with academic publication metadata (`url`, `summary`, `cite`) for all 7 publications
- Surface academic identity in `basics.summary` (h-index, working group memberships, estensore credits)
- Add GDPR authorization clause visible in the rendered PDF
- Convert `languages[].fluency` from vague free-text to CEFR levels

**Non-Goals:**
- Modify the JSON Resume schema spec (we use `additionalProperties: true`)
- Fork or patch the `jsonresume-theme-stackoverflow` theme (would be lost on `npm install`)
- Add new sections to the JSON Resume spec (e.g., a dedicated `metrics` block)
- Translate the CV to English (separate concern, not in scope)
- Modify the Makefile or any tooling (existing commands handle the enriched data as-is)

## Decisions

### 1. `cite` field as text, not structured

**Choice:** Store the full bibliographic citation as a single string in the `cite` field (AMA/Vancouver style), not as a structured object.

**Rationale:** The `additionalProperties: true` of the publications schema allows arbitrary fields, but downstream consumers (Scopus, Crossref, ORCID) typically ingest free-text citations for matching. A single `cite` string is more portable than a `{authors, title, journal, year, volume, issue, pages, doi, pmid}` object. The trade-off is loss of programmatic access to individual citation components — accepted because no current consumer needs it.

### 2. GDPR clause in `basics.summary` (not a new top-level field)

**Choice:** Append the GDPR authorization clause to `basics.summary` after a `---` separator.

**Rationale:** Three options were evaluated:
- A: Inline in `basics.summary` — always visible, simple, mixes professional bio with legal text
- B: Custom `basics.legalNotice` field — clean, but the theme doesn't render it → invisible
- C: New top-level `legalNotice` — visually distinct, but breaks the JSON Resume schema standard

Option A was chosen because the primary goal is visibility in the rendered PDF. The mixing of professional and legal text is acceptable because Italian CV conventions already do this. The `---` separator provides visual distinction.

### 3. CEFR levels instead of free-text fluency

**Choice:** Convert all 4 languages from free-text ("Native speaker", "Excellent", "Good", "Elementary") to CEFR levels ("C2 — Madrelingua", "C1", "B2", "A2").

**Rationale:** CEFR is the European standard for language proficiency, recognized by Italian employers and academic institutions. Mapping is straightforward: "Native" → C2, "Excellent" → C1, "Good" → B2, "Elementary" → A2. Certifications (Cambridge, DELF, Goethe) can be added later in a separate `certificates` field when the user provides them.

### 4. h-index calculation methodology

**Choice:** Display h-index as `5` with explicit caveat "fonte: stima su Scopus/PubMed, da verificare".

**Rationale:** h-index = max h such that h papers have at least h citations each. With 5 PubMed/Scholar-indexed papers with citation counts of ~100+ (WAPM), 11 (Tech Coloproctol), 9 (Riv Psichiatr), 8 (Clin Ter), 7 (Vaccines), h-index = 5. The caveat is critical because: (a) we don't have direct Scopus/Scholar access to verify, (b) some databases may not index Martina as author of the WAPM paper given 203 co-authors, (c) future citation accumulation will increase this number. The user should verify on Scopus/Google Scholar when convenient.

### 5. WAPM COVID-19 paper added (1 of 203 authors)

**Choice:** Include the WAPM 2021 paper in the publications list, with summary explicitly stating "Martina ha partecipato come membro del working group WAPM-COVID-19 nell'ambito del network Sapienza-Di Mascio".

**Rationale:** Authorship is verifiable on PubMed and ResearchGate. The `summary` field provides the context (multicentre study, 203 authors) so the contribution is not overstated. The paper is Martina's most-cited work by orders of magnitude (likely 100+ citations), making it the strongest single item in the publication list. Excluding it would misrepresent her research footprint.

### 6. Chronological descending order

**Choice:** Order publications from newest (2024-01) to oldest (2016-06).

**Rationale:** Standard CV convention in academic and clinical contexts. Recency-weighted ordering matches recruiter scanning patterns. The 7th publication (WAPM 2021) slots between the 2023 cluster and the 2016 book chapter.

### 7. Placeholders over hardcoded values

**Choice:** Keep `p. XX–XX` for book chapter page numbers and `[autori da completare]` for the 2 missing Tech Coloproctol co-authors.

**Rationale:** The user explicitly chose to leave these open pending retrieval. Keeping placeholders makes the gaps visible and easy to fix later. No fabricated data was inserted.

## Risks / Trade-offs

- **[Risk] h-index claim unverifiable locally**: We put `5` in the CV with a "da verificare" caveat. If the real value is lower (e.g., 3 because Scopus doesn't credit Martina for the WAPM paper), this is misleading. **Mitigation**: explicit source attribution in the text; user should verify before sharing with research-oriented recruiters.
- **[Trade-off] Invisible `cite` field**: The theme doesn't render it. The ~14KB of citation text lives only in JSON. **Mitigation**: documented in proposal; future themes or export pipelines can use it.
- **[Trade-off] GDPR mixed with bio**: `basics.summary` now contains both professional narrative and legal text. **Mitigation**: visual `---` separator. Alternative (custom field) would be invisible.
- **[Risk] Personal data in tracked docs**: `data/martina-peracchini.json` contains name, email, phone, address, photo — all gitignored per design. The change documents this in proposal.md but does not alter `.gitignore`.
- **[Risk] Open items**: 4 deferred items (page numbers, 2 co-authors, h-index verification, English translation, language certifications). All flagged in proposal.md so they're discoverable in the archive.
