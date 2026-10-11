// Bounded companion renderer. Never writes outside this new Wunschkiste folder.
import {readFileSync,writeFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=dirname(fileURLToPath(import.meta.url));
const escape=value=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function inline(value){return escape(value).replaceAll('&lt;br&gt;','<br>').replace(/\[([^\]]+)\]\(([^)]+)\)/g,(_,label,url)=>`<a href="${url}">${label}</a>`);}
const allowed=['privacy','impressum','help','deletion','terms'];
const requested=process.argv.slice(2);
if(requested.some(name=>!allowed.includes(name)))throw new Error('Unknown Wunschkiste document');
const documents=requested.length?[...new Set(requested)]:allowed;
for(const language of ['de','en'])for(const name of documents){
  const english=language==='en';
  const source=readFileSync(join(root,`${name}.${language}.md`),'utf8').replaceAll('\r\n','\n');
  const title=source.match(/^title: "(.+)"$/m)[1];
  const body=source.replace(/^---\n[\s\S]*?\n---\n/,'').trim().split(/\n\s*\n/).map(block=>{
    const heading=block.match(/^(#{1,2}) (.+)$/);
    return heading?`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`:`<p>${inline(block.replaceAll('\n',' '))}</p>`;
  }).join('\n');
  const labels=english?['Help','Privacy','Legal notice','Delete account']:['Hilfe','Datenschutz','Impressum','Konto löschen'];
  writeFileSync(join(root,`${name}.${language}.html`),`<!doctype html>
<html lang="${language}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="referrer" content="no-referrer"><title>${escape(title)}</title><link rel="stylesheet" href="/assets/wunschkiste-legal.css"><link rel="canonical" href="https://timonply.com/wunschkiste/${name}.${language}/"><link rel="alternate" hreflang="de" href="https://timonply.com/wunschkiste/${name}.de/"><link rel="alternate" hreflang="en" href="https://timonply.com/wunschkiste/${name}.en/"></head>
<body><main><nav aria-label="Navigation"><a href="/">${english?'Website':'Zur Website'}</a> · <a href="/wunschkiste/${name}.de.html" lang="de"${language==='de'?' aria-current="page"':''}>Deutsch</a> · <a href="/wunschkiste/${name}.en.html" lang="en"${language==='en'?' aria-current="page"':''}>English</a></nav>
${body}
<footer>${['help','privacy','impressum','deletion'].map((route,index)=>`<a href="/wunschkiste/${route}.${language}.html">${labels[index]}</a>`).join(' · ')}</footer></main></body></html>
`);
}
