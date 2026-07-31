import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const languages = ['de', 'en', 'es', 'ja'];
const apps = {
  neonroutine: ['privacy', 'terms', 'accessibility', 'deletion', 'impressum'],
  kalvenda: ['privacy', 'terms', 'accessibility', 'deletion', 'csae', 'impressum'],
  exactake: ['privacy', 'terms', 'accessibility', 'deletion', 'impressum'],
  flatnest: ['privacy', 'terms', 'accessibility', 'deletion', 'csae', 'impressum'],
};

function read(path) {
  return readFileSync(join(root, path), 'utf8');
}

function exists(path) {
  return existsSync(join(root, path));
}

function localRefs(html, attr) {
  return [...html.matchAll(new RegExp(`\\s${attr}="([^"#?][^"]*)"`, 'g'))]
    .map((match) => match[1])
    .filter((ref) => ref.startsWith('/'))
    .map((ref) => ref.split('#')[0].split('?')[0].replace(/^\//, '').replace(/\/$/, ''));
}

function localHrefs(html) {
  return localRefs(html, 'href');
}

function localSrcs(html) {
  return localRefs(html, 'src');
}

function legalMarkdownFiles() {
  const files = [
    'README.md',
    'docs/legal-route-matrix.md',
    'docs/regulatory-review.md',
    ...languages.map((lang) => `impressum.${lang}.md`),
  ];

  for (const [app, docs] of Object.entries(apps)) {
    for (const doc of docs) {
      for (const lang of languages) files.push(`${app}/${doc}.${lang}.md`);
    }
  }

  files.push('flatnest/privacy.md', 'flatnest/terms.md', 'flatnest/LEGAL_REVIEW_REQUIRED.md');
  return files;
}

function frontMatter(path) {
  const text = read(path);
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  return match?.[1] ?? '';
}

function yamlListValues(frontmatter, key) {
  const lines = frontmatter.split('\n');
  const index = lines.findIndex((line) => line === `${key}:`);
  if (index === -1) return [];

  const values = [];
  for (const line of lines.slice(index + 1)) {
    if (!line.startsWith('  - ')) break;
    values.push(line.slice(4).trim());
  }
  return values;
}

function normalizedJekyllOutput(route) {
  const clean = route.replace(/^\/+/, '').replace(/\/+$/, '');
  if (!clean) return 'index.html';
  if (/\.[a-z0-9]+$/i.test(clean)) return clean;
  return `${clean}/index.html`;
}

test('home page exposes the app legal repository and all app route groups', () => {
  const html = read('index.html');

  assert.match(html, /Legal pages, support routes, and app compliance references\./);
  assert.match(html, /class="[^"]*\bportfolio-hero\b/);
  assert.match(html, /class="[^"]*\bapp-showcase\b/);
  assert.match(html, /docs\/legal-route-matrix/);
  assert.match(html, /docs\/regulatory-review/);

  for (const app of Object.keys(apps)) {
    assert.match(html, new RegExp(`id="${app}"`));
    for (const doc of apps[app]) {
      for (const lang of languages) {
        assert.match(html, new RegExp(`/${app}/${doc}\\.${lang}/`));
      }
    }
  }

  assert.match(html, /assets\/icons\/exactake-192\.png/);
  assert.doesNotMatch(html, /Documents and support for NeonRoutine and Kalvenda\./);
  assert.doesNotMatch(html, /Live index/i);
  assert.doesNotMatch(html, /signal-grid/);
  assert.doesNotMatch(html, /class="[^"]*\blegal-command\b/);
});

