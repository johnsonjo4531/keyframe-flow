import { describe, expect, it } from "vite-plus/test";

import { Quaternion } from "../transform/quaternion.ts";
import { transform } from "../transform/transform.ts";
import { Animation } from "./animation.ts";
import type { EasingName } from "./easing.ts";
import type { TransformKeyframe } from "./keyframes.ts";

describe("Animation.from with from/to definitions (§5.2, T13)", () => {
  it("normalizes from/to into a two-keyframe timeline at 0 and 1", () => {
    const anim = Animation.from({
      from: transform(),
      to: transform().translate(100, 0, 0),
      duration: 2000,
    });

    expect(anim.duration).toBe(2000);
    expect(anim.keyframes).toHaveLength(2);
    expect(anim.keyframes[0]!.at).toBe(0);
    expect(anim.keyframes[1]!.at).toBe(1);
    expect(anim.keyframes[0]!.transform.equals(transform())).toBe(true);
  });

  it("samples endpoints and midpoint of a from/to animation", () => {
    const from = transform();
    const to = transform().translate(100, 0, 0);
    const anim = Animation.from({ from, to, duration: 2000 });

    expect(anim.sample(0)).toBe(from);
    expect(anim.sample(2000)).toBe(to);
    expect(anim.sample(1000).components.position.toArray()).toEqual([50, 0, 0]);
  });

  it("produces the same timeline as the equivalent keyframes definition", () => {
    const from = transform().translate(-20, 0, 5);
    const to = transform().rotateY(1.1).scale(1.7);

    const viaFromTo = Animation.from({ from, to, duration: 800 });
    const viaKeyframes = Animation.from({
      keyframes: [
        { at: 0, transform: from },
        { at: 1, transform: to },
      ],
      duration: 800,
    });

    for (const ms of [0, 123, 400, 657, 800]) {
      expect(viaFromTo.sample(ms).equals(viaKeyframes.sample(ms), 1e-12)).toBe(true);
    }
  });

  it("accepts an animation-level easing option", () => {
    const anim = Animation.from({
      from: transform(),
      to: transform().translate(100, 0, 0),
      duration: 1000,
      easing: "ease-in-out",
    });
    expect(anim.sample(500).components.position.x).toBeCloseTo(50, 6);
  });

  it("a full-revolution from/to holds orientation because endpoints are equivalent (§9.1)", () => {
    // §9.1: equivalent start/end orientations do not describe a revolution;
    // the spin example from §5.2 therefore stays at the identity orientation.
    const spin = Animation.from({
      from: transform(),
      to: transform().rotateY(Math.PI * 2),
      duration: 2000,
    });
    expect(spin.sample(1000).equals(transform())).toBe(true);
  });
});

describe("Duration validation (§6.2)", () => {
  const from = transform();
  const to = transform().translate(1, 0, 0);

  it("requires a finite numeric duration", () => {
    expect(() => Animation.from({ from, to } as never)).toThrow(/duration/);
    expect(() => Animation.from({ from, to, duration: "2000" } as never)).toThrow(/duration/);
    expect(() => Animation.from({ from, to, duration: Number.NaN })).toThrow(/duration/);
    expect(() => Animation.from({ from, to, duration: Number.POSITIVE_INFINITY })).toThrow(
      /duration/,
    );
  });

  it("rejects negative durations", () => {
    expect(() => Animation.from({ from, to, duration: -5 })).toThrow(/negative/);
  });

  it("allows a zero duration", () => {
    const anim = Animation.from({ from, to, duration: 0 });
    expect(anim.sample(-1)).toBe(from);
    expect(anim.sample(0)).toBe(from);
    expect(anim.sample(1)).toBe(to);
  });
});

describe("Definition shape validation (§5.1)", () => {
  it("rejects mixing keyframes with from/to", () => {
    expect(() =>
      Animation.from({
        keyframes: [{ at: 0, transform: transform() }],
        from: transform(),
        duration: 100,
      } as never),
    ).toThrow(/not both/);
  });

  it("rejects a definition with neither keyframes nor from/to", () => {
    expect(() => Animation.from({ duration: 100 } as never)).toThrow(/requires/);
  });

  it("rejects non-object definitions", () => {
    expect(() => Animation.from(null as never)).toThrow(/definition object/);
    // A Transform is an object but not a definition — it fails on duration.
    expect(() => Animation.from(transform() as never)).toThrow(/duration/);
  });

  it("validates keyframe sources eagerly at definition time (§5.5)", () => {
    expect(() => Animation.from({ keyframes: [], duration: 100 })).toThrow(/at least one keyframe/);
    expect(() =>
      Animation.from({
        keyframes: [
          { at: 0.5, transform: transform() },
          { at: 0.2, transform: transform() },
        ],
        duration: 100,
      }),
    ).toThrow(/strictly increasing/);
  });

  it("validates named easings eagerly at definition time (§8)", () => {
    const bogus = "bounce-like" as string as EasingName;
    expect(() =>
      Animation.from({ from: transform(), to: transform(), duration: 1, easing: bogus }),
    ).toThrow(/Unknown easing/);
    expect(() =>
      Animation.from({
        keyframes: [{ at: 0, transform: transform(), easing: bogus }],
        duration: 1,
      }),
    ).toThrow(/Unknown easing/);
  });
});

