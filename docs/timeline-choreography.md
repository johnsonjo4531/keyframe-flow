---
title: Timeline & Choreography
group: Guides
order: 6
---

# Timeline & Choreography

An `Animation` describes **one** thing moving over its own time axis. A
`Timeline` schedules **several** animations — and other timelines — over a
**single shared time axis** (§3.7, §14.1). It changes nothing about what an
animation, playback, scheduler, or render target means; it only adds the layer
that decides _when each definition runs and on which target_.

```ts
import { Animation, Timeline, target } from "keyframe-flow";

const scene = Timeline.sequence([
  { animation: logoIn, target: target.html(logoEl) },
  { animation: headingIn, target: target.html(headingEl) },
]);

scene.attach({ autoplay: true }); // one playback for the whole composition
```

## Definition vs. execution (§3.7, Appendix B.1)

The same boundary the rest of the library keeps is preserved exactly:

|                      | `Timeline` (definition)                          | `TimelinePlayback` (execution)           |
| -------------------- | ------------------------------------------------ | ---------------------------------------- |
| Created by           | `Timeline.from/sequence/parallel/repeat/stagger` | `timeline.attach(options)`               |
| Holds                | frozen child entries + placement                 | shared time, direction, rate, lifecycle  |
| Mutates over time    | never                                            | every frame                              |
| Touches DOM / timers | no — pure data (§2)                              | through the shared `PlaybackEngine` only |
| Can be reused        | yes, by any number of playbacks                  | one run at a time per instance           |

A timeline is **sampleable with no scheduler at all**: `timeline.sample(t)` is a
pure function of time. Playback is just one way to walk that function.

## Placing children (§14.1)

`Timeline.from` places named children at absolute times on the shared axis:

```ts
const intro = Timeline.from({
  logo: { animation: logoIn, target: target.html(logoEl), at: 0 }, // ms, default 0
  heading: { animation: headingIn, target: target.html(headingEl), at: 400 },
});
```

`Timeline.sequence` places children back to back using each child's **intrinsic**
duration, with an optional `gap` between them. Placement never re-times or
normalizes a child — a 350 ms animation stays a 350 ms animation no matter where
it lands:

```ts
const entrance = Timeline.sequence(
  [
    { animation: logoIn, target: target.html(logoEl) }, // 0 … 350
    { animation: headingIn, target: target.html(headingEl) }, // 350 + gap …
    { animation: subtitleIn, target: target.html(subtitleEl) },
  ],
  { gap: 120 },
);
```

Three rows entering in order, each inside its own window while shared time runs
straight through:

```iframe
//johnsonjo4531.github.io/keyframe-flow/storybook/iframe.html?id=timeline-sequence--entrance title="Live demo — Timeline.sequence entrance" height=470 themed=false

```

