---
title: Animation
kind: class
longname: Animation
description: An immutable, reusable animation definition (§5.1). Definitions describe motion; they are not playback instances and hold no execution state (Appendix B.1). All keyframe sources — arrays, synchronous iterables, generator instances, and functions returning iterables — are consumed eagerly and exactly once when Animation.from() is called, producing a normalized timeline that every consumer shares (§5.5).
---

# Animation

<SourceLink href="/keyframe-flow/docs/source/animation/animation-ts/#L200" label="animation.ts:200" />

An immutable, reusable animation definition (§5.1). Definitions describe motion; they are not playback instances and hold no execution state (Appendix B.1). All keyframe sources — arrays, synchronous iterables, generator instances, and functions returning iterables — are consumed eagerly and exactly once when `Animation.from()` is called, producing a normalized timeline that every consumer shares (§5.5).

**Remarks**

Manual sampling is first-class and requires no scheduler or render target (§10); `sample(ms)` and `sampleProgress(p)` evaluate the same timeline.

Composite definitions created by [Animation.combine](/keyframe-flow/docs/animation#combine) and [Animation.group](/keyframe-flow/docs/animation#group) evaluate through property tracks and child routing instead of materialized keyframes — their `keyframes` array is empty and their inputs are exposed as [Animation.children](/keyframe-flow/docs/animation#children) (§14).

---

## Properties

<MemberHeading id="children" depth="3" name="children" sig="children: readonly Animation[]" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/animation/animation-ts/#L212" sourceLabel="animation.ts:212" />

Inputs of a composite animation (`combine`/`group`); `[]` otherwise (§14).

<MemberHeading id="duration" depth="3" name="duration" sig="duration: number" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/animation/animation-ts/#L202" sourceLabel="animation.ts:202" />

Total duration in milliseconds (§6.2).

<MemberHeading id="keyframes" depth="3" name="keyframes" sig="keyframes: readonly NormalizedKeyframe[]" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/animation/animation-ts/#L209" sourceLabel="animation.ts:209" />

The eagerly normalized, frozen timeline shared by all consumers (§5.5). Composite animations built by `combine`/`group` evaluate through their `Animation.children` instead and expose an empty timeline here.

## Accessors

<MemberHeading id="animatedproperties" depth="3" name="animatedProperties" sig="get animatedProperties(): AnimatedProperties" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/animation/animation-ts/#L438" sourceLabel="animation.ts:438" />

Which transform properties this animation actually changes (§14). Keyframe timelines compare every keyframe; composite animations sample their evaluation. Property tracks built on this detection power `Animation.combine` and parallel groups.

## Methods

<MemberHeading
  id="attach"
  depth="3"
  name="attach"
  sig="attach(
	target?: RenderTarget,
	options?: PlaybackOptions,
): Playback"
/>

<MemberMeta sourceHref="/keyframe-flow/docs/source/animation/animation-ts/#L483" sourceLabel="animation.ts:483" />

Creates an independent playback instance from this definition (§11). The instance has its own execution state and lifecycle while sharing the definition's immutable normalized timeline — definitions are not playback instances (Appendix B.1). Attachment is optional: `attach()` without a target still provides full time control (`play`, `pause`, `seek`, repetition, completion promises) for hosts that render themselves (§11).

Concurrent playbacks on the same target follow replacement semantics: the most recently started playback owns the target and supersedes the previous one without additive composition (§14).

**Parameters**

- `target` ([RenderTarget](/keyframe-flow/docs/rendertarget), optional)
- `options` ([PlaybackOptions](/keyframe-flow/docs/playbackoptions), optional)

**Returns**

- [`Playback`](/keyframe-flow/docs/playback)

**Example**

```ts
const playback = spin.attach(target.html(element), { iterations: 2 });
playback.play();
await playback.finished; // { status: "finished" } — never rejects
```

<MemberHeading id="sample" depth="3" name="sample" sig="sample(timeMs: number): Transform" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/animation/animation-ts/#L499" sourceLabel="animation.ts:499" />

Samples the timeline at elapsed milliseconds (§10.1). Out-of-range times are clamped to the animation boundaries; `sample(500)` on a 2000 ms animation is equivalent to `sampleProgress(0.25)`.

**Parameters**

- `timeMs` (number)

**Returns**

- [`Transform`](/keyframe-flow/docs/transform)

**Example**

```ts
const slide = Animation.from({ to: { position: [100, 0, 0] }, duration: 1000 });
slide.sample(500).components.position.x; // 50
slide.sample(2000).components.position.x; // 100 — clamped to the end
```

