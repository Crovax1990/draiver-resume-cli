require('dotenv').config();
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const OpenAI = require('openai');

const DEFAULT_MODEL = 'gpt-4o-mini';
const DEFAULT_LOCAL_BASE_URL = 'http://localhost:8080/v1';
const DEFAULT_LOCAL_MODEL = 'LFM2.5-8B-A1B-Q8_0';
const LOCAL_MAX_TOKENS = 8192;

const SECTIONS = ['basics', 'work', 'volunteer', 'education', 'skills', 'languages', 'projects', 'publications', 'interests'];

const TRANSLATABLE_FIELDS = {
  basics: ['name', 'label', 'summary'],
  'basics.location': ['address', 'city', 'region'],
  work: {
    _ItemFields: ['name', 'position', 'summary'],
    highlights: true,
  },
  volunteer: {
    _ItemFields: ['organization', 'position', 'summary'],
  },
  education: {
    _ItemFields: ['institution', 'area', 'studyType'],
  },
  skills: {
    _ItemFields: ['name'],
    keywords: true,
  },
  languages: {
    _ItemFields: ['language', 'fluency'],
  },
  projects: {
    _ItemFields: ['name', 'description'],
    highlights: true,
  },
  publications: {
    _ItemFields: ['name', 'publisher'],
  },
  interests: {
    _ItemFields: ['name'],
    keywords: true,
  },
};

const NEVER_TRANSLATE_KEYS = new Set([
  'url', 'email', 'phone', 'countryCode', 'postalCode',
  'startDate', 'endDate', 'score', 'image', 'network', 'username',
]);

// ponytail: glossary is CV-specific (dell'utente tech stack ≠ Martina's medical terms).
// Per-CV glossaries belong in data/<cv>.glossary.json when needed; dynamic
// extraction in extractGlossaryTerms() still catches CamelCase tokens.
const STATIC_GLOSSARY = [];

