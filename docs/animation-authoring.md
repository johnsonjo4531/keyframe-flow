---
title: Animation Authoring
group: Guides
order: 2
---

# Animation Authoring

`Animation.from()` accepts several definition styles — they all produce the
same immutable, normalized timeline (§5). An `Animation` is a description: it
holds no execution state, so one definition can back any number of playback
instances and sampling calls.

## From/to definitions

The simplest shape gives an explicit start and end transform over a duration
in milliseconds (§5.2):

```ts
const fadeUp = Animation.from({
  from: transform().translate(0, 20),
  to: transform(),
  duration: 300,
});
```

Durations must be finite and non-negative; `duration: 0` is legal and renders
the terminal value immediately (§6.2).

## Property-level definitions

You rarely need a full transform on both ends — specify only the properties
that change, and everything else is preserved from the start (or from
documented identity defaults when `from` is omitted) (§7):

```ts
// Rotates 90° about Z while x slides 0 → 100; y/z and scale stay put.
const slideTurn = Animation.from({
  from: { position: [0, 40, 0], rotation: [0, 0, 0] }, // Euler radians (§4.3)
  to: { position: [100, 40, 0], rotation: [0, 0, Math.PI / 2] },
  duration: 600,
});

// No `from` at all: starts from identity.
const grow = Animation.from({ to: { scale: 1.5 }, duration: 250 });
```

## Keyframe definitions

Explicit keyframes use **normalized** timestamps in `[0, 1]` — they are
fractions of the timeline, independent of `duration` (§6.1). Re-timing an
animation never requires rewriting its keyframes:

```ts
const bounce = Animation.from({
  duration: 1200,
  keyframes: [
    { at: 0, transform: transform().translate(0, -100) },
    { at: 0.6, transform: transform() },
    { at: 0.75, transform: transform().translate(0, -30) },
    { at: 0.9, transform: transform() },
    { at: 1, transform: transform() },
  ],
});
```

Validation is eager and strict (§6.3): timestamps must be finite, in `[0, 1]`,
and **strictly increasing** — duplicates or out-of-order entries throw at
`Animation.from()` time rather than being silently reordered. An empty source
throws; a single keyframe produces a constant animation.

## Generators and iterables

Any synchronous iterable works as a keyframe source — arrays, `Map`s,
generator functions, generator instances (§5.3–§5.5). The source is consumed
**eagerly and exactly once**, when `Animation.from()` runs; the normalized
timeline is frozen and shared thereafter:

```ts
function* orbitKeyframes(count: number) {
  for (let i = 0; i <= count; i++) {
    const angle = (i / count) * Math.PI * 2;
    yield {
      at: i / count,
      transform: transform().translate(Math.cos(angle) * 80, Math.sin(angle) * 80),
    };
  }
}

const orbit = Animation.from({
  duration: 4000,
  keyframes: orbitKeyframes(24), // runs once, here — not during playback
});
```

Asynchronous iterables are rejected explicitly: normalization must complete
synchronously so sampling is always available and deterministic.

## Composition: combine and group

Independent animations can be composed instead of hand-authoring one big
timeline (§14). `Animation.combine` merges by **property track**: each input
only overrides the properties it actually animates, later inputs win
overlaps, and shorter inputs hold their final value after completing.

```ts
const move = Animation.from({ to: { position: [200, 0, 0] }, duration: 1000 });
const spin = Animation.from({ to: { rotation: [0, Math.PI, 0] }, duration: 1000 });
const pulse = Animation.from({ to: { scale: 1.4 }, duration: 500 });

// One animation that moves AND turns AND pulses — no merged keyframes needed.
const composed = Animation.combine([move, spin, pulse]);
```

`Animation.group` builds timelines: children play **back to back** by default
(sequence), or simultaneously with the same property-merge semantics as
combine (`layout: "parallel"`). Groups are ordinary `Animation` values, so
they nest freely (§14, §19):

```ts
const entrance = Animation.group([move, spin]); // one after the other
const scene = Animation.group([entrance, pulse]); // groups inside groups
```

## What to read next

- [Easing & interpolation](../easing-interpolation/) — how values move
  _between_ keyframes.
- [Playback & lifecycle](../playback-lifecycle/) — running definitions.

Live versions of every style run in the
[Storybook examples](../../storybook/).
