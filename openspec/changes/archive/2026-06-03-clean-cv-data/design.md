## Context

Il file `firstname-lastname-cv.json` contiene il CV di l'utente in formato JSON Resume ma è stato generato con artefatti di citation (`[cite: 1]`) su quasi ogni campo testuale. Il file inoltre contiene valori non conformi allo schema (come `"Attuale"` per `endDate`) e manca di sezioni supportate dallo schema (`interests`, `meta`). Il profilo GitHub del candidato fornisce dati aggiuntivi (progetti attivi, interessi, URL corretti) che devono essere integrati. Questo è il ground-truth italiano da cui deriverà la versione inglese tramite script di traduzione (change successiva).

## Goals / Non-Goals

**Goals:**
- Produrre un file `firstname-lastname-cv.json` pienamente conforme allo schema JSON Resume v1.0.0
- Rimuovere tutti gli artefatti `[cite: N]` sistematicamente
- Normalizzare i campi data (omissione di `endDate` per posizioni correnti)
- Arricchire il CV con dati dal profilo GitHub (progetti, interessi, profilo GitHub)
- Enfatizzare nel summary e nelle skills: llm-wiki pattern, OpenSpec, Opencode, GitHub Copilot CLI, smart-sales-calendar, full-stack tecnologico
- Preparare il file come fonte di verità per la traduzione IT→EN
- Creare un'immagine placeholder temporanea per `basics.image`

**Non-Goals:**
- Creare la versione inglese del CV (change successiva: `add-translation-script`)
- Implementare la pipeline Docker (change successiva: `docker-pipeline`)
- Automatizzare la sincronizzazione IT↔EN (la traduzione sarà manuale/semi-automatica tramite script nella change successiva)
- Customizzare il tema `even` (fuori scope)

## Decisions

**1. Strategia di pulizia `[cite: 1]`: riscrittura completa vs regex**

Scelta: **Riscrittura completa del JSON** invece di sed/regex sul file.

Rationale: Il pattern `[cite: N]` è pervasivo (presente in ~40+ campi) ma non è l'unico problema — servono anche correzioni strutturali (omissione campi, aggiunta sezioni, riscrittura summary). Una regex perderebbe i cambiamenti strutturali. Riscrivere il JSON completo garantisce coerenza.

Alternativa considerata: Script sed/regex — più veloce ma fragile, non gestisce i cambi strutturali.

**2. Campo `endDate` per posizioni correnti: omesso vs `"present"` vs vuoto**

Scelta: **Omettere il campo** per posizioni correnti.

Rationale: Lo schema JSON Resume definisce `endDate` come opzionale. Ometterlo è il modo standard per indicare una posizione corrente (`null` è anche accettato ma meno comune). La documentazione di riferimento usa `endDate: null` o campo assente.

**3. Immagine placeholder: file vs URL vs stringa vuota**

Scelta: **`"placeholder.png"`** — file locale che l'utente sostituirà.

Rationale: Lo schema JSON Resume supporta URL o path locale. Una stringa vuota (`""`) è valida per ATS ma non permette preview. Un URL esterno introdurrebbe dipendenza. Un file locale placeholder permette di testare subito il rendering.

**4. Sezione `projects`: 2 progetti vs tutti**

Scelta: **2 progetti massimi** come richiesto esplicitamente dall'utente.

Rationale: Un CV con troppi progetti diventa dispersivo. I 2 selezionati coprono gli argomenti da enfatizzare: AI/Agentic (Autonomous Educational Generator) e full-stack desktop (Smart Sales Calendar).

**5. Formato telefono internazionale**

Scelta: **`+39 329 141 5445`** (formato E.164 internazionale con spazi per leggibilità).

Rationale: Il formato `(+39) +39 XXX XXX XXXX` è non standard. Il formato internazionale con spazi è leggibile e conforme alle best practice per CV multinazionali.

## Risks / Trade-offs

- **[Rischio] Dati involontariamente persi nella riscrittura**: Tutti i campi originali vengono riscritti manualmente → Mitigazione: confronto campo-per-campo con l'originale tramite `resume test` dopo la modifica
- **[Rischio] Progetti GitHub non verificabili**: I 2 progetti selezionati sono pubblici su GitHub ma potrebbero cambiare → Mitigazione: usare URL stabili (`github.com/your-username/<repo>`)
- **[Trade-off] Summary riscritto**: Il summary viene riscritto per enfatizzare i temi richiesti, perdendo parte della formulazione originale → Accettabile poiché l'utente ha richiesto esplicitamente questi enfasi
- **[Rischio] Lo schema JSON Resume non ha un campo `meta.language` standard**: Il campo `meta` supporta proprietà arbitrarie, ma `language` non è standard → Mitigazione: è un'estensione comune e il tema `even` lo ignora senza errori