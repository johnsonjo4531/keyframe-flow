---
title: EasingFunction
kind: typedef
longname: EasingFunction
description: "Custom easing function (§8): maps normalized progress in [0, 1] to an eased value. Values outside [0, 1] are permitted (overshoot) but must be finite; non-finite results throw at sampling time."
---

# EasingFunction

<Signature code="EasingFunction = (progress: number) => number" />

<SourceLink href="/keyframe-flow/docs/source/animation/easing-ts/#L6" label="easing.ts:6" />

Custom easing function (§8): maps normalized progress in `[0, 1]` to an eased value. Values outside `[0, 1]` are permitted (overshoot) but must be finite; non-finite results throw at sampling time.

**Parameters**

- `progress` (number)

**Returns**

- `number`
