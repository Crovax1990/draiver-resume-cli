## Context

Il progetto `draiver-resume-cli` contiene un CV in formato JSON Resume pulito (`firstname-lastname-cv.json`, lingua italiana) pronto per il rendering tramite `resume-cli` con tema `even`. Per il mercato internazionale serve una versione inglese (`firstname-lastname-cv.en.json`). La traduzione manuale è fragile: ogni modifica al JSON IT richiede una ritraduzione manuale. Lo script automatizza questo processo con un JSON walker ricorsivo che identifica i campi traducibili e chiama un LLM per la traduzione contestuale.

Lo script vive in `scripts/translate.js` ed è eseguito con `node scripts/translate.js` o `make translate`. Il file EN generato è il sorgente per i target `html-en` e `pdf-en` del Makefile.

## Goals / Non-Goals

**Goals:**
- Creare uno script Node.js che traduce `firstname-lastname-cv.json` (IT) in `firstname-lastname-cv.en.json` (EN)
- Implementare un JSON walker ricursivo che identifica automaticamente i campi da tradurre e quelli da preservare
- Utilizzare OpenAI API (GPT-4o-mini) come motore di traduzione primario per coerenza contestuale
- Fornire un fallback a `@vitalets/google-translate-api` per uso gratuito/senza API key
- Presevare interamente la struttura JSON (chiavi, tipi, array, annidamento)
- Aggiornare il Makefile con target per traduzione e rendering EN

**Non-Goals:**
- Traduzione bidirezionale (EN→IT non è richiesta)
- Traduzione di altri formati помимо JSON Resume
- Interfaccia interattiva o GUI per la traduzione
- CI/CD pipeline per traduzione automatica su push
- Customizzazione del prompt LLM da parte dell'utente (il prompt è hardcoded per garantire coerenza)

## Decisions

**1. Motore di traduzione: LLM API (OpenAI) vs Google Translate vs manuale**

Scelta: **OpenAI GPT-4o-mini come primario, Google Translate come fallback**

Rationale: I CV contengono testo contestuale dove "Sviluppatore Software" deve diventare "Software Developer" coerentemente in tutto il documento. Un LLM mantiene coerenza terminologica e comprende il contesto professionale. GPT-4o-mini costa ~$0.01-0.03 per traduzione completa. Il fallback Google Translate è gratuito ma meno contestuale e soggetto a rate limits.

Alternativa scartata: Google Translate come primario — non comprende contesto, traduce "Technical Lead" come "Lead Tecnico" invece di mantenerlo in inglese, e traduce incoerentemente i termini tecnici.

**2. Strategia di identificazione campi: whitelist vs blacklist vs walker intelligente**

Scelta: **Whitelist di campi traducibili per sezione JSON Resume**

Rationale: Una whitelist per sezione è esplicita e predicibile. Il JSON Resume ha una struttura nota e stabile. Camminare ricursivamente e tradurre "tutte le stringhe" rischierebbe di tradurre keyword tecniche ("Spring Boot"), URL, codici paese. Con una whitelist sappiamo esattamente cosa viene tradotto.

Campi traducibili per sezione:
- `basics`: name, label, summary
- `basics.location`: address, city, region
- `work[*]`: name, position, summary, highlights[]
- `education[*]`: institution, area, studyType
- `skills[*]`: keywords[] (selezione: tradurre solo keyword non tecniche)
- `languages[*]`: language, fluency
- `projects[*]`: name, description, highlights[]
- `interests[*]`: name, keywords[]

Campi PRESERVATI (mai tradotti): url, email, phone, countryCode, startDate, endDate, score, image, meta, keyword tecniche nelle skills.

**3. Gestione keyword tecniche nelle skills: tradurre o preservare**

Scelta: **Preservare keyword tecniche, tradurre solo i nomi di categoria**

Rationale: Keyword come "Spring Boot", "Apache Kafka", "PostgreSQL" sono nomi propri di tecnologie e non vanno tradotti. I nomi di categoria ("Architetture e Linguaggi" → "Architecture & Languages") vanno tradotti. Lo script usa un prompt LLM che istruisce esplicitamente a preservare i termini tecnici.

**4. Formato output del LLM: stringa singola vs JSON strutturato**

Scelta: **Batch per sezione con output JSON strutturato**

Rationale: Invece di tradurre campo-per-campo (N chiamate API), lo script raggruppa i campi per sezione e invia un singolo prompt per sezione, chiedendo al LLM di restituire un oggetto JSON con le traduzioni. Questo riduce le chiamate API da ~30 a ~7 e mantiene coerenza contestuale all'interno di ogni sezione. Il LLM riceve la struttura della sezione e restituisce la stessa struttura con i valori tradotti.

**5. File EN generato: commesso al repo o aggiunto a .gitignore**

Scelta: **Aggiunto a .gitignore**

Rationale: Il file EN è un artefatto derivato. Committarlo creerebbe drift quando il file IT cambia. Lo script lo rigenera su richiesta. Il Makefile e la pipeline Docker lo rigenerano prima del rendering.

## Risks / Trade-offs

- **[Rischio] Costo API OpenAI**: GPT-4o-mini costa ~$0.01-0.03 per traduzione completa → Mitigazione: il fallback Google Translate è gratuito; lo script supporta `--fallback` flag
- **[Rischio] Rate limiting Google Translate**: Il fallback gratuito ha limiti di rate → Mitigazione: lo script implementa retry con backoff esponenziale
- **[Rischio] Incoerenza tra traduzioni**: Esecuzioni diverse possono produrre traduzioni leggermente differenti → Mitigazione: il prompt è deterministico con istruzioni di coerenza; se necessario, committare una versione "approvata" del file EN
- **[Trade-off] Whitelist vs flessibilità**: La whitelist di campi traducibili è rigida per nuove sezioni JSON Resume → Accettabile perché lo schema è stabile e nuove sezioni richiederebbero comunque aggiornamento manuale
- **[Rischio] API key esposta**: La chiave OpenAI deve essere gestita come env var → Mitigazione: usare `.env` file aggiunto a `.gitignore`, e variabile d'ambiente `OPENAI_API_KEY`

## Open Questions

- Quale modello LLM usare come primario? GPT-4o-mini è il DEFAULT ma l'utente potrebbe voler usare un modello diverso (es. Claude Haiku). Lo script supporta `--model` flag per override.
- Lo script deve supportare anche la traduzione da EN a IT in futuro? Per ora NO (Non-Goal), ma la architettura del walker è generica e riutilizzabile.