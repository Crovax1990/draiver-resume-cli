## Context

The two render scripts (`scripts/render-html.mjs`, `scripts/render-pdf.mjs`) hardcode `require("jsonresume-theme-stackoverflow")`. This means:
- Changing theme requires editing both scripts plus `package.json`
- Theme-specific features like `changeLanguage()` are assumed to exist — calling them on a theme that doesn't support them causes a runtime error
- No way to specify different themes for different resumes (e.g., IT vs EN could use different layouts)
- The resume JSON already carries rich metadata (`meta.theme`, `meta.language`, `meta.pdfRenderOptions`) but not the theme package name

## Goals / Non-Goals

**Goals:**
- Make the theme package name configurable via `meta.themePackage` in the resume JSON
- Safe capability detection: only call `theme.changeLanguage()` if the method exists
- Graceful fallback to `jsonresume-theme-stackoverflow` when `meta.themePackage` is missing or the package is not installed
- Single source of truth for theme selection: the resume JSON
- Both render scripts updated consistently

**Non-Goals:**
- Hot-reloading or runtime theme switching
- Theme validation (e.g., checking if a theme exports `.render()`)
- Adding a Makefile variable for theme override (out of scope — the JSON is the source of truth)
- Installing or managing themes via CLI
- Changing how `resumed` CLI works (only the custom scripts)

## Decisions

### D1: `meta.themePackage` field in JSON (not Makefile variable, not .env)
**Decision**: Read the theme package name from `resume.meta.themePackage`.

**Rationale**: The JSON is already the single source of truth for all resume data and metadata. Adding the theme there keeps configuration co-located with the data it renders. A Makefile variable would require command-line overrides or editing the Makefile — less discoverable.

**Alternative**: Makefile `THEME` variable — rejected because it's not data-driven, requires `make pdf THEME=...` every time.

**Alternative**: `.env` file — rejected because it's not version-controlled with the resume content.

### D2: Default fallback via `||` chain
**Decision**:
```js
const themeName = resume.meta?.themePackage || "jsonresume-theme-stackoverflow";
```

**Rationale**: Simple, no extra dependencies. If the field is missing or the package is not installed, `require()` will throw a clear error.

### D3: Capability detection for `changeLanguage()`
**Decision**: Guard with `typeof theme.changeLanguage === "function"`.

**Rationale**: Not all JSON Resume themes expose `changeLanguage()`. Calling it unconditionally throws. The guard makes the system compatible with any theme.

**Alternative**: Try/catch — rejected because it masks real errors.

### D4: Both JSON files (IT and EN) get `meta.themePackage`
**Decision**: Add the field to both `data/firstname-lastname-cv.json` and `data/firstname-lastname-cv.en.json`.

**Rationale**: The field belongs to each resume independently. If in the future they use different themes, this supports it.

## Risks / Trade-offs

- **[Missing theme package at runtime]** — If a theme referenced in JSON is not installed via npm, `require()` will throw a Module Not Found error. → **Mitigation**: The error message from `require()` is descriptive enough to debug. Documentation will instruct to run `npm install <theme>` first.
- **[Theme without `.render()`]** — Some packages may export incorrectly. → **Mitigation**: This is a theme bug, not our concern. The error from `theme.render()` will be clear.
- **[Backwards compatibility]** — Existing JSONs without `meta.themePackage` will fall back to stackoverflow. → **Mitigation**: Graceful default via `||` operator. No breaking changes.
