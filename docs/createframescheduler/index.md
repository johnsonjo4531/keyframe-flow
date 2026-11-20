---
title: createFrameScheduler
kind: function
longname: createFrameScheduler
description: "Creates the default frame scheduler (§16): requestAnimationFrame in browsers, timer-based scheduling elsewhere. Resolution happens at call time — not import time — so the core never touches browser APIs merely by being loaded (§2 principle 1)."
---

# createFrameScheduler

<Signature code="createFrameScheduler(): Scheduler" />

<SourceLink href="/keyframe-flow/docs/source/timing/scheduler-ts/#L66" label="scheduler.ts:66" />

Creates the default frame scheduler (§16): `requestAnimationFrame` in browsers, timer-based scheduling elsewhere. Resolution happens at call time — not import time — so the core never touches browser APIs merely by being loaded (§2 principle 1).

**Returns**

- [`Scheduler`](/keyframe-flow/docs/scheduler)