const SECTION_EXAMPLES = {
  basics: {
    input: { name: 'Mario Rossi', label: 'Ingegnere Software Senior', summary: 'Ingegnere Software con 5 anni di esperienza nello sviluppo backend.' },
    output: { name: 'Mario Rossi', label: 'Senior Software Engineer', summary: 'Software Engineer with 5 years of experience in backend development.' },
  },
  'basics.location': {
    input: { city: 'Roma', region: 'Lazio (RM)' },
    output: { city: 'Rome', region: 'Lazio (RM)' },
  },
  work: {
    input: [{ name: 'Azienda S.p.A.', position: 'Programmatore Senior', summary: 'Sviluppo di applicazioni enterprise.', highlights: ['Migrazione su infrastruttura Cloud con Kubernetes e Docker.', 'Implementazione di pipeline CI/CD con Jenkins.'] }],
    output: [{ name: 'Azienda S.p.A.', position: 'Senior Programmer', summary: 'Development of enterprise applications.', highlights: ['Migration to Cloud infrastructure with Kubernetes and Docker.', 'Implementation of CI/CD pipelines with Jenkins.'] }],
  },
  education: {
    input: [{ institution: "Università degli Studi di Roma", area: 'Scienze informatiche', studyType: 'Laurea Triennale' }],
    output: [{ institution: 'University of Rome', area: 'Computer Science', studyType: "Bachelor's Degree" }],
  },
  skills: {
    input: [{ name: 'Linguaggi e Framework', keywords: ['Java', 'Spring Boot', 'Microservizi'] }],
    output: [{ name: 'Languages and Frameworks', keywords: ['Java', 'Spring Boot', 'Microservices'] }],
  },
  languages: {
    input: [{ language: 'Italiano', fluency: 'Madrelingua' }, { language: 'Inglese', fluency: 'C1 (Ottima conoscenza scritta e parlata)' }],
    output: [{ language: 'Italian', fluency: 'Native' }, { language: 'English', fluency: 'C1 (Excellent written and spoken proficiency)' }],
  },
  projects: {
    input: [{ name: 'Sistema di Forecasting', description: 'Sistema di previsione basato su dati storici e algoritmi di correlazione.', highlights: ['Integrazione con pipeline RAG e ChromaDB.'], keywords: ['Python', 'RAG'] }],
    output: [{ name: 'Forecasting System', description: 'Prediction system based on historical data and correlation algorithms.', highlights: ['Integration with RAG pipelines and ChromaDB.'], keywords: ['Python', 'RAG'] }],
  },
  interests: {
    input: [{ name: 'Intelligenza Artificiale e LLM', keywords: ['RAG', 'Inferenza Locale'] }],
    output: [{ name: 'AI and LLM', keywords: ['RAG', 'Local Inference'] }],
  },
};

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { local: false, extract: false, merge: null, output: null, source: null, model: null, fallback: false };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--local') options.local = true;
    else if (arg === '--extract') options.extract = true;
    else if (arg === '--fallback') options.fallback = true;
    else if (arg.startsWith('--merge=')) options.merge = arg.split('=').slice(1).join('=');
    else if (arg === '--merge' && args[i + 1]) { options.merge = args[++i]; }
    else if (arg.startsWith('--output=')) options.output = arg.split('=').slice(1).join('=');
    else if (arg === '--output' && args[i + 1]) { options.output = args[++i]; }
    else if (arg.startsWith('--source=')) options.source = arg.split('=').slice(1).join('=');
    else if (arg === '--source' && args[i + 1]) { options.source = args[++i]; }
    else if (arg.startsWith('--model=')) options.model = arg.split('=')[1];
    else if (arg === '--help') {
      console.log('Usage: node scripts/translate.js [options]');
      console.log('');
      console.log('Options:');
      console.log('  --local                Use local llama-server for translation');
      console.log('  --extract              Extract translatable fields to a JSON file');
      console.log('  --merge=<file>         Merge translated JSON back into full resume');
      console.log('  --output=<path>        Override output file path');
      console.log('  --source=<path>        Override source file path');
      console.log('  --model=<model>        Override the LLM model');
      console.log('  --fallback             (removed) prints error and exits');
      process.exit(0);
    }
  }
  return options;
}

function collectTranslatableStrings(source) {
  const sections = {};

  for (const sectionName of SECTIONS) {
    if (sectionName === 'basics') {
      sections.basics = collectFromObject(source.basics, TRANSLATABLE_FIELDS.basics);
      if (source.basics.location) {
        const locStrings = collectFromObject(source.basics.location, TRANSLATABLE_FIELDS['basics.location']);
        sections['basics.location'] = locStrings;
      }
    } else {
      const sectionData = source[sectionName];
      if (!sectionData || !Array.isArray(sectionData)) continue;
      const fieldConfig = TRANSLATABLE_FIELDS[sectionName];
      if (!fieldConfig) continue;

      const items = [];
      for (const item of sectionData) {
        const itemStrings = {};
        const directFields = fieldConfig._ItemFields || [];
        for (const key of directFields) {
          if (item[key] && typeof item[key] === 'string') {
            itemStrings[key] = item[key];
          }
        }
        if (fieldConfig.highlights && Array.isArray(item.highlights)) {
          itemStrings.highlights = item.highlights.filter(h => typeof h === 'string');
        }
        if (fieldConfig.keywords && Array.isArray(item.keywords)) {
          itemStrings.keywords = item.keywords.filter(k => typeof k === 'string');
        }
        items.push(itemStrings);
      }
      sections[sectionName] = items;
    }
  }

  return sections;
}

function collectFromObject(obj, fields) {
  const result = {};
  if (!obj) return result;
  for (const key of fields) {
    if (obj[key] && typeof obj[key] === 'string') {
      result[key] = obj[key];
    }
  }
  return result;
}

