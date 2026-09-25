# Runtime City

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
`site/assets/playroom.css` holds the shared look.

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
node tools/build-artifact.js site/playrooms/factory-method/index.html out.html
```
