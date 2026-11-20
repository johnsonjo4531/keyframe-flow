---
title: Scheduler
kind: interface
longname: Scheduler
description: "A frame callback source (§16). One request schedules exactly one callback invocation — the same contract as requestAnimationFrame — and cancel aborts a request that has not fired yet. The clock and scheduler are kept separate on purpose: scheduling is not timekeeping (Appendix B.7), so the engine reads timestamps from a Clock rather than trusting callback arguments."
---

# Scheduler

<Signature
  code="interface Scheduler {
	cancel(handle: unknown): void;
	request(callback: (time: number) => void): unknown;
}"
/>

<SourceLink href="/keyframe-flow/docs/source/timing/scheduler-ts/#L11" label="scheduler.ts:11" />

A frame callback source (§16). One `request` schedules exactly one callback invocation — the same contract as `requestAnimationFrame` — and `cancel` aborts a request that has not fired yet. The clock and scheduler are kept separate on purpose: scheduling is not timekeeping (Appendix B.7), so the engine reads timestamps from a `Clock` rather than trusting callback arguments.

#### Implemented By

- [`ManualScheduler`](/keyframe-flow/docs/manualscheduler)

---

## Methods

<MemberHeading id="cancel" depth="3" name="cancel" sig="cancel(handle: unknown): void" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/timing/scheduler-ts/#L15" sourceLabel="scheduler.ts:15" />

Cancels a previously requested callback that has not fired yet.

**Parameters**

- `handle` (unknown)

**Returns**

- `void`

<MemberHeading id="request" depth="3" name="request" sig="request(callback: (time: number) => void): unknown" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/timing/scheduler-ts/#L13" sourceLabel="scheduler.ts:13" />

Schedules `callback` for the next frame; returns a cancelable handle.

**Parameters**

- `callback` ((time: number) => void)

**Returns**

- `unknown`
