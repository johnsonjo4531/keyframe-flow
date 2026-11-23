feat: llms.txt docs indexes, guide-aligned Storybook examples, gallery polish

Documentation and examples now tell one consistent story — and both humans and
AI models can read it: every embedded example runs the code printed beside it,
local previews stay on localhost, the vanilla-TypeScript gallery gained theming
and syntax highlighting, and the whole docs set publishes as llms.txt.

LLM-readable documentation (T61):

- Enabled clean-jsdoc-theme's `llmsTxt`: the docs build emits
  `/keyframe-flow/docs/llms.txt` (llmstxt.org index — one section per sidebar
  group, every guide + API page linked to its companion Markdown with a
  description) and `llms-full.txt` (all bodies concatenated), generated from
  the same sources as the site so they never drift.
- Discoverability: pinned header menu item on every docs page, README bullet,
  a reader-facing "AI & LLM tools" section in Getting Started explaining the
  convention, and a maintainer note in contributing-docs.md (new pages join
  the indexes automatically via their companion `.md`).

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

---

feat(timeline): Timeline composition API from the vision addendum + pinned vanilla examples link

The Timeline subsystem specified in design-docs/vision.md (§3.7, §13.1,
§14.1–§14.4, §16.1, §20.1) is now implemented, and the vanilla-TypeScript
examples gallery is pinned into every docs page and the landing page (T62).

Timeline API (T63–T69):

- `Timeline` — immutable temporal composition definition over a shared time
  axis: `Timeline.from` (named absolute placement), `sequence` (back-to-back +
  gap), `parallel` (independent child durations), nesting as first-class
  children, `repeat` (compact single-entry repeat operation — never expanded)
  and `stagger` (compiles to ordinary entries at i × delay, forward/reverse).
- §13.1 repetition semantics everywhere: total iterations including the first,
  positive integers or explicit `"infinite"`/`Infinity`, normal/alternate
  (+ reverse parity), delay between iterations never before the first; alternate
  ping-pongs without snapping to the start.
