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

  function chrome(cfg){
    const park = cfg.park || {};
    const line = (park.items || []).map(it =>
      it.label === park.current ? '<b class="now">' + it.label + '</b>'
      : it.href ? '<a href="' + it.href + '">' + it.label + '</a>'
      : it.label
    ).join(' · ');
    return '' +
    '<div class="wrap">' +
      '<header class="top">' +
        '<span class="brand">' + MARK + 'Runtime City</span>' +
        '<span class="sep">/</span><span>' + esc(cfg.district) + '</span>' +
      '</header>' +
      '<section class="intro"><h1>' + esc(cfg.title) + '</h1><p>' + esc(cfg.dek) + '</p></section>' +
      '<nav class="rail" id="rail" aria-label="Playroom steps"></nav>' +
      '<div class="lesson">' +
        '<div>' +
          '<section class="story" id="story"></section>' +
          '<div class="stage">' + cfg.stage +
            '<div class="controls" id="controls"></div>' +
            '<div class="status" id="status" aria-live="polite"></div>' +
          '</div>' +
          '<div class="nav"><button id="prev"></button><button id="next" class="fwd"></button></div>' +
        '</div>' +
        '<aside><div class="code">' +
          '<div class="langs" id="langs">' +
            LANGS.map(l => '<button data-l="' + l[0] + '">' + l[1] + '</button>').join('') +
          '</div>' +
          '<div id="files"></div><div class="codenote" id="codenote"></div>' +
        '</div></aside>' +
      '</div>' +
      '<section class="city"><span class="k">' + esc(cfg.district) + '</span>' + line +
        '<br>Every concept in Runtime City is a playroom: see it, break it, fix it, then say it in an interview.' +
      '</section>' +
    '</div>';
  }

  function Playroom(cfg){
    const LAST = cfg.steps.length;
    const S = Object.assign({step:1, lang:'cs', out:'', fb:null}, cfg.state || {});
    S.seen = new Set([1]);
    S.quiz = {};
    try{ const l = localStorage.getItem('rc-lang'); if(l && LANGS.some(x => x[0] === l)) S.lang = l; }catch(e){}

    (document.getElementById('playroom') || document.body).innerHTML = chrome(cfg);
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
        return '<button data-s="' + n + '"' + (n === S.step ? ' aria-current="step"' : '') +
          ' class="' + (S.seen.has(n) && n !== S.step ? 'done' : '') + '">' +
          '<span class="n">' + n + '</span>' + esc(t) + '</button>';
      }).join('');
      if(r.scrollWidth > r.clientWidth){
        const cur = r.querySelector('[aria-current]');
        if(cur) cur.scrollIntoView({block:'nearest', inline:'center'});
      }
      const p = $('prev'), n = $('next');
      p.hidden = S.step === 1;
      p.textContent = S.step > 1 ? '← ' + cfg.steps[S.step - 2] : '';
      if(S.step < LAST){ n.className = 'fwd'; n.textContent = 'Next: ' + cfg.steps[S.step] + ' →'; }
      else { n.className = 'again'; n.textContent = 'Start the playroom again'; }
    }

    function story(){
      $('story').innerHTML = cfg.story(S, api);
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

    function render(){
      rail(); story(); controls(); status();
      if(cfg.onStage) cfg.onStage(S);
      code();
    }

    function go(n){
      if(n < 1 || n > LAST) return;
      S.step = n; S.seen.add(n); S.fb = null; S.out = '';
      if(cfg.onStep) cfg.onStep(S, n);
      render();
      if(window.innerWidth < 920) $('story').scrollIntoView({behavior:'smooth', block:'start'});
    }

    function restart(){
      if(cfg.reset) cfg.reset(S);
      S.seen = new Set([1]); S.quiz = {};
      go(1);
      window.scrollTo({top:0, behavior:'smooth'});
    }

    document.addEventListener('click', ev => {
      const b = ev.target.closest('button');
      if(!b) return;
      if(b.dataset.s) return go(+b.dataset.s);
      if(b.dataset.l){
        S.lang = b.dataset.l;
        try{ localStorage.setItem('rc-lang', S.lang); }catch(e){}
        story(); code();
        if(cfg.onStage) cfg.onStage(S);
        return;
      }
      if(b.dataset.quiz !== undefined) return;       // handled in story()
      if(b.id === 'prev') return go(S.step - 1);
      if(b.id === 'next') return S.step < LAST ? go(S.step + 1) : restart();
      if(cfg.onClick && cfg.onClick(S, b, api) !== false) render();
    });

    render();
    return api;
  }

  window.Playroom = Playroom;
})();
