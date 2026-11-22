import { describe, expect, it } from "vite-plus/test";

import { Animation } from "../animation/animation.ts";
import type { Matrix4 } from "../matrix/matrix4.ts";
import { Transform } from "../transform/transform.ts";
import { ManualClock } from "../timing/clock.ts";
import { ManualScheduler } from "../timing/scheduler.ts";
import { PlaybackEngine } from "./engine.ts";
import type { PlaybackResult, PlaybackState } from "./playback.ts";
import type { RenderTarget } from "../targets/types.ts";

/** Target that records every submitted transform for assertions (§17.1). */
class RecordingTarget implements RenderTarget {
  readonly matrices: Matrix4[] = [];
  disposeCalls = 0;

  setTransform(matrix: Matrix4): void {
    this.matrices.push(matrix);
  }

  dispose(): void {
    this.disposeCalls += 1;
  }

  get positionsX(): number[] {
    return this.matrices.map((m) => Transform.fromMatrix(m).components.position.x);
  }

  get lastPositionX(): number {
    const m = this.matrices[this.matrices.length - 1];
    return m === undefined ? Number.NaN : Transform.fromMatrix(m).components.position.x;
  }
}

function moveAnimation(duration = 1000): Animation {
  return Animation.from({
    from: transformInit(0),
    to: transformInit(100),
    duration,
  });
}

function transformInit(x: number) {
  return { position: [x, 0, 0] as [number, number, number] };
}

interface Harness {
  clock: ManualClock;
  scheduler: ManualScheduler;
  engine: PlaybackEngine;
  /** Advances the clock `deltaMs` and dispatches exactly one frame. */
  tick(deltaMs: number): void;
}

function createHarness(): Harness {
  const clock = new ManualClock(0);
  const scheduler = new ManualScheduler();
  const engine = new PlaybackEngine({ clock, scheduler });
  return {
    clock,
    scheduler,
    engine,
    tick(deltaMs) {
      clock.advance(deltaMs);
      scheduler.tick(clock.now());
    },
  };
}

function settled(promise: Promise<PlaybackResult>): Promise<PlaybackResult | "pending"> {
  return Promise.race([
    promise,
    new Promise<"pending">((res) => setTimeout(() => res("pending"), 0)),
  ]);
}

