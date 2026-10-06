# ─────────────────────────────────────────────────────────────────────────────
# draiver-resume-cli — Multi-CV Makefile
#
# Standard per tutti i JSON in data/:
#   - meta.language          (string, "it" | "en")
#   - meta.themePackage      (npm package del tema, default: $(THEME))
#   - meta.pdfRenderOptions  (A4, margini 1cm — vedi blocco sotto)
#   - meta.theme             (OPZIONALE: object con colors/sectionOrder custom, es. firstname-lastname)
#
# Auto-discovery: scansione di data/*.json, esclusi *.en.json, *.translateme.json,
# resume.example.json. Usa `make list` per vedere i CV scoperti.
#
# Pathing resumed (per fork futuri):
#   RESUMED punta al package npm "resumed". Per usare un fork:
#     1. npm install github:<user>/<fork>#main
#     2. npm uninstall resumed
#   Il Makefile continua a funzionare invariato perché invoca `npx $(RESUMED)`.
# ─────────────────────────────────────────────────────────────────────────────

OUTPUT_DIR  := output
DATA_DIR    := data
# THEME: package npm del tema OPPURE path (assoluto) di un wrapper locale.
# Default: wrapper locale che fixa il wrapping delle keyword della sezione SKILLS
# del tema stackoverflow (bug upstream v3.3.0). Vedi doc/skills-rendering.md.
THEME       ?= $(CURDIR)/themes/stackoverflow-fix.js
RESUMED     ?= resumed
KEEP_HTML   ?= 0
# Luogo stampato nel footer del CV (data = ultima modifica del JSON, automatica)
CV_PLACE    ?= Firenze
# Default CV = primo scoperto, fallback se discovery vuota
CV          ?= $(shell ls $(DATA_DIR)/*.json 2>/dev/null \
                 | grep -v '\.en\.json$$' \
                 | grep -v '\.translateme\.json$$' \
                 | grep -v 'resume\.example\.json' \
                 | grep -v 'certifications' \
                 | head -1 | xargs -I{} basename {} .json 2>/dev/null)
ifeq ($(CV),)
CV := firstname-lastname
endif

SANDBOX_FLAG := $(shell [ "$$(uname)" = "Linux" ] && echo "--puppeteer-arg=--no-sandbox")

# Tutti i CV scoperti (lista di stem, es. "firstname-lastname martina-peracchini")
ALL_CVS := $(shell ls $(DATA_DIR)/*.json 2>/dev/null \
            | grep -v '\.en\.json$$' \
            | grep -v '\.translateme\.json$$' \
            | grep -v 'resume\.example\.json' \
            | grep -v 'certifications' \
            | xargs -I{} basename {} .json)

.PHONY: build pdf pdf-all html html-all validate validate-all \
        translate translate-all list clean clean-all help debug \
        snapshot snapshots rollback

# ─── Default ────────────────────────────────────────────────────────────────
build: pdf-all

# ─── Discovery ──────────────────────────────────────────────────────────────
list:
	@echo "CV scoperti in $(DATA_DIR)/:"
	@if [ -z "$(ALL_CVS)" ]; then \
		echo "  (nessuno — aggiungi un file data/<nome>.json)"; \
	else \
		for c in $(ALL_CVS); do echo "  - $$c"; done; \
	fi

# ─── Single CV (CV=<stem>) ─────────────────────────────────────────────────
# Default CV = $(CV). Per generare un CV specifico: make pdf CV=martina-peracchini

pdf: output
	@if [ ! -f $(DATA_DIR)/$(CV).json ]; then \
		echo "ERROR: $(DATA_DIR)/$(CV).json non esiste. CV disponibili:"; \
		$(MAKE) list; \
		exit 1; \
	fi
	@$(MAKE) snapshot CV=$(CV)
	@echo "=== [$(CV)] IT ==="
	$(MAKE) one-pdf SOURCE=$(DATA_DIR)/$(CV).json
	@if [ -f $(DATA_DIR)/$(CV).en.json ]; then \
		echo "=== [$(CV)] EN ==="; \
		$(MAKE) one-pdf SOURCE=$(DATA_DIR)/$(CV).en.json; \
	else \
		echo "(skip EN: $(DATA_DIR)/$(CV).en.json non esiste)"; \
	fi
	@echo ""
	@echo "=== Output in $(OUTPUT_DIR)/ ==="
	@ls -lh $(OUTPUT_DIR)/$(CV)-*.pdf 2>/dev/null || true

html: output
	@if [ ! -f $(DATA_DIR)/$(CV).json ]; then \
		echo "ERROR: $(DATA_DIR)/$(CV).json non esiste"; exit 1; \
	fi
	@$(MAKE) snapshot CV=$(CV)
	@echo "=== [$(CV)] IT (HTML) ==="
	$(MAKE) one-html SOURCE=$(DATA_DIR)/$(CV).json
	@if [ -f $(DATA_DIR)/$(CV).en.json ]; then \
		echo "=== [$(CV)] EN (HTML) ==="; \
		$(MAKE) one-html SOURCE=$(DATA_DIR)/$(CV).en.json; \
	fi

validate:
	@if [ ! -f $(DATA_DIR)/$(CV).json ]; then \
		echo "ERROR: $(DATA_DIR)/$(CV).json non esiste"; exit 1; \
	fi
	@echo "=== Validate [$(CV)] ==="
	npx $(RESUMED) validate $(DATA_DIR)/$(CV).json
	@if [ -f $(DATA_DIR)/$(CV).en.json ]; then \
		echo "=== Validate [$(CV)] EN ==="; \
		npx $(RESUMED) validate $(DATA_DIR)/$(CV).en.json; \
	fi

translate:
	@if [ ! -f $(DATA_DIR)/$(CV).json ]; then \
		echo "ERROR: $(DATA_DIR)/$(CV).json non esiste"; exit 1; \
	fi
	node scripts/translate.cjs --source=$(DATA_DIR)/$(CV).json --output=$(DATA_DIR)/$(CV).en.json

translate-local:
	@if [ ! -f $(DATA_DIR)/$(CV).json ]; then \
		echo "ERROR: $(DATA_DIR)/$(CV).json non esiste"; exit 1; \
	fi
	node scripts/translate.cjs --local --source=$(DATA_DIR)/$(CV).json --output=$(DATA_DIR)/$(CV).en.json

# ─── Bulk (tutti i CV scoperti) ─────────────────────────────────────────────

pdf-all:
	@for c in $(ALL_CVS); do \
		$(MAKE) pdf CV=$$c; \
		echo ""; \
	done

html-all:
	@for c in $(ALL_CVS); do \
		$(MAKE) html CV=$$c; \
		echo ""; \
	done

validate-all:
	@for c in $(ALL_CVS); do \
		$(MAKE) validate CV=$$c; \
		echo ""; \
	done

translate-all:
	@for c in $(ALL_CVS); do \
		$(MAKE) translate CV=$$c; \
		echo ""; \
	done

translate-all-local:
	@for c in $(ALL_CVS); do \
		$(MAKE) translate-local CV=$$c; \
		echo ""; \
	done

# ─── Low-level (chiamati da pdf/html) ──────────────────────────────────────

# one-pdf: render → export PDF → cleanup HTML
# Il PDF prende la data di ultima modifica del JSON (<base>-<YYYY-MM-DD>.pdf),
# la stessa stampata nel footer via CV_FOOTER: nome file e contenuto coincidono.
one-pdf:
	@base=$$(basename $(SOURCE) .json); \
	stamp=$$(date -r $(SOURCE) +%Y-%m-%d); \
	html="$(OUTPUT_DIR)/$$base.html"; \
	pdf="$(OUTPUT_DIR)/$$base-$$stamp.pdf"; \
	export CV_FOOTER="$(CV_PLACE), $$stamp"; \
	echo "Render:  $$html"; \
	npx $(RESUMED) render $(SOURCE) -t $(THEME) -o $$html && \
	echo "Export:  $$pdf"; \
	npx $(RESUMED) export $(SOURCE) -t $(THEME) -o $$pdf $(SANDBOX_FLAG); \
	if [ "$(KEEP_HTML)" = "1" ]; then \
		echo "KEEP_HTML=1, mantengo $$html per debug"; \
	else \
		echo "Cancello HTML intermedio: $$html"; \
		rm -f $$html; \
	fi

# one-html: solo render, mantiene il file
one-html:
	@base=$$(basename $(SOURCE) .json); \
	html="$(OUTPUT_DIR)/$$base.html"; \
	echo "Render:  $$html"; \
	export CV_FOOTER="$(CV_PLACE), $$(date -r $(SOURCE) +%Y-%m-%d)"; \
	npx $(RESUMED) render $(SOURCE) -t $(THEME) -o $$html

# ─── Snapshot & rollback (versionamento locale dei JSON, fuori git) ──────────
# I JSON in data/ sono gitignored (privacy) ma ogni cambio va storicizzato per
# il rollback: `snapshot` salva una copia solo se il contenuto è cambiato
# dall'ultimo snapshot (IT + EN). `pdf` e `html` lo invocano in automatico,
# quindi ogni punto di modifica/validazione è coperto senza disciplina manuale.

SNAP_DIR  := .snapshots
SNAP_KEEP ?= 20

snapshot:
	@mkdir -p $(SNAP_DIR); \
	for f in $(DATA_DIR)/$(CV).json $(DATA_DIR)/$(CV).en.json; do \
		if [ ! -f $$f ]; then continue; fi; \
		stem=$$(basename $$f .json); \
		latest=$$(ls -t $(SNAP_DIR)/$$stem-*.json 2>/dev/null | head -1); \
		cur=$$(sha256sum $$f | cut -d' ' -f1); \
		if [ -n "$$latest" ] && [ "$$cur" = "$$(sha256sum $$latest | cut -d' ' -f1)" ]; then \
			echo "(snapshot: nessun cambio in $$f)"; \
		else \
			snap=$(SNAP_DIR)/$$stem-$$(date +%Y%m%d-%H%M%S-%N).json; \
			cp $$f $$snap; \
			echo "Snapshot: $$snap"; \
			old=$$(ls -t $(SNAP_DIR)/$$stem-*.json 2>/dev/null | tail -n +$$(( $(SNAP_KEEP) + 1 ))); \
			if [ -n "$$old" ]; then echo "$$old" | xargs -r rm -f; echo "(pulizia: tenuti ultimi $(SNAP_KEEP) per $$stem)"; fi; \
		fi; \
	done

snapshots:
	@files=$$(ls -t $(SNAP_DIR)/$(CV)-*.json $(SNAP_DIR)/$(CV).en-*.json 2>/dev/null); \
	if [ -z "$$files" ]; then echo "(nessuno snapshot per $(CV))"; else echo "$$files" | while read f; do ls -l $$f; done; fi

# rollback: salva prima lo stato corrente (mai perdere il dirty), poi annulla
# l'ultima modifica ripristinando il penultimo snapshot (o SNAP=<file> esplicito)
# + rivalida + rigenera. Un secondo rollback di fila rifà (redo).
rollback:
	@$(MAKE) snapshot CV=$(CV)
	@if [ -n "$(SNAP)" ]; then \
		cp $(SNAP) $(DATA_DIR)/$(CV).json; \
		echo "Ripristinato $(DATA_DIR)/$(CV).json da $(SNAP)"; \
	else \
		prev=$$(ls -t $(SNAP_DIR)/$(CV)-*.json 2>/dev/null | head -2 | tail -1); \
		n=$$(ls $(SNAP_DIR)/$(CV)-*.json 2>/dev/null | wc -l); \
		if [ "$$n" -lt 2 ]; then echo "ERROR: niente da annullare per $(CV) (un solo snapshot)"; exit 1; fi; \
		cp $$prev $(DATA_DIR)/$(CV).json; \
		echo "Annullata ultima modifica di $(DATA_DIR)/$(CV).json (da $$prev)"; \
	fi
	@$(MAKE) validate CV=$(CV)
	@$(MAKE) pdf CV=$(CV)

# ─── Debug & utilities ─────────────────────────────────────────────────────

# debug: come build ma mantiene gli HTML per ispezione rendering
debug:
	KEEP_HTML=1 $(MAKE) build

output:
	mkdir -p $@

# ─── Cleanup ───────────────────────────────────────────────────────────────
clean:
	rm -f $(OUTPUT_DIR)/*.html $(OUTPUT_DIR)/*.pdf

clean-all: clean
	rm -f $(DATA_DIR)/*.en.json $(DATA_DIR)/*.translateme.json
	rm -rf node_modules

# ─── Help ──────────────────────────────────────────────────────────────────
help:
	@echo "Usage: make <target> [CV=<stem>] [RESUMED=<pkg>]"
	@echo ""
	@echo "Target principali:"
	@echo "  make                  Equivalente a 'make pdf-all' (default)"
	@echo "  make build            Idem"
	@echo "  make list             Lista i CV scoperti in data/"
	@echo ""
	@echo "Generazione (CV singolo, default dal primo scoperto):"
	@echo "  make pdf              PDF del CV \$$CV (IT + EN se presente)"
	@echo "  make html             HTML del CV \$$CV (IT + EN se presente)"
	@echo "  make validate         Valida il JSON del CV \$$CV"
	@echo "  make translate        Traduce \$$CV in EN via OpenAI"
	@echo "  make translate-local  Traduce \$$CV in EN via LLM locale"
	@echo ""
	@echo "Generazione (bulk, tutti i CV scoperti):"
	@echo "  make pdf-all          PDF per tutti"
	@echo "  make html-all         HTML per tutti"
	@echo "  make validate-all     Valida tutti"
	@echo "  make translate-all    Traduce tutti"
	@echo ""
	@echo "Debug & cleanup:"
	@echo "  make debug            Come build ma mantiene HTML (KEEP_HTML=1)"
	@echo "  make clean            Rimuove output/*.{html,pdf}"
	@echo "  make clean-all        clean + data/*.{en,translateme}.json + node_modules"
	@echo ""
	@echo "Esempi:"
	@echo "  make pdf CV=firstname-lastname           # solo firstname-lastname"
	@echo "  make pdf CV=martina-peracchini   # solo martina"
	@echo "  make pdf-all                     # tutti"
	@echo ""
	@echo "Override resumed (per fork):"
	@echo "  RESUMED=my-fork-resumed make pdf CV=firstname-lastname"