describe("Property-level from/to definitions (§7, T14)", () => {
  it("normalizes the §7 example into the transform representation", () => {
    const anim = Animation.from({
      from: { position: [0, 0, 0], rotation: [0, 0, 0] },
      to: { position: [100, 0, 0], rotation: [0, Math.PI, 0] },
      duration: 1000,
    });

    const start = anim.keyframes[0]!.transform;
    const end = anim.keyframes[1]!.transform;

    expect(start.components.position.toArray()).toEqual([0, 0, 0]);
    expect(start.components.rotation.equals(Quaternion.identity())).toBe(true);
    // Unspecified scale falls back to the documented identity default (§7).
    expect(start.components.scale.toArray()).toEqual([1, 1, 1]);

    expect(end.components.position.toArray()).toEqual([100, 0, 0]);
    expect(end.components.rotation.equals(Quaternion.fromAxisAngle([0, 1, 0], Math.PI), 1e-9)).toBe(
      true,
    );

    const mid = anim.sample(500);
    expect(mid.components.position.toArray()).toEqual([50, 0, 0]);
    expect(
      mid.components.rotation.equals(Quaternion.fromAxisAngle([0, 1, 0], Math.PI / 2), 1e-9),
    ).toBe(true);
  });

  it("preserves properties unspecified in `to` from the explicit starting transform", () => {
    const startTransform = transform().translate(5, 6, 7).scale(3);
    const anim = Animation.from({
      from: startTransform,
      to: { rotation: [0, 0, Math.PI] },
      duration: 100,
    });

    const end = anim.keyframes[1]!.transform;
    expect(end.components.position.toArray()).toEqual([5, 6, 7]);
    expect(end.components.scale.toArray()).toEqual([3, 3, 3]);
    expect(end.components.rotation.equals(Quaternion.fromAxisAngle([0, 0, 1], Math.PI), 1e-9)).toBe(
      true,
    );

    // The full starting transform is used verbatim as the first keyframe.
    expect(anim.keyframes[0]!.transform).toBe(startTransform);
  });

  it("uses documented identity defaults when no starting transform is supplied", () => {
    const anim = Animation.from({ to: { position: [10, 0, 0] }, duration: 100 });
    const start = anim.keyframes[0]!.transform;
    expect(start.components.position.toArray()).toEqual([0, 0, 0]);
    expect(start.components.rotation.equals(Quaternion.identity())).toBe(true);
    expect(start.components.scale.toArray()).toEqual([1, 1, 1]);

    const end = anim.keyframes[1]!.transform;
    expect(end.components.position.toArray()).toEqual([10, 0, 0]);
    // Rotation and scale are preserved from the identity-default start.
    expect(end.components.rotation.equals(Quaternion.identity())).toBe(true);
    expect(end.components.scale.toArray()).toEqual([1, 1, 1]);
  });

  it("merges a partial `from` over identity defaults", () => {
    const anim = Animation.from({ from: { position: [1, 2, 3] }, duration: 100 });
    const start = anim.keyframes[0]!.transform;
    expect(start.components.position.toArray()).toEqual([1, 2, 3]);
    expect(start.components.scale.toArray()).toEqual([1, 1, 1]);

    // `from` alone produces a constant animation at the starting transform.
    expect(anim.sample(50).equals(start)).toBe(true);
  });

  it("accepts a uniform scale number in property-level definitions", () => {
    const anim = Animation.from({ from: { scale: 2 }, to: { scale: 4 }, duration: 100 });
    expect(anim.sample(50).components.scale.toArray()).toEqual([3, 3, 3]);
  });

  it("rejects invalid property-level values explicitly", () => {
    expect(() => Animation.from({ from: [1, 2, 3] as never, duration: 1 })).toThrow(
      /Property-level/,
    );
  });
});

