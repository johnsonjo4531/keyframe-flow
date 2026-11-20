import { describe, expect, it } from "vite-plus/test";

import { Animation } from "../animation/animation.ts";
import { createFrameScheduler } from "./scheduler.ts";

/**
 * Regression coverage for the default browser frame path (§16). Until these
 * existed, `createFrameScheduler` was only exercised through Node's timer
 * fallback, so detaching `requestAnimationFrame` from its environment — which
 * Chromium rejects with "Illegal invocation" — went unnoticed in every
 * animated Storybook story.
 */

/** Resolves after `count` real animation frames, using the scheduler itself. */
function nextFrames(count: number): Promise<void> {
  const scheduler = createFrameScheduler();
  return new Promise((resolve) => {
    const step = (remaining: number): void => {
      if (remaining <= 0) resolve();
      else scheduler.request(() => step(remaining - 1));
    };
    step(count);
  });
}

describe("createFrameScheduler in a real browser", () => {
  it("requests frames through requestAnimationFrame without Illegal invocation", async () => {
    const scheduler = createFrameScheduler();
    const time = await new Promise<unknown>((resolve) => {
      scheduler.request((t) => resolve(t));
    });
    expect(typeof time).toBe("number");
  });

  it("cancels a requested frame before it fires", async () => {
    const scheduler = createFrameScheduler();
    let fired = false;
    const handle = scheduler.request(() => {
      fired = true;
    });
    scheduler.cancel(handle);
    await nextFrames(2);
    expect(fired).toBe(false);
  });

  it("drives real playback through the default shared engine", async () => {
    let frames = 0;
    const target = { setTransform: (): void => void (frames += 1) };
    const animation = Animation.from({ to: { scale: 2 }, duration: 100 });

    // No clock or scheduler injected: this attaches to the lazily created
    // shared engine, which resolves the default rAF scheduler at play time.
    const playback = animation.attach(target);
    playback.play();

    await nextFrames(3);

    expect(frames).toBeGreaterThan(0);
    expect(playback.currentTime).toBeGreaterThan(0);
    playback.dispose();
  });
});
