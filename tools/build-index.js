/* Write site/index.html from the city map, so the home page can never drift
   from site/assets/city.js.

   Usage: node tools/build-index.js
*/
const fs = require('fs');
const CITY = require('../site/assets/city.js');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const district = d => {
  const rooms = d.playrooms.map(p =>
    `    <li data-room="${p.slug}"><a href="playrooms/${p.slug}/"><span class="t">${esc(p.title)}</span> <span class="d">${esc(p.blurb)}</span><span class="state" hidden></span></a></li>`);
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
h1{font-family:var(--display);font-weight:800;font-size:clamp(40px,8vw,66px);line-height:.95;letter-spacing:-.035em;margin:34px 0 12px;text-wrap:balance}
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
li .state{margin-left:auto;font-family:var(--mono);font-size:11px;text-transform:uppercase;letter-spacing:.06em}
li .state.done{color:var(--good)}
li .state.part{color:var(--accent)}
li.soon{color:var(--muted);padding:14px 2px;font-size:14px}
.resume{margin:0 0 16px}
.resume a{display:inline-flex;align-items:center;gap:8px;font-size:14.5px;color:var(--ink);text-decoration:none;
          border:1px solid var(--accent);border-radius:10px;padding:10px 14px}
.resume a span{font-family:var(--mono);font-size:12px;color:var(--accent)}
.resume a:hover{background:rgba(201,112,29,.1)}
.loop{font-size:14px;color:var(--muted);border-top:1px solid var(--hair);padding-top:22px;max-width:60ch}
.loop b{color:var(--ink);font-weight:500}
</style>
</head>
<body>
<div class="wrap">
  <h1>Learn by breaking</h1>
  <p class="dek">Software engineering concepts you can walk into, take apart and put back together. Built for students heading into interviews.</p>
  <nav class="jump">${CITY.districts.map(d => `<a href="#${d.slug}">${esc(d.name)}</a>`).join('')}</nav>

${open.map(district).join('\n\n')}

${planned.map(district).join('\n\n')}

  <p class="loop">Every playroom runs the same loop: <b>see it</b> working, <b>break it</b> yourself, <b>fix it</b>, read the <b>same code</b> in C#, Java or TypeScript, then take the <b>interview check</b>.</p>
</div>

<script src="assets/city.js"></script>
<script src="assets/nav.js"></script>
<script>
  RuntimeNav.mount({title:'All districts'});

  /* mark what this visitor has already done, and offer to pick it up again */
  (function(){
    const P = RuntimeNav.Progress, L = RuntimeNav.links(null);
    let resume = null;
    CITY.all.forEach(room => {
      const p = P.of(room.slug);
      if(!p) return;
      const li = document.querySelector('li[data-room="' + room.slug + '"] .state');
      if(li){
        li.hidden = false;
        li.className = 'state ' + (p.done ? 'done' : 'part');
        li.textContent = p.done ? 'finished' : 'step ' + p.step + ' of ' + (p.total || 6);
      }
      if(!p.done && !resume) resume = {room, p};
    });
    if(resume){
      const h1 = document.querySelector('h1');
      h1.insertAdjacentHTML('afterend',
        '<p class="resume"><a href="' + L.room(resume.room.slug) + '#step-' + resume.p.step + '">' +
        'Pick up where you left off: ' + resume.room.title +
        ' <span>step ' + resume.p.step + ' of ' + (resume.p.total || 6) + ' →</span></a></p>');
    }
  })();
</script>
</body>
</html>
`;

fs.writeFileSync('site/index.html', html);
console.log(`site/index.html  ${CITY.all.length} playrooms across ${CITY.districts.length} districts`);
