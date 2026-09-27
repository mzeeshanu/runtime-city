/* HOME PAGE — PARK VERSION (default).

   Run it with: node tools/build-index.js        (or: node tools/build-index.js park)
   The city version is tools/build-home.city.js — node tools/build-index.js city

   The city is drawn as one park. Districts become lands, playrooms become
   rides you walk up to, and a path winds through all of them from the gate.
*/
const CITY = require('../site/assets/city.js');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* Each district is a zone on the map; each playroom is a marker inside it. */
const ZONES = {
  'pattern-park':        {x:18,  y:34,  w:316, h:274, dot:'var(--accent)',        sub:'design patterns'},
  'solid-quarter':       {x:344, y:34,  w:316, h:274, dot:'var(--good)',          sub:'the five principles'},
  'memory-harbour':      {x:670, y:34,  w:316, h:274, dot:'rgb(47,127,208)',      sub:'where objects live'},
  'concurrency-crossing':{x:18,  y:330, w:316, h:274, dot:'rgb(122,107,181)',     sub:'two things at once'},
  'database-vault':      {x:344, y:330, w:316, h:274, dot:'var(--accent)',        sub:'storing it safely'},
  'network-highway':     {x:670, y:330, w:316, h:274, dot:'rgb(47,127,208)',      sub:'getting there'},
  /* one wide strip: an avenue reads better as a single row of five */
  'api-avenue':          {x:18,  y:630, w:968, h:230, dot:'var(--good)',          sub:'talking over the wire', per:5, gap:170, mid:138}
};

/* the same signs as the city map, drawn in a 24×24 box */
const GLYPH = require('./glyphs.js');


function ride(p, i, total, Z){
  /* rows of at most three, each row centred in the zone */
  const perRow = Z.per || Math.min(total, 3);
  const rows = Math.ceil(total / perRow);
  const row = Math.floor(i / perRow), col = i % perRow;
  const inThisRow = Math.min(perRow, total - row * perRow);

  const step = Z.gap || 104;
  const cx = Z.x + Z.w / 2 - ((inThisRow - 1) * step) / 2 + col * step;
  const cy = Z.y + (rows === 1 ? (Z.mid || 166) : 124 + row * 88);
  const r = 36;

  return `<a class="ride" href="playrooms/${p.slug}/" data-room="${p.slug}" aria-label="${esc(p.title)} — ${esc(p.blurb)}">` +
    `<title>${esc(p.title)} · ${esc(p.blurb)}</title>` +
    `<circle class="pad" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r}"/>` +
    `<g class="sign" transform="translate(${(cx - 23).toFixed(1)} ${(cy - 23).toFixed(1)}) scale(1.9)">${GLYPH[p.icon] || GLYPH.box}</g>` +
    `<text class="rname" x="${cx.toFixed(1)}" y="${(cy + r + 17).toFixed(1)}">${esc(p.short || p.title)}</text>` +
    `</a>`;
}

function land(d){
  const Z = ZONES[d.slug];
  if(!Z) return '';
  const rides = d.playrooms.map((p, i) => ride(p, i, Math.max(d.playrooms.length, 1), Z)).join('');
  return `<g class="zone ${d.open ? 'open' : 'planned'}" id="zone-${d.slug}" data-district="${d.slug}">` +
    `<rect class="plot" x="${Z.x}" y="${Z.y}" width="${Z.w}" height="${Z.h}" rx="14"/>` +
    `<rect class="dot" x="${Z.x + 20}" y="${Z.y + 22}" width="9" height="9" rx="2" fill="${Z.dot}"/>` +
    `<text class="lname" x="${Z.x + 36}" y="${Z.y + 31}">${esc(d.name)}</text>` +
    `<text class="lsub" x="${Z.x + 36}" y="${Z.y + 46}">${esc(Z.sub)}</text>` +
    `<text class="lcount" x="${Z.x + Z.w - 20}" y="${Z.y + 31}">${d.open ? d.playrooms.length : '—'}</text>` +
    `<line class="rule" x1="${Z.x + 20}" y1="${Z.y + 60}" x2="${Z.x + Z.w - 20}" y2="${Z.y + 60}"/>` +
    rides +
    `</g>`;
}

const map = `
<svg class="parkmap" viewBox="0 0 1004 878" role="img" aria-label="Runtime City: seven districts, each marker is a playroom">
  ${CITY.districts.map(land).join(String.fromCharCode(10))}
</svg>`;

