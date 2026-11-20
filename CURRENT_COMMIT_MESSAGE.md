
fix(timing): bind frame host methods so rAF keeps its environment receiver (T46)

Every animated Storybook story failed at play() with "TypeError: Illegal
invocation"; Playwright stack traces pinpointed the scheduler's frame-request
path in the shipped bundle.

- resolveFrameHost captured globalThis.requestAnimationFrame/
  cancelAnimationFrame as unbound references and later called them as
  methods of the plain { request, cancel } frame-host object, so Chromium
  rejected the wrong `this`. Frame functions are now wrapped so rAF/cAF
  always run with globalThis as receiver; environment resolution still
  happens at call time (§2 principle 1: no browser APIs at import time).
- Regression coverage: src/timing/scheduler.browser.test.ts drives the
  default browser path in Chromium — a real rAF tick, cancelling a pending
  frame, and full playback through the lazily created shared engine with no
  injected clock or scheduler. The suite previously only exercised the Node
  timer fallback, which is how the defect survived an otherwise green build.
- Verified with Playwright against the rebuilt static Storybook: all 18
  stories render with zero console errors (headless GL driver performance
  notes on the WebGL story are benign). Unit (245), browser (20), lint,
  format, and type checks all green.
