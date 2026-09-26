/* Write site/index.html from the city map.

   Two home-page designs live side by side, so you can switch back at any time:

     node tools/build-index.js          the park  (default) — tools/build-home.park.js
     node tools/build-index.js park     the same
     node tools/build-index.js city     the city blocks     — tools/build-home.city.js

   Both read site/assets/city.js, so districts and playrooms never drift.
*/
const fs = require('fs');
const CITY = require('../site/assets/city.js');

const design = (process.argv[2] || 'park').toLowerCase();
const builders = {park: './build-home.park.js', city: './build-home.city.js'};

if(!builders[design]){
  console.error(`unknown design "${design}" — try: park, city`);
  process.exit(1);
}

const html = require(builders[design]);
fs.writeFileSync('site/index.html', html);
console.log(`site/index.html  ${design} design · ${CITY.all.length} playrooms across ${CITY.districts.length} districts`);