describe("Keyframe definitions and eager timeline sharing (§5.3–§5.5, T11)", () => {
  it("normalizes the §5.3 static keyframe example", () => {
    const k0 = transform();
    const k1 = transform().translate(0, 100, 0);
    const anim = Animation.from({
      keyframes: [
        { at: 0, transform: k0 },
        { at: 0.5, transform: k1 },
        { at: 1, transform: k0 },
      ],
      duration: 1000,
    });

    expect(anim.keyframes).toHaveLength(3);
    // Exact keyframe hits return the authored transforms from the shared
    // normalized timeline.
    expect(anim.sample(0)).toBe(k0);
    expect(anim.sample(500)).toBe(k1);
    expect(anim.sample(1000)).toBe(k0);

    // Between keyframes the shared timeline is interpolated linearly (§9).
    expect(anim.sample(250).components.position.toArray()).toEqual([0, 50, 0]);
  });

  it("runs generator sources exactly once per definition (§5.5)", () => {
    let runs = 0;
    function* orbit(): Generator<TransformKeyframe> {
      runs++;
      for (let i = 0; i <= 100; i++) {
        const progress = i / 100;
        yield {
          at: progress,
          transform: transform().translate(
            Math.cos(progress * Math.PI * 2) * 100,
            Math.sin(progress * Math.PI * 2) * 100,
            0,
          ),
        };
      }
    }

    const anim = Animation.from({ keyframes: orbit, duration: 3000 });
    expect(runs).toBe(1);
    expect(anim.keyframes).toHaveLength(101);

    // Sampling never re-executes the generator; playback consumers would also
    // share this single normalized timeline (§5.5).
    for (let ms = 0; ms <= 3000; ms += 250) anim.sample(ms);
    expect(runs).toBe(1);

    const half = anim.sample(1500);
    expect(half.components.position.x).toBeCloseTo(-100, 9);
    expect(half.components.position.y).toBeCloseTo(0, 9);
  });

  it("freezes the normalized timeline so it cannot be mutated", () => {
    const anim = Animation.from({
      keyframes: [
        { at: 0, transform: transform() },
        { at: 1, transform: transform() },
      ],
      duration: 100,
    });
    expect(Object.isFrozen(anim.keyframes)).toBe(true);
  });

  it("repeated sampling of the same timeline is stable and does not mutate (§10.3)", () => {
    const anim = Animation.from({
      keyframes: [
        { at: 0, transform: transform() },
        { at: 0.5, transform: transform().translate(40, 0, 0) },
        { at: 1, transform: transform().translate(40, 90, 0) },
      ],
      duration: 1000,
    });

    const first = anim.sample(333);
    for (let i = 0; i < 50; i++) {
      expect(anim.sample(333).equals(first)).toBe(true);
    }
    expect(anim.keyframes).toHaveLength(3);
    expect(anim.duration).toBe(1000);
  });
});

describe("Easing in sampling (§8, T15)", () => {
  const moveX = (x: number) => transform().translate(x, 0, 0);

  it("defaults to linear easing when none is specified", () => {
    const anim = Animation.from({ from: moveX(0), to: moveX(100), duration: 1000 });
    expect(anim.sample(250).components.position.x).toBeCloseTo(25, 9);
  });

  it("applies an animation-level custom easing function without registration (§8)", () => {
    const anim = Animation.from({
      from: moveX(0),
      to: moveX(100),
      duration: 100,
      easing: (t) => t * t,
    });
    expect(anim.sample(50).components.position.x).toBeCloseTo(25, 9);
  });

  it("a keyframe's easing controls the segment to the next keyframe (§8)", () => {
    const anim = Animation.from({
      keyframes: [
        { at: 0, transform: moveX(0) },
        { at: 0.5, transform: moveX(100), easing: "ease-in-quad" },
        { at: 1, transform: moveX(200), easing: "ease-out" },
      ],
      duration: 100,
    });

    // Segment [0, 0.5]: no keyframe easing and no animation default → linear.
    expect(anim.sample(25).components.position.x).toBeCloseTo(50, 9);

    // Segment [0.5, 1]: the keyframe at 0.5 eases quad; at localT = 0.5 the
    // eased value is 0.25 → x = 100 + 0.25 × 100 = 125.
    expect(anim.sample(75).components.position.x).toBeCloseTo(125, 9);
  });

  it("custom segment easings work too", () => {
    const anim = Animation.from({
      keyframes: [
        { at: 0, transform: moveX(0), easing: (t) => t ** 3 },
        { at: 1, transform: moveX(80) },
      ],
      duration: 100,
    });
    expect(anim.sample(50).components.position.x).toBeCloseTo(10, 9);
  });

  it("throws when an easing produces a non-finite value", () => {
    const anim = Animation.from({
      from: moveX(0),
      to: moveX(100),
      duration: 100,
      easing: () => Number.NaN,
    });
    expect(() => anim.sample(50)).toThrow(/finite/);
  });

  it("permits overshooting easings that return values outside [0, 1]", () => {
    const anim = Animation.from({
      from: moveX(0),
      to: moveX(100),
      duration: 100,
      easing: (t) => t * 2,
    });
    expect(anim.sample(50).components.position.x).toBeCloseTo(100, 9);
    expect(anim.sample(75).components.position.x).toBeCloseTo(150, 9);
  });
});

