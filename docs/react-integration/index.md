---
title: React Integration
kind: guide
group: Guides
order: 6
---

# React Integration

The core package is framework-free — its build never sees React (§2 principle 1). When you work in a React app, import the dedicated component helpers from the `keyframe-flow/react` subpath; React is a peer dependency of that entry only.

```ts
import { Animation, target } from "keyframe-flow";
import { Animated, useKeyframePlayback } from "keyframe-flow/react";
```

## `<Animated>` — declarative HTML

The smallest helper: renders a `div` whose transform is driven by an animation through the built-in HTML adapter. The playback attaches on mount and disposes on unmount without touching the element itself (Appendix B.8).

```tsx
import { useMemo } from "react";
import { Animation, transform } from "keyframe-flow";
import { Animated } from "keyframe-flow/react";

const slideIn = Animation.from({
  from: transform().translate(0, 24),
  to: transform(),
  duration: 300,
});

export function Card() {
  return <Animated animation={slideIn} options={{ autoplay: true }} className="card" />;
}
```

`options` accepts every `PlaybackOptions` field (`iterations`, `direction`, `playbackRate`, `autoplay`, `engine`) plus `makeTarget`; it defaults to `target.html(host)`. Pass a different factory for SVG, Canvas, or GPU output.

## `useKeyframePlayback` — full transport control

The hook owns one `Playback` per mounted host element and returns a handle: refs to wire into JSX, mirrored state for readouts, and transport controls.

```tsx
import { useCallback } from "react";
import { Animation, target } from "keyframe-flow";
import { useKeyframePlayback } from "keyframe-flow/react";

export function Demo() {
  const animation = useMemo(
    () =>
      Animation.from({
        from: { position: [-120, 0, 0] },
        to: { position: [120, 0, 0], rotation: [0, 0, Math.PI / 4] },
        duration: 1200,
      }),
    [],
  );

  const handle = useKeyframePlayback<HTMLDivElement>(animation, {
    autoplay: true,
    makeTarget: useCallback((host) => target.html(host), []),
  });

  return (
    <>
      <div ref={handle.ref} />
      <button onClick={handle.play}>play</button>
      <button onClick={handle.pause}>pause</button>
      <button onClick={handle.reset}>reset</button>
      <span>
        {handle.state} · t = {handle.currentTime.toFixed(0)} ms
      </span>
    </>
  );
}
```

The handle exposes `state`, `currentTime`, `iterationCount`, and `result` mirrored from the live playback, plus `play`, `pause`, `reverse`, `reset`, `cancel`, `seek`, and `seekProgress`. State is sampled on frames while a run is live and re-synced after every control action, so readouts never go stale after play-after-finish, reset, or seek.

### Lifecycle semantics

- **Attach:** the playback is created on mount from the host behind `ref` and re-attached whenever the animation or any option changes identity — the old playback is disposed; the host element survives (§17.2).
- **Reset:** rewinds to progress 0 facing forward, so the next `play()` always runs 0 → 1 even after a `reverse()` (§12 restarts in the current direction).
- **Dispose on unmount** never destroys the host element or its content (Appendix B.8) — GPU contexts, canvas content, and event listeners you own stay intact.

Memoize `animation` (`useMemo`) and `options.makeTarget` (`useCallback`) — new identities on every render would re-attach each render.

<Embed src="//johnsonjo4531.github.io/keyframe-flow/storybook/iframe.html?id=playback-lifecycle--transport-controls" title="Live demo — transport controls built with useKeyframePlayback" height="470" themed="false" />

[▶ Vanilla TypeScript implementation](https://johnsonjo4531.github.io/keyframe-flow/examples/#/example/playback-lifecycle--transport-controls) · [Open in Storybook](https://johnsonjo4531.github.io/keyframe-flow/storybook/?path=/story/playback-lifecycle--transport-controls)

## What to read next

- [Playback & lifecycle](../playback-lifecycle/) — the state machine the hook mirrors.
- [Render adapters & custom targets](../render-adapters/) — what `makeTarget` can return.
- Every guide's live example also ships a React twin: browse them together in the [examples gallery](https://johnsonjo4531.github.io/keyframe-flow/examples/).
