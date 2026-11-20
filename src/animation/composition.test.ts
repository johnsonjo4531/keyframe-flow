import { describe, expect, it } from "vite-plus/test";

import { Animation } from "./animation.ts";
import { Matrix4 } from "../matrix/matrix4.ts";
import { Quaternion } from "../transform/quaternion.ts";
import { transform, Transform } from "../transform/transform.ts";

function moveX(from: number, to: number, duration: number): Animation {
  return Animation.from({
    from: { position: [from, 0, 0] as [number, number, number] },
    to: { position: [to, 0, 0] as [number, number, number] },
    duration,
  });
}

function scaleUp(to: number, duration: number): Animation {
  return Animation.from({
    from: { scale: 1 },
    to: { scale: to },
    duration,
  });
}

const xOf = (t: Transform): number => t.components.position.x;

describe("Animation.combine — property-level composition (§14)", () => {
  it("composes move + rotate + scale without authoring a combined animation", () => {
    const move = moveX(0, 100, 1000);
    const rotate = Animation.from({
      from: { rotation: [0, 0, 0] as [number, number, number] },
      to: { rotation: [0, Math.PI / 2, 0] as [number, number, number] },
      duration: 1000,
    });
    const scale = scaleUp(2, 1000);

    const composed = Animation.combine([move, rotate, scale]);
    expect(composed.duration).toBe(1000);

    const mid = composed.sampleProgress(0.5);
    expect(xOf(mid)).toBeCloseTo(50); // from `move`
    expect(mid.components.scale.x).toBeCloseTo(1.5); // from `scale`
    // From `rotate`: halfway through rotateY(90°) is rotateY(45°): x̂ → (cos45, 0, −sin45).
    const rotated = mid.components.rotation.rotateVector([1, 0, 0]);
    expect(rotated.x).toBeCloseTo(Math.SQRT1_2, 6);
    expect(rotated.z).toBeCloseTo(-Math.SQRT1_2, 6);

    // The full end state applies all three inputs.
    const end = composed.sampleProgress(1);
    expect(xOf(end)).toBeCloseTo(100);
    expect(end.components.scale.x).toBeCloseTo(2);
    expect(end.components.rotation.rotateVector([1, 0, 0]).z).toBeCloseTo(-1, 6);
  });

  it("inputs only override properties they animate (§14)", () => {
    const move = moveX(0, 100, 1000);
    // A pure-scale animation must not reset position to identity defaults.
    const composed = Animation.combine([move, scaleUp(2, 1000)]);
    const mid = composed.sampleProgress(0.5);
    expect(xOf(mid)).toBeCloseTo(50);

    // Reverse order: later input wins only its own animated properties.
    const flipped = Animation.combine([scaleUp(2, 1000), move]);
    const flippedMid = flipped.sampleProgress(0.5);
    expect(xOf(flippedMid)).toBeCloseTo(50);
    expect(flippedMid.components.scale.x).toBeCloseTo(1.5);
  });

  it("later inputs win overlapping animated properties — no additive composition (§14)", () => {
    const first = moveX(0, 100, 1000);
    const second = moveX(200, 300, 1000);
    const composed = Animation.combine([first, second]);
    expect(xOf(composed.sampleProgress(0.5))).toBeCloseTo(250); // not 200 (sum)

    const reversed = Animation.combine([second, first]);
    expect(xOf(reversed.sampleProgress(0.5))).toBeCloseTo(50);
  });

  it("shorter inputs hold their final value once complete (§6.2)", () => {
    const long = moveX(0, 100, 1000);
    const shortScale = scaleUp(2, 500);
    const composed = Animation.combine([long, shortScale]);

    // At t = 1000 ms the 500 ms input has completed and holds scale = 2.
    const end = composed.sample(1000);
    expect(xOf(end)).toBeCloseTo(100);
    expect(end.components.scale.x).toBeCloseTo(2);

    // Mid-flight: short input is at its own midpoint (progress 0.5 of 500 ms).
    const mid = composed.sample(250);
    expect(mid.components.scale.x).toBeCloseTo(1.5);
  });

  it("position is a single property — overlapping position inputs replace wholesale (§14)", () => {
    const moveXAxis = moveX(0, 100, 1000);
    const moveYAxis = Animation.from({
      from: { position: [0, 0, 0] as [number, number, number] },
      to: { position: [0, 10, 0] as [number, number, number] },
      duration: 500,
    });
    // Both animate `position`, so the later input owns the whole vector —
    // there is no component-wise merging (§14).
    const composed = Animation.combine([moveXAxis, moveYAxis]);
    const end = composed.sample(1000);
    expect(xOf(end)).toBeCloseTo(0);
    expect(end.components.position.y).toBeCloseTo(10);
  });

  it("animatedProperties detects wobble that returns to the start value", () => {
    const wobble = Animation.from({
      keyframes: [
        { at: 0, transform: transform() },
        { at: 0.5, transform: transform().translate(100, 0, 0) },
        { at: 1, transform: transform() },
      ],
      duration: 100,
    });
    expect(wobble.animatedProperties.position).toBe(true);
    expect(wobble.animatedProperties.rotation).toBe(false);

    const constant = Animation.from({
      keyframes: [{ at: 0, transform: transform() }],
      duration: 100,
    });
    expect(constant.animatedProperties).toEqual({ position: false, rotation: false, scale: false });
  });

  it("validates inputs explicitly", () => {
    expect(() => Animation.combine([])).toThrow(TypeError);
    expect(() => Animation.combine([moveX(0, 1, 10), "nope" as unknown as Animation])).toThrow(
      TypeError,
    );
  });

  it("exposes composes' inputs via children and an empty keyframe timeline (§14)", () => {
    const a = moveX(0, 10, 10);
    const b = scaleUp(2, 10);
    const composed = Animation.combine([a, b]);
    expect(composed.children).toEqual([a, b]);
    expect(composed.keyframes).toHaveLength(0);
  });
});