[▶ Vanilla TypeScript implementation](https://johnsonjo4531.github.io/keyframe-flow/examples/#/example/timeline-sequence--entrance)

[Open in Storybook](https://johnsonjo4531.github.io/keyframe-flow/storybook/?path=/story/timeline-sequence--entrance)
to change the gap.

`Timeline.parallel` starts children together and lets each keep its own
duration — nothing is stretched to match anything else:

```ts
const scene = Timeline.parallel([
  { animation: Timeline.repeat(spin, { iterations: "infinite" }), target: ring },
  { animation: cardIn, target: card }, // finite children inside an endless scene
]);
```

The infinite child makes the composition's duration infinite (§14.3), so the run
never completes on its own — but the finite children still settle into their
final states while it keeps turning:

```iframe
//johnsonjo4531.github.io/keyframe-flow/storybook/iframe.html?id=timeline-parallel--endless-scene title="Live demo — Timeline.parallel with an infinite child" height=470 themed=false

```

[▶ Vanilla TypeScript implementation](https://johnsonjo4531.github.io/keyframe-flow/examples/#/example/timeline-parallel--endless-scene)

[Open in Storybook](https://johnsonjo4531.github.io/keyframe-flow/storybook/?path=/story/timeline-parallel--endless-scene)
to change the loop length.

Timelines nest: any `Timeline` is a legal child of another, so large scenes are
built from smaller ones and composed without a special grouping node.

## Stagger (§14.1)

`Timeline.stagger(child, items, { delay })` gives one definition to many targets,
each starting one interval after the previous. It is **not** a runtime concept —
it compiles to ordinary scheduled entries at `i × delay`, exactly like hand-written
placement:

```ts
const fan = Timeline.stagger(
  Animation.from({ from: { position: [-260, 0, 0] }, to: { position: [0, 0, 0] }, duration: 450 }),
  cards.map((card) => target.html(card)), // or a count: Timeline.stagger(anim, 5, …)
  { delay: 100, order: "forward" }, // "reverse" flips which index starts first
);
// duration = (count − 1) × delay + childDuration
```

Five cards fanning in — drag the interval and flip the order:

```iframe
//johnsonjo4531.github.io/keyframe-flow/storybook/iframe.html?id=timeline-stagger--card-fan title="Live demo — Timeline.stagger card fan" height=470 themed=false

```

[▶ Vanilla TypeScript implementation](https://johnsonjo4531.github.io/keyframe-flow/examples/#/example/timeline-stagger--card-fan)

[Open in Storybook](https://johnsonjo4531.github.io/keyframe-flow/storybook/?path=/story/timeline-stagger--card-fan)
for the `order` control.

## Repetition (§13.1, §14.2)

Repetition uses one consistent options shape everywhere — on entries, on
`Timeline.repeat`, and on playbacks:

- **`iterations`** counts _total_ iterations including the first: `1` (default),
  any positive integer, or `"infinite"` (`Infinity`) for a loop that never
  completes.
- **`direction`** is `"normal"`, `"reverse"`, `"alternate"`, or
  `"alternate-reverse"`. Alternate ping-pongs _progress_ — it never snaps back to
  the beginning between passes.
- **`delay`** is a gap **between** iterations; it never delays the first one.

```ts
const pulse = Timeline.repeat(
  { animation: scaleUp, target: target.html(dotEl) },
  { iterations: 6, direction: "alternate" },
);
```

Because `Timeline.repeat` wraps its child in a **single compact entry** rather
than expanding it into copies, repeating an entire choreography is cheap, and
outer repeats compose with child repeats independently:

```ts
const loop = Timeline.repeat(entrance, { iterations: 3, delay: 300 });
// window = D × N + R × (N − 1) — here the sequence's duration × 3 plus two gaps
```

During a repeat-delay gap the just-finished iteration holds its terminal values,
so nothing flickers back to the authored start while the gap elapses:

```iframe
//johnsonjo4531.github.io/keyframe-flow/storybook/iframe.html?id=timeline-repeat--repeated-choreography title="Live demo — a repeated sequence with delay gaps" height=470 themed=false

```

[▶ Vanilla TypeScript implementation](https://johnsonjo4531.github.io/keyframe-flow/examples/#/example/timeline-repeat--repeated-choreography)

[Open in Storybook](https://johnsonjo4531.github.io/keyframe-flow/storybook/?path=/story/timeline-repeat--repeated-choreography)
— switch the story to `pulse` to watch an alternating ping-pong instead.

## Duration and infinite children (§14.3)

A finite timeline's duration is the farthest horizon any child reaches:

```text
entryDuration = D × N + R × (N − 1)   // D = child duration, N = iterations, R = repeat delay
duration      = max over entries of (at + entryDuration)
```

Rules that follow directly from that:

- An **infinite `parallel` child** (or an infinite final sequence child) makes the
  whole composition's `duration` `Infinity`. Nothing completes naturally; only
  `cancel()`/`dispose()` end the run.
- A **non-final infinite sequence child** is rejected at construction with a
  `RangeError`: every later sibling would be unreachable, which is almost always
  a mistake rather than an intention.
- Repeating or reversing an **infinite-duration child** is rejected too — a second
  iteration is unreachable and reversed time has no horizon to count back from.

## Deterministic sampling (§14.4)

`sample(timeMs)` evaluates the composition as a pure function of shared time. For
every entry that has started, `childLocalTime = timeMs − childStart`, and outputs
flatten into plain samples:

```ts
scene.sample(200);
// [{ name: "heading", target, localTime: 50, transform }, …]
scene.sampleProgress(0.25); // same mapping over normalized progress [0, 1]
```

What the mapping guarantees:

- **Unstarted children produce nothing** — no sample, not a zeroed one.
- **Completed children clamp** to their endpoint behavior; repeat-delay gaps hold
  the terminal value of the iteration that just ended.
- **Nested timelines flatten.** Inner outputs keep their own names and targets;
  an unbound inner output inherits the wrapping entry's target, so wrapping a
  bound child in `Timeline.repeat` keeps its placement binding.
- **Same-target conflicts resolve by schedule order, never additively** — the last
  scheduled writer wins, exactly like playback supersede (§14).

This makes timelines usable without any playback at all: scrub a scene from your
own render loop, or drive it from a scroll position, by sampling and applying
transforms yourself.

## Timeline playback on the shared scheduler (§16.1)

`timeline.attach()` creates one `TimelinePlayback` for the whole composition. It
registers as **a single scheduled unit** on the centralized `PlaybackEngine`, and
every child derives its local time from that one shared clock — children never
create their own clocks or frame requests, so a 40-element scene costs exactly one
scheduled callback:

```ts
const playback = scene.attach({ autoplay: true, playbackRate: 1.5 });

playback.currentTime; // shared timeline position in ms
playback.iterationCount; // playback-level iteration index (§13.1)
playback.pause();
playback.seek(1200); // jump the whole composition to t = 1200
playback.seekProgress(0.5);
playback.playbackRate = 0.25; // scales future deltas, never jumps time
playback.reverse();
await playback.finished; // { status: "finished" } | { status: "cancelled" }
playback.dispose(); // releases target bindings only
```

Transport semantics are identical to animation playbacks (§12): the same state
machine, a `finished` promise that never rejects and is fresh per run, seek
clamping, and continuous rate changes.

Target ownership also spans both definition types. Starting a timeline supersedes
any animation playback driving a bound target (and vice versa) — the older owner
is cancelled rather than blended, since replacement, not composition, is the rule
everywhere in this library (§14). Disposal releases those bindings but never
destroys the host's elements or adapter-owned resources (Appendix B.8).

## See also

- [Playback & Lifecycle](../playback-lifecycle/) — the state machine a timeline
  playback follows, and target supersede.
- [Animation Authoring](../animation-authoring/) — building the child definitions
  a timeline schedules.
- API reference: [`Timeline`](../timeline/), [`TimelinePlayback`](../timelineplayback/).
- Live Timeline demos in the [Storybook examples](../../storybook/) and their
  [vanilla-TypeScript twins](https://johnsonjo4531.github.io/keyframe-flow/examples/).
