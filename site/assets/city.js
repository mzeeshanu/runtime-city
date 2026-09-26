/* Runtime City — the map.
   One source of truth for districts, playrooms and their order. The playroom
   engine reads it for breadcrumbs and next/previous links; tools/build-index.js
   writes the home page from it. */
(function(root){
  const CITY = {
    districts: [
      {
        name: 'Pattern Park',
        slug: 'pattern-park',
        blurb: 'The design patterns interviewers ask about.',
        open: true,
        playrooms: [
          {slug:'dependency-injection', icon:'socket', short:'DI', title:'Dependency Injection', blurb:'weld an engine in, then cut a socket'},
          {slug:'factory-method', icon:'gear', short:'Factory',       title:'Factory Method',       blurb:'grow a switch until it breaks, then cut a hole'},
          {slug:'strategy', icon:'fork', short:'Strategy',             title:'Strategy',             blurb:'drown a method in flags, then hand the algorithm in'},
          {slug:'observer', icon:'antenna', short:'Observer',             title:'Observer',             blurb:'wire every listener by name, then let them subscribe'},
          {slug:'singleton', icon:'one', short:'Singleton',            title:'Singleton',            blurb:'one instance, a thread race, and poisoned tests'}
        ],
        soon: []
      },
      {
        name: 'Memory Harbour',
        slug: 'memory-harbour',
        blurb: 'Where your objects actually live.',
        open: true,
        playrooms: [
          {slug:'stack-and-heap', icon:'stack', short:'Stack',     title:'Stack and Heap',     blurb:'two names, one object, and what the collector takes'},
          {slug:'garbage-collection', icon:'bin', short:'GC', title:'Garbage Collection', blurb:'drop a reference, then find out nothing was freed'},
          {slug:'boxing', icon:'box', short:'Boxing',             title:'Boxing',             blurb:'a number becomes an object, a million times'},
          {slug:'pointers-and-null', icon:'pointer', short:'Null',  title:'Pointers and Null',  blurb:'point at nothing, crash, then fix it in the type'},
          {slug:'caching', icon:'bolt', short:'Cache',            title:'Caching',            blurb:'fast answers, stale answers, and the stampede'}
        ],
        soon: []
      },
      {
        name: 'SOLID Quarter',
        slug: 'solid-quarter',
        blurb: 'Five principles, five buildings that crack when you break them.',
        open: true,
        playrooms: [
          {slug:'single-responsibility', icon:'onedoor', short:'SRP',  title:'Single Responsibility',  blurb:'four departments, one file, and the crack down the middle'},
          {slug:'open-closed', icon:'plus', short:'OCP',            title:'Open/Closed',            blurb:'stop editing the engine to add a promotion'},
          {slug:'liskov-substitution', icon:'shapes', short:'LSP',    title:'Liskov Substitution',    blurb:'a square that makes a correct test fail'},
          {slug:'interface-segregation', icon:'split', short:'ISP',  title:'Interface Segregation',  blurb:'a printer forced to promise it can fax'},
          {slug:'dependency-inversion', icon:'flip', short:'DIP',   title:'Dependency Inversion',   blurb:'flip the arrow between your rules and your database'}
        ],
        soon: []
      },
      {
        name: 'Network Highway',
        slug: 'network-highway',
        blurb: 'What happens when you type a URL.',
        open: true,
        playrooms: [
          {slug:'dns', icon:'signpost', short:'DNS',  title:'DNS',  blurb:'a name becomes an address, and a TTL decides your outage'},
          {slug:'tcp', icon:'handshake', short:'TCP',  title:'TCP',  blurb:'pay for a handshake, then lose one packet'},
          {slug:'http', icon:'envelope', short:'HTTP', title:'HTTP', blurb:'verbs that promise things and codes that mean things'},
          {slug:'tls', icon:'padlock', short:'TLS',  title:'TLS',  blurb:'your password on the wire, then the padlock'}
        ],
        soon: []
      },
      {
        name: 'Database Vault',
        slug: 'database-vault',
        blurb: 'Indexes, joins and the promises a transaction makes.',
        open: true,
        playrooms: [
          {slug:'indexes', icon:'tabs', short:'Indexes',          title:'Indexes',          blurb:'read a million rows, then read four'},
          {slug:'joins', icon:'venn', short:'Joins',            title:'Joins',            blurb:'which rows survive, and the accidental 101 queries'},
          {slug:'transactions', icon:'safe', short:'Tx',     title:'Transactions',     blurb:'crash halfway and lose £100, then do not'},
          {slug:'isolation-levels', icon:'partition', short:'Isolation', title:'Isolation Levels', blurb:'two sessions, four anomalies, one lost sale'}
        ],
        soon: []
      },
      {
        name: 'Concurrency Crossing',
        slug: 'concurrency-crossing',
        blurb: 'Two things at once, and what goes wrong.',
        open: true,
        playrooms: [
          {slug:'threads', icon:'lanes', short:'Threads',     title:'Threads',       blurb:'two threads, one counter, a different answer every run'},
          {slug:'locks', icon:'lock', short:'Locks',       title:'Locks',         blurb:'correctness, bought with a queue'},
          {slug:'deadlocks', icon:'cross', short:'Deadlock',   title:'Deadlocks',     blurb:'both waiting, both polite, forever'},
          {slug:'async-await', icon:'clock', short:'Async', title:'Async / Await', blurb:'waiting without holding a thread hostage'}
        ],
        soon: []
      }
    ]
  };

  /* every open playroom, in city order */
  CITY.all = CITY.districts.reduce((acc, d) =>
    acc.concat(d.playrooms.map(p => Object.assign({district:d.name, districtSlug:d.slug}, p))), []);

  /* what sits around a playroom: its district, and the rooms either side of it */
  CITY.locate = function(slug){
    const i = CITY.all.findIndex(p => p.slug === slug);
    if(i < 0) return null;
    const room = CITY.all[i];
    const district = CITY.districts.find(d => d.slug === room.districtSlug);
    return {room, district, prev: CITY.all[i - 1] || null, next: CITY.all[i + 1] || null, index: i, total: CITY.all.length};
  };

  root.CITY = CITY;
  if(typeof module !== 'undefined' && module.exports) module.exports = CITY;
})(typeof window !== 'undefined' ? window : globalThis);
