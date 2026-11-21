fix(storybook): rewind-and-replay forward; repair WebGL/WebGPU stories (T48–T49)

Two Storybook fixes, both found and verified through the Playwright MCP server.

Add a reset control to every transport-bearing example:
- useKeyframePlayback now exposes reset(): seek to progress 0 AND restore
  forward direction. §12 restarts a run in its current direction, so a reversed
  instance would replay backwards — reset flips it back first, guaranteeing the
  next play() runs 0 → 1.
- Wired into the shared Transport component, so all 14 stories using it gain the
  button with no per-story changes.
- Controls now share one rAF handle and kick the state-mirror loop on every
  action; previously that loop stopped whenever playback left "running", so a
  play-after-finish, reset, or seek left the readout showing stale time/state.

Fix the WebGL and WebGPU target stories (they rendered nothing):
- Root cause: both call useKeyframePlayback but never attached its hostRef to
  any element, so the hook's effect early-returned on a null host — no playback
  instance was ever created, transport buttons silently did nothing, and the
  uniform upload/write readouts stayed empty.
- Both now attach hostRef to their layout wrapper (the custom-target pattern:
  host for layout only; the GPU adapters ignore it).

Fix a latent engine defect the GPU work surfaced (playback.ts):
- Button-restarted runs could finish instantly. A frame callback can deliver a
  timestamp older than the anchor captured in play() (input dispatched inside an
  already-started frame); a run always begins exactly on a timeline boundary, so
  even a few ms of negative delta crossed the opposite boundary and completed it
  in one step. onEngineUpdate now ignores non-forward timestamps (§16) without
  double-counting the skipped interval. Two unit regression tests added (boundary
  restart with stale timestamp; mid-run out-of-order frame) — Node suite 247.

Verified against the rebuilt static Storybook: all 18 stories render, every
transport shows reset, and a reverse → reset → play round trip advances t from 0
to duration forward on both GPU targets, zero console errors. Unit (247),
browser (20), examples tsc, lint, format, and type checks all green.
