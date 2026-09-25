/* Runtime City — sequence diagrams for the playrooms where time matters.

   A lane per machine, time running downward, one arrow per message.

   Sequence.stage({lanes, height})                 -> the svg markup
   Sequence.draw({lanes, messages, caption})       -> redraws it

   A message: {from, to, label, ms, kind}
     from/to  lane indexes (to may equal from for work done in place)
     kind     'ok' (default) · 'slow' · 'bad' · 'cached' · 'secret'
*/
(function(root){
  'use strict';

  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  let LANES = [], W = 600, TOP = 58;

  function stage(opts){
    LANES = opts.lanes;
    W = opts.width || 600;
    const h = opts.height || 320;
    return '<svg viewBox="0 0 ' + W + ' ' + h + '" role="img" aria-label="Messages between machines over time">' +
      '<defs>' +
        '<pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" class="gridline" fill="none"/></pattern>' +
        '<marker id="sq" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="var(--ink)"/></marker>' +
        '<marker id="sqBad" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="var(--bad)"/></marker>' +
        '<marker id="sqOk" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="var(--good)"/></marker>' +
        '<marker id="sqAcc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="var(--accent)"/></marker>' +
      '</defs>' +
      '<rect width="' + W + '" height="' + h + '" fill="url(#grid)" opacity=".6"/>' +
      '<g id="seqLanes"></g><g id="seqMsgs"></g>' +
      '<text class="seqcap" id="seqCap" x="16" y="' + (h - 12) + '"></text>' +
    '</svg>';
  }

  const laneX = i => {
    const n = LANES.length;
    const margin = 70;
    return n === 1 ? W / 2 : margin + i * ((W - margin * 2) / (n - 1));
  };

  function draw(opts){
    const lanes = opts.lanes || LANES;
    LANES = lanes;
    const msgs = opts.messages || [];
    const bottom = TOP + Math.max(msgs.length, 1) * 34 + 20;

    document.getElementById('seqLanes').innerHTML = lanes.map((l, i) => {
      const x = laneX(i);
      const label = typeof l === 'string' ? l : l.name;
      const sub = typeof l === 'string' ? '' : (l.sub || '');
      const dim = typeof l === 'object' && l.dim;
      return '<g class="' + (dim ? 'lane dim' : 'lane') + '">' +
        '<rect class="lanehead" x="' + (x - 58) + '" y="18" width="116" height="' + (sub ? 34 : 26) + '" rx="6"/>' +
        '<text class="lanelbl" x="' + x + '" y="' + (sub ? 34 : 36) + '">' + esc(label) + '</text>' +
        (sub ? '<text class="lanesub" x="' + x + '" y="' + 46 + '">' + esc(sub) + '</text>' : '') +
        '<line class="lifeline" x1="' + x + '" y1="' + (sub ? 56 : 48) + '" x2="' + x + '" y2="' + bottom + '"/>' +
      '</g>';
    }).join('');

    document.getElementById('seqMsgs').innerHTML = msgs.map((m, i) => {
      const y = TOP + 14 + i * 34;
      const kind = m.kind || 'ok';
      const x1 = laneX(m.from), x2 = laneX(m.to);
      const time = m.ms != null ? '<text class="seqms ' + kind + '" x="' + (W - 14) + '" y="' + (y + 4) + '">' + esc(m.ms) + '</text>' : '';

      if(m.from === m.to){          /* work done inside one machine */
        return '<g class="msg ' + kind + '">' +
          '<path class="seqself" d="M' + x1 + ' ' + (y - 8) + ' h 26 v 16 h -26"/>' +
          '<text class="seqlbl left" x="' + (x1 + 34) + '" y="' + (y + 4) + '">' + esc(m.label) + '</text>' + time + '</g>';
      }
      const mid = (x1 + x2) / 2;
      return '<g class="msg ' + kind + '">' +
        '<line class="seqline" x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '"/>' +
        '<text class="seqlbl" x="' + mid + '" y="' + (y - 7) + '">' + esc(m.label) + '</text>' + time + '</g>';
    }).join('');

    const cap = document.getElementById('seqCap');
    if(cap) cap.textContent = opts.caption || '';
  }

  root.Sequence = {stage, draw, laneX};
})(window);
