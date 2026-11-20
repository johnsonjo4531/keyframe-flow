---
title: ManualScheduler
kind: class
longname: ManualScheduler
description: A scheduler that only fires frames when a test or host calls ManualScheduler.tick (§16). Pair it with ManualClock for fully deterministic playback tests. const clock = new ManualClock(0); const scheduler = new ManualScheduler(); const engine = new PlaybackEngine({ clock, scheduler }); // ...start a playback... clock.advance(16); scheduler.tick(clock.now()); // drives exactly one engine update
---

# ManualScheduler

<SourceLink href="/keyframe-flow/docs/source/timing/scheduler-ts/#L100" label="scheduler.ts:100" />

A scheduler that only fires frames when a test or host calls `ManualScheduler.tick` (§16). Pair it with `ManualClock` for fully deterministic playback tests.

```ts
const clock = new ManualClock(0);
const scheduler = new ManualScheduler();
const engine = new PlaybackEngine({ clock, scheduler });
// ...start a playback...
clock.advance(16);
scheduler.tick(clock.now()); // drives exactly one engine update
```

---

## Constructors

<MemberHeading id="constructor" depth="3" name="constructor" sig="new ManualScheduler(): ManualScheduler" />

**Returns**

`ManualScheduler`

#### Implements

- [`Scheduler`](/keyframe-flow/docs/scheduler)

---

## Accessors

<MemberHeading id="haspending" depth="3" name="hasPending" sig="get hasPending(): boolean" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/timing/scheduler-ts/#L117" sourceLabel="scheduler.ts:117" />

`true` while at least one requested frame is waiting to fire.

<MemberHeading id="pendingcount" depth="3" name="pendingCount" sig="get pendingCount(): number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/timing/scheduler-ts/#L122" sourceLabel="scheduler.ts:122" />

The number of requested frames waiting to fire.

## Methods

<MemberHeading id="cancel" depth="3" name="cancel" sig="cancel(handle: unknown): void" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/timing/scheduler-ts/#L110" sourceLabel="scheduler.ts:110" />

_Implementation of&#x20;_[`cancel`](/keyframe-flow/docs/scheduler#cancel)

Cancels a previously requested callback that has not fired yet.

**Parameters**

- `handle` (unknown)

**Returns**

- `void`

<MemberHeading id="request" depth="3" name="request" sig="request(callback: (time: number) => void): unknown" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/timing/scheduler-ts/#L104" sourceLabel="scheduler.ts:104" />

_Implementation of&#x20;_[`request`](/keyframe-flow/docs/scheduler#request)

Schedules `callback` for the next frame; returns a cancelable handle.

**Parameters**

- `callback` ((time: number) => void)

**Returns**

- `unknown`

<MemberHeading id="tick" depth="3" name="tick" sig="tick(time: number): void" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/timing/scheduler-ts/#L131" sourceLabel="scheduler.ts:131" />

Fires every pending callback once, in request order, with `time` (the scheduler's own view of the frame timestamp). Requests are one-shot like `requestAnimationFrame`: each must re-request for the next tick.

**Parameters**

- `time` (number)

**Returns**

- `void`