describe("playback scheduling (§16)", () => {
  it("drives all active playbacks from the clock, not frame counts", () => {
    const h = createHarness();
    const animation = moveAnimation(1000);
    const a = animation.attach(undefined, { engine: h.engine });
    const b = animation.attach(undefined, { engine: h.engine });

    a.play();
    b.play();
    expect(h.engine.activeCount).toBe(2);
    expect(h.scheduler.pendingCount).toBe(1); // one shared frame request

    // Irregular timestamps still advance time correctly (timestamp-based).
    h.tick(300);
    h.clock.advance(450);
    h.scheduler.tick(h.clock.now());
    expect(a.currentTime).toBeCloseTo(750, 9);
    expect(b.currentTime).toBeCloseTo(750, 9);

    a.pause();
    expect(a.state).toBe("paused");
    expect(a.currentTime).toBeCloseTo(750, 9); // pausing retains time (§12)
    h.tick(100);
    expect(b.currentTime).toBeCloseTo(850, 9);
    expect(a.currentTime).toBeCloseTo(750, 9);
  });

  it("requests no frames when nothing is active (§16)", () => {
    const h = createHarness();
    expect(h.scheduler.hasPending).toBe(false);

    const playback = moveAnimation(100).attach(undefined, { engine: h.engine });
    playback.play();
    expect(h.scheduler.hasPending).toBe(true);

    h.tick(50);
    h.tick(60); // crosses duration → finishes
    expect(playback.state).toBe("finished");
    expect(h.scheduler.hasPending).toBe(false);
    expect(h.engine.activeCount).toBe(0);
  });

  it("ignores non-forward frame timestamps so boundary restarts don't finish instantly (§16)", () => {
    // Browser race: a click dispatched inside an already-started frame calls
    // play() (anchoring to clock.now()) and the pending frame callback then
    // delivers that frame's older timestamp. A run always starts exactly on a
    // timeline boundary, so a negative delta would cross the opposite boundary
    // and complete the run in one step.
    const h = createHarness();
    h.clock.advance(5000); // arbitrary origin drift between clock and frames
    const playback = moveAnimation(1000).attach(undefined, { engine: h.engine });

    playback.play(); // anchors at clock.now() = 5000
    h.scheduler.tick(4986); // stale frame timestamp from before the anchor

    expect(playback.state).toBe("running");
    expect(playback.currentTime).toBe(0);
    expect(h.engine.activeCount).toBe(1);

    h.clock.advance(30);
    h.scheduler.tick(h.clock.now()); // 5030 → normal 30 ms advance from anchor
    expect(playback.currentTime).toBeCloseTo(30, 9);
  });

  it("a stale timestamp mid-run never steps time backwards (§16)", () => {
    const h = createHarness();
    const playback = moveAnimation(1000).attach(undefined, { engine: h.engine });

    playback.play();
    h.tick(400);
    expect(playback.currentTime).toBeCloseTo(400, 9);

    h.scheduler.tick(h.clock.now() - 14); // out-of-order frame timestamp
    expect(playback.state).toBe("running");
    expect(playback.currentTime).toBeCloseTo(400, 9); // time retained, not reversed
  });

  it("steps playbacks from its Clock, not scheduler callback timestamps (§16)", () => {
    // The engine must never advance time by a frame callback's argument —
    // nested-iframe rAF timestamps can stall against the realm clock, and
    // stepping by them freezes (or finishes) runs at boundaries.
    const h = createHarness();
    const playback = moveAnimation(1000).attach(undefined, { engine: h.engine });

    playback.play(); // anchors at clock.now() = 0
    h.clock.advance(50);
    h.scheduler.tick(12345); // arbitrary frame timestamp — the engine ignores it
    expect(playback.currentTime).toBeCloseTo(50, 9);

    h.clock.advance(70);
    h.scheduler.tick(-10); // stale again — still advanced from the clock
    expect(playback.currentTime).toBeCloseTo(120, 9);
  });

  it("ManualScheduler fires one-shot requests in order and honors cancel", () => {
    const scheduler = new ManualScheduler();
    const seen: number[] = [];
    const h1 = scheduler.request((t) => seen.push(1 * t));
    scheduler.request((t) => seen.push(2 * t));
    scheduler.cancel(h1);
    expect(scheduler.pendingCount).toBe(1);
    scheduler.tick(10);
    expect(seen).toEqual([20]);
    scheduler.tick(20); // nothing pending — requests are one-shot
    expect(seen).toEqual([20]);
  });

  it("engine.stop() halts scheduling and clears the active set", () => {
    const h = createHarness();
    const playback = moveAnimation(1000).attach(undefined, { engine: h.engine });
    playback.play();
    h.engine.stop();
    expect(h.scheduler.hasPending).toBe(false);
    expect(h.engine.activeCount).toBe(0);
    h.tick(200);
    expect(playback.currentTime).toBe(0); // no updates after stop
  });
});

