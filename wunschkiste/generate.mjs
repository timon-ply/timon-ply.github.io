// Bounded companion renderer. Never writes outside this new Wunschkiste folder.
import {readFileSync,writeFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=dirname(fileURLToPath(import.meta.url));
const escape=value=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function inline(value){return escape(value).replaceAll('&lt;br&gt;','<br>').replace(/\[([^\]]+)\]\(([^)]+)\)/g,(_,label,url)=>`<a href="${url}">${label}</a>`);}
for(const name of ['privacy','impressum','help','deletion']){
  const source=readFileSync(join(root,`${name}.de.md`),'utf8');
  const title=source.match(/^title: "(.+)"$/m)[1];
  const body=source.replace(/^---\n[\s\S]*?\n---\n/,'').trim().split(/\n\s*\n/).map(block=>{
    const heading=block.match(/^(#{1,2}) (.+)$/);
    return heading?`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`:`<p>${inline(block.replaceAll('\n',' '))}</p>`;
  }).join('\n');
  writeFileSync(join(root,`${name}.de.html`),`<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="referrer" content="no-referrer"><title>${escape(title)}</title><link rel="stylesheet" href="/assets/wunschkiste-legal.css"><link rel="canonical" href="https://timonply.com/wunschkiste/${name}.de/"></head>
<body><main><nav aria-label="Zurück"><a href="/">Zur Website</a></nav>
${body}
<footer><a href="/wunschkiste/help.de.html">Hilfe</a> · <a href="/wunschkiste/privacy.de.html">Datenschutz</a> · <a href="/wunschkiste/impressum.de.html">Impressum</a> · <a href="/wunschkiste/deletion.de.html">Konto löschen</a></footer></main></body></html>
`);
}
