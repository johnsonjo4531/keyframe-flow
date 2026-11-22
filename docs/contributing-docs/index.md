---
title: Contributing Docs
kind: guide
group: Project
order: 1
---

# Contributing Docs

Everything on the documentation site is generated or authored in this repository — no hosted CMS, no manual HTML. This page documents the pipeline.

## What lives where

| Path                                | Role                                      | Built by                            |
| ----------------------------------- | ----------------------------------------- | ----------------------------------- |
| `docs/*.md`                         | User-facing guides (authored)             | copied into the API reference build |
| `README.md`                         | Library landing page (GitHub + docs home) | same                                |
| `typedoc.json`                      | API reference + theme configuration       | —                                   |
| `site/docs/`                        | Generated API reference & guides          | `make build-docs`                   |
| `examples/.storybook/`              | Storybook config                          | —                                   |
| `examples/stories/**/*.stories.tsx` | Live examples (authored)                  | —                                   |
| `site/storybook/`                   | Built Storybook                           | `make build-storybook`              |
| `docs/embed-host-rewrite.js`        | Embed-preview shim (no-op on Pages)       | copied into `site/docs/`            |
| `docs/site-index.html`              | Combined-site landing page                | copied by deploy target             |
| `site/`                             | Whole staging site                        | both targets                        |

The published site is a single GitHub Pages deployment: guides + API reference at `/keyframe-flow/docs/`, examples at `/keyframe-flow/storybook/`, and the landing page at the root.

## Building locally

```sh
make build-docs # TypeDoc + clean-jsdoc-theme v5 → site/docs
make build-storybook # Storybook (React/Vite) → site/storybook
```

Preview the combined site after also copying the landing page:

```sh
cp docs/site-index.html site/index.html && touch site/.nojekyll
npx serve site
```

`site/` is generated output — never edit files inside it directly, and never commit it.

<Callout type="info">
  The theme emits `_assets/` and `_islands/` directories. Jekyll (which runs on GitHub Pages by default) strips underscore-prefixed paths, so the deploy target always stages a `.nojekyll` marker at the site root. Without it the deployed site renders unstyled.
</Callout>

## Docs base paths

GitHub Pages hosts this project under `/keyframe-flow/`, and every base path must agree:

- `typedoc.json → cleanJsdocTheme.basePath`: `/keyframe-flow/docs` (the API reference lives in a sub-path of the site, not its root).
- Storybook build: output served from `/keyframe-flow/storybook/`; builder-vite emits fully relative asset URLs, so the site is portable under any mount path (no `--base-path` flag exists in Storybook 10).
- Guide links to other sites/pages use **relative** paths (`../../storybook/…`) so they resolve identically from any docs sub-page. (Root-absolute hrefs written in guide Markdown are rewritten by the theme relative to `basePath` — `/keyframe-flow/storybook/…` ends up as `/keyframe-flow/docs/keyframe-flow/storybook/…` — so avoid them in prose.)

## Authoring guides

Guides are Markdown with flat frontmatter for sidebar placement:

```markdown
---
title: Playback & Lifecycle
group: Guides
order: 4
---
```

- `group` must appear in `cleanJsdocTheme.docGroups` (typedoc.json) to control section order; unlisted groups are appended.

- `order` sorts within the group.

- Cross-link symbols with `{@link SymbolName}` — the theme resolves them to real API pages at build time. Unresolved namepaths silently render as inline code, so after adding links, grep the built HTML:

  ```sh
  grep -r "{@link" site/docs --include=index.html # must find nothing outside source listings and this file's own code samples
  ```