test('support and debug pages expose privacy, safety, accessibility, and QA routes', () => {
  const support = read('support.html');
  const debug = read('debug.html');

  assert.match(support, /mailto:dev@timonply\.com/);
  assert.match(support, /Exactake, Flatnest, Kalvenda, or NeonRoutine/);
  assert.match(support, /\/flatnest\/deletion\.en\//);
  assert.match(support, /\/kalvenda\/csae\.en\//);
  assert.match(support, /\/docs\/legal-route-matrix\//);

  assert.match(debug, /Route checks for app metadata/);
  assert.match(debug, /\/docs\/legal-route-matrix\//);
  assert.match(debug, /\/flatnest\/privacy\.en\//);
  assert.match(debug, /\/exactake\/accessibility\.en\//);
  assert.match(debug, /\/neonroutine\/deletion\.en\//);
  assert.doesNotMatch(debug, /design regression|Visual regression|viewport widths/i);
});

test('multilingual app legal corpus is complete and has redirect aliases', () => {
  for (const [app, docs] of Object.entries(apps)) {
    for (const doc of docs) {
      for (const lang of languages) {
        const path = `${app}/${doc}.${lang}.md`;
        assert.equal(exists(path), true, `missing ${path}`);
        const text = read(path);

        assert.match(text, /^---\nlayout: legal/m, `${path} missing legal front matter`);
        assert.match(text, new RegExp(`^language_code: ${lang}$`, 'm'), `${path} missing language code`);
        assert.match(text, new RegExp(`^permalink: /${app}/${doc}\\.${lang}/$`, 'm'), `${path} missing canonical permalink`);
        assert.match(text, new RegExp(`  - /${app}/${doc}\\.${lang}\\.html$`, 'm'), `${path} missing html redirect`);
        assert.match(text, new RegExp(`  - /${app}/${doc}\\.${lang}\\.md$`, 'm'), `${path} missing md redirect`);
        assert.doesNotMatch(text, new RegExp(`  - /${app}/${doc}\\.${lang}$`, 'm'), `${path} has a redirect alias that collides with its canonical permalink`);
        assert.doesNotMatch(text, /ec\.europa\.eu\/consumers\/odr/i, `${path} contains discontinued ODR URL`);
        assert.doesNotMatch(text, /[ÃÂ]|â€|ã[€‚ƒ]/, `${path} contains likely mojibake`);
      }
    }
  }
});

test('NeonRoutine privacy pages disclose bounded health access in every language', () => {
  const expected = {
    de: /Apple HealthKit oder Android Health Connect.*ausschließlich auf dem Gerät.*schreibt keine Gesundheitsdaten.*Werbe- oder Kaufanalysen.*widerrufen/s,
    en: /Apple HealthKit or Android Health Connect.*only on the device.*does not write health data.*advertising or purchase analytics.*revoked/s,
    es: /Apple HealthKit o Android Health Connect.*solo en el dispositivo.*no escribe datos de salud.*analítica publicitaria o de compras.*revocarse/s,
    ja: /Apple HealthKitまたはAndroid Health Connect.*端末上でのみ.*健康データへの書き込み.*広告・購入分析への送信.*取り消せます/s,
  };

  for (const lang of languages) {
    assert.match(read(`neonroutine/privacy.${lang}.md`), expected[lang]);
  }

  assert.match(
    read('neonroutine/privacy.en.md'),
    /^  - \/neonroutine\/privacy\/$/m,
    'English privacy page must own the stable generic store URL',
  );
});

test('shared legal notices, route matrix, and regulatory notes are publishable', () => {
  for (const lang of languages) {
    const path = `impressum.${lang}.md`;
    const text = read(path);

    assert.match(text, /^---\nlayout: legal/m);
    assert.match(text, new RegExp(`^permalink: /impressum\\.${lang}/$`, 'm'));
    assert.match(text, new RegExp(`  - /impressum\\.${lang}\\.html$`, 'm'));
    assert.doesNotMatch(text, new RegExp(`  - /impressum\\.${lang}$`, 'm'));
    assert.doesNotMatch(text, /ec\.europa\.eu\/consumers\/odr/i);
  }

  const matrix = read('docs/legal-route-matrix.md');
  const review = read('docs/regulatory-review.md');

  assert.match(matrix, /^---\nlayout: legal/m);
  assert.match(matrix, /^permalink: \/docs\/legal-route-matrix\/$/m);
  assert.match(matrix, /Application workspace checked: C:\\\\coding\\\\applications\\\\exactake/);
  assert.match(matrix, /flatnest\/csae\.en\//);

  assert.match(review, /^---\nlayout: legal/m);
  assert.match(review, /^permalink: \/docs\/regulatory-review\/$/m);
  assert.match(review, /EU ODR platform discontinuation as of 20 July 2025/);
});

test('redirect aliases do not collide with canonical Jekyll output paths', () => {
  const outputs = new Map();

  for (const file of legalMarkdownFiles()) {
    const fm = frontMatter(file);
    const permalink = fm.match(/^permalink:\s*(.+)$/m)?.[1]?.trim();
    if (!permalink) continue;

    const canonicalOutput = normalizedJekyllOutput(permalink);
    assert.equal(outputs.has(canonicalOutput), false, `${file} duplicates output ${canonicalOutput}`);
    outputs.set(canonicalOutput, `${file} permalink`);
  }

  for (const file of legalMarkdownFiles()) {
    const fm = frontMatter(file);
    for (const redirect of yamlListValues(fm, 'redirect_from')) {
      const redirectOutput = normalizedJekyllOutput(redirect);
      assert.equal(
        outputs.has(redirectOutput),
        false,
        `${file} redirect_from ${redirect} collides with ${outputs.get(redirectOutput)}`,
      );
      outputs.set(redirectOutput, `${file} redirect_from ${redirect}`);
    }
  }
});

test('stylesheet has accessible responsive behavior without viewport-scaled type', () => {
  const css = read('assets/site.css');
  const fontSizeRules = [...css.matchAll(/font-size\s*:[^;]+;/g)].map((match) => match[0]);

  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /\.route-row/);
  assert.equal(
    fontSizeRules.some((rule) => rule.includes('vw')),
    false,
    'font-size rules must not scale with viewport width',
  );
});

test('public pages only link to existing local documents, files, and image assets', () => {
  const pages = ['index.html', 'support.html', 'debug.html'];

  for (const page of pages) {
    for (const href of localHrefs(read(page))) {
      if (href === '' || href === 'index.html' || href === 'support.html' || href === 'debug.html') {
        continue;
      }

      const candidates = [`${href}.html`, `${href}.md`, join(href, 'index.html'), href];

      assert.equal(
        candidates.some((candidate) => exists(candidate)),
        true,
        `${page} links to missing local route /${href}/`,
      );
    }

    for (const src of localSrcs(read(page))) {
      assert.equal(exists(src), true, `${page} references missing local asset /${src}`);
    }
  }
});

test('exactake icons and generated document tooling are present', () => {
  assert.equal(exists('assets/icons/exactake.png'), true);
  assert.equal(exists('assets/icons/exactake-192.png'), true);
  assert.match(read('_config.yml'), /jekyll-redirect-from/);
  assert.match(read('README.md'), /tools\/generate_legal_docs\.mjs|tools\\generate_legal_docs\.mjs/);
});

test('feature registry documents app route and debug surfaces', () => {
  const registry = read('feature_registry.md');

  assert.match(registry, /Portfolio Design Overhaul/);
  assert.match(registry, /Debug Functionality Register/);
  assert.match(registry, /\/debug\.html/);
  assert.match(registry, /legal document routes/);
  assert.match(registry, /app-scoped route checks/);
});

test('all owned legal markdown documents avoid the discontinued EU ODR URL', () => {
  for (const file of legalMarkdownFiles()) {
    const text = read(file);
    assert.doesNotMatch(text, /ec\.europa\.eu\/consumers\/odr/i, `${file} contains discontinued ODR URL`);
  }
});
