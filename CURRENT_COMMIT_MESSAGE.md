feat: guide-aligned Storybook examples, local-preview link fixes, gallery polish

Documentation and examples now tell one consistent story: every embedded
example runs the code printed beside it, local previews stay on localhost, and
the vanilla-TypeScript gallery gains theming and syntax highlighting.

Guide-aligned Storybook examples (T59):

- New "Guides" story section runs guide snippets verbatim:
  `guides-getting-started--first-animation` (definition + playback + HTML
  target), `guides-getting-started--sample-without-playing` (the same `slide`
  sampled by a host rAF loop — no playback, no target), and
  `guides-core-concepts--crane-vs-orbit` (composition order; endpoints
  (100, 0) vs (0, 100) make `M ← M × Op` visible).
- Embedded stories realigned with their guide snippets: from/to is now the
  guide's `fadeUp` (was slide-and-tilt), keyframes the `bounce` path (was
  zig-zag), combine the exact move/spin/pulse values, orbit the radius-80
  generator at 4000 ms, SLERP-vs-angular the 1000 ms full revolution. The two
  unrelated getting-started embeds and the core-concepts embed were replaced
  by the new guide stories.
- Every story now carries a substantive Docs description explaining what it
  demonstrates and linking its guide section; vanilla twins and gallery
  registry entries follow all new/renamed ids (21 examples).
- `Matrix4.el(index)` is public so the guides' documented column-major reads
  (`m.el(12)`) compile verbatim.

Local-preview link & embed fixes (T58):

- The docs shim now rewrites anchor links ("Open in Storybook",
  "▶ Vanilla TypeScript implementation") to same-origin paths off-GitHub-Pages,
  not just iframe srcs — local browsing no longer jumps to the published site.
- `make preview-site` serves with Python's stdlib server: `serve` 301-redirects
  `*.html` and drops query strings, which blanked every Storybook embed under
  local preview ("No Preview"). GitHub Pages keeps query strings; published
  pages unaffected.

Examples gallery polish (T60):

- Header light/dark toggle: persisted to localStorage, follows
  `prefers-color-scheme`, applied before first paint; all surfaces use CSS
  custom properties with a token palette per theme.
- Prism syntax highlighting for the TypeScript and TSX code panels.

Earlier in this batch (Milestones 9–10): React integration subpath
(`keyframe-flow/react` with `useKeyframePlayback` + `<Animated>`), standalone
vanilla-TypeScript gallery at `/keyframe-flow/examples/`, all-React-storybook
migration onto the library hook, playable docs embeds with host-rewrite shim,
canonical `?path=/story/` deep links (19 fixed, Playwright-verified), closed
markdown links, clock-stepped engine, and the new `docs/react-integration.md`
guide.

All checks green: vp check, 248 unit + 22 browser tests, zero-warning docs
build; Playwright verified all 21 story canvases render, all 20 guide embeds
load their exact stories locally, and the gallery (landing, new pages, theme
persistence, highlighting) works end to end.
