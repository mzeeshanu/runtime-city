# Runtime City

**Learn by breaking.** Runtime City is an interactive city of software engineering concepts. Each district covers a field (design patterns, memory, networking, databases), and each concept is a *playroom* where you see it working, break it, fix it, and compare the real code.

Audience: students preparing for interviews first, then early-career developers.

## Playrooms

| District | Playroom | Status |
|---|---|---|
| Pattern Park | [Dependency Injection](site/playrooms/dependency-injection/index.html) | Prototype |

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