function extractJSON(content) {
  if (!content || typeof content !== 'string') return null;

  let text = content;
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  const firstObj = text.indexOf('{');
  const firstArr = text.indexOf('[');
  let startIdx;
  let openChar, closeChar;

  if (firstObj === -1 && firstArr === -1) return null;
  if (firstObj === -1) { startIdx = firstArr; openChar = '['; closeChar = ']'; }
  else if (firstArr === -1) { startIdx = firstObj; openChar = '{'; closeChar = '}'; }
  else { startIdx = Math.min(firstObj, firstArr); openChar = text[startIdx] === '{' ? '{' : '['; closeChar = openChar === '{' ? '}' : ']'; }

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = startIdx; i < text.length; i++) {
    const ch = text[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === openChar || ch === '{' || ch === '[') depth++;
    if (ch === closeChar || ch === '}' || ch === ']') {
      depth--;
      if (depth === 0) {
        const extracted = text.substring(startIdx, i + 1);
        try {
          return JSON.parse(extracted);
        } catch {
          return null;
        }
      }
    }
  }

  try {
    return JSON.parse(text.substring(startIdx));
  } catch {
    return null;
  }
}

function parseLLMResponse(response) {
  const choice = response.choices?.[0];
  if (!choice) throw new Error('No choices in LLM response');

  if (choice.finish_reason === 'length') {
    throw new Error('LLM response was truncated (finish_reason: "length"). Consider increasing max_tokens or splitting the section.');
  }

  const content = choice.message?.content;
  if (!content) throw new Error('Empty content in LLM response');

  const parsed = extractJSON(content);
  if (parsed === null) {
    throw new Error(`Failed to extract JSON from LLM response. Raw content:\n${content.substring(0, 500)}`);
  }
  return parsed;
}

function buildSectionPrompt(sectionName, sectionData) {
  const sectionDesc = {
    'basics': 'personal information (name, job title, summary)',
    'basics.location': 'location/address information',
    'work': 'work experience entries',
    'education': 'education entries',
    'skills': 'skill categories and keywords',
    'languages': 'language proficiency',
    'projects': 'project descriptions and highlights',
    'interests': 'personal interests',
  }[sectionName] || sectionName;

  return `You are a professional resume translator. Translate the following resume section from Italian to English.

SECTION: ${sectionName} — ${sectionDesc}

IMPORTANT RULES:
1. Translate ONLY the values, keep the JSON keys unchanged.
2. Preserve ALL technical terms, brand names, and technology names as-is (e.g., Spring Boot, Kafka, Kubernetes, MCP, Qwen2.5, Ollama).
3. Do NOT translate: URLs, email addresses, phone numbers, dates, or codes.
4. Maintain professional tone appropriate for a Senior Software Engineer CV.
5. Return ONLY a valid JSON object with the same structure as the input. No markdown, no explanation.
6. For skill keywords that are NOT technology/brand names (e.g., category names like "Architetture e Linguaggi"), translate them meaningfully.
7. For the "name" field in basics, keep the name as-is (already in Latin alphabet).
8. For fluency levels, translate: "Madrelingua" → "Native", "Ottima conoscenza scritta e parlata" → "Excellent written and spoken proficiency", "Buona conoscenza scritta e parlata" → "Good written and spoken proficiency".

INPUT:
${JSON.stringify(sectionData, null, 2)}`;
}

function extractGlossaryTerms(sectionData) {
  const text = JSON.stringify(sectionData);
  const found = new Set(STATIC_GLOSSARY);
  const techPattern = /\b([A-Z][a-zA-Z0-9]*(?:\.[A-Z][a-zA-Z0-9]*)+)\b/g;
  let m;
  while ((m = techPattern.exec(text)) !== null) {
    found.add(m[1]);
  }
  return [...found].sort();
}

