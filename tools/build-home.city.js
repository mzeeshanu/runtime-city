/* HOME PAGE — CITY VERSION (fallback).

   Run it with: node tools/build-index.js city

   Write site/index.html from the city map.

   The home page is a drawing of the city: every district is a block, every
   playroom is a building you can walk into, and finished ones have their
   lights on. The text list underneath is the same content for phones,
   search engines and anyone who would rather read than explore.

   Usage: node tools/build-index.js
*/
const fs = require('fs');
const CITY = require('../site/assets/city.js');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* where each district sits on the map, and how its buildings are drawn */
const LAYOUT = {
  'pattern-park':        {x:40,  y:44,  w:280, h:180, kind:'park'},
  'solid-quarter':       {x:360, y:44,  w:280, h:180, kind:'blocks'},
  'memory-harbour':      {x:680, y:44,  w:280, h:180, kind:'harbour'},
  'concurrency-crossing':{x:40,  y:268, w:280, h:180, kind:'blocks'},
  'database-vault':      {x:360, y:268, w:280, h:180, kind:'vault'},
  'network-highway':     {x:680, y:268, w:280, h:180, kind:'road'}
};

/* Each playroom gets a sign on its facade, drawn in a 24×24 box, plus a
   rooftop that suits it. The point is that you can tell the buildings apart
   before you read a word. */
const GLYPH = {
  socket:   '<rect class="gl" x="4" y="7" width="16" height="11" rx="2"/><path class="gl" d="M9 11v3M15 11v3"/><path class="gl a" d="M12 2v5"/>',
  gear:     '<circle class="gl" cx="12" cy="12" r="5"/><path class="gl a" d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M18 6l-2 2"/>',
  fork:     '<path class="gl" d="M12 21V13"/><path class="gl a" d="M12 13 5 5M12 13l7-8M12 13v-9"/>',
  antenna:  '<path class="gl" d="M12 21V6"/><path class="gl a" d="M7 9a7 7 0 0 1 10 0M9 12a4 4 0 0 1 6 0"/><circle class="gl a" cx="12" cy="4" r="2"/>',
  one:      '<path class="gl" d="M9 8l3-3v14"/><path class="gl a" d="M7 19h10"/>',
  stack:    '<rect class="gl" x="4" y="15" width="16" height="5" rx="1"/><rect class="gl" x="6" y="10" width="12" height="5" rx="1"/><rect class="gl a" x="8" y="5" width="8" height="5" rx="1"/>',
  bin:      '<path class="gl" d="M6 7h12l-1 13H7L6 7Z"/><path class="gl a" d="M4 7h16M10 4h4"/><path class="gl" d="M10 11v5M14 11v5"/>',
  box:      '<rect class="gl" x="4" y="7" width="16" height="13" rx="2"/><path class="gl a" d="M4 11h16M12 7v-4"/>',
  pointer:  '<path class="gl" d="M4 12h9"/><path class="gl" d="M10 8l4 4-4 4"/><circle class="gl a" cx="18" cy="12" r="3"/><path class="gl a" d="M16 14l4-4"/>',
  bolt:     '<path class="gl a" d="M13 2 5 13h6l-1 9 8-11h-6l1-9Z"/>',
  onedoor:  '<path class="gl" d="M5 20V9l7-5 7 5v11"/><rect class="gl a" x="10" y="13" width="4" height="7"/>',
  plus:     '<rect class="gl" x="4" y="8" width="10" height="12" rx="1"/><path class="gl a" d="M17 9v8M13 13h8"/>',
  shapes:   '<rect class="gl" x="3" y="7" width="18" height="10" rx="1"/><rect class="gl a" x="7" y="7" width="10" height="10" rx="1"/>',
  split:    '<rect class="gl" x="3" y="6" width="7" height="13" rx="1"/><rect class="gl a" x="14" y="6" width="7" height="13" rx="1"/>',
  flip:     '<path class="gl" d="M8 20V6"/><path class="gl" d="M5 9l3-3 3 3"/><path class="gl a" d="M16 4v14"/><path class="gl a" d="M13 15l3 3 3-3"/>',
  signpost: '<path class="gl" d="M12 21V5"/><path class="gl a" d="M12 7h8l-2 3h-6Z"/><path class="gl" d="M12 13H4l2-3h6Z"/>',
  handshake:'<path class="gl" d="M3 10h5l4 4"/><path class="gl a" d="M21 14h-5l-4-4"/><path class="gl" d="M8 10l4-3 4 3"/>',
  envelope: '<rect class="gl" x="3" y="6" width="18" height="12" rx="2"/><path class="gl a" d="m3 8 9 6 9-6"/>',
  padlock:  '<rect class="gl" x="5" y="11" width="14" height="9" rx="2"/><path class="gl a" d="M9 11V8a3 3 0 0 1 6 0v3"/>',
  tabs:     '<rect class="gl" x="4" y="5" width="16" height="15" rx="2"/><path class="gl a" d="M8 5v6l2-2 2 2V5"/><path class="gl" d="M4 14h16"/>',
  venn:     '<circle class="gl" cx="9" cy="12" r="6"/><circle class="gl a" cx="15" cy="12" r="6"/>',
  safe:     '<rect class="gl" x="4" y="5" width="16" height="15" rx="2"/><circle class="gl a" cx="12" cy="12" r="4"/><path class="gl a" d="M12 12l3-2"/>',
  partition:'<rect class="gl" x="3" y="6" width="18" height="13" rx="2"/><path class="gl a" d="M12 6v13"/>',
  lanes:    '<path class="gl" d="M7 20V7"/><path class="gl" d="M4 10l3-3 3 3"/><path class="gl a" d="M17 20V7"/><path class="gl a" d="M14 10l3-3 3 3"/>',
  lock:     '<rect class="gl" x="5" y="10" width="14" height="10" rx="2"/><path class="gl a" d="M9 10V7a3 3 0 0 1 6 0v3"/><circle class="gl a" cx="12" cy="15" r="1.6"/>',
  cross:    '<path class="gl" d="M4 8h10l-3-3"/><path class="gl a" d="M20 16H10l3 3"/><path class="gl a" d="m8 18 8-12"/>',
  clock:    '<circle class="gl" cx="12" cy="12" r="8"/><path class="gl a" d="M12 7v5l4 2"/>'
};