const listSection = d => `    <section id="list-${d.slug}">
      <h3>${esc(d.name)} <span class="state">${d.open ? `${d.playrooms.length} playrooms` : 'planned'}</span></h3>
      <ul>
${d.playrooms.map(p => `        <li data-room="${p.slug}"><a href="playrooms/${p.slug}/"><span class="ico" aria-hidden="true"><svg viewBox="0 0 24 24">${GLYPH[p.icon] || GLYPH.box}</svg></span><span class="body"><span class="t">${esc(p.title)}</span><span class="d">${esc(p.blurb)}</span></span><span class="state" hidden></span></a></li>`).join('\n')}
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

/* the map */
.mapwrap{margin:16px -4px 0}
.parkmap{display:block;width:100%;height:auto}

.plot{fill:var(--surface);stroke:var(--hair);stroke-width:1.5}
.zone.planned .plot{fill:none;stroke-dasharray:6 6}
.lname{font-family:var(--display);font-weight:700;font-size:15.5px;fill:var(--ink);letter-spacing:-.01em}
.lsub{font-family:var(--mono);font-size:9.5px;fill:var(--muted)}
.lcount{font-family:var(--mono);font-size:12px;fill:var(--muted);text-anchor:end}
.rule{stroke:var(--hair);stroke-width:1}

.ride{cursor:pointer}
.pad{fill:var(--ground);stroke:var(--hair);stroke-width:1.6;transition:stroke .15s,fill .15s}
.gl{fill:none;stroke:var(--ink);stroke-width:1.3;stroke-linecap:round;stroke-linejoin:round;transition:stroke .15s}
.gl.a{stroke:var(--accent)}
.rname{font-family:var(--mono);font-size:11px;fill:var(--muted);text-anchor:middle;transition:fill .15s}
.ride:hover .pad{stroke:var(--ink);fill:var(--surface)}
.ride:hover .rname{fill:var(--ink)}
.ride:focus-visible .pad{stroke:var(--accent);stroke-width:3}
.ride.done .pad{stroke:var(--good);stroke-width:2}
.ride.done .gl,.ride.done .gl.a{stroke:var(--good)}
.ride.done .rname{fill:var(--good)}
.ride.part .pad{stroke:var(--accent);stroke-width:2;stroke-dasharray:6 5}
.ride.part .rname{fill:var(--accent)}

.zone.focus .plot,.district.focus .ground{stroke:var(--accent);stroke-width:2.5}
.zone.focus,.district.focus{animation:zonepulse 2.4s ease-out}
@keyframes zonepulse{0%,22%{opacity:.5}40%,100%{opacity:1}}
.legend{display:flex;flex-wrap:wrap;gap:8px 22px;align-items:center;font-family:var(--mono);font-size:11px;color:var(--muted);padding:14px 2px 0}
.legend i{display:inline-block;width:11px;height:11px;border-radius:50%;margin-right:7px;vertical-align:-1px;border:2px solid var(--hair)}
.legend .lit{border-color:var(--good)}
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
.listing li a{display:flex;align-items:center;gap:14px;padding:14px 2px;color:var(--ink);text-decoration:none;min-height:64px}
.listing li a:hover .t{border-bottom:1px solid var(--accent)}
.listing li .body{display:flex;flex-direction:column;gap:3px;min-width:0}
.listing li .ico{flex:0 0 40px;width:40px;height:40px;border:1.5px solid var(--hair);border-radius:50%;display:grid;place-items:center;background:var(--ground)}
.listing li .ico svg{width:23px;height:23px;overflow:visible}
.listing li .ico .gl{stroke-width:1.6}
.listing li a:hover .ico{border-color:var(--ink)}
.listing li .t{font-family:var(--display);font-weight:600;font-size:18px;letter-spacing:-.02em}
.listing li .d{color:var(--muted);font-size:13.5px;line-height:1.4}
.listing li .state{margin-left:auto;font-family:var(--mono);font-size:11px;text-transform:uppercase;letter-spacing:.06em}
.listing li .state.done{color:var(--good)} .listing li .state.part{color:var(--accent)}
.listing li.soon{color:var(--muted);padding:14px 2px;font-size:14px}

.loop{font-size:14px;color:var(--muted);border-top:1px solid var(--hair);margin-top:30px;padding-top:20px;max-width:62ch}
.loop b{color:var(--ink);font-weight:500}


/* Map or list — the visitor picks one, and we remember it */
.viewpick{display:flex;gap:2px;margin:20px 0 0;padding:3px;border:1px solid var(--hair);border-radius:999px;width:max-content}
.viewpick button{appearance:none;background:none;border:0;cursor:pointer;font-family:var(--mono);font-size:11px;
  letter-spacing:.07em;text-transform:uppercase;color:var(--muted);padding:9px 17px;border-radius:999px;
  display:flex;align-items:center;gap:8px;transition:color .15s,background .15s}
.viewpick button svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.viewpick button[aria-pressed="true"]{background:var(--surface);color:var(--ink);box-shadow:inset 0 0 0 1px var(--hair)}
.viewpick button:hover{color:var(--ink)}
.viewpick button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
body[data-view="list"] .mapwrap,body[data-view="list"] .legend{display:none}
body[data-view="map"] .listing{display:none}

@media (max-width:820px){
  .mapwrap,.legend,.viewpick{display:none}   /* the map needs room; phones always get the list */
  body[data-view="map"] .listing{display:block}
  .listing{margin-top:18px}
  .hero{padding-block:22px 6px}
}
</style>
</head>
<body>

<script>/* before anything paints, so the chosen view never flashes the other one */
(function(){var v="map";try{v=localStorage.getItem("rc-view")==="list"?"list":"map"}catch(e){}
document.body.setAttribute("data-view",v);})();</script>

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


  <div class="viewpick" role="group" aria-label="Choose how to browse">
    <button type="button" data-pick="map" aria-pressed="true"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/></svg>Map</button>
    <button type="button" data-pick="list" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>List</button>
  </div>

  <div class="mapwrap">${map}</div>

  <div class="legend">
    <span><i class="lit"></i>finished</span>
    <span><i class="part"></i>in progress</span>
    <span><i class="unlit"></i>not started</span>
    <span>select any marker to open it</span>
    <span class="count" id="explored">0 of ${CITY.all.length} explored</span>
  </div>
  <div class="listing" id="listing">
${CITY.districts.map(listSection).join('\n')}
  </div>

  <p class="loop">Every playroom runs the same loop: <b>see it</b> working, <b>break it</b> yourself, <b>fix it</b>, read the <b>same code</b> in C#, Java or TypeScript, then take the <b>interview check</b>.</p>
</div>

<script src="assets/city.js"></script>
<script src="assets/nav.js"></script>
<script>

  /* The Map/List choice, remembered in localStorage under "rc-view". */
  (function(){
    const KEY = "rc-view", pick = document.querySelector(".viewpick");
    if(!pick) return;
    function apply(view, remember){
      document.body.setAttribute("data-view", view);
      pick.querySelectorAll("button").forEach(b =>
        b.setAttribute("aria-pressed", String(b.dataset.pick === view)));
      if(remember){ try{ localStorage.setItem(KEY, view); }catch(e){} }
    }
    apply(document.body.getAttribute("data-view") || "map", false);
    pick.addEventListener("click", e => {
      const b = e.target.closest("button[data-pick]");
      if(b) apply(b.dataset.pick, true);
    });
  })();

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
    if(counter) counter.textContent = done + ' of ' + CITY.all.length + ' explored';

    if(resume){
      const a = document.getElementById('enter');
      a.href = L.room(resume.room.slug) + '#step-' + resume.p.step;
      a.innerHTML = 'Pick up where you left off <span class="sub">' + resume.room.title + ' · step ' + resume.p.step + '</span>';
    }


  /* Coming back from a playroom: #pattern-park lands you on that zone of the
     map, not in the list. */
  (function(){
    /* Some embedded browsers ignore smooth scrolling and simply stay put, so
       if nothing has moved shortly after, jump there instead. */
    function goTo(el, block){
      const from = window.scrollY;
      el.scrollIntoView({block: block, behavior: "smooth"});
      setTimeout(() => {
        if(Math.abs(window.scrollY - from) < 4) el.scrollIntoView({block: block});
      }, 350);
    }
    function focusDistrict(slug){
      if(!slug) return;
      const zone = document.getElementById("zone-" + slug);
      const phone = window.matchMedia("(max-width: 820px)").matches;
      const onMap = !phone && document.body.getAttribute("data-view") !== "list";
      if(zone && onMap){
        goTo(zone, "center");
        document.querySelectorAll(".zone.focus,.district.focus").forEach(z => z.classList.remove("focus"));
        zone.classList.add("focus");
        setTimeout(() => zone.classList.remove("focus"), 2600);
        return;
      }
      const section = document.getElementById("list-" + slug);
      if(section) goTo(section, "start");
    }
    const fromHash = () => focusDistrict((location.hash || "").replace("#", ""));
    window.addEventListener("hashchange", fromHash);
    if(location.hash) setTimeout(fromHash, 60);
  })();
  })();
</script>
</body>
</html>
`;
