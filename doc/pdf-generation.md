# PDF Generation — Workflow & Risorse

## Workflow JSON → PDF

### Prerequisiti

```bash
npm install
```

### Generazione PDF

Il Makefile scopre automaticamente tutti i CV in `data/*.json` (esclusi `*.en.json`, `*.translateme.json`, `certifications*`, `resume.example.json`):

```bash
make list                   # Mostra i CV scoperti
make pdf CV=firstname-lastname      # Genera output/firstname-lastname.pdf (+ .en.pdf se presente)
make pdf-all                # Genera PDF per tutti i CV
```

### Generazione HTML

```bash
make html CV=firstname-lastname     # Genera output/firstname-lastname.html (+ .en.html se presente)
make html-all               # Genera HTML per tutti
```

### Pipeline complete

```bash
make translate-local CV=firstname-lastname   # Traduce IT → EN via LLM locale
make pdf CV=firstname-lastname               # Genera IT + EN
make clean                           # Rimuove artefatti in output/
```

## Com'è strutturata la generazione

1. **JSON sorgente** (`data/<stem>.json`) segue lo schema [JSON Resume](https://jsonresume.org/schema/)
2. **Resumed** valida il JSON: `npx resumed validate data/<stem>.json` (oppure `make validate CV=<stem>`)
3. **Render engine**: `resumed export` usa [Puppeteer](https://pptr.dev/) per convertire HTML in PDF
4. **Tema corrente**: [jsonresume-theme-stackoverflow](https://www.npmjs.com/package/jsonresume-theme-stackoverflow)
5. **Margini e formato**: specificati nel JSON tramite `meta.pdfRenderOptions` (A4, 1cm)

## Template PDF (temi JSON Resume)

I PDF sono generati tramite temi del ecosistema [JSON Resume](https://jsonresume.org/). Il tema di default è `jsonresume-theme-stackoverflow`.

Il tema è specificato nel JSON stesso tramite `meta.themePackage` (standard resumed). Il CLI `resumed` legge questo campo e carica dinamicamente il pacchetto npm corrispondente.

### Come cambiare tema

```bash
# 1. Installa il nuovo tema
npm install jsonresume-theme-<nome>

# 2. Modifica il campo themePackage nel JSON
#    data/<stem>.json → meta.themePackage = "jsonresume-theme-<nome>"

# 3. Rigenera il PDF
make pdf CV=<stem>
```

Oppure senza toccare il JSON, imposta la variabile Make:

```bash
THEME=jsonresume-theme-<nome> make pdf CV=<stem>
```

## `meta.pdfRenderOptions` — standard per tutti i CV

Tutti i JSON in `data/` dovrebbero avere lo stesso blocco `meta.pdfRenderOptions` per consistenza di output:

```json
{
  "meta": {
    "language": "it",
    "themePackage": "jsonresume-theme-stackoverflow",
    "pdfRenderOptions": {
      "format": "A4",
      "margin": {
        "top": "1cm",
        "bottom": "1cm",
        "left": "1cm",
        "right": "1cm"
      }
    }
  }
}
```

Le opzioni vengono lette da `resumed export` e passate a Puppeteer tramite `page.pdf({...})`.

## Variabili Makefile utili

| Variabile | Default | Effetto |
|---|---|---|
| `CV` | primo scoperto | Stem del CV (no `.json`); usato dai target singoli |
| `THEME` | `jsonresume-theme-stackoverflow` | Tema npm |
| `RESUMED` | `resumed` | Package `resumed` (per usare un fork) |
| `KEEP_HTML` | `0` | Se `1`, mantiene HTML intermedi per debug |

### Usare un fork di `resumed`

```bash
npm install github:<user>/<resumed-fork>#main
npm uninstall resumed
make pdf CV=<stem>          # usa automaticamente il fork
```

## Link utili

| Risorsa | URL |
|---|---|
| JSON Resume schema | <https://jsonresume.org/schema/> |
| Temi disponibili | <https://www.npmjs.com/search?q=jsonresume-theme> |
| Tema Stack Overflow (default) | <https://www.npmjs.com/package/jsonresume-theme-stackoverflow> |
| Resume CLI (resumed) | <https://www.npmjs.com/package/resumed> |
| Puppeteer docs | <https://pptr.dev/> |
| Anteprima temi online | <https://jsonresume.org/themes/> |

## Note

- I PDF generati sono gitignored (pattern `output/` in `.gitignore`).
- Le opzioni PDF (formato, margini) sono in `meta.pdfRenderOptions` e applicate automaticamente da `resumed export`.
- I dati personali (`data/<stem>.json`, `data/<stem>.en.json`) sono gitignored — solo `data/resume.example.json` è tracciato.