/* rooftops, so the skyline is not a row of identical boxes */
const ROOF = {
  antenna:  (x, w, y) => `<path class="mast" d="M${x + w / 2} ${y - 5}V${y - 20}"/><circle class="mast a" cx="${x + w / 2}" cy="${y - 22}" r="2.5"/>`,
  gear:     (x, w, y) => `<rect class="chimney" x="${x + w - 15}" y="${y - 16}" width="7" height="12" rx="1"/>`,
  bin:      (x, w, y) => `<rect class="chimney" x="${x + 7}" y="${y - 14}" width="6" height="10" rx="1"/>`,
  one:      (x, w, y) => `<path class="chimney" d="M${x + w / 2 - 7} ${y - 4}l7 -13l7 13Z"/>`,
  safe:     (x, w, y) => `<path class="dome" d="M${x + 4} ${y - 4}a${w / 2 - 4} 11 0 0 1 ${w - 8} 0Z"/>`,
  stack:    (x, w, y) => `<path class="mast" d="M${x + 6} ${y - 5}V${y - 18}h14"/><path class="mast a" d="M${x + 20} ${y - 18}v6"/>`,
  padlock:  (x, w, y) => `<path class="dome" d="M${x + 4} ${y - 4}a${w / 2 - 4} 9 0 0 1 ${w - 8} 0Z"/>`,
  signpost: (x, w, y) => `<path class="mast" d="M${x + w / 2} ${y - 5}V${y - 16}"/><path class="mast a" d="M${x + w / 2} ${y - 14}h9"/>`,
  clock:    (x, w, y) => `<path class="mast" d="M${x + w / 2 - 8} ${y - 5}l8 -10 8 10Z"/>`
};

const HEIGHTS = [74, 96, 62, 88, 70];

function building(d, p, i, total, box){
  const slotW = (box.w - 34) / total;
  const w = Math.min(46, slotW - 8);
  const h = HEIGHTS[i % HEIGHTS.length];
  const x = box.x + 17 + i * slotW + (slotW - 8 - w) / 2;
  const y = box.y + box.h - 22 - h;
  const icon = p.icon || 'box';

  /* a couple of windows up top, the sign in the middle */
  const windows = [0, 1].map(c =>
    `<rect class="win" x="${(x + 9 + c * (w - 26)).toFixed(1)}" y="${y + 9}" width="9" height="9" rx="1.5"/>`).join('');

  const signSize = Math.min(24, w - 12);
  const sx = x + (w - signSize) / 2;
  const sy = y + h - 20 - signSize;
  const sign = `<g class="sign" transform="translate(${sx.toFixed(1)} ${sy.toFixed(1)}) scale(${(signSize / 24).toFixed(3)})">` +
    (GLYPH[icon] || GLYPH.box) + '</g>';

  return `<a class="bld" href="playrooms/${p.slug}/" data-room="${p.slug}" aria-label="${esc(p.title)} — ${esc(p.blurb)}">` +
    `<title>${esc(p.title)} · ${esc(p.blurb)}</title>` +
    (ROOF[icon] ? ROOF[icon](x, w, y) : '') +
    `<rect class="wall" x="${x.toFixed(1)}" y="${y}" width="${w}" height="${h}" rx="3"/>` +
    `<rect class="roof" x="${(x - 3).toFixed(1)}" y="${y - 5}" width="${w + 6}" height="6" rx="2"/>` +
    windows + sign +
    `<rect class="door" x="${(x + w / 2 - 6).toFixed(1)}" y="${y + h - 13}" width="12" height="13" rx="1"/>` +
    `<text class="bname" x="${(x + w / 2).toFixed(1)}" y="${box.y + box.h - 6}">${esc(p.short || p.title.split(/[ /]/)[0])}</text>` +
    `</a>`;
}

