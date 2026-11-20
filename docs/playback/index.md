---
title: Playback
kind: class
longname: Playback
description: "An independent playback instance created by Animation.attach (§11). Definitions describe motion; playback instances execute it (Appendix B.1): every instance owns its execution state — time, direction, iteration, lifecycle — while sharing the definition's immutable normalized timeline. Playback without a target is fully supported for pure time control (§11)."
---

# Playback

<SourceLink href="/keyframe-flow/docs/source/playback/playback-ts/#L110" label="playback.ts:110" />

An independent playback instance created by `Animation.attach` (§11). Definitions describe motion; playback instances execute it (Appendix B.1): every instance owns its execution state — time, direction, iteration, lifecycle — while sharing the definition's immutable normalized timeline. Playback without a target is fully supported for pure time control (§11).

**Remarks**

Time semantics: [Playback.currentTime](/keyframe-flow/docs/playback#currenttime) is elapsed animation time in milliseconds within the current iteration, always in `[0, duration]`. Time progression is timestamp-based via the engine's clock, never frame-count- based (§16), and playback-rate changes never introduce discontinuities because future deltas are simply scaled by the new rate.

Repetition and direction (§13) are evaluated here — the animation definition and its keyframes are never duplicated. Concurrent playbacks on one target follow replacement semantics: the most recently started playback owns the target, and superseded playbacks are cancelled without additive composition (§14).

**Example**

```ts
const playback = slide.attach(target.html(element), { iterations: "infinite" });
playback.play();
// later…
playback.pause();
playback.seek(0);
playback.dispose();
```

---

## Constructors

<MemberHeading
  id="constructor"
  depth="3"
  name="constructor"
  sig="new Playback(
	animation: Animation,
	target?: RenderTarget,
	options: PlaybackOptions,
): Playback"
/>

**Parameters**

- `animation` ([Animation](/keyframe-flow/docs/animation))
- `target` ([RenderTarget](/keyframe-flow/docs/rendertarget), optional)
- `options` ([PlaybackOptions](/keyframe-flow/docs/playbackoptions), default: `{}`)

**Returns**

`Playback`

---

## Properties

<MemberHeading id="animation" depth="3" name="animation" sig="animation: Animation" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/playback/playback-ts/#L112" sourceLabel="playback.ts:112" />

The immutable definition being played (§11).

<MemberHeading id="target" depth="3" name="target" sig="target: RenderTarget | undefined" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/playback/playback-ts/#L115" sourceLabel="playback.ts:115" />

The render target receiving evaluated transforms, if any (§11).

## Accessors

<MemberHeading id="currenttime" depth="3" name="currentTime" sig="get currentTime(): number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/playback/playback-ts/#L179" sourceLabel="playback.ts:179" />

Elapsed animation time in milliseconds within the current iteration, always clamped to `[0, duration]` (§11.1).

<MemberHeading id="directionmode" depth="3" name="directionMode" sig="get directionMode(): PlaybackDirectionMode" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/playback/playback-ts/#L201" sourceLabel="playback.ts:201" />

The authored direction mode (§13).

<MemberHeading id="finished" depth="3" name="finished" sig="get finished(): Promise<PlaybackResult>" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/playback/playback-ts/#L191" sourceLabel="playback.ts:191" />

The completion promise of the current run (§11.1). It resolves with `{ status: "finished" }` when all iterations complete naturally, or `{ status: "cancelled" }` on ordinary cancellation — never a rejection. Each run started by `play()` gets its own promise; awaiting this getter before any run settles waits for the next settlement of whatever run is current when read.

<MemberHeading id="iterationcount" depth="3" name="iterationCount" sig="get iterationCount(): number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/playback/playback-ts/#L211" sourceLabel="playback.ts:211" />

The completed iterations of the current run (§13).

<MemberHeading id="iterations" depth="3" name="iterations" sig="get iterations(): number | 'infinite'" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/playback/playback-ts/#L196" sourceLabel="playback.ts:196" />

Configured total iterations, including the initial one (§13).

<MemberHeading id="playbackrate" depth="3" name="playbackRate" sig="get playbackRate(): number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/playback/playback-ts/#L221" sourceLabel="playback.ts:221" />

