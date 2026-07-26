## 1. Clean Stale Files

- [x] 1.1 Delete `public/` directory (stale standalone HTML resume)
- [x] 1.2 Delete `profile-image.png` (unused source image — base64 embedded in JSON)
- [x] 1.3 Delete `firstname-lastname-cv.translateme.json` from root (regenerable temp artifact, will be moved to data/)

## 2. Create Directory Structure

- [x] 2.1 Create `data/` directory at project root
- [x] 2.2 Create `output/` directory at project root

## 3. Move JSON Artifacts to data/

- [x] 3.1 Move `firstname-lastname-cv.json` (Italian source) to `data/firstname-lastname-cv.json`
- [x] 3.2 Move `firstname-lastname-cv.en.json` (English translation) to `data/firstname-lastname-cv.en.json`

## 4. Move Rendered Outputs to output/

- [x] 4.1 Move `cv-output.pdf` (Italian) to `output/cv-output.pdf`
- [x] 4.2 Move `cv-output.en.pdf` (English) to `output/cv-output.en.pdf`

## 5. Update scripts/translate.js Constants

- [x] 5.1 Change `SOURCE_FILE` constant to `data/firstname-lastname-cv.json`
- [x] 5.2 Change `OUTPUT_FILE` constant to `data/firstname-lastname-cv.en.json`
- [x] 5.3 Change `EXTRACT_FILE` constant to `data/firstname-lastname-cv.translateme.json`

## 6. Update Makefile Paths

- [x] 6.1 Change `RESUME_IT` variable to `data/firstname-lastname-cv.json`
- [x] 6.2 Change `RESUME_EN` variable to `data/firstname-lastname-cv.en.json`
- [x] 6.3 Update `pdf` target paths (input: `data/firstname-lastname-cv.json`, output: `output/cv-output.pdf`)
- [x] 6.4 Update `pdf-en` target paths (input: `data/firstname-lastname-cv.en.json`, output: `output/cv-output.en.pdf`)
- [x] 6.5 Update `html` target paths (input: `data/firstname-lastname-cv.json`, output: `output/cv-output.html`)
- [x] 6.6 Update `translate`, `translate-extract`, `translate-merge`, `translate-local` targets to use new `data/` and `output/` paths
- [x] 6.7 Update `clean` target to remove files from `output/` and `data/firstname-lastname-cv.en.json`

## 7. Update .gitignore

- [x] 7.1 Add `data/firstname-lastname-cv.en.json` to `.gitignore`
- [x] 7.2 Add `data/firstname-lastname-cv.translateme.json` to `.gitignore`
- [x] 7.3 Add `output/` directory pattern to `.gitignore`
- [x] 7.4 Remove stale patterns (old `cv-output.*` root-level entries)

## 8. Verify Change

- [x] 8.1 Run `make pdf` and confirm it produces `output/cv-output.pdf`
- [x] 8.2 Run `make pdf-en` and confirm it produces `output/cv-output.en.pdf`
- [x] 8.3 Run `git status` and confirm no root-level generated files remain
- [x] 8.4 Run `make clean` and confirm all generated files are removed from `data/` and `output/`
