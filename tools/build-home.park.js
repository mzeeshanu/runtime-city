/* HOME PAGE — PARK VERSION (default).

   Run it with: node tools/build-index.js        (or: node tools/build-index.js park)
   The city version is tools/build-home.city.js — node tools/build-index.js city

   The city is drawn as one park. Districts become lands, playrooms become
   rides you walk up to, and a path winds through all of them from the gate.
*/
const CITY = require('../site/assets/city.js');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* each land: where it sits, its tint, and a bit of scenery */
const LANDS = {
  'pattern-park':        {x:36,  y:66,  w:300, h:150, tint:'green',  scene:'trees',    sub:'design patterns'},
  'solid-quarter':       {x:372, y:44,  w:300, h:150, tint:'amber',  scene:'flowers',  sub:'the five principles'},
  'memory-harbour':      {x:706, y:66,  w:262, h:150, tint:'blue',   scene:'lake',     sub:'where objects live'},
  'concurrency-crossing':{x:36,  y:300, w:300, h:150, tint:'violet', scene:'carousel', sub:'two things at once'},
  'database-vault':      {x:372, y:322, w:300, h:150, tint:'amber',  scene:'wheel',    sub:'storing it safely'},
  'network-highway':     {x:706, y:300, w:262, h:150, tint:'teal',   scene:'balloons', sub:'getting there'}
};

/* the same signs as the city map, drawn in a 24×24 box */
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

const SCENE = {
  trees:    (L) => `<circle class="tree" cx="${L.x + 22}" cy="${L.y + L.h - 26}" r="15"/><circle class="tree" cx="${L.x + 44}" cy="${L.y + L.h - 18}" r="10"/><circle class="tree" cx="${L.x + L.w - 24}" cy="${L.y + 26}" r="12"/>`,
  flowers:  (L) => [0,1,2,3].map(i => `<circle class="flower" cx="${L.x + 20 + i * 13}" cy="${L.y + L.h - 16}" r="3.4"/>`).join('') +
                   `<circle class="tree" cx="${L.x + L.w - 26}" cy="${L.y + L.h - 24}" r="13"/>`,
  lake:     (L) => `<ellipse class="lake" cx="${L.x + L.w / 2}" cy="${L.y + L.h - 18}" rx="${L.w / 2 - 26}" ry="13"/>` +
                   `<path class="ripple" d="M${L.x + 40} ${L.y + L.h - 18}q10 -5 20 0t20 0"/>`,
  carousel: (L) => `<circle class="ride-ring" cx="${L.x + L.w - 32}" cy="${L.y + 34}" r="14"/><path class="ride-ring" d="M${L.x + L.w - 32} ${L.y + 20}v28M${L.x + L.w - 46} ${L.y + 34}h28"/>`,
  wheel:    (L) => `<circle class="ride-ring" cx="${L.x + L.w - 30}" cy="${L.y + 36}" r="17"/><circle class="ride-ring" cx="${L.x + L.w - 30}" cy="${L.y + 36}" r="5"/>` +
                   [0,45,90,135].map(a => {
                     const r = 17, rad = a * Math.PI / 180, cx = L.x + L.w - 30, cy = L.y + 36;
                     return `<line class="ride-ring" x1="${(cx - r * Math.cos(rad)).toFixed(1)}" y1="${(cy - r * Math.sin(rad)).toFixed(1)}" x2="${(cx + r * Math.cos(rad)).toFixed(1)}" y2="${(cy + r * Math.sin(rad)).toFixed(1)}"/>`;
                   }).join(''),
  balloons: (L) => [0,1,2].map(i => `<circle class="balloon" cx="${L.x + 26 + i * 18}" cy="${L.y + 26 + (i % 2) * 8}" r="7"/>` +
                   `<path class="string" d="M${L.x + 26 + i * 18} ${L.y + 33 + (i % 2) * 8}v10"/>`).join('')
};

function ride(p, i, total, L){
  /* rows of at most three, each row centred in the lawn */
  const perRow = total > 4 ? Math.ceil(total / 2) : total;
  const rows = Math.ceil(total / perRow);
  const row = Math.floor(i / perRow), col = i % perRow;
  const inThisRow = Math.min(perRow, total - row * perRow);

  const step = 74;
  const rowWidth = (inThisRow - 1) * step;
  const cx = L.x + L.w / 2 - rowWidth / 2 + col * step;
  const cy = L.y + (rows === 1 ? L.h / 2 + 10 : 62 + row * 58);

  return `<a class="ride" href="playrooms/${p.slug}/" data-room="${p.slug}" aria-label="${esc(p.title)} — ${esc(p.blurb)}">` +
    `<title>${esc(p.title)} · ${esc(p.blurb)}</title>` +
    `<circle class="pad" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="21"/>` +
    `<g class="sign" transform="translate(${(cx - 11).toFixed(1)} ${(cy - 11).toFixed(1)}) scale(0.92)">${GLYPH[p.icon] || GLYPH.box}</g>` +
    `<text class="rname" x="${cx.toFixed(1)}" y="${(cy + 34).toFixed(1)}">${esc(p.short || p.title)}</text>` +
    `</a>`;
}