function districtSvg(d){
  const box = LAYOUT[d.slug];
  if(!box) return '';
  const rooms = d.playrooms.map((p, i) => building(d, p, i, Math.max(d.playrooms.length, 1), box)).join('');

  /* a little scenery so the districts do not all look the same */
  const scenery = {
    park:    `<circle class="tree" cx="${box.x + 34}" cy="${box.y + box.h - 34}" r="13"/>` +
             `<circle class="tree" cx="${box.x + box.w - 30}" cy="${box.y + box.h - 40}" r="10"/>`,
    harbour: `<path class="water" d="M${box.x + 10} ${box.y + box.h - 14} q 18 -8 36 0 t 36 0 t 36 0 t 36 0 t 36 0 t 36 0 t 36 0"/>` +
             `<path class="water" d="M${box.x + 10} ${box.y + box.h - 6} q 18 -8 36 0 t 36 0 t 36 0 t 36 0 t 36 0 t 36 0 t 36 0"/>`,
    vault:   `<circle class="vaultdial" cx="${box.x + box.w - 30}" cy="${box.y + 34}" r="12"/>` +
             `<line class="vaultdial" x1="${box.x + box.w - 30}" y1="${box.y + 34}" x2="${box.x + box.w - 22}" y2="${box.y + 28}"/>`,
    road:    `<line class="lane" x1="${box.x + 12}" y1="${box.y + box.h - 12}" x2="${box.x + box.w - 12}" y2="${box.y + box.h - 12}"/>`,
    blocks:  ''
  }[box.kind] || '';

  return `<g class="district ${d.open ? 'open' : 'planned'}" data-district="${d.slug}">` +
    `<rect class="ground" x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="10"/>` +
    scenery +
    `<text class="dname" x="${box.x + 14}" y="${box.y + 24}">${esc(d.name)}</text>` +
    `<text class="dcount" x="${box.x + box.w - 14}" y="${box.y + 24}">${d.open ? d.playrooms.length + ' playrooms' : 'planned'}</text>` +
    rooms +
    (d.open ? '' : `<text class="soonlbl" x="${box.x + box.w / 2}" y="${box.y + box.h / 2 + 6}">coming soon</text>`) +
    `</g>`;
}

const map = `
<svg class="citymap" viewBox="0 0 1000 492" role="img" aria-label="A map of Runtime City: six districts, each building is a playroom">
  <defs>
    <pattern id="mgrid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="var(--grid)" stroke-width="1"/></pattern>
  </defs>
  <rect width="1000" height="492" fill="url(#mgrid)" opacity=".5"/>

  <g class="roads">
    <line x1="0" y1="246" x2="1000" y2="246"/>
    <line x1="340" y1="0" x2="340" y2="492"/>
    <line x1="660" y1="0" x2="660" y2="492"/>
  </g>
  <g class="roadlines">
    <line x1="0" y1="246" x2="1000" y2="246"/>
    <line x1="340" y1="0" x2="340" y2="492"/>
    <line x1="660" y1="0" x2="660" y2="492"/>
  </g>

  ${CITY.districts.map(districtSvg).join('\n  ')}
</svg>`;

const listSection = d => `    <section id="${d.slug}">
      <h3>${esc(d.name)} <span class="state">${d.open ? `${d.playrooms.length} playrooms` : 'planned'}</span></h3>
      <ul>
${d.playrooms.map(p => `        <li data-room="${p.slug}"><a href="playrooms/${p.slug}/"><span class="t">${esc(p.title)}</span> <span class="d">${esc(p.blurb)}</span><span class="state" hidden></span></a></li>`).join('\n')}
${d.soon.length ? `        <li class="soon">${d.soon.map(esc).join(' · ')} — coming soon</li>` : ''}
      </ul>
    </section>`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Runtime City</title>