describe("Manual sampling (§10, T17)", () => {
  const anim = Animation.from({
    from: transform().translate(0, 0, 0),
    to: transform().translate(200, 0, 0),
    duration: 2000,
  });

  it("time-based and progress-based sampling evaluate the same timeline (§10.2)", () => {
    // The §10 equivalence: 500 ms of a 2000 ms animation == 0.25 progress.
    expect(anim.sample(500).components.position.toArray()).toEqual(
      anim.sampleProgress(0.25).components.position.toArray(),
    );

    for (const [ms, p] of [
      [0, 0],
      [400, 0.2],
      [1000, 0.5],
      [1999, 0.9995],
      [2000, 1],
    ] as const) {
      expect(anim.sample(ms).equals(anim.sampleProgress(p), 1e-12)).toBe(true);
    }
  });

  it("clamps out-of-range times and progress to the animation boundaries (§10)", () => {
    expect(anim.sample(-100)).toBe(anim.sample(0));
    expect(anim.sample(3000)).toBe(anim.sample(2000));
    expect(anim.sampleProgress(-0.5)).toBe(anim.sampleProgress(0));
    expect(anim.sampleProgress(1.5)).toBe(anim.sampleProgress(1));
  });

  it("rejects non-finite sampling inputs explicitly", () => {
    expect(() => anim.sample(Number.NaN)).toThrow(/finite/);
    expect(() => anim.sample(Number.POSITIVE_INFINITY)).toThrow(/finite/);
    expect(() => anim.sampleProgress(Number.NaN)).toThrow(/finite/);
    expect(() => anim.sampleProgress("0.5" as never)).toThrow(/finite/);
  });

  it("holds the first value before and the last value after defined keyframes (§6.3)", () => {
    const inner = Animation.from({
      keyframes: [
        { at: 0.2, transform: transform().translate(0, 0, 0) },
        { at: 0.8, transform: transform().translate(100, 0, 0) },
      ],
      duration: 100,
    });

    expect(inner.sample(0)).toBe(inner.keyframes[0]!.transform); // hold first
    expect(inner.sample(100)).toBe(inner.keyframes[1]!.transform); // hold last

    // p = 0.3 lands inside the segment at localT = (0.3 − 0.2) / 0.6.
    expect(inner.sample(30).components.position.x).toBeCloseTo(100 / 6, 9);
  });

  it("a single keyframe yields a constant animation everywhere (§6.3)", () => {
    const only = transform().translate(7, 8, 9);
    const constant = Animation.from({ keyframes: [{ at: 0.4, transform: only }], duration: 100 });

    expect(constant.sample(0)).toBe(only);
    expect(constant.sample(50)).toBe(only);
    expect(constant.sampleProgress(1)).toBe(only);
  });

  it("sampling requires no scheduler or render target (§10, §10.3)", () => {
    // This suite runs in plain Node with zero browser APIs; direct sampling
    // from the definition is the documented external-loop integration path.
    const orbit = Animation.from({
      keyframes: [
        { at: 0, transform: transform() },
        { at: 1, transform: transform().rotateY(Math.PI) },
      ],
      duration: 500,
    });

    let lastX = Number.NaN;
    for (const time of [0, 120, 240, 360, 480]) {
      const currentTransform = orbit.sample(time);
      if (!Number.isNaN(lastX)) {
        expect(currentTransform.components.position.x).toBe(lastX); // no motion on X
      }
      lastX = currentTransform.components.position.x;
    }
    expect(
      orbit
        .sample(250)
        .components.rotation.equals(transform().rotateY(Math.PI / 2).components.rotation, 1e-9),
    ).toBe(true);
  });

  it("binary search finds the correct segment in dense timelines", () => {
    const keyframes: TransformKeyframe[] = [];
    for (let i = 0; i <= 50; i++) {
      keyframes.push({ at: i / 50, transform: transform().translate(i * 2, 0, 0) });
    }
    const anim = Animation.from({ keyframes, duration: 1000 });

    // p = 0.63 lands in segment [0.62, 0.64] at localT ≈ 0.5 → x = 63.
    expect(anim.sampleProgress(0.63).components.position.x).toBeCloseTo(63, 9);

    // Exact hits inside a dense timeline still return the authored transforms.
    expect(anim.sampleProgress(0.5)).toBe(anim.keyframes[25]!.transform);
  });
});