function buildLocalPrompt(sectionName, sectionData) {
  const sectionDesc = {
    'basics': 'personal information (name, job title, summary)',
    'basics.location': 'location/address information',
    'work': 'work experience entries',
    'education': 'education entries',
    'skills': 'skill categories and keywords',
    'languages': 'language proficiency',
    'projects': 'project descriptions and highlights',
    'interests': 'personal interests',
  }[sectionName] || sectionName;

  const glossary = extractGlossaryTerms(sectionData);
  const example = SECTION_EXAMPLES[sectionName];

  let prompt = `[TASK]
Translate the following Italian resume section to English: ${sectionName} — ${sectionDesc}

[RULES]
1. Translate ONLY the string values. Keep ALL JSON keys unchanged.
2. Preserve ALL terms listed in the GLOSSARY as-is — do NOT translate them.
3. Do NOT translate: URLs, email addresses, phone numbers, dates, or codes.
4. Maintain a professional tone appropriate for a Senior Software Engineer CV.
5. Return ONLY valid JSON with the same structure as the input. No markdown fences, no explanation, no commentary.
6. Person names in Latin alphabet stay unchanged.
7. Fluency mappings: "Madrelingua" → "Native", "Ottima conoscenza scritta e parlata" → "Excellent written and spoken proficiency", "Buona conoscenza scritta e parlata" → "Good written and spoken proficiency".
8. Skill category names that are Italian phrases (not tech brands) must be meaningfully translated (e.g., "Architetture e Linguaggi" → "Architectures and Languages").

[GLOSSARY]
${glossary.join(', ')}`;

  if (example) {
    prompt += `

[EXAMPLE]
Input:
${JSON.stringify(example.input, null, 2)}

Output:
${JSON.stringify(example.output, null, 2)}`;
  }

  prompt += `

[INPUT]
${JSON.stringify(sectionData, null, 2)}`;

  return prompt;
}

async function checkLocalServer(baseUrl) {
  const healthUrl = baseUrl.replace(/\/v1\/?$/, '').replace(/\/?$/, '/health');
  return new Promise((resolve, reject) => {
    const mod = healthUrl.startsWith('https') ? https : http;
    const req = mod.get(healthUrl, { timeout: 5000 }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.status === 'ok') return resolve(true);
        } catch {}
        resolve(false);
      });
    });
    req.on('error', (err) => reject(new Error(`Local server unreachable at ${healthUrl}: ${err.message}`)));
    req.on('timeout', () => { req.destroy(); reject(new Error(`Local server timeout at ${healthUrl}`)); });
  });
}

async function checkLocalModel(baseUrl, modelId) {
  const modelsUrl = baseUrl.replace(/\/?$/, '/models');
  return new Promise((resolve, reject) => {
    const mod = modelsUrl.startsWith('https') ? https : http;
    const req = mod.get(modelsUrl, { timeout: 10000 }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          const models = parsed.data || [];
          const found = models.some(m => m.id === modelId);
          if (!found) {
            const available = models.map(m => m.id).join(', ');
            return reject(new Error(`Model "${modelId}" not found on server. Available: ${available}`));
          }
          resolve(true);
        } catch (err) {
          reject(new Error(`Failed to parse models response: ${err.message}`));
        }
      });
    });
    req.on('error', (err) => reject(new Error(`Failed to fetch models: ${err.message}`)));
    req.on('timeout', () => { req.destroy(); reject(new Error('Models request timeout')); });
  });
}

