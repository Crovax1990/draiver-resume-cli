#!/usr/bin/env python3
"""Extract text from all PDFs in CERTIFICAZIONI folder, with PyPDF2 fallback to pdftotext.

Usage:
  CERT_DIR=~/Documenti/CERTIFICAZIONI python3 scripts/extract_certs.py
"""
import json, os, subprocess, sys
from pathlib import Path

CERT_DIR = Path(os.environ.get("CERT_DIR", "~/Documenti/CERTIFICAZIONI")).expanduser()
OUT_FILE = Path(__file__).resolve().parent.parent / "data" / "certifications.json"

results = []

def extract_pypdf2(pdf_path):
    """Extract text with PyPDF2."""
    try:
        from PyPDF2 import PdfReader
        reader = PdfReader(str(pdf_path))
        text = ""
        for i, page in enumerate(reader.pages):
            t = page.extract_text()
            if t:
                text += f"\n--- Page {i+1} ---\n{t}"
        return text.strip() if text.strip() else None
    except Exception as e:
        return f"[PyPDF2 error: {e}]"

def extract_pdftotext(pdf_path):
    """Extract text with pdftotext (poppler)."""
    try:
        result = subprocess.run(
            ["pdftotext", "-layout", str(pdf_path), "-"],
            capture_output=True, text=True, timeout=30
        )
        text = result.stdout.strip()
        return text if text else None
    except Exception as e:
        return f"[pdftotext error: {e}]"

def extract_text(pdf_path):
    """Try all methods, return first successful non-trivial extraction."""
    # Try pdftotext first (most reliable)
    text = extract_pdftotext(pdf_path)
    if text and len(text) > 30 and not text.startswith("["):
        return text, "pdftotext"
    
    # Fallback to PyPDF2
    text = extract_pypdf2(pdf_path)
    if text and len(text) > 30 and not text.startswith("["):
        return text, "PyPDF2"
    
    return text if text else "[No text extracted]", "failed"

# Walk directory
for entry in sorted(CERT_DIR.rglob("*")):
    if entry.is_dir():
        continue
    if entry.suffix.lower() != '.pdf':
        # Also try to read .txt and .doc files
        if entry.suffix.lower() in ('.txt',):
            text = entry.read_text(encoding='utf-8', errors='replace')[:2000]
            results.append({
                "filename": entry.name,
                "path": str(entry),
                "method": "txt",
                "text": text
            })
        continue
    
    print(f"Processing: {entry.relative_to(CERT_DIR)}")
    text, method = extract_text(entry)
    results.append({
        "filename": entry.name,
        "path": str(entry.relative_to(CERT_DIR)),
        "method": method,
        "text": text[:3000]  # cap text to 3000 chars
    })

# Save as JSON
OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
with open(OUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"\nSaved {len(results)} entries to {OUT_FILE}")

# Print summary
for r in results:
    print(f"\n{'='*60}")
    print(f"FILE: {r['filename']}  [{r['method']}]")
    print(f"CHARS: {len(r['text'])}")
    print(f"PREVIEW: {r['text'][:500]}")