<meta name="description" content="Runtime City: learn software engineering concepts by seeing them, breaking them and fixing them. ${CITY.all.length} interactive playrooms, built for students heading into interviews.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=IBM+Plex+Sans:wght@400;500&family=JetBrains+Mono:wght@400&display=swap">
<link rel="stylesheet" href="assets/playroom.css">
<style>
body{padding-block:0 64px}
.wrap{max-width:1080px}

.hero{padding-block:34px 18px}
h1{font-family:var(--display);font-weight:800;font-size:clamp(42px,8.5vw,80px);line-height:.92;letter-spacing:-.04em;margin:0 0 14px;text-wrap:balance}
h1 em{font-style:normal;color:var(--accent)}
.dek{font-size:clamp(16px,2.2vw,19px);color:var(--muted);margin:0;max-width:44ch}
.herorow{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap}
.enter{display:inline-flex;align-items:center;gap:10px;background:var(--ink);color:var(--surface);text-decoration:none;
       border-radius:10px;padding:13px 20px;font-weight:500;font-size:15px;white-space:nowrap}
.enter:hover{filter:brightness(1.15)}
.enter .sub{font-family:var(--mono);font-size:11px;opacity:.7}

/* the map */
.mapwrap{margin:8px -8px 0;position:relative}
.citymap{display:block;width:100%;height:auto}
.roads line{stroke:var(--hair);stroke-width:26}
.roadlines line{stroke:var(--ground);stroke-width:2;stroke-dasharray:14 16}
.ground{fill:var(--surface);stroke:var(--hair);stroke-width:1.5}
.district.planned .ground{fill:none;stroke-dasharray:6 6}
.dname{font-family:var(--display);font-weight:700;font-size:15px;fill:var(--ink)}
.district.planned .dname{fill:var(--muted)}
.dcount{font-family:var(--mono);font-size:10px;fill:var(--accent);text-anchor:end}
.district.planned .dcount{fill:var(--muted)}
.soonlbl{font-family:var(--mono);font-size:11px;fill:var(--muted);text-anchor:middle}
.tree{fill:var(--good);opacity:.2}
.water{fill:none;stroke:var(--accent);stroke-width:1.5;opacity:.35}
.vaultdial{fill:none;stroke:var(--muted);stroke-width:1.5}
.lane{stroke:var(--muted);stroke-width:2;stroke-dasharray:12 10;opacity:.6}

.bld{cursor:pointer}
.wall{fill:var(--ground);stroke:var(--ink);stroke-width:1.5;transition:fill .15s}
.roof{fill:var(--ink)}
.door{fill:var(--hair)}
.win{fill:var(--hair);transition:fill .15s}
.bname{font-family:var(--mono);font-size:7.4px;fill:var(--muted);text-anchor:middle}

/* the sign on the front of each building */
.gl{fill:none;stroke:var(--muted);stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;transition:stroke .15s}
.gl.a{stroke:var(--accent);opacity:.85}
.mast{fill:none;stroke:var(--ink);stroke-width:1.6}
.mast.a{fill:var(--accent);stroke:var(--accent)}
.chimney{fill:var(--ink);stroke:none}
.dome{fill:var(--ink);stroke:none}

.bld:hover .wall{fill:var(--surface)}
.bld:hover .win{fill:var(--accent)}
.bld:hover .gl{stroke:var(--ink)}
.bld:hover .gl.a{stroke:var(--accent);opacity:1}
.bld:hover .bname{fill:var(--ink)}
.bld:focus-visible .wall{stroke:var(--accent);stroke-width:2.5}
.bld.done .win{fill:var(--good)}
.bld.done .gl{stroke:var(--good)}
.bld.done .gl.a{stroke:var(--good)}
.bld.done .roof{fill:var(--good)}
.bld.part .win{fill:var(--accent);opacity:.75}
.bld.part .gl{stroke:var(--accent)}

.legend{display:flex;flex-wrap:wrap;gap:8px 22px;align-items:center;font-family:var(--mono);font-size:11px;color:var(--muted);
        padding:14px 2px 0}
.legend i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:6px;vertical-align:-1px}
.legend .lit{background:var(--good)} .legend .part{background:var(--accent)} .legend .unlit{background:var(--hair)}
.legend .count{margin-left:auto;color:var(--ink)}