describe("playback lifecycle states and transitions (§12)", () => {
  it("walks idle → running → paused → running → finished", async () => {
    const h = createHarness();
    const playback = moveAnimation(1000).attach(undefined, { engine: h.engine });
    expect(playback.state).toBe("idle");

    playback.play();
    expect(playback.state).toBe("running");
    h.tick(250);
    expect(playback.currentTime).toBeCloseTo(250, 9);

    playback.pause();
    expect(playback.state).toBe("paused");
    h.tick(400);
    expect(playback.currentTime).toBeCloseTo(250, 9);

    playback.play(); // resume at retained time (§12)
    expect(playback.state).toBe("running");
    h.tick(700);
    expect(playback.currentTime).toBeCloseTo(950, 9);
    h.tick(100);
    expect(playback.state).toBe("finished");
    expect(playback.currentTime).toBe(1000);

    await expect(playback.finished).resolves.toEqual({ status: "finished" });
  });

  it("play() on a finished playback restarts from the beginning in current direction (§12)", () => {
    const h = createHarness();
    const playback = moveAnimation(1000).attach(undefined, { engine: h.engine });
    playback.play();
    h.tick(1200);
    expect(playback.state).toBe("finished");

    playback.play(); // restart (§12)
    expect(playback.state).toBe("running");
    expect(playback.currentTime).toBe(0);
    h.tick(300);
    expect(playback.currentTime).toBeCloseTo(300, 9);
  });

  it("play() on a finished reversed playback restarts at the end and runs backwards", () => {
    const h = createHarness();
    const playback = moveAnimation(1000).attach(undefined, { engine: h.engine });
    playback.play();
    h.tick(600);
    playback.reverse();
    h.tick(700); // 600 → back past 0, iteration ends at 0 → finished
    expect(playback.state).toBe("finished");
    expect(playback.currentTime).toBe(0);

    playback.play(); // restart in current (reversed) direction (§12)
    expect(playback.reversed).toBe(true);
    expect(playback.currentTime).toBe(1000);
    h.tick(400);
    expect(playback.currentTime).toBeCloseTo(600, 9);
  });

  it("seek() and seekProgress() set time with clamping and render immediately (§12)", () => {
    const target = new RecordingTarget();
    const h = createHarness();
    const playback = moveAnimation(1000).attach(target, { engine: h.engine });

    playback.seek(400);
    expect(playback.currentTime).toBe(400);
    expect(target.lastPositionX).toBeCloseTo(40, 9);

    playback.seek(-50); // clamps to the boundary (§12)
    expect(playback.currentTime).toBe(0);
    playback.seek(5000);
    expect(playback.currentTime).toBe(1000);

    playback.seekProgress(0.25);
    expect(playback.currentTime).toBe(250);
    playback.seekProgress(2);
    expect(playback.currentTime).toBe(1000);
    playback.seekProgress(-1);
    expect(playback.currentTime).toBe(0);

    expect(() => playback.seek(Number.NaN)).toThrow(TypeError);
    expect(() => playback.seekProgress(Number.POSITIVE_INFINITY)).toThrow(TypeError);
  });

  it("cancel() stops playback, retains the last rendered transform, resolves cancelled (§12)", async () => {
    const target = new RecordingTarget();
    const h = createHarness();
    const playback = moveAnimation(1000).attach(target, { engine: h.engine });

    playback.play();
    h.tick(500);
    const renderedAtCancel = target.lastPositionX;
    const callCount = target.matrices.length;

    playback.cancel();
    expect(playback.state).toBe("cancelled");
    expect(target.matrices.length).toBe(callCount); // last transform retained
    expect(target.lastPositionX).toBe(renderedAtCancel);

    h.tick(500);
    expect(target.matrices.length).toBe(callCount); // no further renders
    await expect(playback.finished).resolves.toEqual({ status: "cancelled" });

    // Cancellation and completion are separate outcomes; cancel is a no-op
    // once settled (§12), and the promise keeps its original outcome.
    playback.cancel();
    await expect(playback.finished).resolves.toEqual({ status: "cancelled" });
  });

  it("cancel() from idle resolves cancelled", async () => {
    const h = createHarness();
    const playback = moveAnimation(1000).attach(undefined, { engine: h.engine });
    playback.cancel();
    expect(playback.state).toBe("cancelled");
    await expect(playback.finished).resolves.toEqual({ status: "cancelled" });
  });

  it("dispose() is idempotent and settles pending promises; other operations throw (§12)", async () => {
    const target = new RecordingTarget();
    const h = createHarness();
    const playback = moveAnimation(1000).attach(target, { engine: h.engine });
    playback.play();
    h.tick(100);

    playback.dispose();
    expect(playback.state).toBe("disposed");
    playback.dispose(); // idempotent (§12)
    expect(playback.state).toBe("disposed");
    expect(h.engine.activeCount).toBe(0);

    await expect(playback.finished).resolves.toEqual({ status: "cancelled" });

    const operations: Array<() => void> = [
      () => playback.play(),
      () => playback.pause(),
      () => playback.reverse(),
      () => playback.seek(10),
      () => playback.seekProgress(0.5),
      () => playback.cancel(),
      () => {
        playback.playbackRate = 2;
      },
    ];
    for (const operation of operations) {
      expect(operation).toThrow(/disposed/);
    }
    // The adapter's optional cleanup hook runs, but host-owned resources are
    // never destroyed by disposal (Appendix B.8).
    expect(target.disposeCalls).toBe(1);
  });

  it("each run has its own completion promise (§11.1)", async () => {
    const h = createHarness();
    const playback = moveAnimation(100).attach(undefined, { engine: h.engine });

    const firstRun = playback.finished;
    playback.play();
    h.tick(200);
    await expect(firstRun).resolves.toEqual({ status: "finished" });

    playback.play(); // new run → new promise
    const secondRun = playback.finished;
    expect(secondRun).not.toBe(firstRun);
    expect(await settled(secondRun)).toBe("pending");
    playback.cancel();
    await expect(secondRun).resolves.toEqual({ status: "cancelled" });
  });
});

