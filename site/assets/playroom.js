/* Runtime City — the playroom engine.
   A playroom page supplies its content and stage logic; this file builds the page
   chrome (steps, story, controls, status, code column, quiz, navigation) and runs
   the see it / break it / fix it / code it / interview loop.

   Playroom({
     district, title, dek,          // header and hero
     steps: ['Welded in', ...],     // one label per step
     stage: '<svg>...</svg>',       // the artwork, kept as-is between renders
     park:  { current, items },     // the district line at the foot
     state: { ... },                // playroom-specific state
     story(S, api)   -> html        // the left-hand text for the current step
     controls(S)     -> html        // buttons under the stage
     statusLine(S)   -> html        // one-line readout
     files(S)        -> [{n,lines}] // code panel; lines are [text, flag?]
     note(S)         -> html        // the line under the code
     onStage(S)                     // update the svg for the current state
     onStep(S, n)                   // entering a step
     onClick(S, btn, api) -> false  // return false when the click was not yours
     reset(S)                       // restore state for "start again"
     quiz: [{q, o, a, w}], soundbite
   })
*/
(function(){
  'use strict';

  const LANGS = [['cs','C#'], ['java','Java'], ['ts','TypeScript']];
  const KW = new Set(('public private protected internal readonly final static abstract override virtual ' +
    'class interface extends implements new var let const return void throw if else switch case this ' +
    'export import using function test expect true false null').split(' '));

  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  /* one-pass tokeniser: comments, strings, attributes, keywords, type names */
  function highlight(src){
    const re = /(\/\/.*$)|("(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)|(@\w+|\[\w+\])|([A-Za-z_]\w*)/g;
    let out = '', i = 0, m;
    while((m = re.exec(src))){
      out += esc(src.slice(i, m.index));
      const t = m[0];
      if(m[1]) out += '<span class="t-com">' + esc(t) + '</span>';
      else if(m[2]) out += '<span class="t-str">' + esc(t) + '</span>';
      else if(m[3]) out += '<span class="t-attr">' + esc(t) + '</span>';
      else if(KW.has(t)) out += '<span class="t-kw">' + t + '</span>';
      else if(/^[A-Z]/.test(t)) out += '<span class="t-type">' + t + '</span>';
      else out += t;
      i = re.lastIndex;
    }
    return out + esc(src.slice(i));
  }

  const MARK = '<svg viewBox="0 0 24 24" aria-hidden="true">' +
    '<rect x="2" y="10" width="5" height="12" fill="currentColor"/>' +
    '<rect x="9" y="4" width="6" height="18" fill="currentColor"/>' +
    '<rect x="17" y="13" width="5" height="9" fill="var(--accent)"/></svg>';

  /* where this page sits in the city: by folder name, or by title when the page
     is a single-file copy served from somewhere else */
  function place(cfg){
    const city = typeof window !== 'undefined' && window.CITY;
    if(!city) return null;
    const parts = location.pathname.replace(/\/+$/, '').split('/');
    const byPath = city.locate(parts[parts.length - 1]);
    if(byPath) return byPath;
    const match = city.all.find(p => p.title === cfg.title);
    return match ? Object.assign(city.locate(match.slug), {detached: true}) : null;
  }

  function chrome(cfg, here){
    const NAV = window.RuntimeNav;
    const L = NAV.links(here);
    const anchor = NAV.anchor;
    const districtName = here ? here.district.name : cfg.district;
    const districtSlug = here ? here.district.slug : '';

    /* the district line at the foot: every playroom in this district */
    const line = here
      ? here.district.playrooms.map(p => p.slug === here.room.slug
          ? '<b class="now">' + esc(p.title) + '</b>'
          : anchor(L.room(p.slug), '', esc(p.title))
        ).concat(here.district.soon.map(s => '<span class="soon">' + esc(s) + '</span>')).join(' · ')
      : '';

    return '' +
    /* the top bar is the same on every page: home, where you are, and the whole city */
    NAV.bar({here, L, districtName, districtSlug, title: cfg.title,
             count: here ? (here.index + 1) + '/' + here.total : ''}) +
    '<div class="wrap">' +
      '<section class="intro"><h1>' + esc(cfg.title) + '</h1><p>' + esc(cfg.dek) + '</p></section>' +
      '<div class="steprow">' +
        '<ol class="rail" id="rail" aria-label="Playroom steps"></ol>' +
        '<div class="stepjump">' +
          '<button id="prevTop" aria-label="Previous step" title="Previous step (left arrow key)">←</button>' +
          '<button id="nextTop" aria-label="Next step" title="Next step (right arrow key)">→</button>' +
        '</div>' +
      '</div>' +
      /* phone only: the stage and the code share the screen, one tap apart */
      '<div class="viewtabs" id="viewtabs" role="tablist" aria-label="View">' +
        '<button data-view="play" role="tab">Playroom</button>' +
        '<button data-view="code" role="tab">Code<span class="dot" hidden></span></button>' +
      '</div>' +
      '<div class="lesson">' +
        '<div class="col-play">' +
          '<section class="story" id="story"></section>' +
          '<div class="stage">' + cfg.stage +
            '<div class="controls" id="controls"></div>' +
            '<div class="status" id="status" aria-live="polite"></div>' +
          '</div>' +
        '</div>' +
        '<aside class="col-code"><div class="code">' +
          '<div class="langs" id="langs">' +
            LANGS.map(l => '<button data-l="' + l[0] + '">' + l[1] + '</button>').join('') +
          '</div>' +
          '<div id="files"></div><div class="codenote" id="codenote"></div>' +
        '</div></aside>' +
      '</div>' +
      '<div class="nav"><button id="prev"></button><span id="nextslot"></span></div>' +
      '<section class="city">' +
        '<span class="k">' + esc(districtName) + '</span>' + line +
        '<p class="cityfoot">' +
          (L.home ? '<a href="' + L.home + '">All districts</a> · ' : '') +
          'Every concept in Runtime City is a playroom: see it, break it, fix it, then say it in an interview.' +
        '</p>' +
      '</section>' +
    '</div>';
  }

  function Playroom(cfg){
    const LAST = cfg.steps.length;
    const S = Object.assign({step:1, lang:'cs', out:'', fb:null}, cfg.state || {});
    S.seen = new Set([1]);
    S.quiz = {};
    try{ const l = localStorage.getItem('rc-lang'); if(l && LANGS.some(x => x[0] === l)) S.lang = l; }catch(e){}

    const here = place(cfg);
    (document.getElementById('playroom') || document.body).innerHTML = chrome(cfg, here);
    const $ = id => document.getElementById(id);
    const NS = 'http://www.w3.org/2000/svg';

    const api = {
      S, esc, el: $,
      out(msg){ S.out = msg; },
      tell(kind, html){ S.fb = {k:kind, t:html}; },
      fb(){ return S.fb ? '<p class="tell ' + S.fb.k + '">' + S.fb.t + '</p>' : ''; },
      quizHTML,
      render, go,
      /* restart a CSS transition on an svg group that was moved by a class */
      replay(id, cls){ const e = $(id); if(!e) return; e.classList.add(cls); void e.getBBox();
                       requestAnimationFrame(() => requestAnimationFrame(() => { if(cfg.onStage) cfg.onStage(S); })); },
      /* short-lived decoration inside an svg group */
      fx(parentId, tag, attrs, cls, ttl){
        const p = $(parentId); if(!p) return null;
        const e = document.createElementNS(NS, tag);
        for(const a in attrs) e.setAttribute(a, attrs[a]);
        if(cls) e.setAttribute('class', cls);
        p.appendChild(e);
        setTimeout(() => e.remove(), ttl || 1500);
        return e;
      }
    };

    function rail(){
      const r = $('rail');
      r.innerHTML = cfg.steps.map((t, i) => {
        const n = i + 1;
        const state = n === S.step ? 'now' : (n < S.step || S.seen.has(n) ? 'done' : 'todo');
        return '<li class="' + state + '">' +
          '<button data-s="' + n + '"' + (n === S.step ? ' aria-current="step"' : '') +
          ' title="Step ' + n + ': ' + esc(t) + '">' +
          '<span class="n">' + (state === 'done' ? '✓' : n) + '</span>' +
          '<span class="t">' + esc(t) + '</span></button></li>';
      }).join('');
      if(r.scrollWidth > r.clientWidth){
        const cur = r.querySelector('[aria-current]');
        if(cur) cur.scrollIntoView({block:'nearest', inline:'center'});
      }
      $('prevTop').disabled = S.step === 1;
      $('nextTop').disabled = S.step === LAST;

      const p = $('prev');
      if(S.step > 1){
        p.hidden = false;
        p.textContent = '← ' + cfg.steps[S.step - 2];
        p.removeAttribute('data-room');
      } else if(here && here.prev){
        /* step 1 goes back to the previous playroom rather than nowhere */
        p.hidden = false;
        p.textContent = '← ' + here.prev.title;
        p.setAttribute('data-room', window.RuntimeNav.links(here).room(here.prev.slug));
      } else {
        p.hidden = true;
      }

      /* the last step hands over to the next playroom instead of dead-ending */
      const slot = $('nextslot');
      if(S.step < LAST){
        slot.innerHTML = '<button class="fwd" id="next">Next: ' + esc(cfg.steps[S.step]) + ' →</button>';
      } else {
        const L = window.RuntimeNav.links(here);
        const nx = here && here.next;
        const nextHref = nx ? L.room(nx.slug) : L.home;
        slot.innerHTML = '<button class="again" id="again">Start again</button>' +
          (nextHref
            ? '<a class="fwd" href="' + nextHref + '">' +
              (nx ? 'Next playroom: ' + esc(nx.title) : 'Back to Runtime City') + ' →</a>'
            : '');
        /* finishing a playroom is worth remembering */
        if(here) window.RuntimeNav.Progress.mark(here.room.slug, LAST, LAST);
      }
    }

    function story(){
      /* ties the step name in the rail to the section you are reading */
      const eyebrow = '<p class="eyebrow">Step ' + S.step + ' of ' + LAST +
        '<span class="sep">·</span>' + esc(cfg.steps[S.step - 1]) + '</p>';
      $('story').innerHTML = eyebrow + cfg.story(S, api);
      $('story').querySelectorAll('.opt').forEach(b => b.onclick = () => {
        S.quiz[b.dataset.quiz] = +b.dataset.opt;
        story();
      });
    }

    function controls(){ $('controls').innerHTML = cfg.controls(S); }

    function status(){
      $('status').innerHTML = cfg.statusLine(S) +
        (S.out ? '<span class="out">' + esc(S.out) + '</span>' : '');
    }

    function code(){
      $('langs').querySelectorAll('button').forEach(b =>
        b.setAttribute('aria-pressed', b.dataset.l === S.lang));
      $('files').innerHTML = cfg.files(S).map(f =>
        '<div><div class="fname">' + esc(f.n) + '</div><pre><code>' +
        f.lines.map(l => '<span class="ln ' + (l[1] || '') + '">' + (highlight(l[0]) || ' ') + '</span>').join('') +
        '</code></pre></div>').join('');
      $('codenote').innerHTML = cfg.note(S);
    }

    function quizHTML(){
      const items = cfg.quiz || [];
      const answered = Object.keys(S.quiz).length;
      const right = Object.entries(S.quiz).filter(([i, v]) => items[i].a === v).length;
      return '<div class="quiz">' + items.map((q, i) => {
        const pick = S.quiz[i];
        return '<div class="q"><h3>' + (i + 1) + '. ' + esc(q.q) + '</h3><div class="opts">' +
          q.o.map((o, j) => {
            let cls = '';
            if(pick !== undefined) cls = j === q.a ? 'right' : (j === pick ? 'wrong' : '');
            return '<button class="opt ' + cls + '" data-quiz="' + i + '" data-opt="' + j + '"' +
              (pick !== undefined ? ' disabled' : '') + '>' + esc(o) + '</button>';
          }).join('') + '</div>' +
          (pick !== undefined ? '<p class="why">' + q.w + '</p>' : '') + '</div>';
      }).join('') +
      (answered === items.length && items.length
        ? '<p class="score">' + right + ' of ' + items.length + ' correct.</p>' : '') +
      (cfg.soundbite
        ? '<p class="soundbite"><span class="k">Say it in an interview</span>' + cfg.soundbite + '</p>' : '') +
      '</div>';
    }

    /* phone view: "Playroom" or "Code". Desktop shows both and ignores this. */
    function setView(v){
      S.view = v;
      document.documentElement.setAttribute('data-view', v);
      $('viewtabs').querySelectorAll('button').forEach(b =>
        b.setAttribute('aria-selected', b.dataset.view === v));
      if(v === 'code') markCode(false);
    }

    /* a dot on the Code tab when the code moved while the reader was on the stage */
    function markCode(on){
      const dot = $('viewtabs').querySelector('.dot');
      if(dot) dot.hidden = !on;
    }

    function render(){
      rail(); story(); controls(); status();
      if(cfg.onStage) cfg.onStage(S);
      code();
    }

    /* each step is a URL, so a step can be linked, reloaded and gone Back from */
    function stepFromHash(){
      const m = /^#step-(\d+)$/.exec(location.hash || '');
      const n = m ? +m[1] : 1;
      return n >= 1 && n <= LAST ? n : 1;
    }

    function go(n, push){
      if(n < 1 || n > LAST) return;
      const moved = n !== S.step;
      S.step = n; S.seen.add(n); S.fb = null; S.out = '';
      if(cfg.onStep) cfg.onStep(S, n);
      if(here){
        window.RuntimeNav.Progress.mark(here.room.slug, n, LAST);
        /* keep the menu's ticks current, while nobody is looking at it */
        const panel = $('citymenu');
        if(panel && panel.hidden)
          panel.innerHTML = window.RuntimeNav.menuHTML(here, window.RuntimeNav.links(here));
      }
      render();
      if(push !== false && moved){
        try{ history.pushState({step:n}, '', '#step-' + n); }catch(e){}
      }
      if(moved && S.view === 'code') setView('play');   // a new step starts on the stage
      if(moved && window.innerWidth < 920) $('story').scrollIntoView({behavior:'smooth', block:'start'});
    }

    window.addEventListener('popstate', () => go(stepFromHash(), false));

    /* arrow keys walk the steps, unless the reader is typing or tabbing controls */
    document.addEventListener('keydown', ev => {
      if(ev.metaKey || ev.ctrlKey || ev.altKey) return;
      const t = ev.target;
      if(t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if(ev.key === 'ArrowRight' && S.step < LAST){ ev.preventDefault(); go(S.step + 1); }
      if(ev.key === 'ArrowLeft' && S.step > 1){ ev.preventDefault(); go(S.step - 1); }
    });

    function restart(){
      if(cfg.reset) cfg.reset(S);
      S.seen = new Set([1]); S.quiz = {};
      go(1);
      window.scrollTo({top:0, behavior:'smooth'});
    }

    window.RuntimeNav.wire();

    document.addEventListener('click', ev => {
      const b = ev.target.closest('button');
      if(!b || b.id === 'menubtn') return;
      if(b.dataset.room){ location.href = b.dataset.room; return; }
      if(b.dataset.s) return go(+b.dataset.s);
      if(b.dataset.l){
        S.lang = b.dataset.l;
        try{ localStorage.setItem('rc-lang', S.lang); }catch(e){}
        story(); code();
        if(cfg.onStage) cfg.onStage(S);
        return;
      }
      if(b.dataset.quiz !== undefined) return;       // handled in story()
      if(b.dataset.view) return setView(b.dataset.view);
      if(b.id === 'prev' || b.id === 'prevTop') return go(S.step - 1);
      if(b.id === 'next' || b.id === 'nextTop') return go(S.step + 1);
      if(b.id === 'again') return restart();
      if(cfg.onClick && cfg.onClick(S, b, api) !== false){
        render();
        if(S.view === 'play') markCode(true);        // the code changed behind the tab
      }
    });

    setView('play');
    go(stepFromHash(), false);
    return api;
  }

  window.Playroom = Playroom;
})();