<MemberHeading id="sampleprogress" depth="3" name="sampleProgress" sig="sampleProgress(progress: number): Transform" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/animation/animation-ts/#L524" sourceLabel="animation.ts:524" />

Samples the timeline at normalized progress in `[0, 1]` (§10.2), evaluating the same underlying timeline as `Animation.sample`. Out-of-range progress is clamped to the animation boundaries. Sampling never mutates the definition and requires no scheduler or render target (§10.3).

**Parameters**

- `progress` (number)

**Returns**

- [`Transform`](/keyframe-flow/docs/transform)

**Example**

```ts
// Drive your own frame loop — sampling needs nothing else:
function draw(progress: number): void {
const matrix = slide.sampleProgress(progress).toMatrix();
gl.uniformMatrix4fv(uModel, false, matrix.toFloat32Array());
}
```

## Static Methods

<MemberHeading id="combine" depth="3" name="combine" sig="combine(animations: readonly Animation[]): Animation" />

<MemberMeta badges="static" sourceHref="/keyframe-flow/docs/source/animation/animation-ts/#L343" sourceLabel="animation.ts:343" />

Composes independent animations into one definition through property tracks (§14): at any progress point, each input is sampled by elapsed time (shorter inputs hold their final value once complete), and the result merges per transform property — an input only overrides the properties it actually animates, with later inputs winning overlaps. The combined duration is the longest input's duration.

This is the convenience layer over the track model; movement, rotation, and scale authored as separate animations compose without manually authoring a combined animation (§14).

**Parameters**

- `animations` (readonly [Animation](/keyframe-flow/docs/animation)\[])

**Returns**

- [`Animation`](/keyframe-flow/docs/animation)

**Example**

```ts
const move = Animation.from({ to: { position: [200, 0, 0] }, duration: 1000 });
const spin = Animation.from({ to: { rotation: [0, Math.PI, 0] }, duration: 1000 });
const pulse = Animation.from({ to: { scale: 1.4 }, duration: 500 });

const composed = Animation.combine([move, spin, pulse]);
composed.attach(target.html(element)).play();
```

<MemberHeading id="from" depth="3" name="from" sig="from(definition: AnimationDefinition): Animation" />

<MemberMeta badges="static" sourceHref="/keyframe-flow/docs/source/animation/animation-ts/#L260" sourceLabel="animation.ts:260" />

Creates an immutable animation definition from a from/to definition (§5.2), a property-level definition (§7), or a keyframe definition with array, iterable, generator, or factory sources (§5.3–§5.5). Keyframes are normalized and validated eagerly; invalid definitions throw here rather than failing later during sampling or playback (§6.3).

**Parameters**

- `definition` ([AnimationDefinition](/keyframe-flow/docs/animationdefinition))

**Returns**

- [`Animation`](/keyframe-flow/docs/animation)

**Example**

```ts
import { Animation } from "keyframe-flow";

const fadeUp = Animation.from({
  from: { position: [0, 20, 0] }, // property-level (§7): scale stays identity
  to: { position: [0, 0, 0] },
  duration: 300,
  easing: "ease-out",
});
```

<MemberHeading
  id="group"
  depth="3"
  name="group"
  sig="group(
	animations: readonly Animation[],
	options?: AnimationGroupOptions,
): Animation"
/>

<MemberMeta badges="static" sourceHref="/keyframe-flow/docs/source/animation/animation-ts/#L371" sourceLabel="animation.ts:371" />

Groups animations into a single definition — full groups and nested timelines (§14, §19). Because groups are ordinary `Animation` values, nesting composes naturally: groups can contain groups.

**Remarks**

- `"sequence"` (default): children play back to back; the group's duration is the sum of child durations.
- `"parallel"`: children run simultaneously over the longest child's duration, merging animated properties with later-wins precedence — equivalent to [Animation.combine](/keyframe-flow/docs/animation#combine).

**Parameters**

- `animations` (readonly [Animation](/keyframe-flow/docs/animation)\[])
- `options` ([AnimationGroupOptions](/keyframe-flow/docs/animationgroupoptions), optional)

**Returns**

- [`Animation`](/keyframe-flow/docs/animation)

**Example**

```ts
const showThenSpin = Animation.group([fadeIn, spin]); // one after the other
const entrance = Animation.group([move, rotate], { layout: "parallel" });
const scene = Animation.group([entrance, tail]); // groups nest naturally
```
