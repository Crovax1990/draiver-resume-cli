// Wrapper del tema `jsonresume-theme-stackoverflow` con due fix locali.
// Non si tocca node_modules: si wrappa il tema npm e si inietta CSS/HTML
// in testa all'output renderizzato.
//
// 1. SKILLS: bug upstream (v3.3.0): `KeywordList.svelte` rende ogni keyword come
//    chip `display:inline-block; white-space:nowrap`. In stampa il chip non va
//    mai a capo; una keyword più lunga della colonna (1/3 di pagina) sborda e si
//    sovrappone alla colonna adiacente. Fix: in stampa le keyword possono andare
//    a capo dentro la propria colonna. Vedi doc/skills-rendering.md.
//
// 2. FOOTER luogo+data: se l'env `CV_FOOTER` è valorizzata (il Makefile la
//    imposta a "<luogo>, <data ultima modifica del JSON>"), appende in calce al
//    CV una riga discreta (es. "Firenze, 2026-10-06"). Senza env, nessun footer.

import base from 'jsonresume-theme-stackoverflow';

export const pdfRenderOptions = base.pdfRenderOptions;

const SKILLS_WRAP_FIX = `
@media print {
  .skills-grid li {
    white-space: normal;
    overflow-wrap: anywhere;
    max-width: 100%;
  }
}
`;

const FOOTER_CSS = `
.cv-footer {
  margin-top: 1.5em;
  text-align: right;
  font-size: 0.8rem;
  color: #777;
}
`;

function footerHtml() {
  const text = (process.env.CV_FOOTER || '').trim();
  if (!text) return '';
  const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<div class="cv-footer">${esc}</div>`;
}

export function render(resume, options) {
  let html = base.render(resume, options);
  html = html.replace('</head>', `<style>${SKILLS_WRAP_FIX}${FOOTER_CSS}</style>\n</head>`);
  const footer = footerHtml();
  if (footer) {
    html = html.includes('</main>')
      ? html.replace('</main>', `${footer}\n</main>`)
      : html.replace('</body>', `${footer}\n</body>`);
  }
  return html;
}

export default { render, pdfRenderOptions, changeLanguage: base.changeLanguage };
