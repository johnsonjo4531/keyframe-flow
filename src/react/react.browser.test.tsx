import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, expect, it } from "vite-plus/test";

import {
  Animation,
  ManualClock,
  ManualScheduler,
  PlaybackEngine,
  target,
  transform,
} from "../index.ts";
import { Animated, useKeyframePlayback } from "./index.ts";
import type { KeyframePlaybackHandle } from "./index.ts";

/**
 * Browser tests for the React integration (T52): mount/attach lifecycle,
 * transport controls with forward-facing reset, deterministic re-attach on
 * identity change, and dispose-on-unmount that leaves hosts untouched (B.8).
 */

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function slide(durationMs: number): Animation {
  return Animation.from({
    from: transform().translate(0, 0),
    to: transform().translate(100, 0),
    duration: durationMs,
  });
}

/** Advance the manual clock and dispatch exactly one engine frame. */
function step(engineClock: ManualClock, scheduler: ManualScheduler, deltaMs: number): void {
  engineClock.advance(deltaMs);
  scheduler.tick(engineClock.now());
}

async function flushFrames(count: number): Promise<void> {
  for (let i = 0; i < count; i++) {
    await act(async () => {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    });
  }
}

describe("keyframe-flow/react", () => {
  it("<Animated> attaches an html target and drives the element's transform", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root: Root = createRoot(container);

    await act(async () => {
      root.render(
        <Animated animation={slide(200)} options={{ autoplay: true }} data-testid="box" />,
      );
    });
    const box = container.querySelector('[data-testid="box"]') as HTMLElement;
    expect(box).not.toBeNull();

    await flushFrames(3); // real default engine advances on real frames
    expect(box.style.transform).toMatch(/^matrix3d\(/);

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("hook controls mirror state and reset faces forward; re-attach replaces the playback", async () => {
    const clock = new ManualClock(0);
    const scheduler = new ManualScheduler();
    const engine = new PlaybackEngine({ clock, scheduler });
    const makeTarget = (host: HTMLElement) => target.html(host);

    let handle!: KeyframePlaybackHandle<HTMLDivElement>;
    function Probe({ animation }: { animation: Animation }) {
      handle = useKeyframePlayback<HTMLDivElement>(animation, {
        engine,
        autoplay: false,
        makeTarget,
      });
      return <div ref={handle.ref} />;
    }

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const first = slide(1000);

    await act(async () => {
      root.render(<Probe animation={first} />);
    });
    expect(handle.state).toBe("idle");
    const box = container.firstElementChild as HTMLElement;
    expect(box.style.transform).toBe(""); // not playing yet — nothing written

    await act(async () => {
      handle.play();
    });
    step(clock, scheduler, 400);
    await flushFrames(1);
    expect(handle.state).toBe("running");
    expect(handle.currentTime).toBeCloseTo(400, 6);
    expect(box.style.transform).toMatch(/^matrix3d\(/);

    await act(async () => {
      handle.pause();
    });
    expect(handle.playbackRef.current?.state).toBe("paused");

    // Reverse then reset: reset must undo the direction flip so the next play
    // runs forward (T48 semantics, now part of the public API).
    await act(async () => {
      handle.reverse();
      handle.reset();
    });
    expect(handle.playbackRef.current?.reversed).toBe(false);
    expect(handle.currentTime).toBe(0);

    // New animation identity → old playback disposed, fresh one attached.
    const previous = handle.playbackRef.current;
    await act(async () => {
      root.render(<Probe animation={slide(500)} />);
    });
    expect(previous?.state).toBe("disposed");
    expect(handle.playbackRef.current).not.toBe(previous);

    // Unmount disposes without destroying the host container (B.8).
    const live = handle.playbackRef.current;
    await act(async () => {
      root.unmount();
    });
    expect(live?.state).toBe("disposed");
    expect(document.body.contains(container)).toBe(true);
    container.remove();
  });
});
