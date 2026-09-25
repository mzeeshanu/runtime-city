/* Runtime City — the navigation shared by every page.

   Needs city.js first. Gives you:
     RuntimeNav.bar({...})   the sticky top bar markup
     RuntimeNav.wire()       menu open/close behaviour
     RuntimeNav.links(here)  where the city links point from this page
     RuntimeNav.Progress     what this visitor has finished, per browser
*/
(function(root){
  'use strict';

  const MARK = '<svg viewBox="0 0 24 24" aria-hidden="true">' +
    '<rect x="2" y="10" width="5" height="12" fill="currentColor"/>' +
    '<rect x="9" y="4" width="6" height="18" fill="currentColor"/>' +
    '<rect x="17" y="13" width="5" height="9" fill="var(--accent)"/></svg>';

  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  /* one visitor's progress, in their own browser only */
  const Progress = {
    KEY: 'rc-progress',
    read(){
      try{ return JSON.parse(localStorage.getItem(Progress.KEY)) || {}; }
      catch(e){ return {}; }
    },
    write(p){ try{ localStorage.setItem(Progress.KEY, JSON.stringify(p)); }catch(e){} },
    mark(slug, step, total){
      const p = Progress.read();
      const r = p[slug] || {step:1, done:false};
      r.step = Math.max(r.step, step);
      r.total = total;
      if(step >= total) r.done = true;
      p[slug] = r;
      Progress.write(p);
      return r;
    },
    of(slug){ return Progress.read()[slug] || null; },
    clear(){ try{ localStorage.removeItem(Progress.KEY); }catch(e){} }
  };

  /* Links resolve against the site root when city.js carries a base (used by the
     single-file copies), relatively on the site itself, and nowhere at all when a
     detached copy has no base: then they render as plain text rather than 404s. */
  function links(here){
    const base = (root.CITY && root.CITY.base) || '';
    const detached = !!(here && here.detached);
    const atRoot = !/\/playrooms\//.test(location.pathname);
    const up = atRoot ? '' : '../../';
    return {
      home: base ? base + '/' : (detached ? '' : (up || './')),
      district: slug => base ? base + '/#' + slug : (detached ? '' : up + '#' + slug),
      room: slug => base ? base + '/playrooms/' + slug + '/'
                         : (detached ? '' : (atRoot ? 'playrooms/' + slug + '/' : '../' + slug + '/'))
    };
  }

  function anchor(href, cls, html){
    return href ? '<a class="' + cls + '" href="' + href + '">' + html + '</a>'
                : '<span class="' + cls + ' nolink">' + html + '</span>';
  }

  function tick(slug){
    const p = Progress.of(slug);
    if(!p) return '';
    return p.done ? '<span class="mdone" title="Finished">✓</span>'
                  : '<span class="mpart" title="Step ' + p.step + ' of ' + (p.total || 6) + '">' +
                    p.step + '/' + (p.total || 6) + '</span>';
  }

  /* the whole city, one button away */
  function menuHTML(here, L){
    const city = root.CITY;
    if(!city) return '';
    return city.districts.map(d => {
      const rooms = d.playrooms.map(p => {
        const now = here && p.slug === here.room.slug;
        const inner = '<span class="mt">' + esc(p.title) + tick(p.slug) + '</span>' +
                      '<span class="mb">' + esc(p.blurb) + '</span>';
        return '<li class="' + (now ? 'now' : '') + '">' +
          (now ? '<span class="mrow">' + inner + '<span class="youare">you are here</span></span>'
               : anchor(L.room(p.slug), 'mrow', inner)) + '</li>';
      }).join('');
      const soon = d.soon.length ? '<li class="msoon">' + d.soon.map(esc).join(' · ') + '</li>' : '';
      return '<section class="mgroup' + (d.open ? '' : ' planned') + '">' +
        '<h3>' + anchor(L.district(d.slug), 'mhead', esc(d.name)) +
        '<span class="mcount">' + (d.open ? d.playrooms.length + ' open' : 'planned') + '</span></h3>' +
        '<ul>' + rooms + soon + '</ul></section>';
    }).join('');
  }

  /* opts: {here, districtName, districtSlug, title, count} */
  function bar(opts){
    const L = opts.L || links(opts.here);
    const crumb = opts.districtName
      ? '<span class="sep">/</span>' + anchor(L.district(opts.districtSlug), 'cr', esc(opts.districtName)) +
        '<span class="sep">/</span><span class="cr here">' + esc(opts.title) + '</span>'
      : '<span class="sep">/</span><span class="cr here">' + esc(opts.title) + '</span>';

    return '<header class="topbar"><div class="topbar-in">' +
      anchor(L.home, 'brand', MARK + '<span>Runtime City</span>') +
      '<nav class="crumb" aria-label="Breadcrumb">' + crumb + '</nav>' +
      '<button class="menubtn" id="menubtn" aria-expanded="false" aria-controls="citymenu" aria-haspopup="true">' +
        '<span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>All playrooms' +
        (opts.count ? '<span class="of">' + esc(opts.count) + '</span>' : '') +
      '</button>' +
      '<div class="citymenu" id="citymenu" hidden>' + menuHTML(opts.here, L) + '</div>' +
    '</div></header>';
  }

  function wire(){
    const btn = document.getElementById('menubtn');
    const panel = document.getElementById('citymenu');
    if(!btn || !panel) return;
    const open = on => {
      panel.hidden = !on;
      btn.setAttribute('aria-expanded', String(on));
      document.documentElement.classList.toggle('menu-open', on);
    };
    btn.addEventListener('click', e => { e.stopPropagation(); open(panel.hidden); });
    document.addEventListener('keydown', e => {
      if(e.key === 'Escape' && !panel.hidden){ open(false); btn.focus(); }
    });
    document.addEventListener('click', e => {
      if(!panel.hidden && !e.target.closest('#citymenu') && !e.target.closest('#menubtn')) open(false);
    });
  }

  /* used by the home page and the 404 page */
  function mount(opts){
    document.body.insertAdjacentHTML('afterbegin', bar(opts || {title:'All districts'}));
    wire();
  }

  root.RuntimeNav = {MARK, esc, links, anchor, menuHTML, bar, wire, mount, Progress, tick};
})(window);