describe("Animation.group — groups and nested timelines (§14, §19)", () => {
  it("sequences children back to back over the summed duration", () => {
    const move = moveX(0, 100, 500);
    const scale = scaleUp(2, 500);
    const group = Animation.group([move, scale]);
    expect(group.duration).toBe(1000);

    // In the first child's window at its midpoint.
    const inMove = group.sample(250);
    expect(xOf(inMove)).toBeCloseTo(50);
    expect(inMove.components.scale.x).toBeCloseTo(1);

    // In the second child's window at its midpoint.
    const inScale = group.sample(750);
    expect(xOf(inScale)).toBeCloseTo(0); // second child defines no motion
    expect(inScale.components.scale.x).toBeCloseTo(1.5);

    // Endpoint clamps hold the final value of the last child.
    expect(group.sample(2000).components.scale.x).toBeCloseTo(2);
  });

  it("nests groups inside groups naturally", () => {
    const move = moveX(0, 100, 500);
    const scale = scaleUp(2, 500);
    const inner = Animation.group([move, scale]); // 1000 ms
    const tail = moveX(100, 200, 1000);
    const outer = Animation.group([inner, tail]);
    expect(outer.duration).toBe(2000);

    const inInner = outer.sample(750); // second child of inner at its midpoint
    expect(inInner.components.scale.x).toBeCloseTo(1.5);

    const inTail = outer.sample(1500); // tail at its midpoint: 100 → 200 by 150
    expect(xOf(inTail)).toBeCloseTo(150);
  });

  it("parallel layout merges animated properties like combine (§14)", () => {
    const move = moveX(0, 100, 1000);
    const scale = scaleUp(2, 1000);
    const parallel = Animation.group([move, scale], { layout: "parallel" });
    expect(parallel.duration).toBe(1000);

    const mid = parallel.sampleProgress(0.5);
    expect(xOf(mid)).toBeCloseTo(50);
    expect(mid.components.scale.x).toBeCloseTo(1.5);
  });

  it("validates inputs and layout explicitly", () => {
    expect(() => Animation.group([])).toThrow(TypeError);
    expect(() =>
      Animation.group([moveX(0, 1, 10)], { layout: "overlap" as unknown as "sequence" }),
    ).toThrow(RangeError);
  });

  it("zero-duration children in sequences hold the first child's start value", () => {
    const zero = Animation.from({ from: transform(), to: transform(), duration: 0 });
    const group = Animation.group([zero]);
    expect(group.duration).toBe(0);
    expect(() => group.sampleProgress(0.5)).not.toThrow();
  });
});