async function translateWithOpenAI(sections, model) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your-key-here') {
    console.error('ERROR: OPENAI_API_KEY not set. Use --local for local LLM translation or --extract for manual translation.');
    process.exit(1);
  }

  const client = new OpenAI({ apiKey });
  const useModel = model || process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const translations = {};

  for (const [sectionName, sectionData] of Object.entries(sections)) {
    if (Object.keys(sectionData).length === 0 || (Array.isArray(sectionData) && sectionData.length === 0)) {
      translations[sectionName] = sectionData;
      continue;
    }

    const prompt = buildSectionPrompt(sectionName, sectionData);

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Translating section: ${sectionName} (model: ${useModel}, attempt: ${attempt})`);
        const response = await client.chat.completions.create({
          model: useModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error('Empty response from OpenAI');

        translations[sectionName] = JSON.parse(content);
        console.log(`  ✓ Section ${sectionName} translated successfully`);
        break;
      } catch (err) {
        console.error(`  ✗ Attempt ${attempt} failed for ${sectionName}: ${err.message}`);
        if (attempt === 3) {
          console.error(`  ERROR: Translation failed for section ${sectionName} after 3 attempts. Halting.`);
          process.exit(1);
        }
      }
    }
  }

  return translations;
}

async function translateWithLocalLLM(sections) {
  const baseUrl = process.env.OPENAI_BASE_URL || DEFAULT_LOCAL_BASE_URL;
  const modelId = process.env.LOCAL_LLM_MODEL || DEFAULT_LOCAL_MODEL;

  console.log(`Checking local server at ${baseUrl}...`);
  await checkLocalServer(baseUrl);
  console.log('  ✓ Server is reachable');

  console.log(`Checking model "${modelId}"...`);
  await checkLocalModel(baseUrl, modelId);
  console.log(`  ✓ Model "${modelId}" is available`);

  const client = new OpenAI({ apiKey: 'sk-no-key-needed', baseURL: baseUrl });
  const translations = {};

  for (const [sectionName, sectionData] of Object.entries(sections)) {
    if (Object.keys(sectionData).length === 0 || (Array.isArray(sectionData) && sectionData.length === 0)) {
      translations[sectionName] = sectionData;
      continue;
    }

    const prompt = buildLocalPrompt(sectionName, sectionData);

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Translating section: ${sectionName} (model: ${modelId}, attempt: ${attempt})`);
        const response = await client.chat.completions.create({
          model: modelId,
          messages: [
            { role: 'system', content: 'You are a professional resume translator. Reply ONLY with valid JSON. No markdown fences, no explanation, no thinking aloud.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.1,
          max_tokens: LOCAL_MAX_TOKENS,
        });

        translations[sectionName] = parseLLMResponse(response);
        console.log(`  ✓ Section ${sectionName} translated successfully`);
        break;
      } catch (err) {
        console.error(`  ✗ Attempt ${attempt} failed for ${sectionName}: ${err.message}`);
        if (attempt === 3) {
          console.error(`  ERROR: Translation failed for section ${sectionName} after 3 attempts. Halting.`);
          process.exit(1);
        }
      }
    }
  }

  return translations;
}

function mergeTranslations(src, translations) {
  const output = JSON.parse(JSON.stringify(src));

  const basicsT = translations['basics'];
  if (basicsT) {
    for (const key of TRANSLATABLE_FIELDS.basics) {
      if (basicsT[key] && typeof basicsT[key] === 'string') {
        output.basics[key] = basicsT[key];
      }
    }
  }

  const locT = translations['basics.location'];
  if (locT) {
    for (const key of TRANSLATABLE_FIELDS['basics.location']) {
      if (locT[key] && typeof locT[key] === 'string') {
        output.basics.location[key] = locT[key];
      }
    }
  }

  const arraySections = ['work', 'volunteer', 'education', 'skills', 'languages', 'projects', 'publications', 'interests'];
  for (const sectionName of arraySections) {
    const sectionT = translations[sectionName];
    if (!sectionT || !Array.isArray(sectionT)) continue;

    const fieldConfig = TRANSLATABLE_FIELDS[sectionName];
    if (!fieldConfig) continue;

    for (let i = 0; i < Math.min(output[sectionName].length, sectionT.length); i++) {
      const itemT = sectionT[i];
      const directFields = fieldConfig._ItemFields || [];
      for (const key of directFields) {
        if (itemT[key] && typeof itemT[key] === 'string') {
          output[sectionName][i][key] = itemT[key];
        }
      }
      if (fieldConfig.highlights && Array.isArray(itemT.highlights)) {
        output[sectionName][i].highlights = itemT.highlights;
      }
      if (fieldConfig.keywords && Array.isArray(itemT.keywords)) {
        output[sectionName][i].keywords = itemT.keywords;
      }
    }
  }

  output.meta = {
    ...(output.meta || {}),
    language: 'en',
  };

  if (src.meta) {
    output.meta.theme = src.meta.theme || 'jsonresume-theme-stackoverflow';
    output.meta.version = src.meta.version || 'v1.0.0';
  }

  return output;
}