The playback rate multiplier (§11.1, §16). Any finite number is accepted: `2` plays twice as fast, `-1` runs backwards, `0` holds time. Changing the rate never jumps animation time — only future elapsed-time deltas are scaled relative to the current timestamp (§12, §16).

<MemberHeading id="reversed" depth="3" name="reversed" sig="get reversed(): boolean" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/playback/playback-ts/#L206" sourceLabel="playback.ts:206" />

Whether the current iteration runs backwards, after any `reverse()` calls.

<MemberHeading id="state" depth="3" name="state" sig="get state(): PlaybackState" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/playback/playback-ts/#L171" sourceLabel="playback.ts:171" />

The current lifecycle state (§12).

## Methods

<MemberHeading id="cancel" depth="3" name="cancel" sig="cancel(): void" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/playback/playback-ts/#L350" sourceLabel="playback.ts:350" />

Stops playback and resolves the run's promise with `{ status: "cancelled" }` (§12). The last rendered transform is retained — cancellation does not attempt to restore an unknown original target transform. Cancellation and natural completion are separate outcomes; a finished or already-cancelled instance ignores this call.

**Returns**

- `void`

<MemberHeading id="dispose" depth="3" name="dispose" sig="dispose(): void" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/playback/playback-ts/#L367" sourceLabel="playback.ts:367" />

Permanently releases playback resources (§12): unregisters from the engine, releases target ownership, invokes the adapter's optional `dispose` cleanup hook (§17.1) — never destroying the underlying DOM element, canvas context, or graphics resource (Appendix B.8) — and settles any pending `finished` promise as cancelled so awaiting code cannot hang. Idempotent; every other operation on a disposed instance throws (§12).

**Returns**

- `void`

<MemberHeading id="onengineupdate" depth="3" name="onEngineUpdate" sig="onEngineUpdate(timeMs: number): void" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/playback/playback-ts/#L389" sourceLabel="playback.ts:389" />

Called by the `PlaybackEngine` with the current clock timestamp. Advances time by the elapsed wall-clock delta scaled by `playbackRate` and the iteration direction — timestamp-based, never frame-count-based (§16).

**Parameters**

- `timeMs` (number)

**Returns**

- `void`

<MemberHeading id="pause" depth="3" name="pause" sig="pause(): void" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/playback/playback-ts/#L297" sourceLabel="playback.ts:297" />

Stops time advancement while retaining playback state and time (§12). A later `play()` resumes from the retained time. No-op unless running.

**Returns**

- `void`

<MemberHeading id="play" depth="3" name="play" sig="play(): void" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/playback/playback-ts/#L251" sourceLabel="playback.ts:251" />

Starts or resumes playback (§12). Resuming a paused instance continues at the retained time; starting from `idle`, `finished`, or `cancelled` begins a new run from the beginning of the timeline in the current direction (§12) with its own `Playback.finished` promise. Starting (or resuming) takes target ownership, superseding any other playback on the same target (§14).

**Returns**

- `void`

<MemberHeading id="reverse" depth="3" name="reverse" sig="reverse(): void" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/playback/playback-ts/#L310" sourceLabel="playback.ts:310" />

Changes playback direction (§12, §13). Time is retained and continues in the new direction from wherever it currently sits. The changed direction is also the direction a restarted run uses — `play()` after finishing restarts "in current direction" (§12).

**Returns**

- `void`

<MemberHeading id="seek" depth="3" name="seek" sig="seek(timeMs: number): void" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/playback/playback-ts/#L321" sourceLabel="playback.ts:321" />

Sets elapsed animation time within the current iteration, in milliseconds (§12). Out-of-range times clamp to `[0, duration]`. Seeking immediately re-evaluates and submits the transform to the target when one is attached, without changing playback state.

**Parameters**

- `timeMs` (number)

**Returns**

- `void`

<MemberHeading id="seekprogress" depth="3" name="seekProgress" sig="seekProgress(progress: number): void" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/playback/playback-ts/#L335" sourceLabel="playback.ts:335" />

Sets normalized animation progress in `[0, 1]` within the current iteration (§12), equivalent to `seek(progress × duration)`. Out-of-range progress clamps to the boundaries.

**Parameters**

- `progress` (number)

**Returns**

- `void`