describe("playback rate (§12, §16)", () => {
  it("scales time progression and preserves continuity on change", () => {
    const h = createHarness();
    const playback = moveAnimation(1000).attach(undefined, { engine: h.engine });
    expect(playback.playbackRate).toBe(1);

    playback.playbackRate = 2;
    playback.play();
    h.tick(100);
    expect(playback.currentTime).toBeCloseTo(200, 9);

    // Changing the rate mid-run must not jump time (§12, §16).
    const before = playback.currentTime;
    playback.playbackRate = 0.5;
    expect(playback.currentTime).toBe(before);
    h.tick(100);
    expect(playback.currentTime).toBeCloseTo(before + 50, 9);

    // Negative rate runs backwards through time without discontinuity.
    playback.playbackRate = -1;
    h.tick(50);
    expect(playback.currentTime).toBeCloseTo(before + 50 - 50, 9);

    expect(() => {
      playback.playbackRate = Number.NaN;
    }).toThrow(TypeError);
  });
});

describe("repetition and direction (§13)", () => {
  it("finite iterations count the initial iteration as part of the total", () => {
    const h = createHarness();
    const playback = moveAnimation(100).attach(undefined, {
      engine: h.engine,
      iterations: 3,
    });

    playback.play();
    h.tick(250); // two full iterations done, third in progress
    expect(playback.iterationCount).toBe(2);
    expect(playback.state).toBe("running");
    expect(playback.currentTime).toBeCloseTo(50, 9);

    h.tick(100); // total elapsed = 350ms → three iterations complete
    expect(playback.iterationCount).toBe(3);
    expect(playback.state).toBe("finished");
    expect(playback.currentTime).toBe(100);
  });

  it("infinite playback never naturally completes", () => {
    const h = createHarness();
    const playback = moveAnimation(100).attach(undefined, {
      engine: h.engine,
      iterations: "infinite",
    });

    playback.play();
    for (let i = 0; i < 50; i++) h.tick(97); // ~4850ms — many laps
    expect(playback.state).toBe("running");
    expect(h.scheduler.hasPending).toBe(true);
    expect(playback.currentTime).toBeGreaterThanOrEqual(0);
    expect(playback.currentTime).toBeLessThanOrEqual(100);

    playback.cancel();
    expect(playback.state).toBe("cancelled");
  });

  it("reverse direction runs time backwards", () => {
    const h = createHarness();
    const playback = moveAnimation(1000).attach(undefined, {
      engine: h.engine,
      direction: "reverse",
    });

    playback.play();
    expect(playback.currentTime).toBe(1000); // reversed runs start at the end
    h.tick(400);
    expect(playback.currentTime).toBeCloseTo(600, 9);
    h.tick(700);
    expect(playback.state).toBe("finished");
    expect(playback.currentTime).toBe(0); // holds the reversed terminal value
  });

  it("alternate flips direction between iterations without duplicating keyframes (§13)", () => {
    const h = createHarness();
    const playback = moveAnimation(100).attach(undefined, {
      engine: h.engine,
      iterations: 3,
      direction: "alternate",
    });

    playback.play();
    expect(playback.reversed).toBe(false);
    h.tick(50);
    expect(playback.currentTime).toBeCloseTo(50, 9); // iteration 1 forward

    h.tick(100); // crosses end → iteration 2 reversed from the end
    expect(playback.reversed).toBe(true);
    expect(playback.currentTime).toBeCloseTo(50, 9); // 100 − 50 backwards

    h.tick(100); // crosses start → iteration 3 forward again
    expect(playback.reversed).toBe(false);
    expect(playback.currentTime).toBeCloseTo(50, 9);

    h.tick(100); // third iteration completes at the end
    expect(playback.state).toBe("finished");
    expect(playback.currentTime).toBe(100);
  });

  it("alternate-reverse starts reversed and flips each iteration", () => {
    const h = createHarness();
    const playback = moveAnimation(100).attach(undefined, {
      engine: h.engine,
      iterations: "infinite",
      direction: "alternate-reverse",
    });

    playback.play();
    expect(playback.reversed).toBe(true);
    h.tick(150); // 100→0 reversed (iteration 1), then 0→50 forward
    expect(playback.reversed).toBe(false);
    expect(playback.currentTime).toBeCloseTo(50, 9);
  });

  it("reverse() mid-run flips direction while retaining time", () => {
    const h = createHarness();
    const playback = moveAnimation(1000).attach(undefined, { engine: h.engine });
    playback.play();
    h.tick(600);
    playback.reverse();
    h.tick(250);
    expect(playback.currentTime).toBeCloseTo(350, 9);
  });

  it("many iterations in a single frame advance correctly across all crossings", () => {
    const h = createHarness();
    const playback = moveAnimation(100).attach(undefined, {
      engine: h.engine,
      iterations: 5,
      direction: "alternate",
    });
    playback.play();
    h.tick(437); // four full iterations + 37ms into the fifth (forward)
    expect(playback.iterationCount).toBe(4);
    expect(playback.reversed).toBe(false); // even number of flips
    expect(playback.currentTime).toBeCloseTo(37, 9);
    h.tick(100);
    expect(playback.state).toBe("finished");
  });

  it("zero-duration animations finish immediately holding the final value", async () => {
    const target = new RecordingTarget();
    const h = createHarness();
    const playback = moveAnimation(0).attach(target, { engine: h.engine });
    playback.play();
    expect(playback.state).toBe("finished");
    await expect(playback.finished).resolves.toEqual({ status: "finished" });
  });
});

