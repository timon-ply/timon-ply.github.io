import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8').replaceAll('\r\n','\n');
const escape=value=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const inline=value=>escape(value).replaceAll('&lt;br&gt;','<br>').replace(/\[([^\]]+)\]\(([^)]+)\)/g,(_,label,url)=>`<a href="${url}">${label}</a>`);

test('limited DE/EN upload terms expose matching stable routes and version',()=>{
  for(const lang of ['de','en']){
    const md=read(`wunschkiste/terms.${lang}.md`),html=read(`wunschkiste/terms.${lang}.html`);
    assert.match(md,new RegExp(`^language_code: ${lang}$`,'m'));
    assert.match(md,new RegExp(`^permalink: /wunschkiste/terms\\.${lang}/$`,'m'));
    assert.match(md,/upload-v1-2026-10-11/);
    assert.match(html,new RegExp(`<html lang="${lang}">`));
    assert.match(html,new RegExp(`rel="canonical" href="https://timonply.com/wunschkiste/terms\\.${lang}/"`));
    for(const locale of ['de','en'])assert.match(html,new RegExp(`rel="alternate" hreflang="${locale}" href="https://timonply.com/wunschkiste/terms\\.${locale}/"`));
    assert.match(md,/Timon Polley/);
    assert.match(md,/mailto:dev@timonply\.com/);
    for(const doc of ['help','privacy','impressum','deletion'])assert.match(md,new RegExp(`/wunschkiste/${doc}\\.${lang}\\.html`));
  }
});

test('both terms preserve ownership and narrowly limit permitted use',()=>{
  const de=read('wunschkiste/terms.de.md'),en=read('wunschkiste/terms.en.md');
  assert.match(de,/einfaches, nicht ausschließliches und unentgeltliches Nutzungsrecht/);
  assert.match(en,/non-exclusive, royalty-free licence/);
  assert.match(de,/weder den Verkauf.*Store-Screenshots.*eigene ausreichende Erlaubnis/s);
  assert.match(en,/does not include selling.*Store screenshots.*separate sufficient permission/s);
  assert.match(de,/Du überträgst kein Eigentum/);assert.match(en,/You do not transfer ownership/);
  assert.match(de,/genaue hochgeladene Bildfassung manuell freigegeben/);
  assert.match(en,/exact uploaded image version has been manually approved/);
  assert.match(de,/keine Händlerfotos.*nicht automatisch/s);assert.match(en,/imports no retailer photographs.*not retrieve product details automatically/s);
  assert.match(de,/erforderliche Einwilligung.*bei Kindern.*Elternperson/s);
  assert.match(en,/necessary consent.*for children.*responsible parent/s);
});

test('photo permission is separate, nonretroactive and withdrawal does not erase old images',()=>{
  for(const name of ['terms','help','privacy']){
    const de=read(`wunschkiste/${name}.de.md`),en=read(`wunschkiste/${name}.en.md`);
    assert.match(de,/13–17/);assert.match(en,/13–17/);
    assert.match(de,/frühere allgemeine Kontofreigabe.*nicht nachträglich|ältere allgemeine Kontofreigabe ersetzt sie nicht/);
    assert.match(en,/earlier general account approval does not.*retrospectively|older general account approval does not replace it/);
    assert.match(de,/zukünftige.*[Uu]ploads.*(?:nicht automatisch|aber nicht automatisch)/s);
    assert.match(en,/future.*uploads.*does not automatically/s);
    assert.match(de,/Erlaubnis.*(?:erteilen oder widerrufen|erteilen.*widerrufen)/s);
    assert.match(en,/grant or withdraw photo permission|grant or withdraw the additional photo permission/);
  }
  assert.match(read('wunschkiste/terms.de.md'),/keine unabhängige Prüfung von Alter, Identität oder Erziehungsberechtigung/);
  assert.match(read('wunschkiste/terms.en.md'),/does not claim independent verification of age, identity or parental authority/);
});

test('display permission ends while necessary bounded retention remains disclosed',()=>{
  assert.match(read('wunschkiste/terms.de.md'),/laufende Anzeige endet.*technisch notwendige Sicherungskopien.*erneute Veröffentlichung oder Marketingnutzung ist davon nicht umfasst/s);
  assert.match(read('wunschkiste/terms.en.md'),/ongoing display ends.*necessary backups.*renewed publication or marketing use is excluded/s);
  for(const lang of ['de','en']){
    const terms=read(`wunschkiste/terms.${lang}.md`),privacy=read(`wunschkiste/privacy.${lang}.md`);
    assert.match(terms,/90/);assert.match(privacy,/90/);
    assert.match(privacy,/SHA-256/);assert.match(privacy,/upload-v1-2026-10-11/);
    assert.match(terms,/kein(?:en)? automatischen Löschjob|no automatic deletion job/);
  }
});

test('help and privacy link the exact localized terms, with generated source parity',()=>{
  for(const lang of ['de','en'])for(const name of ['help','privacy','terms']){
    const md=read(`wunschkiste/${name}.${lang}.md`),html=read(`wunschkiste/${name}.${lang}.html`);
    if(name!=='terms'){
      assert.match(md,new RegExp(`/wunschkiste/terms\\.${lang}/`));
      assert.match(html,new RegExp(`href="/wunschkiste/terms\\.${lang}/"`));
    }
    const body=md.replace(/^---\n[\s\S]*?\n---\n/,'').trim().split(/\n\s*\n/).map(block=>{
      const heading=block.match(/^(#{1,2}) (.+)$/);
      return heading?`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`:`<p>${inline(block.replaceAll('\n',' '))}</p>`;
    }).join('\n');
    assert.ok(html.includes(body),`${name}.${lang} renderer drift`);
    assert.doesNotMatch(html,/<(?:script|iframe)[^>]+https?:\/\//i);
    for(const href of [...html.matchAll(/href="(\/wunschkiste\/[^"?#]+)"/g)].map(match=>match[1])){
      const local=href.replace(/^\//,'').replace(/\/$/,'');
      assert.ok(existsSync(root+local)||existsSync(root+local+'.md')||existsSync(root+local+'.html'),`missing ${href}`);
    }
  }
  assert.match(read('wunschkiste/generate.mjs'),/const allowed=\['privacy','impressum','help','deletion','terms'\]/);
});
