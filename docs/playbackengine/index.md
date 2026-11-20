---
title: PlaybackEngine
kind: class
longname: PlaybackEngine
description: "The centralized playback scheduler (§16). One engine drives all active playback instances: it reads the current time from its injectable Clock , steps every registered playback, and requests the next frame from its injectable Scheduler only while at least one playback is active — so there are no unnecessary updates when nothing is playing (§16). Animation time is timestamp-based, never frame-count-based: each update advances playbacks by the elapsed clock time scaled by their playback rate. Custom clocks and schedulers integrate without modifying the core (§21). const engine = new PlaybackEngine({ clock: myClock, scheduler: myScheduler }); const playback = animation.attach(target, { engine }); playback.play(); // driven by `engine` instead of the shared default"
---

# PlaybackEngine

<SourceLink href="/keyframe-flow/docs/source/playback/engine-ts/#L39" label="engine.ts:39" />

The centralized playback scheduler (§16). One engine drives all active playback instances: it reads the current time from its injectable `Clock`, steps every registered playback, and requests the next frame from its injectable `Scheduler` only while at least one playback is active — so there are no unnecessary updates when nothing is playing (§16). Animation time is timestamp-based, never frame-count-based: each update advances playbacks by the elapsed clock time scaled by their playback rate. Custom clocks and schedulers integrate without modifying the core (§21).

```ts
const engine = new PlaybackEngine({ clock: myClock, scheduler: myScheduler });
const playback = animation.attach(target, { engine });
playback.play(); // driven by `engine` instead of the shared default
```

---

## Constructors

<MemberHeading
  id="constructor"
  depth="3"
  name="constructor"
  sig="new PlaybackEngine(
	options: PlaybackEngineOptions,
): PlaybackEngine"
/>

**Parameters**

- `options` ([PlaybackEngineOptions](/keyframe-flow/docs/playbackengineoptions), default: `{}`)

**Returns**

`PlaybackEngine`

---

## Properties

<MemberHeading id="clock" depth="3" name="clock" sig="clock: Clock" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/playback/engine-ts/#L41" sourceLabel="engine.ts:41" />

The time source this engine reads timestamps from.

## Accessors

<MemberHeading id="activecount" depth="3" name="activeCount" sig="get activeCount(): number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/playback/engine-ts/#L53" sourceLabel="engine.ts:53" />

The number of playback instances currently being driven.

## Methods

<MemberHeading id="add" depth="3" name="add" sig="add(playback: EngineTickable): void" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/playback/engine-ts/#L58" sourceLabel="engine.ts:58" />

Registers a running playback for updates, starting frames if needed.

**Parameters**

- `playback` ([EngineTickable](/keyframe-flow/docs/enginetickable))

**Returns**

- `void`

<MemberHeading id="remove" depth="3" name="remove" sig="remove(playback: EngineTickable): void" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/playback/engine-ts/#L67" sourceLabel="engine.ts:67" />

Removes a playback from the update set.

**Parameters**

- `playback` ([EngineTickable](/keyframe-flow/docs/enginetickable))

**Returns**

- `void`

<MemberHeading id="stop" depth="3" name="stop" sig="stop(): void" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/playback/engine-ts/#L76" sourceLabel="engine.ts:76" />

Stops scheduling entirely (pending frame cancelled, active set cleared). Used by hosts that want to shut an engine down; playbacks can re-register afterwards.

**Returns**

- `void`
