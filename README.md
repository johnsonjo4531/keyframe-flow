# keyframe-flow

**Define motion. Transform anything.**

keyframe-flow is a platform-independent transform and animation library for
web and Node.js. It gives you a mathematically rigorous, immutable transform
model, an expressive animation-definition layer, and a deterministic playback
engine — with rendering delegated entirely to structural adapters you can
implement yourself in three lines.

The core never touches browser APIs, so the same animation code runs in a
browser, in Node.js, in workers, or on a server. Interoperability with native
platform matrices happens through explicit conversions that preserve
mathematical meaning, never raw element copies.

## Why keyframe-flow

- **Portable by construction** — zero DOM/`window` dependencies in the core;
  runs in plain Node.js (§2 principle 1 of the design docs).
- **One coordinate convention, stated explicitly** — right-handed, column
  vectors, intrinsic `X → Y → Z` Euler order in radians, column-major matrix
  storage. See [Core concepts & coordinate conventions](https://johnsonjo4531.github.io/keyframe-flow/docs/core-concepts/.
- **Definitions are not playback** — an `Animation` is an immutable, reusable
  description; every `attach()` yields an independent `Playback` instance with
  its own time and lifecycle.
- **Manual sampling is first-class** — drive your own render loop with
  `animation.sample(ms)` / `sampleProgress(p)`; no scheduler required.
- **Composable motion** — property-level composition, groups, nested
  timelines, full-revolution rotation tracks, and easing built in.
- **Adapters, not frameworks** — HTML, SVG, Canvas 2D, WebGL, and WebGPU ship
  as adapters; any object with `setTransform(matrix)` is a valid render target.

## Install

```sh
npm install keyframe-flow
```

## Quick start

```ts
import { Animation, transform, target } from "keyframe-flow";

// Define motion once — immutable and reusable.
const slide = Animation.from({
  from: transform(),
  to: transform().translate(100, 50),
  duration: 800,
  easing: "ease-out-cubic",
});

// Play it on any render target — here a DOM element.
const playback = slide.attach(target.html(document.querySelector(".box")!));
playback.play();
await playback.finished; // resolves { status: "finished" } once complete
```

The same definition can be sampled manually with no scheduler or target at
all:

```ts
const halfway = slide.sample(400); // Transform at t = 400 ms
const matrix = halfway.toMatrix(); // Matrix4, column-major storage
```

## Documentation

- **[Documentation site](https://johnsonjo4531.github.io/keyframe-flow/docs/)** —
  guides and the full API reference.
- **[Live examples (Storybook)](https://johnsonjo4531.github.io/keyframe-flow/storybook/)** —
  every feature running in the browser.

Guides in this repository live under `docs/`:

| Guide                                                                                                      | Covers                                                     |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| [Getting started](https://johnsonjo4531.github.io/keyframe-flow/docs/getting-started/                      | Install, first animation, mental model                     |
| [Core concepts & coordinate conventions](https://johnsonjo4531.github.io/keyframe-flow/docs/core-concepts/ | Handedness, column vectors, Euler order, composition order |
| [Animation authoring](https://johnsonjo4531.github.io/keyframe-flow/docs/animation-authoring/              | From/to, property-level, keyframes, generators             |
| [Easing & interpolation](https://johnsonjo4531.github.io/keyframe-flow/docs/easing-interpolation/          | Named easings, custom curves, SLERP, angular tracks        |
| [Playback & lifecycle](https://johnsonjo4531.github.io/keyframe-flow/docs/playback-lifecycle/              | States, rates, repetition, promises, disposal              |
| [Render adapters & custom targets](https://johnsonjo4531.github.io/keyframe-flow/docs/render-adapters/     | HTML/SVG/Canvas/WebGL/WebGPU, structural targets           |
| [Contributing docs](https://johnsonjo4531.github.io/keyframe-flow/docs/contributing-docs/                  | The documentation pipeline itself                          |

Internal design rationale lives in [`design-docs/vision.md`](https://github.com/johnsonjo4531/keyframe-flow/blob/main/design-docs/vision.md) —
the source of truth the guides above link to rather than duplicate.

## Status

keyframe-flow is pre-1.0. The public API follows semantic versioning from
`0.0.0`; see [CHANGELOG.md](https://github.com/johnsonjo4531/keyframe-flow/blob/main/CHANGELOG.md).

## License

MIT © johnsonjo4531
