import { describe, expect, it } from "vite-plus/test";

import { Animation } from "../animation/animation.ts";
import type { Matrix4 } from "../matrix/matrix4.ts";
import { PlaybackEngine } from "../playback/engine.ts";
import type { RenderTarget } from "../targets/types.ts";
import { ManualClock } from "../timing/clock.ts";
import { ManualScheduler } from "../timing/scheduler.ts";
import { Transform } from "../transform/transform.ts";
import { Timeline } from "./timeline.ts";

/** Target that records every submitted transform for assertions (§17.1). */
class RecordingTarget implements RenderTarget {
  readonly matrices: Matrix4[] = [];

  setTransform(matrix: Matrix4): void {
    this.matrices.push(matrix);
  }

  get lastPositionX(): number {
    const m = this.matrices[this.matrices.length - 1];
    return m === undefined ? Number.NaN : Transform.fromMatrix(m).components.position.x;
  }

  get callCount(): number {
    return this.matrices.length;
  }
}

/** Identity → `[x, 0, 0]` over `duration`, so local times read off as positions. */
function move(x: number, duration = 100): Animation {
  return Animation.from({ to: { position: [x, 0, 0] }, duration });
}

interface Harness {
  clock: ManualClock;
  scheduler: ManualScheduler;
  engine: PlaybackEngine;
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

function settled(promise: Promise<{ status: string }>): Promise<string> {
  return Promise.race([
    promise.then((r) => r.status),
    new Promise<string>((res) => setTimeout(() => res("pending"), 0)),
  ]);
}

/** Local time of the first sample at `timeMs` — single-entry timelines only. */
function localTimeAt(timeline: Timeline, timeMs: number): number {
  const samples = timeline.sample(timeMs);
  expect(samples.length).toBeGreaterThan(0);
  return (samples[0] as { localTime: number }).localTime;
}

describe("timeline definition & placement (§14.1)", () => {
  it("places named children at absolute times and computes max(at + duration) (§14.3)", () => {
    const scene = Timeline.from({
      heading: { animation: move(100, 300), target: new RecordingTarget(), at: 0 },
      subtitle: { animation: move(200, 250), target: new RecordingTarget(), at: 200 },
    });
    expect(scene.duration).toBe(450); // max(0 + 300, 200 + 250) (§14.3)
    expect(scene.entries.map((e) => e.name)).toEqual(["heading", "subtitle"]);
    expect(scene.entries.map((e) => e.at)).toEqual([0, 200]);
    expect(Object.isFrozen(scene.entries)).toBe(true);
    expect(Object.isFrozen(scene.entries[0])).toBe(true);
  });

  it("accepts bare definitions as shorthand placed at 0", () => {
    const scene = Timeline.from({ a: move(100, 100), b: Timeline.sequence([move(1, 50)]) });
    expect(scene.entries.map((e) => e.at)).toEqual([0, 0]);
    expect(scene.duration).toBe(100);
  });

  it("rejects empty records, invalid children, and negative placement (§14.1)", () => {
    expect(() => Timeline.from({})).toThrow(TypeError);
    expect(() => Timeline.from({ a: 42 as never })).toThrow(TypeError);
    expect(() => Timeline.from({ a: { animation: move(1), at: -1 } })).toThrow(RangeError);
    expect(() => Timeline.sequence([])).toThrow(TypeError);
    expect(() => Timeline.parallel([{} as never])).toThrow(TypeError);
  });

  it("sequences children back to back with an optional gap, preserving intrinsic durations (§14.1)", () => {
    const entrance = Timeline.sequence([move(100, 100), move(200, 50), move(300, 25)], {
      gap: 10,
    });
    expect(entrance.entries.map((e) => e.at)).toEqual([0, 110, 170]);
    expect(entrance.duration).toBe(195); // 100 + 10 + 50 + 10 + 25
    // Children keep their own durations: at t = 60 the first child is at local
    // 60 (not re-timed to some normalized group scale).
    expect(localTimeAt(entrance, 60)).toBeCloseTo(60, 9);
  });

  it("rejects an infinite non-final sequence child but allows an infinite final one (§14.3)", () => {
    const loop = Timeline.repeat(move(100), { iterations: "infinite" });
    expect(() => Timeline.sequence([loop, move(200)])).toThrow(RangeError);
    const trailing = Timeline.sequence([move(100), loop]);
    expect(trailing.duration).toBe(Number.POSITIVE_INFINITY);
  });

  it("parallels children with independent durations; infinite parallel child extends forever (§14.3)", () => {
    const scene = Timeline.parallel([move(100, 100), move(200, 400), move(300, 250)]);
    expect(scene.duration).toBe(400); // ends when the longest finite child ends
    const spinning = Timeline.parallel([
      move(100, 100),
      Timeline.repeat(move(1), { iterations: Infinity }),
    ]);
    expect(spinning.duration).toBe(Number.POSITIVE_INFINITY);
  });

  it("nests timelines so composition composes naturally (§14.1)", () => {
    const inner = Timeline.sequence([move(100, 100), move(200, 100)]);
    const outer = Timeline.from({ act: { animation: inner, at: 50 } });
    expect(outer.duration).toBe(250); // 50 + (100 + 100)
    // At t = 200 the nested timeline is at local 150: its first child has
    // completed (clamped final), its second runs at leaf-local 50 (§14.4).
    const samples = outer.sample(200);
    expect(samples.map((s) => s.localTime)).toEqual([100, 50]);
  });
});

describe("repetition semantics (§13.1, §14.2)", () => {
  it("computes repeated duration as D × N + R × (N − 1) as a single compact entry (§14.3)", () => {
    const repeated = Timeline.repeat(move(100, 100), { iterations: 3, delay: 50 });
    expect(repeated.entries.length).toBe(1); // never eagerly expanded per iteration (§14.2)
    expect(repeated.duration).toBe(400); // 100 × 3 + 50 × 2 — delay omitted after the last (§14.3)
  });

  it("validates iterations as positive total counts or explicit infinity, and delays as non-negative (§13.1)", () => {
    const bad = [0, -1, 1.5, Number.NaN];
    for (const iterations of bad) {
      expect(() => Timeline.repeat(move(1), { iterations })).toThrow(RangeError);
    }
    expect(Timeline.repeat(move(1), { iterations: Infinity }).duration).toBe(
      Number.POSITIVE_INFINITY,
    );
    expect(Timeline.repeat(move(1), { iterations: "infinite" }).entries[0]!.iterations).toBe(
      "infinite",
    );
    expect(() => Timeline.repeat(move(1), { delay: -10 })).toThrow(RangeError);
    expect(() => Timeline.repeat(move(1), { direction: "sideways" as never })).toThrow(RangeError);
  });

  it("maps time through iterations and holds terminal values inside repeat-delay gaps (§13.1)", () => {
    // D = 100, N = 3, R = 200 → window 700; period 300 per iteration.
    const repeated = Timeline.repeat(move(100, 100), { iterations: 3, delay: 200 });
    expect(localTimeAt(repeated, 50)).toBeCloseTo(50, 9); // iteration 0 forward
    expect(localTimeAt(repeated, 150)).toBeCloseTo(100, 9); // in the gap: hold terminal
    expect(localTimeAt(repeated, 350)).toBeCloseTo(50, 9); // iteration 1 restarts from 0
    expect(localTimeAt(repeated, 700)).toBeCloseTo(100, 9); // window end: last final
    // The delay never delays the first iteration (§13.1): t = 0 is local 0.
    expect(localTimeAt(repeated, 0)).toBeCloseTo(0, 9);
  });

  it("alternate reverses progress without snapping to the beginning between iterations (§13.1)", () => {
    const pingPong = Timeline.repeat(move(100, 100), { iterations: 2, direction: "alternate" });
    expect(pingPong.duration).toBe(200);
    expect(localTimeAt(pingPong, 50)).toBeCloseTo(50, 9); // iteration 0 forward
    expect(localTimeAt(pingPong, 150)).toBeCloseTo(50, 9); // iteration 1 reversed: 100 − 50
    // Continuity across the boundary — no snap to 0 (§13.1).
    expect(localTimeAt(pingPong, 100 - 0.001)).toBeCloseTo(100 - 0.001, 6);
    expect(localTimeAt(pingPong, 100 + 0.001)).toBeCloseTo(100 - 0.001, 6);
  });

  it("reverse mode runs every iteration backwards (§13.1)", () => {
    const reversed = Timeline.repeat(move(100, 100), { iterations: 2, direction: "reverse" });
    expect(localTimeAt(reversed, 25)).toBeCloseTo(75, 9); // D − phase
    expect(localTimeAt(reversed, 125)).toBeCloseTo(75, 9);
  });

  it("composes outer and inner repeats independently (§16.1)", () => {
    const inner = Timeline.repeat(move(100, 100), { iterations: 2 }); // window 200
    const outer = Timeline.repeat(inner, { iterations: 3 }); // window 600
    expect(outer.duration).toBe(600);
    expect(localTimeAt(outer, 450)).toBeCloseTo(50, 9); // outer iteration 2 → inner local 50
  });
});

describe("stagger helper (§14.1)", () => {
  it("expands into ordinary scheduled entries at i × delay with explicit ordering", () => {
    const fan = Timeline.stagger(move(100, 100), 3, { delay: 50 });
    expect(fan.entries.map((e) => e.at)).toEqual([0, 50, 100]);
    expect(fan.duration).toBe(200); // (3 − 1) × 50 + 100
    const reversed = Timeline.stagger(move(100, 100), 3, { delay: 50, order: "reverse" });
    expect(reversed.entries.map((e) => e.at)).toEqual([100, 50, 0]);
    // Ordinary entries — same shape as everything else, no special node.
    for (const entry of fan.entries) {
      expect(entry.duration).toBe(100);
      expect(entry.iterations).toBe(1);
    }
  });

  it("binds one render target per expanded item and validates inputs (§14.1)", () => {
    const targets = [new RecordingTarget(), new RecordingTarget()];
    const fan = Timeline.stagger(move(100), targets, { delay: 10 });
    expect(fan.entries.map((e) => e.target)).toEqual(targets);
    expect(() => Timeline.stagger(move(100), [{} as never], { delay: 10 })).toThrow(TypeError);
    expect(() => Timeline.stagger(move(100), 0, { delay: 10 })).toThrow(RangeError);
    expect(() => Timeline.stagger(move(100), 2, {} as never)).toThrow(TypeError);
    expect(() => Timeline.stagger(move(100), 2, { delay: -1 })).toThrow(RangeError);
  });
});

describe("deterministic sampling (§14.4)", () => {
  it("produces nothing before a child's start and clamps completed children to endpoints", () => {
    const scene = Timeline.from({ late: { animation: move(100, 100), at: 200 } });
    expect(scene.sample(150)).toEqual([]); // not begun (§14.4)
    const done = scene.sample(500); // completed: holds the endpoint behavior
    expect(done.length).toBe(1);
    expect(done[0]!.localTime).toBeCloseTo(100, 9);
    expect(done[0]!.transform.components.position.x).toBeCloseTo(100, 9);
  });

  it("flattens nested timelines carrying inner names, targets, and local times (§14.4)", () => {
    const target = new RecordingTarget();
    const inner = Timeline.from({ card: { animation: move(100, 100), target, at: 25 } });
    const outer = Timeline.from({ act: { animation: inner, at: 50 } });
    const samples = outer.sample(100); // inner started at 75; local 25
    expect(samples.length).toBe(1);
    expect(samples[0]!.name).toBe("card");
    expect(samples[0]!.target).toBe(target);
    expect(samples[0]!.localTime).toBeCloseTo(25, 9); // 100 − 50 − 25 (§14.4)
  });

  it("keeps samples in schedule order so same-target conflicts resolve by explicit ordering (§14.4)", () => {
    const shared = new RecordingTarget();
    const scene = Timeline.parallel([
      move(10, 100), // untitled entries carry no name
      { animation: move(20, 100), target: shared },
      { animation: move(30, 100), target: shared },
    ]);
    const samples = scene.sample(50);
    expect(samples.map((s) => s.target === shared)).toEqual([false, true, true]);
    // Replacement, not additive: the last entry in order is what a renderer applies.
    expect(samples[2]!.transform.components.position.x).toBeCloseTo(15, 9);
  });

  it("sampleProgress maps over total duration and rejects infinite horizons (§14.3)", () => {
    const scene = Timeline.sequence([move(100, 100), move(200, 100)]);
    // progress 0.25 over the 200 ms horizon → shared t = 50: only the first
    // child has started, at leaf-local 50 (§14.3).
    const samples = scene.sampleProgress(0.25);
    expect(samples.length).toBe(1);
    expect(samples[0]!.localTime).toBeCloseTo(50, 9);
    const forever = Timeline.repeat(move(1), { iterations: "infinite" });
    expect(() => forever.sampleProgress(0.5)).toThrow(Error);
    expect(() => scene.sample(Number.NaN)).toThrow(TypeError);
  });
});

describe("timeline playback through the shared scheduler (§16.1)", () => {
  it("drives children from one shared time as a single scheduled unit (§16.1)", async () => {
    const h = createHarness();
    const a = new RecordingTarget();
    const b = new RecordingTarget();
    const scene = Timeline.sequence([
      { animation: move(100, 100), target: a },
      { animation: move(200, 100), target: b },
    ]);
    const playback = scene.attach({ engine: h.engine });
    playback.play();
    expect(h.engine.activeCount).toBe(1); // one scheduled unit for the whole scene
    expect(h.scheduler.pendingCount).toBe(1);

    h.tick(50); // shared t = 50: child A local 50, child B not started
    expect(a.lastPositionX).toBeCloseTo(50, 9);
    expect(b.callCount).toBe(0);

    h.tick(75); // shared t = 125: A completed (holds final), B local 25
    expect(a.lastPositionX).toBeCloseTo(100, 9);
    expect(b.lastPositionX).toBeCloseTo(50, 9); // B authored 0→200 over 100 ms

    h.tick(75); // shared t = 200 — exactly on the horizon: finishes only once crossed
    expect(playback.state).toBe("running");
    expect(a.lastPositionX).toBeCloseTo(100, 9);
    expect(b.lastPositionX).toBeCloseTo(200, 9);

    h.tick(1); // cross the horizon → finish naturally with terminal outputs (§12)
    expect(playback.state).toBe("finished");
    expect(b.lastPositionX).toBeCloseTo(200, 9);
    await expectSettled(playback.finished, "finished");
  });

  it("finishes with a resolved finished promise and supports pause/seek/rate/reverse (§12)", async () => {
    const h = createHarness();
    const target = new RecordingTarget();
    const scene = Timeline.from({ hero: { animation: move(100, 200), target } });
    const playback = scene.attach({ engine: h.engine });

    playback.play();
    h.tick(50);
    playback.pause();
    const pausedAt = playback.currentTime;
    h.tick(100); // no advancement while paused (§12)
    expect(playback.currentTime).toBe(pausedAt);
    expect(target.lastPositionX).toBeCloseTo(25, 9);

    playback.playbackRate = 2; // continuity: time is never jumped (§16)
    expect(playback.currentTime).toBe(pausedAt);
    playback.play();
    h.tick(25); // 25 ms of clock × rate 2 → +50 ms of shared time
    expect(playback.currentTime).toBeCloseTo(100, 9);

    playback.seek(10);
    expect(playback.state).toBe("running");
    expect(target.lastPositionX).toBeCloseTo(5, 9);

    h.tick(500); // cross the horizon → terminal value + finish (§12)
    expect(playback.state).toBe("finished");
    expect(target.lastPositionX).toBeCloseTo(100, 9);
    await expectSettled(playback.finished, "finished");

    playback.playbackRate = 1; // restore nominal rate for the restart checks below
    playback.reverse();
    playback.play(); // restarts in current direction from the beginning (§12)
    h.tick(50);
    expect(playback.state).toBe("running");
    expect(playback.reversed).toBe(true);
    expect(target.lastPositionX).toBeCloseTo(75, 9); // running backwards from 100
    playback.cancel();
    await expectSettled(playback.finished, "cancelled");
  });

  it("never completes naturally with infinite duration and supports absolute seek (§14.3, §16.1)", async () => {
    const h = createHarness();
    const target = new RecordingTarget();
    // Infinite repetition over a finite source is legal (§13.1); binding the
    // target on the outer entry flows through to the wrapped child (§14.4).
    const spin = Timeline.repeat(move(100, 100), { iterations: Infinity });
    const scene = Timeline.parallel([{ animation: spin, target }, move(1, 50)]);
    expect(scene.duration).toBe(Number.POSITIVE_INFINITY);

    const playback = scene.attach({ engine: h.engine });
    playback.play();
    h.tick(300);
    expect(playback.state).toBe("running"); // infinite parallel child never finishes (§14.3)
    expect(playback.currentTime).toBeCloseTo(300, 9);
    // Normal repetition restarts each iteration from the authored beginning
    // (§13.1): t = 300 lands exactly on a new iteration boundary.
    expect(target.lastPositionX).toBeCloseTo(0, 9);

    playback.seek(120);
    expect(playback.currentTime).toBeCloseTo(120, 9);
    expect(() => playback.seekProgress(0.5)).toThrow(Error); // no finite horizon (§14.3)

    playback.cancel();
    await expectSettled(playback.finished, "cancelled");
  });

  it("repeats the whole choreography at playback level, composing with segment repeats (§14.2, §16.1)", () => {
    const h = createHarness();
    const target = new RecordingTarget();
    // Segment: two iterations of a 50 ms move → window 100; timeline horizon 100.
    const scene = Timeline.from({
      pulse: { animation: Timeline.repeat(move(100, 50), { iterations: 2 }), target },
    });
    const playback = scene.attach({ engine: h.engine, iterations: 3 });

    playback.play();
    h.tick(75); // outer iteration 0: shared t = 75 → segment iteration 1, local 25 → x = 50
    expect(playback.iterationCount).toBe(0);
    expect(target.lastPositionX).toBeCloseTo(50, 9);
    h.tick(75); // outer t = 150 → iteration 1, shared time 50 → segment local 50
    expect(playback.iterationCount).toBe(1);
    expect(playback.currentTime).toBeCloseTo(50, 9);
    h.tick(200); // cross two more horizons → done at outer t = 300 (§13.1 total count)
    expect(playback.state).toBe("finished");
    expect(playback.iterationCount).toBe(3);
  });

  it("supersedes existing playbacks on bound targets in both directions (§14)", async () => {
    const h = createHarness();
    const shared = new RecordingTarget();

    // Animation playback owns the target; starting a timeline playback supersedes it.
    const animationPlayback = move(100, 500).attach(shared, { engine: h.engine });
    animationPlayback.play();
    const scene = Timeline.from({ hero: { animation: move(200, 200), target: shared } });
    const timelinePlayback = scene.attach({ engine: h.engine });
    timelinePlayback.play();
    expect(animationPlayback.state).toBe("cancelled"); // replacement semantics (§14)
    await expectSettled(animationPlayback.finished, "cancelled");

    // And back the other way: an animation playback supersedes a running timeline.
    const takeover = move(300, 500).attach(shared, { engine: h.engine });
    takeover.play();
    expect(timelinePlayback.state).toBe("cancelled");
    await expectSettled(timelinePlayback.finished, "cancelled");
  });

  it("follows lifecycle rules: dispose settles pending promises and blocks further use (§12)", async () => {
    const h = createHarness();
    const target = new RecordingTarget();
    const scene = Timeline.from({ hero: { animation: move(100, 100), target } });
    const playback = scene.attach({ engine: h.engine });

    playback.play();
    h.tick(40);
    playback.dispose();
    expect(playback.state).toBe("disposed");
    h.tick(1); // flush the engine's queued frame — nothing left to drive (§16)
    expect(h.scheduler.hasPending).toBe(false); // unregistered from the engine
    await expectSettled(playback.finished, "cancelled");
    playback.dispose(); // idempotent (§12)
    expect(() => playback.play()).toThrow(Error);
    expect(target.callCount).toBeGreaterThan(0); // last outputs retained; nothing destroyed (§B.8)
  });

  it("flattens nested targets for ownership and exposes them on the playback", () => {
    const innerTarget = new RecordingTarget();
    const outerTarget = new RecordingTarget();
    const inner = Timeline.from({ card: { animation: move(100), target: innerTarget } });
    const scene = Timeline.parallel([
      { animation: inner },
      { animation: move(1), target: outerTarget },
    ]);
    const playback = scene.attach({ engine: createHarness().engine });
    expect(playback.targets).toEqual([innerTarget, outerTarget]);
  });
});

function expectSettled(promise: Promise<{ status: string }>, status: string): Promise<void> {
  return settled(promise).then((result) => {
    expect(result).toBe(status);
  });
}
