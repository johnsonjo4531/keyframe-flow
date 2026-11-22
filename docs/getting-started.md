---
title: Getting Started
group: Getting Started
order: 1
---

# Getting Started

keyframe-flow lets you describe motion once and replay it anywhere — in a
browser, in Node.js, or in your own render loop. This guide takes you from an
empty project to a running animation.

> [!NOTE]
> The internal design rationale lives in the
> [vision document](https://github.com/johnsonjo4531/keyframe-flow/blob/main/design-docs/vision.md).
> Guides here link to its sections (like §5) rather than duplicating them.

## Install

```sh
npm install keyframe-flow
```

The package ships ES modules with bundled type definitions. There is no
browser-only entry point — the same import works in Node.js.

## Your first animation

An animation has three parts: a **definition** (what moves), a **playback**
(when and how it plays), and an optional **render target** (where it appears).

```ts
import { Animation, transform, target } from "keyframe-flow";

// 1. A definition — immutable, reusable, no execution state.
const slide = Animation.from({
  from: transform(), // identity: position (0,0,0), no rotation, scale 1
  to: transform().translate(100, 50), // move +100 x, +50 y
  duration: 800, // milliseconds
  easing: "ease-out-cubic",
});

// 2. A playback — an independent instance with its own time and lifecycle.
const box = document.querySelector(".box")!;
const playback = slide.attach(target.html(box));

// 3. Drive it.
playback.play();
await playback.finished; // { status: "finished" } — never rejects
```

`target.html(element)` writes CSS `matrix3d()` transforms onto the element.
Swap in `target.svg(gElement)`, `target.canvas(ctx2d)`, or your own object —
see [Render adapters & custom targets](../render-adapters/).

The example below is live — press play, pause, reset, and reverse right here:

```iframe
//johnsonjo4531.github.io/keyframe-flow/storybook/iframe.html?id=guides-getting-started--first-animation title="Live demo — the snippet above, running: definition + playback + HTML target" height=470 themed=false

```

[▶ Vanilla TypeScript implementation](https://johnsonjo4531.github.io/keyframe-flow/examples/#/example/guides-getting-started--first-animation)

The embed runs exactly the code above — press play, pause, reset, and
reverse right here. [Open in Storybook](https://johnsonjo4531.github.io/keyframe-flow/storybook/?path=/story/guides-getting-started--first-animation)
shows the same example with its full source and explanation.

## Sample without playing

Manual sampling is first-class: definitions can be evaluated at any time with
no scheduler, no playback instance, and no render target (§10). This is the
hook for hosts that already run their own frame loop.

```ts
const halfway = slide.sample(400); // Transform at t = 400 ms
const normalized = slide.sampleProgress(0.5); // same transform — 0.5 of 800 ms
const matrix = halfway.toMatrix(); // Matrix4 for your own upload path
```

`sample(ms)` and `sampleProgress(p)` evaluate the identical timeline; inputs
outside `[0, duration]` or `[0, 1]` clamp to the boundaries.

The live example below samples the very same `slide` definition from its
time in an external `requestAnimationFrame` loop that calls `slide.sample(t)`
itself — the library runs no playback at all:

```iframe
//johnsonjo4531.github.io/keyframe-flow/storybook/iframe.html?id=guides-getting-started--sample-without-playing title="Live demo — the same slide definition, sampled by a host rAF loop" height=420 themed=false

```

[▶ Vanilla TypeScript implementation](https://johnsonjo4531.github.io/keyframe-flow/examples/#/example/guides-getting-started--sample-without-playing)

[Open in Storybook](https://johnsonjo4531.github.io/keyframe-flow/storybook/?path=/story/guides-getting-started--sample-without-playing)
for the full source of the host loop.

## The three-object model

| Object        | Role                                           | Mutable?                             | Reusable?                                                 |
| ------------- | ---------------------------------------------- | ------------------------------------ | --------------------------------------------------------- |
| `Animation`   | Describes motion (keyframes, duration, easing) | No — frozen after `Animation.from()` | Yes — attach as many playbacks as you like                |
| `Playback`    | Executes one run: time, direction, rate, state | Yes — its own execution state        | One lifecycle; create a new instance to restart cleanly   |
| Render target | Receives evaluated `Matrix4` values            | Host-owned                           | Yes — the latest playback owns it (replacement semantics) |

Keeping these separate is what makes definitions shareable across playbacks
and targets swappable without touching animation code (Appendix B.1).

## What to read next

- [Core concepts & coordinate conventions](../core-concepts/) — the math
  contract: handedness, column vectors, Euler order, composition order.
- [Animation authoring](../animation-authoring/) — from/to, property-level,
  keyframes, and generator sources.
- [Easing & interpolation](../easing-interpolation/) — named easings, custom
  curves, SLERP, and full-revolution rotation tracks.
- [Playback & lifecycle](../playback-lifecycle/) — the full state machine,
  rates, repetition, and disposal.
- [Render adapters & custom targets](../render-adapters/) — HTML, SVG, Canvas,
  WebGL, WebGPU, and rolling your own.
- [React Integration](../react-integration/) — `useKeyframePlayback` and
  `<Animated>` from the `keyframe-flow/react` subpath.

Live versions of every example run in the
[Storybook examples](../../storybook/).
