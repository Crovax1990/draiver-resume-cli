---
name: cv-quality-check
description: Validate a JSON Resume CV in data/ against the "show the evidence" quality rubric — generic claims without proof, concrete examples, measurable results, context, demonstrated soft skills. Use when the user asks to validate/verify the quality of a CV, check rubric violations, or prepare the work for adding missing metrics.
---

# cv-quality-check

Skill di validazione **qualitativa** dei CV JSON Resume in `data/`. Complementare a `make validate` (schema JSON) e alla verifica visiva del PDF (layout): rileva problemi di contenuto che nessuno dei due strumenti vede.

## Principio fondante

> "Un buon CV non convince perché contiene tante qualità. Convince perché riesce a dimostrarle attraverso esperienze, risultati e responsabilità realmente vissute."

Ogni affermazione di competenza nel CV deve avere una **prova** leggibile nel resto del documento. Se la prova non c'è, è una violazione.

## Input

- Path del CV: `data/<stem>.json` (se non indicato dall'utente, chiedere o usare `make list` per elencare gli stem disponibili)
- Compito: leggere il JSON, applicare la rubric, restituire il report. **NON modificare alcun file.**

## Rubric di validazione

### P1 — Niente affermazioni generiche
- Cerca nei testi (`basics.summary`, `work[].summary`/`highlights`, `projects[].description`/`highlights`) le qualità astratte senza supporto: problem solving, leadership, capacità organizzative, orientamento ai risultati, team working, comunicazione, adattabilità, proattività, flessibilità, passione, dedizione, "buone capacità di...", "forte esperienza in..." senza seguito.
- Ogni occorrenza DEVE avere almeno un esempio o risultato a supporto nello stesso CV.
- Severità: `minor` se l'esempio esiste altrove nel CV, `critical` se l'affermazione resta senza alcuna prova.

### P2 — Ogni qualità supportata da un'esperienza concreta
- Mappa ogni claim del summary verso i `work[]`/`projects[]` che lo provano.
- L'esperienza deve essere specifica: tecnologia, progetto, responsabilità, contesto — non solo ruoli.
- Severità: `critical` per claim non provati da nessuna entry.

### P3 — Risultati misurabili (il punto più spesso violato)
- Cerca numeri: team size, volumi (eventi/sec, transiti, utenti, impianti), percentuali, riduzioni di tempo, obiettivi raggiunti, progetti completati.
- Un highlight che descrive un'azione senza il suo impatto → `critical`.
- CV senza NESSUN numero → `critical` a livello documento.
- L'evidenza mancante va formulata come **domanda** (es. "quanti eventi/sec?", "team di quante persone?", "riduzione del tempo di deploy?") — MAI inventare la metrica.

### P4 — Contesto descritto
- Scala dell'azienda/sistema, complessità del ruolo, responsabilità affidate.
- "Sistemi nazionali critici", "settore energia", "mission-critical" sono contesto valido; ruoli senza alcuna indicazione di scala → `minor`.

### P5 — Soft skill dimostrate, non elencate
- Soft skill presenti in `skills[].keywords` → `info`: non bloccante, ma va verificato che esista un esempio nel corpo del CV.
- Soft skill dichiarate nel summary senza esempio narrativo (come si è esercitata la leadership: team coordinato, decisione architetturale, problema di coordinamento risolto) → `minor`/`critical`.

### P6 — Self-check finale
- Per OGNI claim del summary: "chi legge troverà una prova che lo confermi?" Risposta no → violazione `critical` (P1/P2).

## Mappa campi JSON Resume

| Sezione | Campi da valutare | Principi |
|---|---|---|
| `basics.summary` | affermazioni da provare | P1, P2, P6 |
| `work[].summary`, `work[].highlights` | esempi, risultati, contesto | P2, P3, P4 |
| `projects[].description`, `projects[].highlights` | outcome, utilizzo reale | P2, P3 |
| `skills[].keywords` | hard skill ok; soft skill → P5 | P5 |
| `education` | (opzionale) eventuali risultati | P3 |
| `meta`, `basics.image`, `references` | SKIP — non valutati | — |

## Severità

- **critical**: affermazione centrale del CV (summary, highlight principale) senza prova o senza impatto misurabile
- **minor**: contesto mancante, esempio debole, soft skill non dimostrata
- **info**: suggerimento non bloccante (es. keyword soft skill, metriche candidate)

## Formato del report

```
# Quality Check: <stem> — ESITO: PASS | FAIL

## Punteggio per principio
- P1 Affermazioni generiche: OK / N violazioni
- P2 Esempi concreti: ...
- P3 Risultati misurabili: ...
- P4 Contesto: ...
- P5 Soft skill: ...
- P6 Self-check: ...

## Violazioni (scope in dot notation, come CHANGELOG.md)
- [critical] work[1].highlights[2]: azione senza impatto → evidenza mancante: "quanti eventi/sec processati?"
- [minor] basics.summary: "leadership" senza esempio → provarla in work[0].summary

## Punti di forza
- work[0].highlights[0]: esempio concreto con contesto nazionale
```

## Guardrails

- ❌ MAI modificare `data/*.json` — solo report
- ❌ MAI inventare numeri/metriche — formulare le evidenze mancanti come domande da rispondere con dati reali
- ❌ NON valutare `meta`, `basics.image`, `references`
- ✅ Scope in dot notation compatibile con il formato CHANGELOG.md del repo
- ✅ Esito: violazioni `critical` → FAIL; proporre il fix (es. raccolta metriche reali dall'utente) per una sessione/change successiva
