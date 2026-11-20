---
title: ManualClock
kind: class
longname: ManualClock
description: "A clock whose time only moves when a test or host says so (§16). Ideal for deterministic playback tests: animation time is timestamp-based, never frame-count-based (§16), and this makes every timestamp explicit. const clock = new ManualClock(0); clock.advance(16); // clock.now() === 16 clock.set(5000); // clock.now() === 5000"
---

# ManualClock

<SourceLink href="/keyframe-flow/docs/source/timing/clock-ts/#L38" label="clock.ts:38" />

A clock whose time only moves when a test or host says so (§16). Ideal for deterministic playback tests: animation time is timestamp-based, never frame-count-based (§16), and this makes every timestamp explicit.

```ts
const clock = new ManualClock(0);
clock.advance(16); // clock.now() === 16
clock.set(5000);   // clock.now() === 5000
```

---

## Constructors

<MemberHeading id="constructor" depth="3" name="constructor" sig="new ManualClock(start: number): ManualClock" />

**Parameters**

- `start` (number, default: `0`)

**Returns**

`ManualClock`

#### Implements

- [`Clock`](/keyframe-flow/docs/clock)

---

## Methods

<MemberHeading id="advance" depth="3" name="advance" sig="advance(deltaMs: number): void" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/timing/clock-ts/#L62" sourceLabel="clock.ts:62" />

Moves the clock forward (or back) by `deltaMs` milliseconds.

**Parameters**

- `deltaMs` (number)

**Returns**

- `void`

<MemberHeading id="now" depth="3" name="now" sig="now(): number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/timing/clock-ts/#L49" sourceLabel="clock.ts:49" />

_Implementation of&#x20;_[`now`](/keyframe-flow/docs/clock#now)

Current time in milliseconds, from an arbitrary but stable origin.

**Returns**

- `number`

<MemberHeading id="set" depth="3" name="set" sig="set(timeMs: number): void" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/timing/clock-ts/#L54" sourceLabel="clock.ts:54" />

Jumps the clock to an absolute timestamp in milliseconds.

**Parameters**

- `timeMs` (number)

**Returns**

- `void`
