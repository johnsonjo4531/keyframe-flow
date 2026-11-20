---
title: Clock
kind: interface
longname: Clock
description: A monotonic-ish time source returning milliseconds (§16). Clocks provide time; schedulers coordinate updates — scheduling is not timekeeping (Appendix B.7). The clock and scheduler are separate injectable interfaces so the playback engine can drive animations in any environment.
---

# Clock

<Signature
  code="interface Clock {
	now(): number;
}"
/>

<SourceLink href="/keyframe-flow/docs/source/timing/clock-ts/#L7" label="clock.ts:7" />

A monotonic-ish time source returning milliseconds (§16). Clocks provide time; schedulers coordinate updates — scheduling is not timekeeping (Appendix B.7). The clock and scheduler are separate injectable interfaces so the playback engine can drive animations in any environment.

#### Implemented By

- [`ManualClock`](/keyframe-flow/docs/manualclock)

---

## Methods

<MemberHeading id="now" depth="3" name="now" sig="now(): number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/timing/clock-ts/#L9" sourceLabel="clock.ts:9" />

Current time in milliseconds, from an arbitrary but stable origin.

**Returns**

- `number`