describe("target replacement semantics (§14)", () => {
  it("starting another playback on a target supersedes the existing one", async () => {
    const h = createHarness();
    const target = new RecordingTarget();
    const animation = moveAnimation(1000);

    const first = animation.attach(target, { engine: h.engine });

    first.play();
    h.tick(200);
    const callsAfterFirst = target.matrices.length;
    expect(callsAfterFirst).toBeGreaterThan(0);

    // Re-attach the same definition to the SAME target as a new playback.
    const secondOnTarget = animation.attach(target, { engine: h.engine });
    secondOnTarget.play(); // supersedes `first` (§14)

    expect(first.state).toBe("cancelled");
    await expect(first.finished).resolves.toEqual({ status: "cancelled" });

    h.tick(100);
    // Only the new owner renders now — no additive composition, and the
    // superseded playback produced no further submissions.
    const callsNow = target.matrices.length;
    expect(callsNow).toBeGreaterThan(callsAfterFirst);
    secondOnTarget.pause();
    h.tick(100);
    expect(target.matrices.length).toBe(callsNow);
  });

  it("a superseded paused playback is also cancelled", async () => {
    const h = createHarness();
    const target = new RecordingTarget();
    const animation = moveAnimation(1000);
    const first = animation.attach(target, { engine: h.engine });
    first.play();
    h.tick(100);
    first.pause();

    const second = animation.attach(target, { engine: h.engine });
    second.play();
    expect(first.state).toBe("cancelled");
    await expect(first.finished).resolves.toEqual({ status: "cancelled" });
  });

  it("a finished playback no longer owns the target", () => {
    const h = createHarness();
    const target = new RecordingTarget();
    const animation = moveAnimation(100);
    const first = animation.attach(target, { engine: h.engine });
    first.play();
    h.tick(200);
    expect(first.state).toBe("finished");

    const second = animation.attach(target, { engine: h.engine });
    second.play(); // must not supersede the finished playback beyond a no-op
    expect(first.state).toBe("finished");
    expect(second.state).toBe("running");
  });
});

describe("determinism (§21)", () => {
  it("identical tick sequences produce identical render streams", () => {
    const animation = moveAnimation(500);
    const deltas = [40, 80, 37, 120, 90, 63, 200];

    const run = (): number[] => {
      const h = createHarness();
      const target = new RecordingTarget();
      const playback = animation.attach(target, {
        engine: h.engine,
        iterations: 2,
        direction: "alternate",
        playbackRate: 1.5,
      });
      playback.play();
      for (const delta of deltas) h.tick(delta);
      playback.dispose();
      return target.positionsX;
    };

    expect(run()).toEqual(run());
  });

  it("attaching one definition to many targets yields independent instances (§11)", () => {
    const h = createHarness();
    const animation = moveAnimation(1000);
    const a = animation.attach(new RecordingTarget(), { engine: h.engine });
    const b = animation.attach(new RecordingTarget(), { engine: h.engine });

    a.play();
    h.tick(250);
    b.play();
    h.tick(250);

    expect(a.currentTime).toBeCloseTo(500, 9);
    expect(b.currentTime).toBeCloseTo(250, 9);
    expect(a.state).toBe("running");
    expect(b.state).toBe("running");
  });

  it("state type values match the §12 state list", () => {
    const states: PlaybackState[] = [
      "idle",
      "running",
      "paused",
      "finished",
      "cancelled",
      "disposed",
    ];
    expect(states).toHaveLength(6);
  });
});