/* the list: phones, and anyone who prefers reading */
.listing{margin-top:34px}
.listing > summary{cursor:pointer;font-family:var(--mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;
                   color:var(--muted);padding:12px 0;border-top:1px solid var(--hair);list-style:none}
.listing > summary::marker,.listing > summary::-webkit-details-marker{display:none}
.listing > summary::before{content:"▸ ";color:var(--accent)}
.listing[open] > summary::before{content:"▾ "}
.listing h3{font-family:var(--mono);font-weight:400;font-size:11px;text-transform:uppercase;letter-spacing:.09em;
            color:var(--muted);margin:22px 0 4px;display:flex;gap:10px;align-items:baseline}
.listing h3 .state{color:var(--accent)}
.listing ul{list-style:none;margin:0;padding:0;border-top:1px solid var(--hair)}
.listing li{border-bottom:1px solid var(--hair)}
.listing li a{display:flex;align-items:baseline;gap:4px 12px;flex-wrap:wrap;padding:14px 2px;color:var(--ink);text-decoration:none;min-height:52px}
.listing li a:hover .t{border-bottom:1px solid var(--accent)}
.listing li .t{font-family:var(--display);font-weight:600;font-size:18px;letter-spacing:-.02em}
.listing li .d{color:var(--muted);font-size:14px}
.listing li .state{margin-left:auto;font-family:var(--mono);font-size:11px;text-transform:uppercase;letter-spacing:.06em}
.listing li .state.done{color:var(--good)} .listing li .state.part{color:var(--accent)}
.listing li.soon{color:var(--muted);padding:14px 2px;font-size:14px}

.loop{font-size:14px;color:var(--muted);border-top:1px solid var(--hair);margin-top:30px;padding-top:20px;max-width:62ch}
.loop b{color:var(--ink);font-weight:500}

@media (max-width:760px){
  .mapwrap,.legend{display:none}      /* the map needs room; phones get the list */
  .listing{margin-top:18px}
  .listing > summary{display:none}
  .hero{padding-block:22px 6px}
}
</style>
</head>
<body>

<div class="wrap">
  <section class="hero">
    <div class="herorow">
      <div>
        <h1>Learn by <em>breaking</em></h1>
        <p class="dek">${CITY.all.length} concepts you can walk into, take apart and put back together. Built for students heading into interviews.</p>
      </div>
      <a class="enter" id="enter" href="playrooms/${CITY.all[0].slug}/">Start exploring <span class="sub">${esc(CITY.all[0].title)}</span></a>
    </div>
  </section>

  <div class="mapwrap">${map}</div>

  <div class="legend">
    <span><i class="lit"></i>finished</span>
    <span><i class="part"></i>started</span>
    <span><i class="unlit"></i>not visited</span>
    <span>click any building to walk in</span>
    <span class="count" id="explored">0 of ${CITY.all.length} explored</span>
  </div>

  <details class="listing" id="listing">
    <summary>Browse every playroom as a list</summary>
${CITY.districts.map(listSection).join('\n')}
  </details>

  <p class="loop">Every playroom runs the same loop: <b>see it</b> working, <b>break it</b> yourself, <b>fix it</b>, read the <b>same code</b> in C#, Java or TypeScript, then take the <b>interview check</b>.</p>
</div>

<script src="assets/city.js"></script>
<script src="assets/nav.js"></script>
<script>
  RuntimeNav.mount({title:'All districts'});

  /* light up what this visitor has already done, and point at where to resume */
  (function(){
    const P = RuntimeNav.Progress, L = RuntimeNav.links(null);
    let done = 0, resume = null;

    CITY.all.forEach(room => {
      const p = P.of(room.slug);
      if(!p) return;
      if(p.done) done++;
      else if(!resume) resume = {room, p};

      const bld = document.querySelector('.bld[data-room="' + room.slug + '"]');
      if(bld) bld.classList.add(p.done ? 'done' : 'part');

      const state = document.querySelector('li[data-room="' + room.slug + '"] .state');
      if(state){
        state.hidden = false;
        state.className = 'state ' + (p.done ? 'done' : 'part');
        state.textContent = p.done ? 'finished' : 'step ' + p.step + ' of ' + (p.total || 6);
      }
    });

    const counter = document.getElementById('explored');
    if(counter) counter.textContent = done + ' of ' + CITY.all.length + ' explored';

    if(resume){
      const a = document.getElementById('enter');
      a.href = L.room(resume.room.slug) + '#step-' + resume.p.step;
      a.innerHTML = 'Pick up where you left off <span class="sub">' +
        resume.room.title + ' · step ' + resume.p.step + '</span>';
    }

    /* on a phone the map is hidden, so open the list by default */
    if(window.matchMedia('(max-width: 760px)').matches)
      document.getElementById('listing').open = true;
  })();
</script>
</body>
</html>
`;

module.exports = html;
