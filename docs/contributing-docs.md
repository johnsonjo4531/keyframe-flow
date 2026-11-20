---
title: Contributing Docs
group: Project
order: 1
---

# Contributing Docs

Everything on the documentation site is generated or authored in this
repository — no hosted CMS, no manual HTML. This page documents the pipeline.

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
| `docs/site-index.html`              | Combined-site landing page                | copied by deploy target             |
| `site/`                             | Whole staging site                        | both targets                        |

The published site is a single GitHub Pages deployment: guides + API
reference at `/keyframe-flow/docs/`, examples at `/keyframe-flow/storybook/`,
and the landing page at the root.

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

`site/` is generated output — never edit files inside it directly, and never
commit it.

> [!IMPORTANT]
> The theme emits `_assets/` and `_islands/` directories. Jekyll (which runs
> on GitHub Pages by default) strips underscore-prefixed paths, so the deploy
> target always stages a `.nojekyll` marker at the site root. Without it the
> deployed site renders unstyled.

## Docs base paths

GitHub Pages hosts this project under `/keyframe-flow/`, and every base path
must agree:

- `typedoc.json → cleanJsdocTheme.basePath`: `/keyframe-flow/docs` (the API
  reference lives in a sub-path of the site, not its root).
- Storybook build: output served from `/keyframe-flow/storybook/`; builder-vite
  emits fully relative asset URLs, so the site is portable under any mount
  path (no `--base-path` flag exists in Storybook 10).
- Guide links to other sites/pages use root-absolute paths
  (`/keyframe-flow/storybook/…`) so they resolve identically from any docs
  sub-page.

## Authoring guides

Guides are Markdown with flat frontmatter for sidebar placement:

```markdown
---
title: Playback & Lifecycle
group: Guides
order: 4
---
```

- `group` must appear in `cleanJsdocTheme.docGroups` (typedoc.json) to control
  section order; unlisted groups are appended.
- `order` sorts within the group.
- Cross-link symbols with `{@link SymbolName}` — the theme resolves them to
  real API pages at build time. Unresolved namepaths silently render as inline
  code, so after adding links, grep the built HTML:

  ```sh
  grep -r "{@link" site/docs --include=index.html # must find nothing outside source listings and this file's own code samples
  ```

- Keep guides user-facing; design rationale stays in
  [`design-docs/vision.md`](https://github.com/johnsonjo4531/keyframe-flow/blob/main/design-docs/vision.md)
  and is referenced by section number (§5, §17, …), not duplicated.

## JSDoc rules for public exports

Every public export needs a description, `@param`/`@returns` where it takes
arguments or returns values, at least one runnable `@example`, and `{@link}`
references to related symbols. The TypeDoc build runs with theme `strict: true`
and must stay **warning-free** — treat any new warning from `make build-docs`
as a broken build. Common sources:

- A public signature referencing an undocumented, unexported type (export it
  or document it).
- `{@link}` targets that don't exist in the export graph.
- Relative Markdown links pointing at files outside the docs inputs.

## Storybook stories

Stories live in `examples/stories/` and mount a real keyframe-flow animation
into a React host with working controls (duration, easing, play/pause). Add a
story when a feature ships without one; naming follows the guide structure
(e.g. `Playback/Lifecycle`).

## Deploy

```sh
make github_pages_deploy
```

Builds docs and Storybook into `site/`, stages the landing page + `.nojekyll`,
and publishes `site/` to the `gh-pages` branch via `gh-pages`. The workflow is
purely Makefile-driven — no CI file needed for now.
