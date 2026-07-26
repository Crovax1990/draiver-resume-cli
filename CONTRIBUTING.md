# Contributing

Grazie per il tuo interesse nel contribuire a `draiver-resume-cli`! Questo progetto è una pipeline resume-as-code basata su [resumed](https://www.npmjs.com/package/resumed) con traduzione automatizzata IT→EN e supporto multi-CV.

## Setup locale

```bash
git clone https://github.com/your-org/draiver-resume-cli.git
cd draiver-resume-cli

# Copia il template di esempio e personalizzalo
cp data/resume.example.json data/mio-cv.json
# (modifica data/mio-cv.json con dati di test)

npm install

# (Opzionale) Installa il pre-push hook per bloccare secret
make install-hooks
```

## Come testare le modifiche

```bash
make list                   # Verifica che il tuo CV sia scoperto
make validate-all           # Valida tutti i JSON contro lo schema
make pdf CV=mio-cv          # Genera PDF per il tuo CV
make pdf-all                # Genera PDF per tutti i CV
make clean                  # Pulisce artefatti
```

## Naming convention

- `<stem>` = nome del file senza `.json` (es. `firstname-lastname`, `martina-peracchini`)
- File sorgente: `data/<stem>.json`
- File tradotto: `data/<stem>.en.json`
- File per traduzione manuale: `data/<stem>.translateme.json`
- Output: `output/<stem>.pdf`, `output/<stem>.en.pdf`

Per usare un prefisso personalizzato (CV singolo):

```bash
make pdf CV=mio-cv          # usa data/mio-cv.json
make pdf-all                # usa tutti i data/*.json scoperti
```

`make list` mostra cosa viene effettivamente scoperto.

## Come aggiungere un tema

1. Trova un tema su [npm](https://www.npmjs.com/search?q=jsonresume-theme) o [jsonresume.org/themes/](https://jsonresume.org/themes/)
2. `npm install jsonresume-theme-<nome>`
3. Aggiorna il campo `meta.themePackage` nel JSON: `"jsonresume-theme-<nome>"`
4. `make pdf CV=<stem>`

Se il tema non viene renderizzato — alcuni temi usano JSX o dipendenze non installabili via npm — apri una issue.

## Usare un fork di `resumed`

Il `resumed` upstream è in stato di bassa attività. Per testare un fork:

```bash
npm install github:<user>/<resumed-fork>#main
npm uninstall resumed
make pdf CV=<stem>          # usa automaticamente il fork
```

## Linee guida per le Pull Request

1. **Fork** il repository e crea un branch da `master`
2. Nomi di branch descrittivi: `feat/nuova-funzionalita`, `fix/nome-bug`
3. Commit piccoli e focalizzati
4. Assicurati che `make validate-all` e `make pdf-all` funzionino senza errori (con un CV di test)
5. Aggiorna la documentazione se necessario (`README.md`, `doc/`)
6. Apri la PR con descrizione chiara di cosa cambia e perché

## Segnalazione bug e richieste feature

Apri una [issue su GitHub](https://github.com/your-org/draiver-resume-cli/issues) con:
- **Bug**: descrizione, passi per riprodurlo, ambiente (OS, Node.js, `npm ls resumed`)
- **Feature**: descrizione e caso d'uso

## Struttura del progetto

```
draiver-resume-cli/
├── data/                          # JSON sorgente CV + template
│   └── resume.example.json        # template tracciato
├── output/                        # PDF e HTML generati (gitignored)
├── scripts/
│   └── translate.cjs              # Traduzione IT→EN multi-CV
├── doc/                           # Documentazione interna
├── openspec/                      # Specifiche e artefatti OpenSpec
├── Makefile                       # Orchestratore pipeline multi-CV
└── package.json
```

## Note

- Schema: [JSON Resume](https://jsonresume.org/schema/)
- Rendering: `resumed` CLI (validazione, HTML, PDF)
- I dati personali in `data/<stem>.json` non vanno mai committati — sono gitignored
- Per modifiche sostanziali, considera l'uso del workflow OpenSpec (`/opsx-propose`)