- Keep guides user-facing; design rationale stays in [`design-docs/vision.md`](https://github.com/johnsonjo4531/keyframe-flow/blob/main/design-docs/vision.md) and is referenced by section number (§5, §17, …), not duplicated.

## Playable examples in guides

Guides embed live Storybook stories so readers can run the example without leaving the page. The theme renders a fenced `iframe` block into a sandboxed embed (`allow-scripts allow-same-origin`); its config grammar is `<url> key=value`:

````markdown
```iframe
//johnsonjo4531.github.io/keyframe-flow/storybook/iframe.html?id=targets-html-adapter--matrix-3-d title="Live demo — HTML adapter" height=470 themed=false
```
````

Conventions:

- **Protocol-relative URL pinned to the published host** (`//johnsonjo4531.github.io/…`): the theme only accepts `https://` or `//` URLs, and on GitHub Pages this resolves same-origin to the published Storybook. Locally, `build-docs` injects `docs/embed-host-rewrite.js`, a no-op on GitHub Pages that rewrites such URLs to same-origin paths so a locally served copy of `site/` previews embeds against the local build.
- Point at `storybook/iframe.html?id=<story-id>` — the bare story canvas with its transport buttons (play/pause/reset/reverse/cancel), so the embed is playable. The full story page additionally exposes arg controls, so pair each embed with an "Open in Storybook" link using the manager's **canonical** route form: `[Open in Storybook](https://johnsonjo4531.github.io/keyframe-flow/storybook/?path=/story/<story-id>)`. A bare `?id=<story-id>` does **not** work: the manager ignores it, lands on whichever story was opened first, and produces a broken canvas. Use absolute published-host URLs (like embeds do) — relative `../../storybook/` links resolve wrong when a server serves guide pages without a trailing slash, and the theme rewrites root-relative `/…` paths under its own docs base.
- **Pair every embed with a Vanilla TypeScript link.** Storybook runs on one UI renderer per build (`react-vite`), so plain-TypeScript stories can't live beside the React ones; the vanilla twins instead ship in a standalone Vite gallery at `/keyframe-flow/examples/` (built by `make build-gallery` from `examples/gallery/`). Every example module under `examples/vanilla/` imports only `keyframe-flow` and DOM APIs — never React. Gallery ids mirror Storybook story ids, so each embed gains a relative link below it: `[▶ Vanilla TypeScript implementation](https://johnsonjo4531.github.io/keyframe-flow/examples/#/example/<story-id>)`. To add an example: write the vanilla mount in `examples/vanilla/`, register it (id, title, section, args mirroring the story defaults, both sources via Vite `?raw` imports) in `examples/gallery/examples.ts`, and add the docs link.
- `themed=false` opts out of the theme's automatic `?theme-id=` append (the URL already carries a query string; Storybook manages its own theme).
- Height: \~380 px for canvas-only stories, \~470 px when transport buttons and a state readout render below the animation.

Embeds resolve against the built Storybook, so a docs page's embeds only work when both surfaces are built (`make build`). To preview the whole site — docs, Storybook, and the examples gallery — under the path prefix the published URLs use, run:

```sh
make preview-site   # http://localhost:4173/keyframe-flow/
```

The target symlinks `site/` into `.preview/keyframe-flow/` (the site's absolute `/keyframe-flow/` base paths need that name at the served root) and serves it with Python's stdlib server, so nothing else needs to run. Avoid "clean URL" static hosts like `serve`: they 301-redirect `*.html` requests to extensionless paths and **drop query strings**, which breaks Storybook's `iframe.html?id=<story-id>` embeds ("No Preview"). GitHub Pages keeps query strings, so published embeds are unaffected.

## JSDoc rules for public exports

Every public export needs a description, `@param`/`@returns` where it takes arguments or returns values, at least one runnable `@example`, and `{@link}` references to related symbols. The TypeDoc build runs with theme `strict: true` and must stay **warning-free** — treat any new warning from `make build-docs` as a broken build. Common sources:

- A public signature referencing an undocumented, unexported type (export it or document it).
- `{@link}` targets that don't exist in the export graph.
- Relative Markdown links pointing at files outside the docs inputs.

## Storybook stories

Stories live in `examples/stories/` and mount a real keyframe-flow animation into a React host with working controls (duration, easing, play/pause). Add a story when a feature ships without one; naming follows the guide structure (e.g. `Playback/Lifecycle`).

The Code panel is enabled globally (`parameters.docs.codePanel: true` in `.storybook/preview.tsx`, backed by the `@storybook/addon-docs` addon) so each story shows its source next to the canvas. Storybook's auto-generated snippet collapses to a minified `<l …/>` tag in production builds, so an `enforce: "pre"` Vite plugin (`injectStorySourcePlugin` in `.storybook/main.ts`) appends each story file's verbatim TSX into `meta.parameters.docs.source.code`. If you add a new story file, keep the `const meta = …; export default meta;` shape — that is what the plugin looks for.

## LLM-friendly indexes (llms.txt)

The theme publishes the docs for AI tools automatically (`llmsTxt: true` in `typedoc.json`, which requires `siteUrl`): every build emits `llms.txt` — an [llms.txt](https://llmstxt.org) index, one section per sidebar group, each entry linking the page's companion Markdown with its description — and `llms-full.txt`, all page bodies concatenated. Both land at the docs root (`/keyframe-flow/docs/llms.txt`) and are linked from the header menu, the README, and the Getting Started guide.

Contributors get this for free: every content page already ships a companion `index.md` beside its HTML (append `index.md` to any page URL), and new guides or API pages appear in both indexes automatically — grouped by their sidebar group (`group:` frontmatter / `@category`). Source-file viewer pages are never listed. If the site ever gains locales, each locale gets its own files.

## Deploy

```sh
make github_pages_deploy
```

Builds docs, Storybook, and the examples gallery into `site/`, stages the landing page + `.nojekyll`, and publishes `site/` to the `gh-pages` branch via `gh-pages`. The workflow is purely Makefile-driven — no CI file needed for now.
