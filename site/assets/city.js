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
          {slug:'dependency-injection', title:'Dependency Injection', blurb:'weld an engine in, then cut a socket'},
          {slug:'factory-method',       title:'Factory Method',       blurb:'grow a switch until it breaks, then cut a hole'},
          {slug:'strategy',             title:'Strategy',             blurb:'drown a method in flags, then hand the algorithm in'},
          {slug:'observer',             title:'Observer',             blurb:'wire every listener by name, then let them subscribe'},
          {slug:'singleton',            title:'Singleton',            blurb:'one instance, a thread race, and poisoned tests'}
        ],
        soon: []
      },
      {
        name: 'Memory Harbour',
        slug: 'memory-harbour',
        blurb: 'Where your objects actually live.',
        open: true,
        playrooms: [
          {slug:'stack-and-heap',     title:'Stack and Heap',     blurb:'two names, one object, and what the collector takes'},
          {slug:'garbage-collection', title:'Garbage Collection', blurb:'drop a reference, then find out nothing was freed'},
          {slug:'boxing',             title:'Boxing',             blurb:'a number becomes an object, a million times'},
          {slug:'pointers-and-null',  title:'Pointers and Null',  blurb:'point at nothing, crash, then fix it in the type'},
          {slug:'caching',            title:'Caching',            blurb:'fast answers, stale answers, and the stampede'}
        ],
        soon: []
      },
      {
        name: 'SOLID Quarter',
        slug: 'solid-quarter',
        blurb: 'Five principles, five buildings that crack when you break them.',
        open: true,
        playrooms: [
          {slug:'single-responsibility',  title:'Single Responsibility',  blurb:'four departments, one file, and the crack down the middle'},
          {slug:'open-closed',            title:'Open/Closed',            blurb:'stop editing the engine to add a promotion'},
          {slug:'liskov-substitution',    title:'Liskov Substitution',    blurb:'a square that makes a correct test fail'},
          {slug:'interface-segregation',  title:'Interface Segregation',  blurb:'a printer forced to promise it can fax'},
          {slug:'dependency-inversion',   title:'Dependency Inversion',   blurb:'flip the arrow between your rules and your database'}
        ],
        soon: []
      },
      {
        name: 'Network Highway',
        slug: 'network-highway',
        blurb: 'What happens when you type a URL.',
        open: true,
        playrooms: [
          {slug:'dns',  title:'DNS',  blurb:'a name becomes an address, and a TTL decides your outage'},
          {slug:'tcp',  title:'TCP',  blurb:'pay for a handshake, then lose one packet'},
          {slug:'http', title:'HTTP', blurb:'verbs that promise things and codes that mean things'},
          {slug:'tls',  title:'TLS',  blurb:'your password on the wire, then the padlock'}
        ],
        soon: []
      },
      {
        name: 'Database Vault',
        slug: 'database-vault',
        blurb: 'Indexes, joins and the promises a transaction makes.',
        open: true,
        playrooms: [
          {slug:'indexes',          title:'Indexes',          blurb:'read a million rows, then read four'},
          {slug:'joins',            title:'Joins',            blurb:'which rows survive, and the accidental 101 queries'},
          {slug:'transactions',     title:'Transactions',     blurb:'crash halfway and lose £100, then do not'},
          {slug:'isolation-levels', title:'Isolation Levels', blurb:'two sessions, four anomalies, one lost sale'}
        ],
        soon: []
      },
      {
        name: 'Concurrency Crossing',
        slug: 'concurrency-crossing',
        blurb: 'Two things at once, and what goes wrong.',
        open: false, playrooms: [],
        soon: ['Threads', 'Locks', 'Deadlocks', 'async/await']
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
