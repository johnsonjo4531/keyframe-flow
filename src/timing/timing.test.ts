import { describe, expect, it } from "vite-plus/test";

import { ManualClock, systemClock } from "./clock.ts";
import { createFrameScheduler, ManualScheduler } from "./scheduler.ts";

describe("clocks (§16)", () => {
  it("systemClock returns finite millisecond timestamps", () => {
    const a = systemClock.now();
    const b = systemClock.now();
    expect(Number.isFinite(a)).toBe(true);
    expect(b).toBeGreaterThanOrEqual(a);
  });

  it("ManualClock moves only when told to", () => {
    const clock = new ManualClock(1000);
    expect(clock.now()).toBe(1000);
    clock.advance(250);
    expect(clock.now()).toBe(1250);
    clock.advance(-50);
    expect(clock.now()).toBe(1200);
    clock.set(0);
    expect(clock.now()).toBe(0);

    expect(() => new ManualClock(Number.NaN)).toThrow(TypeError);
    expect(() => clock.set(Number.POSITIVE_INFINITY)).toThrow(TypeError);
    expect(() => clock.advance(Number.NaN)).toThrow(TypeError);
  });
});

describe("schedulers (§16)", () => {
  it("createFrameScheduler works without browser APIs via the timer fallback", async () => {
    const scheduler = createFrameScheduler();
    // Node has no requestAnimationFrame, so this exercises the timer fallback.
    expect(typeof (globalThis as { requestAnimationFrame?: unknown }).requestAnimationFrame).toBe(
      "undefined",
    );

    await new Promise<void>((resolve) => {
      let fired = false;
      const handle = scheduler.request(() => {
        fired = true;
        resolve();
      });
      expect(handle).toBeDefined();
      // Cancel a second request that never needs to fire.
      const cancelled = scheduler.request(() => {
        throw new Error("cancelled request must not fire");
      });
      scheduler.cancel(cancelled);
      expect(fired).toBe(false);
    });
  });

  it("ManualScheduler delivers timestamps and clears requests after tick", () => {
    const scheduler = new ManualScheduler();
    const times: number[] = [];
    scheduler.request((t) => times.push(t));
    scheduler.tick(123.5);
    expect(times).toEqual([123.5]);
    expect(scheduler.hasPending).toBe(false);
    expect(() => scheduler.tick(Number.NaN)).toThrow(TypeError);
  });
});
