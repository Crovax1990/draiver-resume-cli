# Skills rendering — overlap fix

## Sintomo

Nel PDF, la sezione **SKILLS** (3 colonne) può mostrare keyword **troncate** e
**sovrapposte** alla colonna adiacente quando una keyword è lunga (es. una frase
descrittiva invece di un termine singolo).

## Causa (upstream, `jsonresume-theme-stackoverflow` v3.3.0)

`node_modules/jsonresume-theme-stackoverflow/src/components/KeywordList.svelte`:

```css
li {
  display: inline-block;
  white-space: nowrap;   /* <-- il chip non può andare a capo */
}
```

e in `Skills.svelte`:

```css
.skills-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
```

In stampa il blocco `@media print` di `KeywordList.svelte` reimposta margini e
sfondo dei chip ma **non azzera `white-space: nowrap`**. Un chip più largo di
1/3 di pagina non può spezzarsi né andare a capo: come `inline-block` resta
un unico box più largo della cella della griglia e **sborda sopra la colonna
successiva**.

Con keyword corte (`Java`, `Docker`) il chip è più stretto della colonna e il
problema non si vede; con frasi lunghe emerge.

### Perché non basta `override.css`

Il tema emette `<link rel="stylesheet" href="./override.css">` ma `resumed`
carica la pagina con `page.setContent(html)` (origin `about:blank`), quindi il
link relativo non si risolve e l'override non viene applicato al PDF.

### Perché non si patcha `node_modules`

Le modifiche in `node_modules/` si perdono a ogni `npm install`.

## Fix

Wrapper locale del tema: `themes/stackoverflow-fix.js`. Importa il tema npm e
inietta in testa all'HTML una regola che, **solo in stampa**, riabilita il
wrapping dei chip:

```css
@media print {
  .skills-grid li { white-space: normal; overflow-wrap: anywhere; max-width: 100%; }
}
```

Il Makefile usa il wrapper come tema di default:

```makefile
THEME ?= $(CURDIR)/themes/stackoverflow-fix.js
```

`resumed` carica il tema via `import(<THEME>)`; un path assoluto è accettato.
Per tornare al tema npm puro: `THEME=jsonresume-theme-stackoverflow make pdf CV=<stem>`.

## Verifica

```bash
make pdf CV=luca-gobbi-cv
pdftoppm -png -r 80 output/luca-gobbi-cv.pdf /tmp/cv   # ispezione visiva
```

Atteso: nessuna sovrapposizione tra le colonne SKILLS; le keyword lunghe vanno
a capo dentro la propria colonna.

## Quando rimuovere il wrapper

Se upstream aggiunge `white-space: normal` (o `overflow-wrap`) al blocco
`@media print` di `KeywordList.svelte`, il wrapper diventa inutile: si può
ripristinare `THEME ?= jsonresume-theme-stackoverflow` e cancellare
`themes/stackoverflow-fix.js`.
