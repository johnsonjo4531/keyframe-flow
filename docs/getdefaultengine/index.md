---
title: getDefaultEngine
kind: function
longname: getDefaultEngine
description: The lazily created shared PlaybackEngine used by playbacks that do not inject their own. It combines systemClock with the default frame scheduler ( requestAnimationFrame in browsers, timer-based elsewhere). Resolution is deferred to first use so importing the library never touches browser APIs (§2 principle 1).
---

# getDefaultEngine

<Signature code="getDefaultEngine(): PlaybackEngine" />

<SourceLink href="/keyframe-flow/docs/source/playback/engine-ts/#L121" label="engine.ts:121" />

The lazily created shared `PlaybackEngine` used by playbacks that do not inject their own. It combines `systemClock` with the default frame scheduler (`requestAnimationFrame` in browsers, timer-based elsewhere). Resolution is deferred to first use so importing the library never touches browser APIs (§2 principle 1).

**Returns**

- [`PlaybackEngine`](/keyframe-flow/docs/playbackengine)
