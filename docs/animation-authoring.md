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

```iframe
//johnsonjo4531.github.io/keyframe-flow/storybook/iframe.html?id=authoring-from-to--fade-up title="Live demo — the fadeUp snippet above, running" height=470 themed=false

```

[▶ Vanilla TypeScript implementation](https://johnsonjo4531.github.io/keyframe-flow/examples/#/example/authoring-from-to--fade-up)

[Open in Storybook](https://johnsonjo4531.github.io/keyframe-flow/storybook/?path=/story/authoring-from-to--fade-up)
to change the duration.

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

The live example scales only — position and rotation are untouched, exactly the
property-track behavior described above:

```iframe
//johnsonjo4531.github.io/keyframe-flow/storybook/iframe.html?id=authoring-property-level--scale-only title="Live demo — property-level scale-only animation" height=470 themed=false

```

[▶ Vanilla TypeScript implementation](https://johnsonjo4531.github.io/keyframe-flow/examples/#/example/authoring-property-level--scale-only)

[Open in Storybook](https://johnsonjo4531.github.io/keyframe-flow/storybook/?path=/story/authoring-property-level--scale-only)
for the full source.

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

```iframe
//johnsonjo4531.github.io/keyframe-flow/storybook/iframe.html?id=authoring-keyframes--bounce title="Live demo — the bounce keyframes above, running" height=470 themed=false

```

[▶ Vanilla TypeScript implementation](https://johnsonjo4531.github.io/keyframe-flow/examples/#/example/authoring-keyframes--bounce)

[Open in Storybook](https://johnsonjo4531.github.io/keyframe-flow/storybook/?path=/story/authoring-keyframes--bounce)
to see the five authored keyframes.

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

The orbit below is generated from a generator function — 24 keyframes laid out
on a circle, normalized once at definition time:

```iframe
//johnsonjo4531.github.io/keyframe-flow/storybook/iframe.html?id=authoring-generator-source--orbit title="Live demo — generator-produced orbit" height=470 themed=false

```

[▶ Vanilla TypeScript implementation](https://johnsonjo4531.github.io/keyframe-flow/examples/#/example/authoring-generator-source--orbit)

[Open in Storybook](https://johnsonjo4531.github.io/keyframe-flow/storybook/?path=/story/authoring-generator-source--orbit)
to read the generator function.

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

Below, `combine` merges a move, a turn, and a pulse into one animation — every
property animates at once without any merged keyframes:

```iframe
//johnsonjo4531.github.io/keyframe-flow/storybook/iframe.html?id=authoring-composition--combine-tracks title="Live demo — combined move + spin + pulse tracks" height=470 themed=false

```

[▶ Vanilla TypeScript implementation](https://johnsonjo4531.github.io/keyframe-flow/examples/#/example/authoring-composition--combine-tracks)

[Open in Storybook](https://johnsonjo4531.github.io/keyframe-flow/storybook/?path=/story/authoring-composition--combine-tracks)
for the three input animations.

## What to read next

- [Easing & interpolation](../easing-interpolation/) — how values move
  _between_ keyframes.
- [Playback & lifecycle](../playback-lifecycle/) — running definitions.
- [Timeline & choreography](../timeline-choreography/) — scheduling several animations over one
  shared time axis.
- [React Integration](../react-integration/) — `useKeyframePlayback` and
  `<Animated>` for component apps.

Live versions of every style run in the
[Storybook examples](../../storybook/).