function land(d){
  const L = LANDS[d.slug];
  if(!L) return '';
  const rides = d.playrooms.map((p, i) => ride(p, i, Math.max(d.playrooms.length, 1), L)).join('');
  return `<g class="land tint-${L.tint} ${d.open ? 'open' : 'planned'}" data-district="${d.slug}">` +
    `<rect class="lawn" x="${L.x}" y="${L.y}" width="${L.w}" height="${L.h}" rx="34"/>` +
    (SCENE[L.scene] ? SCENE[L.scene](L) : '') +
    `<text class="lname" x="${L.x + 20}" y="${L.y + 26}">${esc(d.name)}</text>` +
    `<text class="lsub" x="${L.x + 20}" y="${L.y + 40}">${esc(L.sub)}</text>` +
    `<text class="lcount" x="${L.x + L.w - 18}" y="${L.y + 26}">${d.open ? d.playrooms.length + ' rides' : 'building'}</text>` +
    rides +
    `</g>`;
}

const map = `
<svg class="parkmap" viewBox="0 0 1004 560" role="img" aria-label="A map of Runtime City park: six lands, each ride is a playroom">
  <rect class="park" x="8" y="8" width="988" height="544" rx="46"/>

  <path class="trail" d="M502 548 C 470 500, 300 500, 190 462 C 96 430, 60 360, 120 300
                          C 190 232, 120 150, 200 120 C 300 84, 330 150, 420 128
                          C 520 104, 560 40, 700 70 C 860 104, 950 140, 940 230
                          C 932 300, 860 300, 840 350 C 820 402, 700 420, 620 452
                          C 560 476, 540 520, 502 548"/>

  ${CITY.districts.map(land).join('\n  ')}

  <g class="gate">
    <path class="gatearch" d="M462 548v-20a40 40 0 0 1 80 0v20"/>
    <text class="gatelbl" x="502" y="540">ENTRANCE</text>
  </g>
</svg>`;

const listSection = d => `    <section id="${d.slug}">
      <h3>${esc(d.name)} <span class="state">${d.open ? `${d.playrooms.length} playrooms` : 'planned'}</span></h3>
      <ul>
${d.playrooms.map(p => `        <li data-room="${p.slug}"><a href="playrooms/${p.slug}/"><span class="t">${esc(p.title)}</span> <span class="d">${esc(p.blurb)}</span><span class="state" hidden></span></a></li>`).join('\n')}
${d.soon.length ? `        <li class="soon">${d.soon.map(esc).join(' · ')} — coming soon</li>` : ''}
      </ul>
    </section>`;

