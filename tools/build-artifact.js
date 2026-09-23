/* Build a single-file copy of a playroom, for sharing as a Claude artifact.
   Inlines the shared stylesheet and engine, and drops the outer html/head/body
   wrapper (the artifact host supplies its own).

   Usage: node tools/build-artifact.js site/playrooms/factory-method/index.html out.html
*/
const fs = require('fs');
const path = require('path');

const [src, dest] = process.argv.slice(2);
if(!src || !dest){
  console.error('usage: node tools/build-artifact.js <page> <out>');
  process.exit(1);
}

const pageDir = path.dirname(src);
let html = fs.readFileSync(src, 'utf8');

html = html.replace(/[ \t]*<link rel="stylesheet" href="((?:\.\.\/)*assets\/[^"]+)">\n?/g, (m, href) =>
  '<style>\n' + fs.readFileSync(path.join(pageDir, href), 'utf8').trim() + '\n</style>\n');

html = html.replace(/[ \t]*<script src="((?:\.\.\/)*assets\/[^"]+)"><\/script>\n?/g, (m, src2) =>
  '<script>\n' + fs.readFileSync(path.join(pageDir, src2), 'utf8').trim() + '\n</script>\n');

/* keep only what sits inside the document: title, links, styles, body content */
const head = html.slice(html.indexOf('<head>') + 6, html.indexOf('</head>'));
const body = html.slice(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'));
const keep = head
  .split('\n')
  .filter(l => !/^\s*<meta (charset|name="viewport")/.test(l))
  .join('\n')
  .trim();

fs.mkdirSync(path.dirname(path.resolve(dest)), {recursive:true});
fs.writeFileSync(dest, keep + '\n' + body.trim() + '\n');
console.log(`${dest}  ${(fs.statSync(dest).size / 1024).toFixed(1)} KB`);