- Duration & deterministic sampling (§14.3–§14.4): `duration = max(at + D×N +
  R×(N−1))`, infinite parallel/final children → infinite duration, unreachable
  infinite sequence children and repeated/reversed infinite-duration children
  rejected at construction; `sample(timeMs)` evaluates started children at
  childLocalTime = t − start with delay-gap terminal holds, endpoint clamping,
  nested flattening (unbound inner outputs inherit the wrapper's target), and
  schedule-order replacement for same-target conflicts — never additive.
- `TimelinePlayback` (§16.1): `timeline.attach()` gives full §12 transport
  parity as a single scheduled unit on the centralized engine; children derive
  local time from the shared clock (no per-child clocks, Appendix B.1); outer ×
  segment repeats compose independently. New internal target-ownership registry
  makes §14 supersede semantics work across Animation and Timeline playbacks in
  both directions; disposal never destroys adapter-owned targets (B.8).
- QA: 26 unit tests over the whole surface incl. lifecycle via ManualClock/
  ManualScheduler + supersede; full JSDoc — TypeDoc strict build is warning-free;
  exported from `keyframe-flow`; make test green (274 unit + 22 browser).

Docs & landing (T62):

- `cleanJsdocTheme.menu` gained a pinned "Vanilla TS" item linking
  `/keyframe-flow/examples/` — rendered in the header nav of every generated
  docs page, like Storybook; verified present in the built HTML.
- Landing page (`docs/site-index.html`) now carries a third card to the same
  gallery ("Framework-free — Vanilla TypeScript Examples") and the footer
  mentions all three surfaces.

Also: `vp check --fix` normalized whitespace in TODOS.md/vision.md.

---

docs(timeline): Timeline guide, Storybook section and vanilla-TypeScript twins (Milestone 15)

The Timeline API was reachable only through the generated API reference; it now
has a prose guide with playable embeds, a Storybook section demonstrating every
composition form, and framework-free twins in the examples gallery — the same
treatment as the animation surface (Milestones 6/9/10).

Guide (T72):

- `docs/timeline-choreography.md` — "Timeline & Choreography" (Guides order 6;
  React Integration → 7). Covers the definition-vs-execution boundary (§3.7,
  Appendix B.1), every authoring form with snippets matching the embedded
  stories, duration rules including `D × N + R × (N − 1)` and infinite-child
  handling (§14.3), deterministic sampling guarantees (§14.4), and shared-scheduler
  playback with §12 transport parity plus cross-definition target supersede
  (§16.1, §14). Four iframe embeds, each paired with an Open-in-Storybook link
  and a Vanilla-TypeScript gallery link; animation-authoring and
  playback-lifecycle guides now point here. Authored as `docs/timeline.md` and
  renamed: `/keyframe-flow/docs/timeline/` is the generated `Timeline` page.

Stories (T70):

- New `Timeline` story section: `Sequence/Entrance` (back-to-back rows with a
  gap control), `Parallel/EndlessScene` (infinite loop + finite children, so the
  horizon is infinite and the run never completes), `Stagger/CardFan` (interval
  and forward/reverse order), `Repeat/AlternatePulse` + `Repeat/RepeatedChoreography`
  (ping-pong without snapping; a repeated sequence holding terminal values
  across delay gaps).
- `examples/stories/timeline-story.tsx` adds the story-side `useTimelinePlayback`
  twin of `useKeyframePlayback` (attach/re-attach/dispose, frame-mirrored
  readout, forward-facing reset) — example plumbing stays out of the library.
  `Transport`/`Readout` are now structurally typed so one chrome drives both
  animation and timeline handles.

Vanilla twins (T71):

- `examples/vanilla/timeline-{sequence,parallel,stagger,repeat}.ts` — pure
  `keyframe-flow` + DOM, no React — registered as a new `Timeline` gallery
  section across five routes mirroring the story ids, with live mounts,
  story-default args and TS ↔ React source tabs. `mountTransport` in the shared
  harness now accepts a structural playback contract (`state`, `currentTime`,
  `iterationCount`, `reversed`, `finished`, transport verbs) so it drives
  `Playback` and `TimelinePlayback` alike.

Verification (T73):

- Built Storybook, gallery and docs checked with Playwright: all five stories
  animate with zero console errors/warnings; guide embeds resolve to the local
  `/keyframe-flow/storybook/` build; every gallery route mounts its live demo
  with both source tabs; the guide appears in the docs sidebar. Docs build stays
  warning-free, `make test` green (274 unit + 22 browser).
- `docs/contributing-docs.md` records the section naming and twin-registration
  conventions so future features follow the same path.

feat(examples): performance stress-test story + vanilla twin (Milestone 16)

New Performance/Stress Test example shows off how far the centralized
scheduler scales (§16): one shared infinite-alternate Animation definition
drives hundreds of independent playbacks on a single frame loop, and users
can pile on more animated elements live (+10 / +100 / custom count) without
disturbing the playbacks already running.

- examples/stories/performance/stress-test.stories.tsx: imperative stress
  field (dots via target.html, seek-based phase offsets), runtime add/clear
  controls, shared Transport driven through a fan-out PlaybackHandleLike
  group view, and a live FPS / frame-time / element-count readout that syncs
  counts immediately since rAF can stall in nested iframes.
- examples/vanilla/stress-test.ts: framework-free twin with the same
  controls, mounted through the shared harness with a TransportablePlayback
  group view; registered in examples/gallery/examples.ts under a new
  "Performance" section (id performance-stress-test--heavy-field) with TS ↔
  React source toggle.
- docs/playback-lifecycle.md: "Scaling many playbacks" section with live
  embed + Storybook/vanilla links; docs/contributing-docs.md notes the
  Performance registration convention.

Playwright-verified on both surfaces and in the docs embed: zero console
errors, live adds scale 150 → 1,750 playbacks (60 fps through ~750, graceful
degradation beyond), pause fans out to all playbacks. make test green
(274 unit + 22 browser). TODOS.md Milestone 16 / Phase 24 checked off.