function extractTranslatable(source) {
  const result = {
    _instructions: 'Translate all string values from Italian to English. Keep all JSON keys unchanged. Preserve technical terms, brand names, and technology names as-is. Return this JSON with translated values only.',
  };

  for (const sectionName of SECTIONS) {
    if (sectionName === 'basics') {
      result.basics = collectFromObject(source.basics, TRANSLATABLE_FIELDS.basics);
      if (source.basics.location) {
        result['basics.location'] = collectFromObject(source.basics.location, TRANSLATABLE_FIELDS['basics.location']);
      }
    } else {
      const sectionData = source[sectionName];
      if (!sectionData || !Array.isArray(sectionData)) continue;
      const fieldConfig = TRANSLATABLE_FIELDS[sectionName];
      if (!fieldConfig) continue;

      const items = [];
      for (const item of sectionData) {
        const itemStrings = {};
        const directFields = fieldConfig._ItemFields || [];
        for (const key of directFields) {
          if (item[key] && typeof item[key] === 'string') {
            itemStrings[key] = item[key];
          }
        }
        if (fieldConfig.highlights && Array.isArray(item.highlights)) {
          itemStrings.highlights = item.highlights.filter(h => typeof h === 'string');
        }
        if (fieldConfig.keywords && Array.isArray(item.keywords)) {
          itemStrings.keywords = item.keywords.filter(k => typeof k === 'string');
        }
        items.push(itemStrings);
      }
      result[sectionName] = items;
    }
  }

  return result;
}

