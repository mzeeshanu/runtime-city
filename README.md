# Runtime City

**Live: https://runtimecity.com** (deployed from `main` via Railway)

**Learn by breaking.** Runtime City is an interactive city of software engineering concepts. Each district covers a field (design patterns, memory, networking, databases), and each concept is a *playroom* where you see it working, break it, fix it, and compare the real code.

Audience: students preparing for interviews first, then early-career developers.

## Playrooms

| District | Playroom | Status |
|---|---|---|
| Pattern Park | [Dependency Injection](site/playrooms/dependency-injection/index.html) | Prototype |
| Pattern Park | [Factory Method](site/playrooms/factory-method/index.html) | Prototype |
| Pattern Park | [Strategy](site/playrooms/strategy/index.html) | Prototype |
| Pattern Park | [Observer](site/playrooms/observer/index.html) | Prototype |
| Pattern Park | [Singleton](site/playrooms/singleton/index.html) | Prototype |
| Memory Harbour | [Stack and Heap](site/playrooms/stack-and-heap/index.html) | Prototype |
| Memory Harbour | [Garbage Collection](site/playrooms/garbage-collection/index.html) | Prototype |
| Memory Harbour | [Boxing](site/playrooms/boxing/index.html) | Prototype |
| Memory Harbour | [Pointers and Null](site/playrooms/pointers-and-null/index.html) | Prototype |
| Memory Harbour | [Caching](site/playrooms/caching/index.html) | Prototype |
| SOLID Quarter | [Single Responsibility](site/playrooms/single-responsibility/index.html) | Prototype |
| SOLID Quarter | [Open/Closed](site/playrooms/open-closed/index.html) | Prototype |
| SOLID Quarter | [Liskov Substitution](site/playrooms/liskov-substitution/index.html) | Prototype |
| SOLID Quarter | [Interface Segregation](site/playrooms/interface-segregation/index.html) | Prototype |
| SOLID Quarter | [Dependency Inversion](site/playrooms/dependency-inversion/index.html) | Prototype |
| Network Highway | [DNS](site/playrooms/dns/index.html) | Prototype |
| Network Highway | [TCP](site/playrooms/tcp/index.html) | Prototype |
| Network Highway | [HTTP](site/playrooms/http/index.html) | Prototype |
| Network Highway | [TLS](site/playrooms/tls/index.html) | Prototype |
| Database Vault | [Indexes](site/playrooms/indexes/index.html) | Prototype |
| Database Vault | [Joins](site/playrooms/joins/index.html) | Prototype |
| Database Vault | [Transactions](site/playrooms/transactions/index.html) | Prototype |
| Database Vault | [Isolation Levels](site/playrooms/isolation-levels/index.html) | Prototype |

Every playroom follows the same loop: **see it → break it → fix it → code it (C#, Java, TypeScript) → interview check**.

## Project layout

```
site/                     Static site (deploy root)
  index.html              Temporary home, redirects to the first playroom
  playrooms/<concept>/    One folder per playroom
docs/
  ROADMAP.md              Name, domains and roadmap
```

## Run locally

The site is plain HTML with no build step. Open `site/playrooms/dependency-injection/index.html` in a browser, or serve the folder:

```bash
npx serve site
```

## Deploy

- **Railway:** `Staticfile` tells Railpack to serve the `site` folder as a static site. No build or start command needed.
- **Cloudflare Pages:** set the build output directory to `site` and leave the build command empty.

## How a playroom is built

`site/assets/playroom.js` is the lesson engine. It builds the page chrome (steps, story,
controls, status line, code column, interview check, navigation) and runs the loop.
`site/assets/playroom.css` holds the shared look, and `site/assets/sequence.js`
draws the lane-and-arrow diagrams used where time matters.

A playroom page supplies only its own content: the stage artwork as inline SVG, the text
for each step, the code samples per language, and what each control does.

```js
Playroom({
  district, title, dek, steps, stage, park,
  state,              // playroom-specific state
  story, controls,    // html for the current step
  statusLine, files, note,
  onStage, onStep, onClick, reset,
  quiz, soundbite
});
```

To share a playroom as a single file (for a Claude artifact or an email):

```bash
node tools/build-artifact.js site/playrooms/factory-method/index.html out.html --base https://runtimecity.com
```

## Navigation

Every page carries the same sticky top bar (`site/assets/nav.js`): the wordmark
links home, the breadcrumb shows district and playroom, and **All playrooms**
opens the whole city with the current room marked and ticks against the ones
this visitor has finished.

Progress is stored in the visitor's own browser with `localStorage`. The home
page uses it for the ticks and for a "pick up where you left off" link, and
`site/404.html` carries the same bar.

## The city map

`site/assets/city.js` lists every district and playroom, in order. It is the only
place that knows the map: the engine reads it for breadcrumbs, the district line
and the next-playroom hand-off, and the home page is generated from it.

```bash
node tools/build-index.js     # rewrites site/index.html from the map
```

Adding a playroom: create `site/playrooms/<slug>/index.html`, add it to the
district's `playrooms` array in `city.js`, then run the command above.
