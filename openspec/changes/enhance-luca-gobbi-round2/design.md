## Context

Round 1 di miglioramenti al CV di Luca Gobbi ha coperto: lingue CEFR, interests basati su GitHub profile, summary arricchito. Round 2 copre 4 modifiche specifiche:

1. Compattazione di una ridondanza nelle skills
2. Aggiunta di un interesse reale dell'utente
3. Correzione di un project entry con dati outdated (rename + URL sbagliato)
4. Aggiunta di un progetto Open Source attuale (il tool che stiamo usando per buildare il CV stesso)

## Goals / Non-Goals

**Goals:**
- Pulire keywords ridondanti nelle skills (Jira vs Jira Tempo)
- Aggiungere "Bash Scripting" agli interessi (coerente con l'ambiente di sviluppo Unix-like)
- Riscrivere l'entry "Famiglia730" con il nome corretto "Dichiaro" e l'URL aggiornato, basato sul README ufficiale del repo
- Aggiungere "draiver-resume-cli" come progetto professionale (è il tool che ha progettato)

**Non-Goals:**
- Non modificare le lingue (già CEFR)
- Non modificare il summary (decisione utente in R1)
- Non spostare il GDPR da `references[]` a `basics.summary` (decisione utente)
- Non modificare il tema o il tooling
- Non tradurre in EN (la traduzione esiste già in `luca-gobbi.en.json`, viene rigenerata da `make pdf`)

## Decisions

### 1. Jira + Jira Tempo → Jira + Tempo

**Choice:** Una singola keyword `"Jira + Tempo"` invece di due separate.

**Rationale:** Jira Tempo è un plugin di Jira per il time tracking, non un tool separato. Averli come due keyword separate è ridondante per un recruiter che fa keyword matching. La forma compatta è più leggibile nel PDF.

### 2. Bash Scripting in Linux & Open Source Ecosystem

**Choice:** Aggiungere "Bash Scripting" come keyword all'entry esistente "Linux & Open Source Ecosystem".

**Rationale:** L'utente sviluppa su ambienti Unix-like (confermato dall'uso di AMD ROCm per LLM locale, dal profilo GitHub). Bash scripting è competenza trasversale per dev su Linux. Mantengo l'entry unita per coerenza tematica (tutto Linux/OSS in un'unica entry).

### 3. Famiglia730 → Dichiaro (rewrite completo)

**Choice:** Riscrittura completa di name, description, highlights, keywords, URL.

**Rationale:**
- Il repo è stato rinominato da `dichiarazione730-analyzer` a `dichiaro` (v.0 commit history)
- L'URL nel CV era quindi outdated
- Il README è stato completamente riscritto (commit 3983f7a, 3 weeks ago) con tono più coinvolgente e sezione "Come funziona" dettagliata
- Il vecchio description (3 righe generiche) non rifletteva più l'attuale scope del progetto (multi-upload, auto-detect anno/persona, proiezioni 10 anni)
- Keywords obsolete: "Python" generico vs "Python 3.12+", "SQLAlchemy" vs "SQLAlchemy 2.0", "PyMuPDF" vs "PyMuPDF (fitz)"

### 4. draiver-resume-cli come nuovo progetto

**Choice:** Aggiungere in coda all'array `projects` (dopo draiver-home-scraper).

**Rationale:** È un progetto Open Source reale (MIT license), pubblicato su GitHub, con 5 commit, documentazione completa (README, CONTRIBUTING, AGENTS), CI workflow (gitleaks), e workflow di change management (OpenSpec). Rappresenta un'area di competenza distintiva dell'utente (DevOps + AI workflow + documentation engineering). L'ordine in coda è coerente con l'inserimento più recente.

## Risks / Trade-offs

- **[Risk] Rinomina project potrebbe confondere chi ha già visto il CV**: Chi ha già visto "Famiglia730" potrebbe non riconoscerlo. Mitigation: il nome "Dichiaro" è più professionale, e il description spiega subito che si occupa di 730/RedditiPF.
- **[Risk] draiver-resume-cli è un progetto "infrastrutturale", non un classico progetto cliente**: alcuni recruiter potrebbero non capirne il valore. Mitigation: il description evidenzia "Multi-CV Makefile con auto-discovery" e "Traduzione IT→EN multi-CV" — competenze concrete di developer tooling.
- **[Trade-off] Riempimento 4 highlights → 8 highlights in Dichiaro**: il description è più lungo. Mitigation: l'utente ha esplicitamente chiesto di "riscrivere l'intera sezione" fornendo il link al repo, quindi lunghezza è OK.
- **[Trade-off] Aggiunta di 5° project**: il CV ha già 4 projects, diventa 5. Mitigation: sono tutti progetti sostanziali con keywords rilevanti, non bloating.

## File modificati

```
data/luca-gobbi.json                  (gitignored, modifiche locali)
output/luca-gobbi.pdf                 (rigenerato)
output/luca-gobbi.en.pdf              (rigenerato)
```
