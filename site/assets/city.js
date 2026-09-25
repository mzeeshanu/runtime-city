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
          {slug:'stack-and-heap', title:'Stack and Heap', blurb:'two names, one object, and what the collector takes'}
        ],
        soon: ['Garbage collection', 'Boxing', 'Pointers and null', 'Caching']
      },
      {
        name: 'SOLID Quarter',
        slug: 'solid-quarter',
        blurb: 'Five principles, five buildings that crack when you break them.',
        open: false,
        playrooms: [],
        soon: ['Single Responsibility', 'Open/Closed', 'Liskov Substitution', 'Interface Segregation', 'Dependency Inversion']
      },
      {
        name: 'Network Highway',
        slug: 'network-highway',
        blurb: 'What happens when you type a URL.',
        open: false, playrooms: [],
        soon: ['DNS', 'TCP', 'HTTP', 'TLS']
      },
      {
        name: 'Database Vault',
        slug: 'database-vault',
        blurb: 'Indexes, joins and the promises a transaction makes.',
        open: false, playrooms: [],
        soon: ['Indexes', 'Joins', 'Transactions', 'Isolation levels']
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