describe("angular rotation tracks (§9.1, T35)", () => {
  it("performs a full revolution without intermediate keyframes", () => {
    const spin = Animation.from({
      from: {
        position: [0, 0, 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
      },
      to: { rotation: [0, Math.PI * 2, 0] as [number, number, number] },
      duration: 1000,
      rotationMode: "angular",
    });

    // Halfway through a full turn is a half turn — not the no-op that
    // shortest-path SLERP produces for equivalent orientations.
    const mid = spin.sample(500).components.rotation;
    const rotated = mid.rotateVector([1, 0, 0]);
    expect(rotated.x).toBeCloseTo(-1, 6);

    const quarter = spin.sample(250).components.rotation.rotateVector([1, 0, 0]);
    expect(quarter.z).toBeCloseTo(-1, 6); // rotateY(90°): x̂ → −ẑ

    // Endpoints reproduce the authored orientations.
    const end = spin.sample(1000).components.rotation.rotateVector([1, 0, 0]);
    expect(end.x).toBeCloseTo(1, 6);
  });

  it("default quaternion mode collapses a full turn to no motion (§9.1)", () => {
    const collapsed = Animation.from({
      from: { rotation: [0, 0, 0] as [number, number, number] },
      to: { rotation: [0, Math.PI * 2, 0] as [number, number, number] },
      duration: 1000,
    });
    const mid = collapsed.sample(500).components.rotation.rotateVector([1, 0, 0]);
    expect(mid.x).toBeCloseTo(1, 6); // still identity — orientations only
  });

  it("captures authored angles from generator-produced keyframes too (§5.4)", () => {
    function* turns() {
      yield { at: 0, transform: { rotation: [0, 0, 0] as [number, number, number] } };
      yield { at: 1, transform: { rotation: [0, Math.PI * 4, 0] as [number, number, number] } };
    }

    const twoTurns = Animation.from({
      keyframes: turns,
      duration: 1000,
      rotationMode: "angular",
    });

    // A quarter through two revolutions is a half turn.
    const q = twoTurns.sample(250).components.rotation.rotateVector([1, 0, 0]);
    expect(q.x).toBeCloseTo(-1, 6);
  });

  it("angular mode with quaternion-only inputs uses principal decomposed angles", () => {
    const quarter = Animation.from({
      from: transform(),
      to: transform().rotateY(Math.PI / 2),
      duration: 1000,
      rotationMode: "angular",
    });
    // Endpoints still reproduce the authored orientations exactly.
    const start = quarter.sample(0).components.rotation;
    const end = quarter.sample(1000).components.rotation;
    expect(start.rotateVector([1, 0, 0]).x).toBeCloseTo(1, 6);
    expect(end.rotateVector([1, 0, 0]).z).toBeCloseTo(-1, 6);
  });
});

describe("raw matrix interpolation (§9.2, T37)", () => {
  it("Matrix4#lerp interpolates elements explicitly", () => {
    const a = Matrix4.fromTRS([0, 0, 0], Quaternion.identity(), [1, 1, 1]);
    const b = Matrix4.fromTRS([10, 20, 30], Quaternion.identity(), [1, 1, 1]);

    expect(a.lerp(b, 0).equals(a)).toBe(true);
    expect(a.lerp(b, 1).equals(b)).toBe(true);

    const mid = a.lerp(b, 0.5);
    expect(mid.at(0, 3)).toBeCloseTo(5);
    expect(mid.at(1, 3)).toBeCloseTo(10);
    expect(mid.at(2, 3)).toBeCloseTo(15);

    expect(() => a.lerp(b, Number.NaN)).toThrow(TypeError);
  });

  it("raw-matrix mode matches TRS interpolation for translation-only motion", () => {
    const trs = moveX(0, 100, 1000).sample(500);
    const raw = Animation.from({
      from: { position: [0, 0, 0] as [number, number, number] },
      to: { position: [100, 0, 0] as [number, number, number] },
      duration: 1000,
      interpolation: "raw-matrix",
    }).sample(500);

    expect(raw.equals(trs, 1e-9)).toBe(true);
  });

  it("fails explicitly rather than approximating non-decomposable raw results (§9.2)", () => {
    const crossedAxes = Animation.from({
      from: transform().rotateX(Math.PI / 2),
      to: transform().rotateY(Math.PI / 2),
      duration: 1000,
      interpolation: "raw-matrix",
    });

    // The raw midpoint of two different-axis rotations contains shear and
    // cannot decompose into TRS — an explicit throw beats silent approximation.
    expect(() => crossedAxes.sample(500)).toThrow(/shear|decompos/i);
  });

  it("rejects conflicting interpolation options at definition time", () => {
    expect(() =>
      Animation.from({
        from: transform(),
        to: transform().rotateY(Math.PI),
        duration: 100,
        rotationMode: "angular",
        interpolation: "raw-matrix",
      }),
    ).toThrow(/conflict/);

    expect(() =>
      Animation.from({
        from: transform(),
        to: transform(),
        duration: 100,
        interpolation: "nonsense" as unknown as "trs",
      }),
    ).toThrow(RangeError);
  });
});
