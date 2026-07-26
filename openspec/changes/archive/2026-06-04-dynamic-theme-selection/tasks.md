## 1. Add meta.themePackage to JSONs

- [x] 1.1 Add `"themePackage": "jsonresume-theme-stackoverflow"` to `data/firstname-lastname-cv.json` under `meta`
- [x] 1.2 Add `"themePackage": "jsonresume-theme-stackoverflow"` to `data/firstname-lastname-cv.en.json` under `meta`

## 2. Update scripts/render-html.mjs

- [x] 2.1 Read theme name from `resume.meta.themePackage` with fallback to `jsonresume-theme-stackoverflow`
- [x] 2.2 Use dynamic `require(themeName)` instead of hardcoded require
- [x] 2.3 Guard `theme.changeLanguage()` with `typeof` check
- [x] 2.4 Verify HTML generation still works with both IT and EN JSONs

## 3. Update scripts/render-pdf.mjs

- [x] 3.1 Apply the same three changes as render-html.mjs
- [x] 3.2 Verify PDF generation still works with both IT and EN JSONs

## 4. Clean up documentation

- [x] 4.1 Update `doc/pdf-generation.md` with theme switching instructions
- [x] 4.2 Remove any remaining stale sidebar references from documentation

## 5. Verify

- [x] 5.1 Run `make pdf` and confirm output is correct
- [x] 5.2 Run `make pdf-en` and confirm output is correct
