import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

function read(path) {
  return readFileSync(join(root, path), 'utf8');
}

function localHrefs(html) {
  return [...html.matchAll(/\shref="([^"#?][^"]*)"/g)]
    .map((match) => match[1])
    .filter((href) => href.startsWith('/'))
    .map((href) => href.split('#')[0].split('?')[0].replace(/^\//, '').replace(/\/$/, ''));
}

test('home page exposes the redesigned portfolio structure', () => {
  const html = read('index.html');

  assert.match(html, /class="[^"]*\bportfolio-hero\b/);
  assert.match(html, /class="[^"]*\bsignal-grid\b/);
  assert.match(html, /aria-label="Portfolio status"/);
  assert.match(html, /class="[^"]*\bapp-showcase\b/);
  assert.match(html, /class="[^"]*\blegal-command\b/);
  assert.match(html, /Kalvenda account deletion/);
});

test('support and debug pages keep public support and QA routes reachable', () => {
  const support = read('support.html');
  const debug = read('debug.html');

  assert.match(support, /mailto:dev@timonply\.com/);
  assert.match(support, /class="[^"]*\bsupport-dashboard\b/);
  assert.match(debug, /Developer QA/);
  assert.match(debug, /Visual regression checkpoints/);
  assert.match(debug, /\/kalvenda\/deletion\.en\//);
});

test('feature registry documents the design and debug surfaces', () => {
  const registry = read('feature_registry.md');

  assert.match(registry, /Portfolio Design Overhaul/);
  assert.match(registry, /Debug Functionality Register/);
  assert.match(registry, /\/debug\.html/);
  assert.match(registry, /legal document routes/);
});

test('stylesheet has accessible responsive behavior without viewport-scaled type', () => {
  const css = read('assets/site.css');
  const fontSizeRules = [...css.matchAll(/font-size\s*:[^;]+;/g)].map((match) => match[0]);

  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.equal(
    fontSizeRules.some((rule) => rule.includes('vw')),
    false,
    'font-size rules must not scale with viewport width',
  );
});

test('tracked pages only link to existing local documents or files', () => {
  const pages = ['index.html', 'support.html', 'debug.html'];

  for (const page of pages) {
    for (const href of localHrefs(read(page))) {
      if (href === '' || href === 'index.html' || href === 'support.html' || href === 'debug.html') {
        continue;
      }

      const candidates = [
        `${href}.html`,
        `${href}.md`,
        join(href, 'index.html'),
        href,
      ];

      assert.equal(
        candidates.some((candidate) => existsSync(join(root, candidate))),
        true,
        `${page} links to missing local route /${href}/`,
      );
    }
  }
});
