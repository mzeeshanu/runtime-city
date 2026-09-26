/* Runtime City — the icon for each playroom, drawn in a 24×24 box.

   Shared by both home-page designs. Two stroke classes:
     .gl    the main strokes
     .gl.a  the accent strokes — the part that carries the meaning

   Keep them readable at about 38px: few strokes, no fine detail.
*/
module.exports = {
  /* Pattern Park */
  socket:   '<rect class="gl" x="3" y="12" width="18" height="9" rx="2"/><path class="gl" d="M9 15v3M15 15v3"/>' +
            '<rect class="gl a" x="7" y="2" width="10" height="5" rx="1.5"/><path class="gl a" d="M9 7v5M15 7v5"/>',            // plug going into a socket
  factory:  '<path class="gl" d="M3 20v-8l5 3v-3l5 3v-3l5 3v5Z"/><rect class="gl a" x="16" y="3" width="3" height="7" rx="1"/>' +
            '<path class="gl a" d="M8 20v-3h3v3"/>',                                                                            // works with a chimney
  options:  '<rect class="gl" x="3" y="3" width="18" height="4.6" rx="2.3"/>' +
            '<rect class="gl a" x="3" y="9.7" width="18" height="4.6" rx="2.3"/>' +
            '<rect class="gl" x="3" y="16.4" width="18" height="4.6" rx="2.3"/>',                                               // interchangeable options, one picked
  antenna:  '<path class="gl" d="M12 21V7"/><path class="gl a" d="M6.5 8.5a8 8 0 0 1 11 0M9 11.5a4 4 0 0 1 6 0"/>' +
            '<circle class="gl a" cx="12" cy="4.5" r="2"/>',                                                                    // broadcast
  one:      '<path class="gl" d="M9 8.5 12.5 5v13"/><path class="gl a" d="M7.5 18h10"/>',                                       // exactly one

  /* Memory Harbour */
  stack:    '<rect class="gl" x="2.5" y="15" width="8" height="3.4" rx="1"/><rect class="gl" x="2.5" y="10.6" width="8" height="3.4" rx="1"/>' +
            '<rect class="gl" x="2.5" y="6.2" width="8" height="3.4" rx="1"/>' +
            '<circle class="gl a" cx="16.5" cy="8" r="2.4"/><circle class="gl a" cx="20.5" cy="13.5" r="2"/><circle class="gl a" cx="15.5" cy="15.5" r="2.7"/>', // stack, then heap
  bin:      '<path class="gl" d="M6 7h12l-1 13H7L6 7Z"/><path class="gl a" d="M4 7h16M10 4h4"/><path class="gl" d="M10 11v5M14 11v5"/>',
  box:      '<rect class="gl" x="3.5" y="11" width="17" height="9.5" rx="2"/><path class="gl" d="M3.5 14.5h17"/>' +
            '<rect class="gl a" x="9" y="2" width="6" height="6" rx="1.2"/><path class="gl a" d="M12 8v3"/>',                    // a value going into a box
  pointer:  '<path class="gl" d="M3 12h9"/><path class="gl" d="M9.5 8.5 13 12l-3.5 3.5"/>' +
            '<circle class="gl a" cx="18" cy="12" r="3.4"/><path class="gl a" d="M15.6 14.4 20.4 9.6"/>',                        // a reference to nothing
  cache:    '<rect class="gl" x="3" y="5" width="18" height="14" rx="2.5"/><path class="gl a" d="M13.5 7.5 9 13.5h3l-1 3.5 4.5-6h-3Z"/>', // fast store

  /* SOLID Quarter */
  onejob:   '<rect class="gl" x="4" y="4" width="16" height="16" rx="3"/><circle class="gl a" cx="12" cy="12" r="2.8"/>',        // one box, one job
  openext:  '<rect class="gl" x="2.5" y="10" width="11" height="10.5" rx="2"/><path class="gl" d="M5.5 10V7.6a2.6 2.6 0 0 1 5.2 0V10"/>' +
            '<path class="gl a" d="M18.5 10.5v8M14.5 14.5h8"/>',                                                                 // closed to change, open to extension
  swap:     '<rect class="gl" x="2" y="7" width="8" height="10" rx="1.5"/><rect class="gl a" x="14" y="7" width="8" height="10" rx="1.5"/>' +
            '<path class="gl" d="M10.5 10h3.5M12.5 8.4 14.2 10l-1.7 1.6"/><path class="gl a" d="M13.5 14h-3.5M11.5 12.4 9.8 14l1.7 1.6"/>', // substitutable
  segment:  '<rect class="gl" x="3" y="6" width="18" height="12" rx="2"/><path class="gl a" d="M9 4.5v15M15 4.5v15"/>',          // one interface, cut into roles
  invert:   '<rect class="gl" x="4" y="3" width="16" height="4.6" rx="1.5"/><rect class="gl" x="4" y="16.4" width="16" height="4.6" rx="1.5"/>' +
            '<path class="gl a" d="M12 16.4V9"/><path class="gl a" d="M9 11.4 12 8.4l3 3"/>',                                    // detail points up at policy

  /* Network Highway */
  signpost: '<path class="gl" d="M12 21V4.5"/><path class="gl a" d="M12 6.5h8l-2 3h-6Z"/><path class="gl" d="M12 12.5H4l2-3h6Z"/>',
  syn:      '<path class="gl" d="M4.5 3v18M19.5 3v18"/><path class="gl a" d="M5.5 8.5h13M16 5.5l3 3-3 3"/>' +
            '<path class="gl" d="M18.5 15.5h-13M8 12.5l-3 3 3 3"/>',                                                             // SYN one way, ACK back
  envelope: '<rect class="gl" x="3" y="6" width="18" height="12" rx="2.5"/><path class="gl a" d="m3.8 7.8 8.2 5.6 8.2-5.6"/>',
  shield:   '<path class="gl" d="M12 2.5 4 5.4v5.8c0 4.9 3.4 8.7 8 10.3 4.6-1.6 8-5.4 8-10.3V5.4Z"/>' +
            '<rect class="gl a" x="9.2" y="10.6" width="5.6" height="4.8" rx="1.2"/><path class="gl a" d="M10.6 10.6V9.4a1.4 1.4 0 0 1 2.8 0v1.2"/>', // certificate + lock

  /* Database Vault */
  index:    '<rect class="gl" x="4" y="4" width="16" height="16" rx="2.5"/><path class="gl a" d="M8.5 4v6.5l2.2-2 2.2 2V4"/>' +
            '<path class="gl" d="M4 14.5h16"/>',                                                                                // a book with a marker
  venn:     '<circle class="gl" cx="9" cy="12" r="6"/><circle class="gl a" cx="15" cy="12" r="6"/>',
  commit:   '<path class="gl" d="M7.5 3H5.5a2.5 2.5 0 0 0-2.5 2.5v13A2.5 2.5 0 0 0 5.5 21h2M16.5 3h2A2.5 2.5 0 0 1 21 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-2"/>' +
            '<path class="gl a" d="m8 12.2 2.8 2.8L16 9"/>',                                                                     // all of it, or none
  isolate:  '<rect class="gl" x="3" y="5" width="18" height="14" rx="2.5"/><path class="gl a" d="M12 5v14"/>' +
            '<circle class="gl" cx="7.5" cy="12" r="2.1"/><circle class="gl a" cx="16.5" cy="12" r="2.1"/>',                     // two sessions, one wall

  /* Concurrency Crossing */
  lanes:    '<path class="gl" d="M7 20.5V6.5"/><path class="gl" d="M4 9.5 7 6.5l3 3"/>' +
            '<path class="gl a" d="M17 20.5V6.5"/><path class="gl a" d="M14 9.5 17 6.5l3 3"/>',
  lock:     '<rect class="gl" x="4.5" y="10" width="15" height="10.5" rx="2.5"/><path class="gl a" d="M8.5 10V7a3.5 3.5 0 0 1 7 0v3"/>' +
            '<circle class="gl a" cx="12" cy="15" r="1.7"/>',
  cycle:    '<path class="gl" d="M6.5 6h7a5.5 5.5 0 0 1 0 11H10"/><path class="gl" d="M12.5 14 10 17l2.5 3"/>' +
            '<path class="gl a" d="m16.5 16.5 5 5M21.5 16.5l-5 5"/>',                                                            // a cycle that cannot turn
  clock:    '<circle class="gl" cx="12" cy="12" r="8.5"/><path class="gl a" d="M12 6.8V12l4 2.2"/>'
};
