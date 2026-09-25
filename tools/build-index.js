/* Write site/index.html from the city map, so the home page can never drift
   from site/assets/city.js.

   Usage: node tools/build-index.js
*/
const fs = require('fs');
const CITY = require('../site/assets/city.js');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const district = d => {
  const rooms = d.playrooms.map(p =>
    `    <li><a href="playrooms/${p.slug}/"><span class="t">${esc(p.title)}</span> <span class="d">${esc(p.blurb)}</span></a></li>`);
  const soon = d.soon.length
    ? [`    <li class="soon">${d.soon.map(esc).join(' · ')} — coming soon</li>`]
    : [];
  return `  <section id="${d.slug}">
    <h2>${esc(d.name)} <span class="state">${d.open ? `${d.playrooms.length} playroom${d.playrooms.length === 1 ? '' : 's'}` : 'planned'}</span></h2>
    <p class="blurb">${esc(d.blurb)}</p>
    <ul>
${rooms.concat(soon).join('\n')}
    </ul>
  </section>`;
};

const open = CITY.districts.filter(d => d.open);
const planned = CITY.districts.filter(d => !d.open);

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Runtime City</title>
<meta name="description" content="Runtime City: learn software engineering concepts by seeing them, breaking them and fixing them. Built for students heading into interviews.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=IBM+Plex+Sans:wght@400;500&family=JetBrains+Mono:wght@400&display=swap">
<link rel="stylesheet" href="assets/playroom.css">
<style>
body{padding-block:0 72px}
.wrap{max-width:760px}
.brand{display:inline-flex;align-items:center;gap:8px;font-family:var(--display);font-weight:800;font-size:15px;padding-block:26px 0}
.brand svg{width:15px;height:15px}
h1{font-family:var(--display);font-weight:800;font-size:clamp(40px,8vw,66px);line-height:.95;letter-spacing:-.035em;margin:30px 0 12px;text-wrap:balance}
.dek{font-size:18px;color:var(--muted);margin:0 0 14px;max-width:46ch}
.jump{display:flex;flex-wrap:wrap;gap:2px 18px;font-size:13.5px;margin:0 0 40px;padding-bottom:14px;border-bottom:1px solid var(--hair)}
.jump a{color:var(--muted);text-decoration:none;border-bottom:1px solid transparent;padding-block:10px}
.jump a:hover{color:var(--ink);border-bottom-color:var(--accent)}
section{margin-bottom:40px;scroll-margin-top:24px}
h2{font-family:var(--mono);font-weight:400;font-size:11px;text-transform:uppercase;letter-spacing:.09em;color:var(--muted);margin:0 0 4px;display:flex;gap:10px;align-items:baseline}
h2 .state{color:var(--accent)}
.blurb{margin:0 0 10px;font-size:14px;color:var(--muted)}
ul{list-style:none;margin:0;padding:0;border-top:1px solid var(--hair)}
li{border-bottom:1px solid var(--hair)}
li a{display:flex;align-items:baseline;gap:4px 12px;flex-wrap:wrap;padding:16px 2px;color:var(--ink);text-decoration:none;min-height:52px}
li a:hover .t{border-bottom:1px solid var(--accent)}
li .t{font-family:var(--display);font-weight:600;font-size:20px;letter-spacing:-.02em}
li .d{color:var(--muted);font-size:14px}
li.soon{color:var(--muted);padding:14px 2px;font-size:14px}
.loop{font-size:14px;color:var(--muted);border-top:1px solid var(--hair);padding-top:22px;max-width:60ch}
.loop b{color:var(--ink);font-weight:500}
</style>
</head>
<body>
<div class="wrap">
  <span class="brand">
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="10" width="5" height="12" fill="currentColor"/><rect x="9" y="4" width="6" height="18" fill="currentColor"/><rect x="17" y="13" width="5" height="9" fill="var(--accent)"/></svg>
    Runtime City
  </span>

  <h1>Learn by breaking</h1>
  <p class="dek">Software engineering concepts you can walk into, take apart and put back together. Built for students heading into interviews.</p>
  <nav class="jump">${CITY.districts.map(d => `<a href="#${d.slug}">${esc(d.name)}</a>`).join('')}</nav>

${open.map(district).join('\n\n')}

${planned.map(district).join('\n\n')}

  <p class="loop">Every playroom runs the same loop: <b>see it</b> working, <b>break it</b> yourself, <b>fix it</b>, read the <b>same code</b> in C#, Java or TypeScript, then take the <b>interview check</b>.</p>
</div>
</body>
</html>
`;

fs.writeFileSync('site/index.html', html);
console.log(`site/index.html  ${CITY.all.length} playrooms across ${CITY.districts.length} districts`);