function validateStructure(source, output) {
  const errors = [];

  const basicsSrc = source.basics;
  const basicsOut = output.basics;
  for (const key of TRANSLATABLE_FIELDS.basics) {
    if (basicsSrc[key] && typeof basicsSrc[key] === 'string') {
      if (!(key in basicsOut) || typeof basicsOut[key] !== 'string') {
        errors.push(`basics.${key}: expected string, got ${typeof basicsOut[key]}`);
      }
    }
  }
  if (basicsSrc.location) {
    for (const key of TRANSLATABLE_FIELDS['basics.location']) {
      if (basicsSrc.location[key] && typeof basicsSrc.location[key] === 'string') {
        if (!(key in basicsOut.location) || typeof basicsOut.location[key] !== 'string') {
          errors.push(`basics.location.${key}: expected string, got ${typeof basicsOut.location[key]}`);
        }
      }
    }
  }

  const arraySections = ['work', 'volunteer', 'education', 'skills', 'languages', 'projects', 'publications', 'interests'];
  for (const sectionName of arraySections) {
    const srcArr = source[sectionName];
    const outArr = output[sectionName];
    if (!Array.isArray(srcArr)) continue;
    if (!Array.isArray(outArr)) { errors.push(`${sectionName}: expected array`); continue; }
    if (srcArr.length !== outArr.length) {
      errors.push(`${sectionName}: array length mismatch (source: ${srcArr.length}, output: ${outArr.length})`);
      continue;
    }
    const fieldConfig = TRANSLATABLE_FIELDS[sectionName];
    if (!fieldConfig) continue;
    for (let i = 0; i < srcArr.length; i++) {
      const directFields = fieldConfig._ItemFields || [];
      for (const key of directFields) {
        if (srcArr[i][key] && typeof srcArr[i][key] === 'string') {
          if (!(key in outArr[i]) || typeof outArr[i][key] !== 'string') {
            errors.push(`${sectionName}[${i}].${key}: expected string, got ${typeof outArr[i][key]}`);
          }
        }
      }
      if (fieldConfig.highlights && Array.isArray(srcArr[i].highlights)) {
        if (!Array.isArray(outArr[i].highlights)) {
          errors.push(`${sectionName}[${i}].highlights: expected array`);
        } else if (srcArr[i].highlights.length !== outArr[i].highlights.length) {
          errors.push(`${sectionName}[${i}].highlights: length mismatch (source: ${srcArr[i].highlights.length}, output: ${outArr[i].highlights.length})`);
        }
      }
      if (fieldConfig.keywords && Array.isArray(srcArr[i].keywords)) {
        if (!Array.isArray(outArr[i].keywords)) {
          errors.push(`${sectionName}[${i}].keywords: expected array`);
        } else if (srcArr[i].keywords.length !== outArr[i].keywords.length) {
          errors.push(`${sectionName}[${i}].keywords: length mismatch (source: ${srcArr[i].keywords.length}, output: ${outArr[i].keywords.length})`);
        }
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Structural validation failed:\n  ${errors.join('\n  ')}`);
  }
}

function mergeTranslated(source, translated) {
  if (translated._instructions) {
    delete translated._instructions;
  }

  const output = mergeTranslations(source, translated);
  validateStructure(source, output);
  return output;
}

async function main() {
  const options = parseArgs();

  if (options.fallback) {
    console.error('ERROR: --fallback (Google Translate) has been removed. Use --local for local LLM translation or --extract for manual translation.');
    process.exit(1);
  }

  const sourceFile = options.source;
  if (!sourceFile) {
    console.error('ERROR: --source=<path> is required.');
    process.exit(1);
  }
  if (!fs.existsSync(sourceFile)) {
    console.error(`ERROR: Source file not found: ${sourceFile}`);
    process.exit(1);
  }

  const source = JSON.parse(fs.readFileSync(sourceFile, 'utf-8'));
  console.log(`Loaded source: ${sourceFile}`);

  const baseDir = path.dirname(sourceFile);
  const baseName = path.basename(sourceFile, path.extname(sourceFile));
  const defaultEnFile = path.join(baseDir, `${baseName}.en.json`);
  const defaultExtractFile = path.join(baseDir, `${baseName}.translateme.json`);

  if (options.extract) {
    const extracted = extractTranslatable(source);
    const outFile = options.output || defaultExtractFile;
    fs.writeFileSync(outFile, JSON.stringify(extracted, null, 2) + '\n', 'utf-8');
    console.log(`\nExtracted translatable fields to: ${outFile}`);
    console.log('Paste this file into a chatbot (Gemini, ChatGPT) and ask to translate the values to English.');
    console.log(`Then run: node scripts/translate.js --merge <translated-file>`);
    return;
  }

  if (options.merge) {
    if (!fs.existsSync(options.merge)) {
      console.error(`ERROR: Merge file not found: ${options.merge}`);
      process.exit(1);
    }
    const translated = JSON.parse(fs.readFileSync(options.merge, 'utf-8'));
    console.log(`Loaded translated file: ${options.merge}`);

    const output = mergeTranslated(source, translated);
    const outFile = options.output || defaultEnFile;
    fs.writeFileSync(outFile, JSON.stringify(output, null, 2) + '\n', 'utf-8');
    console.log(`\nOutput written to: ${outFile}`);
    console.log(`Language: ${output.meta.language}`);
    return;
  }

  const sections = collectTranslatableStrings(source);
  console.log(`Collected translatable strings from ${Object.keys(sections).length} sections`);

  let translations;
  if (options.local) {
    console.log(`Using local LLM (model: ${process.env.LOCAL_LLM_MODEL || DEFAULT_LOCAL_MODEL})`);
    translations = await translateWithLocalLLM(sections);
  } else {
    console.log(`Using OpenAI API (model: ${options.model || process.env.OPENAI_MODEL || DEFAULT_MODEL})`);
    translations = await translateWithOpenAI(sections, options.model);
  }

  const output = mergeTranslations(source, translations);

  const outFile = options.output || defaultEnFile;
  fs.writeFileSync(outFile, JSON.stringify(output, null, 2) + '\n', 'utf-8');
  console.log(`\nOutput written to: ${outFile}`);
  console.log(`Language: ${output.meta.language}`);
}

main().catch(err => {
  console.error('Translation failed:', err.message);
  process.exit(1);
});