module.exports = `<!doctype html>
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

.hero{padding-block:34px 14px}
h1{font-family:var(--display);font-weight:800;font-size:clamp(42px,8.5vw,80px);line-height:.92;letter-spacing:-.04em;margin:0 0 14px;text-wrap:balance}
h1 em{font-style:normal;color:var(--accent)}
.dek{font-size:clamp(16px,2.2vw,19px);color:var(--muted);margin:0;max-width:44ch}
.herorow{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap}
.enter{display:inline-flex;align-items:center;gap:10px;background:var(--ink);color:var(--surface);text-decoration:none;
       border-radius:10px;padding:13px 20px;font-weight:500;font-size:15px;white-space:nowrap}
.enter:hover{filter:brightness(1.15)}
.enter .sub{font-family:var(--mono);font-size:11px;opacity:.7}

/* the park */
.mapwrap{margin:10px -6px 0}
.parkmap{display:block;width:100%;height:auto}
.park{fill:var(--surface);stroke:var(--hair);stroke-width:1.5}
.trail{fill:none;stroke:var(--hair);stroke-width:12;stroke-linecap:round;opacity:.65}

.lawn{fill:var(--lawn,rgba(127,127,127,.08));stroke:var(--lawnline,var(--hair));stroke-width:1.5}
.tint-green {--lawn:rgba(31,132,105,.13);  --lawnline:rgba(31,132,105,.45)}
.tint-amber {--lawn:rgba(201,112,29,.13);  --lawnline:rgba(201,112,29,.45)}
.tint-blue  {--lawn:rgba(47,127,208,.13);  --lawnline:rgba(47,127,208,.45)}
.tint-violet{--lawn:rgba(122,107,181,.14); --lawnline:rgba(122,107,181,.45)}
.tint-teal  {--lawn:rgba(31,132,105,.10);  --lawnline:rgba(47,127,208,.35)}
.land.planned .lawn{fill:none;stroke-dasharray:7 7}

.lname{font-family:var(--display);font-weight:700;font-size:16px;fill:var(--ink)}
.lsub{font-family:var(--mono);font-size:9.5px;fill:var(--muted)}
.lcount{font-family:var(--mono);font-size:10px;fill:var(--accent);text-anchor:end}

.tree{fill:var(--good);opacity:.22}
.flower{fill:var(--accent);opacity:.5}
.lake{fill:rgba(47,127,208,.22);stroke:rgba(47,127,208,.45);stroke-width:1.5}
.ripple{fill:none;stroke:rgba(47,127,208,.5);stroke-width:1.5}
.ride-ring{fill:none;stroke:var(--muted);stroke-width:1.5;opacity:.5}
.balloon{fill:var(--accent);opacity:.35}
.string{stroke:var(--muted);stroke-width:1;opacity:.5}

.ride{cursor:pointer}
.pad{fill:var(--ground);stroke:var(--ink);stroke-width:1.8;transition:fill .15s,r .15s}
.gl{fill:none;stroke:var(--ink);stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;transition:stroke .15s}
.gl.a{stroke:var(--accent)}
.rname{font-family:var(--mono);font-size:9px;fill:var(--muted);text-anchor:middle}
.ride:hover .pad{fill:var(--surface);r:23}
.ride:hover .rname{fill:var(--ink)}
.ride:focus-visible .pad{stroke:var(--accent);stroke-width:3}
.ride.done .pad{fill:rgba(31,132,105,.2);stroke:var(--good)}
.ride.done .gl,.ride.done .gl.a{stroke:var(--good)}
.ride.done .rname{fill:var(--good)}
.ride.part .pad{stroke:var(--accent);stroke-dasharray:4 3}
.ride.part .rname{fill:var(--accent)}

.gatearch{fill:none;stroke:var(--ink);stroke-width:2.5}
.gatelbl{font-family:var(--mono);font-size:9px;fill:var(--muted);text-anchor:middle;letter-spacing:.14em}

.legend{display:flex;flex-wrap:wrap;gap:8px 22px;align-items:center;font-family:var(--mono);font-size:11px;color:var(--muted);padding:14px 2px 0}
.legend i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px;vertical-align:-1px;border:1.5px solid var(--hair)}
.legend .lit{background:rgba(31,132,105,.35);border-color:var(--good)}
.legend .part{border-color:var(--accent);border-style:dashed}
.legend .count{margin-left:auto;color:var(--ink)}

.listing{margin-top:32px}
.listing > summary{cursor:pointer;font-family:var(--mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);padding:12px 0;border-top:1px solid var(--hair);list-style:none}
.listing > summary::marker,.listing > summary::-webkit-details-marker{display:none}
.listing > summary::before{content:"▸ ";color:var(--accent)}
.listing[open] > summary::before{content:"▾ "}
.listing h3{font-family:var(--mono);font-weight:400;font-size:11px;text-transform:uppercase;letter-spacing:.09em;color:var(--muted);margin:22px 0 4px;display:flex;gap:10px;align-items:baseline}
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

@media (max-width:820px){
  .mapwrap,.legend{display:none}
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
        <p class="dek">${CITY.all.length} rides you can walk into, take apart and put back together. Built for students heading into interviews.</p>
      </div>
      <a class="enter" id="enter" href="playrooms/${CITY.all[0].slug}/">Enter the park <span class="sub">${esc(CITY.all[0].title)}</span></a>
    </div>
  </section>

  <div class="mapwrap">${map}</div>

  <div class="legend">
    <span><i class="lit"></i>ridden</span>
    <span><i class="part"></i>started</span>
    <span><i class="unlit"></i>not yet</span>
    <span>click any ride to queue up</span>
    <span class="count" id="explored">0 of ${CITY.all.length} ridden</span>
  </div>

  <details class="listing" id="listing">
    <summary>Browse every playroom as a list</summary>
${CITY.districts.map(listSection).join('\n')}
  </details>

  <p class="loop">Every ride runs the same loop: <b>see it</b> working, <b>break it</b> yourself, <b>fix it</b>, read the <b>same code</b> in C#, Java or TypeScript, then take the <b>interview check</b>.</p>
</div>

<script src="assets/city.js"></script>
<script src="assets/nav.js"></script>
<script>
  RuntimeNav.mount({title:'All districts'});

  (function(){
    const P = RuntimeNav.Progress, L = RuntimeNav.links(null);
    let done = 0, resume = null;

    CITY.all.forEach(room => {
      const p = P.of(room.slug);
      if(!p) return;
      if(p.done) done++;
      else if(!resume) resume = {room, p};

      const ride = document.querySelector('.ride[data-room="' + room.slug + '"]');
      if(ride) ride.classList.add(p.done ? 'done' : 'part');

      const state = document.querySelector('li[data-room="' + room.slug + '"] .state');
      if(state){
        state.hidden = false;
        state.className = 'state ' + (p.done ? 'done' : 'part');
        state.textContent = p.done ? 'finished' : 'step ' + p.step + ' of ' + (p.total || 6);
      }
    });

    const counter = document.getElementById('explored');
    if(counter) counter.textContent = done + ' of ' + CITY.all.length + ' ridden';

    if(resume){
      const a = document.getElementById('enter');
      a.href = L.room(resume.room.slug) + '#step-' + resume.p.step;
      a.innerHTML = 'Pick up where you left off <span class="sub">' + resume.room.title + ' · step ' + resume.p.step + '</span>';
    }

    if(window.matchMedia('(max-width: 820px)').matches)
      document.getElementById('listing').open = true;
  })();
</script>
</body>
</html>
`;
