---
title: Playback & Lifecycle
kind: guide
group: Guides
order: 4
---

# Playback & Lifecycle

`animation.attach()` creates an independent `Playback` — a stateful execution of an immutable definition (§11). Multiple playbacks can run from the same definition simultaneously; each owns its own time, direction, rate, and lifecycle (Appendix B.1).

## Attaching

```ts
const playback = slide.attach(target.html(element), {
  iterations: 2, // finite count, or "infinite" (default: 1)
  direction: "alternate", // "normal" | "reverse" | "alternate" | "alternate-reverse"
  playbackRate: 1.5, // positive = forward, negative = backward
  autoplay: false, // start immediately? (default: false)
});
```

The target is **optional** — `animation.attach()` with no target still gives full time control for hosts that render themselves by reading `playback.currentTime` and sampling the animation (§10.3).

## The state machine (§12)

States: `idle → running ⇄ paused → finished | cancelled`, plus terminal `disposed`.

```ts
playback.play(); // idle/paused → running; finished/cancelled → restart in the
// current direction from the beginning
playback.pause(); // running → paused; position and transform are retained
playback.reverse(); // flip direction while preserving time
playback.seek(420); // jump to 420 ms into the current iteration (clamped)
playback.seekProgress(0.5); // equivalent at normalized progress
playback.cancel(); // → cancelled; the last rendered transform stays on target
await playback.finished; // { status: "finished" } | { status: "cancelled" }
playback.dispose(); // release resources; later calls throw (idempotent itself)
```

Key guarantees:

- **`currentTime`** is elapsed animation time within the current iteration, clamped to `[0, duration]` — it is _not_ wall-clock time.
- **`finished` never rejects.** It resolves with a status object; awaiting it from `idle` waits for the first run, and every new run exposes a fresh promise. Code that awaits can therefore never hang: disposal settles any pending wait as `{ status: "cancelled" }`.
- **Disposal is resource release, not destruction.** The animation definition, the render target, and any DOM/GPU objects survive untouched (Appendix B.8); adapter-level cleanup hooks run at most once.

## Playback rate

`playbackRate` is settable while running and continuous — changing it never teleports `currentTime`, it only changes how fast time advances afterwards. Negative rates play backwards; combined with `direction: "alternate"` the two compose predictably (§13).

## Repetition and direction (§13)

Repetition is handled by the engine loop, not by duplicating keyframes:

```ts
const pendulum = slide.attach(target.html(element), {
  iterations: "infinite",
  direction: "alternate", // forward, backward, forward, …
});
```

- `iterations: n` runs `n` times (including the first); `"infinite"` never completes — `finished` stays pending until cancel/dispose.
- `direction: "reverse"` plays each iteration backwards; `"alternate"` flips per iteration; `"alternate-reverse"` starts reversed.
- Multiple iteration boundaries can be crossed in a single frame (long stalls, high rates) without losing sync — time is computed from timestamps, never counted per frame (§16).

## Target ownership: replacement, not composition (§14)

Starting a playback on a target **supersedes** the previous owner: the older playback is cancelled (its `finished` resolves `{ status: "cancelled" }`) and the newest one exclusively drives the target. There is no additive blending — if you want two motions to combine, compose the animations first with `Animation.combine`, then attach once.

## Deterministic testing with manual timing

Timekeeping and scheduling are injectable interfaces kept separate (§16). In tests, drive everything by hand — no timers, no flake:

```ts
import { ManualClock, ManualScheduler, PlaybackEngine } from "keyframe-flow";

const clock = new ManualClock(0);
const scheduler = new ManualScheduler();
const engine = new PlaybackEngine({ clock, scheduler });

const playback = slide.attach(undefined, { engine });
playback.play();

clock.advance(500); // move virtual time…
scheduler.tick(clock.now()); // …and deliver a frame to all active playbacks
playback.currentTime; // exactly 500 — fully deterministic
```

The default engine is created lazily on first use with the system clock and a requestAnimationFrame-based scheduler (falling back to timers in Node), so normal usage needs no setup.

## See also

- [Render adapters](../render-adapters/) — what targets receive and own.
- Live lifecycle playground in the [Storybook examples](../../storybook/).
