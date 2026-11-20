---
title: systemClock
kind: variable
longname: systemClock
description: "The default clock: performance.now() when available, otherwise Date.now() . Works unchanged in browsers and Node.js with no browser-API dependency at import time (§2 principle 1)."
---

# systemClock

<Signature code="systemClock: Clock" />

<SourceLink href="/keyframe-flow/docs/source/timing/clock-ts/#L17" label="clock.ts:17" />

The default clock: `performance.now()` when available, otherwise `Date.now()`. Works unchanged in browsers and Node.js with no browser-API dependency at import time (§2 principle 1).

**Type**

[`Clock`](/keyframe-flow/docs/clock)
