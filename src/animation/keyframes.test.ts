import { describe, expect, it } from "vite-plus/test";

import { transform } from "../transform/transform.ts";
import { normalizeTransformKeyframes } from "./keyframes.ts";
import type { Keyframe, TransformKeyframe } from "./keyframes.ts";
import type { EasingName } from "./easing.ts";

describe("Keyframe types (§6.1)", () => {
  it("Keyframe<T> pairs a normalized position with an arbitrary value", () => {
    const kf: Keyframe<number> = { at: 0.25, value: 42 };
    expect(kf.at).toBe(0.25);
    expect(kf.value).toBe(42);

    const colorKf: Keyframe<string> = { at: 1, value: "#ff0000" };
    expect(colorKf.value).toBe("#ff0000");
  });

  it("TransformKeyframe carries an optional easing controlling the next segment", () => {
    const kf: TransformKeyframe = {
      at: 0.5,
      transform: transform().translate(100, 0, 0),
      easing: "ease-in",
    };
    expect(kf.at).toBe(0.5);
    expect(kf.easing).toBe("ease-in");
  });
});

describe("Eager keyframe normalization (§5.4, §5.5)", () => {
  it("normalizes an array source into transform instances in order", () => {
    const out = normalizeTransformKeyframes([
      { at: 0, transform: transform() },
      { at: 1, transform: transform().translate(10, 0, 0) },
    ]);

    expect(out).toHaveLength(2);
    expect(out[0]!.at).toBe(0);
    expect(out[1]!.at).toBe(1);
    expect(out[1]!.transform.components.position.toArray()).toEqual([10, 0, 0]);
  });

  it("coerces transform init objects to canonical Transforms", () => {
    const out = normalizeTransformKeyframes([{ at: 0.5, transform: { position: [1, 2, 3] } }]);
    expect(out[0]!.transform.components.position.toArray()).toEqual([1, 2, 3]);
  });

  it("resolves named easings to functions eagerly", () => {
    const out = normalizeTransformKeyframes([
      { at: 0, transform: transform(), easing: "ease-in-out" },
      { at: 1, transform: transform() },
    ]);
    expect(typeof out[0]!.easing).toBe("function");
    expect(out[1]!.easing).toBeUndefined();
  });

  it("consumes generator instances immediately", () => {
    let completed = false;
    function* gen(): Generator<TransformKeyframe> {
      yield { at: 0, transform: transform() };
      yield { at: 1, transform: transform() };
      completed = true;
    }

    const generator = gen();
    normalizeTransformKeyframes(generator);
    // Eager consumption runs the generator to completion before returning.
    expect(completed).toBe(true);
  });

  it("runs a generator function exactly once per normalization", () => {
    let calls = 0;
    let yielded = 0;
    function* gen(): Generator<TransformKeyframe> {
      calls++;
      for (let i = 0; i <= 10; i++) {
        yielded++;
        yield { at: i / 10, transform: transform() };
      }
    }

    const out = normalizeTransformKeyframes(gen);
    expect(calls).toBe(1);
    expect(yielded).toBe(11);
    expect(out).toHaveLength(11);
  });

  it("accepts functions returning synchronous iterables", () => {
    const out = normalizeTransformKeyframes(() => [
      { at: 0, transform: transform() },
      { at: 1, transform: transform().scale(2) },
    ]);
    expect(out).toHaveLength(2);
    expect(out[1]!.transform.components.scale.toArray()).toEqual([2, 2, 2]);
  });

  it("accepts arbitrary synchronous iterables", () => {
    const keyframes: TransformKeyframe[] = [
      { at: 0, transform: transform() },
      { at: 1, transform: transform().translate(5, 0, 0) },
    ];
    const out = normalizeTransformKeyframes(new Set(keyframes));
    expect(out).toHaveLength(2);

    const fromMap = normalizeTransformKeyframes(
      new Map([
        [0, keyframes[0]!],
        [1, keyframes[1]!],
      ]).values(),
    );
    expect(fromMap).toHaveLength(2);
  });

  it("freezes normalized keyframes so shared timelines cannot be mutated", () => {
    const out = normalizeTransformKeyframes([{ at: 0, transform: transform() }]);
    expect(Object.isFrozen(out[0])).toBe(true);
  });
});

describe("Keyframe validation (§6.3)", () => {
  it("empty keyframes throw", () => {
    expect(() => normalizeTransformKeyframes([])).toThrow(/at least one keyframe/);
    function* empty(): Generator<TransformKeyframe> {}
    expect(() => normalizeTransformKeyframes(empty)).toThrow(/at least one keyframe/);
  });

  it("a single keyframe normalizes successfully (constant animation)", () => {
    const out = normalizeTransformKeyframes([{ at: 0.4, transform: transform() }]);
    expect(out).toHaveLength(1);
  });

  it("non-finite timestamps throw", () => {
    for (const bad of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => normalizeTransformKeyframes([{ at: bad, transform: transform() }])).toThrow(
        /invalid `at`/,
      );
    }
  });

  it("non-number timestamps throw", () => {
    const bad = [{ at: "0.5", transform: transform() }] as unknown as TransformKeyframe[];
    expect(() => normalizeTransformKeyframes(bad)).toThrow(/invalid `at`/);
  });

  it("timestamps outside [0, 1] throw", () => {
    expect(() => normalizeTransformKeyframes([{ at: -0.1, transform: transform() }])).toThrow(
      /\[0, 1\]/,
    );
    expect(() => normalizeTransformKeyframes([{ at: 1.2, transform: transform() }])).toThrow(
      /\[0, 1\]/,
    );
  });

  it("out-of-order timestamps throw — keyframes are never silently reordered", () => {
    expect(() =>
      normalizeTransformKeyframes([
        { at: 0.5, transform: transform() },
        { at: 0.2, transform: transform() },
      ]),
    ).toThrow(/strictly increasing/);

    expect(() =>
      normalizeTransformKeyframes([
        { at: 0, transform: transform() },
        { at: 0.5, transform: transform() },
        { at: 0.4, transform: transform() },
      ]),
    ).toThrow(/never silently reordered/);
  });

  it("duplicate timestamps throw", () => {
    expect(() =>
      normalizeTransformKeyframes([
        { at: 0.3, transform: transform() },
        { at: 0.3, transform: transform() },
      ]),
    ).toThrow(/duplicates/);
  });

  it("non-object keyframe entries throw", () => {
    const bad = [null] as unknown as TransformKeyframe[];
    expect(() => normalizeTransformKeyframes(bad)).toThrow(/must be an object/);
  });

  it("keyframes without a transform throw", () => {
    const bad = [{ at: 0 }] as unknown as TransformKeyframe[];
    expect(() => normalizeTransformKeyframes(bad)).toThrow(/must be a Transform/);
  });

  it("unknown named easings are rejected eagerly", () => {
    const bogus = "smooth-teleport" as string as EasingName;
    expect(() =>
      normalizeTransformKeyframes([
        { at: 0, transform: transform(), easing: bogus },
        { at: 1, transform: transform() },
      ]),
    ).toThrow(/Unknown easing/);
  });

  it("async iterables and async generators are rejected (§5.5)", () => {
    const asyncIterable = {
      [Symbol.asyncIterator]: () => ({
        next: async () => ({ done: true, value: undefined }),
      }),
    };
    expect(() => normalizeTransformKeyframes(asyncIterable as never)).toThrow(
      /Async iterables .* not supported/,
    );

    async function* asyncGen(): AsyncGenerator<TransformKeyframe> {}
    const asyncInstance = asyncGen() as unknown as Iterable<TransformKeyframe>;
    expect(() => normalizeTransformKeyframes(asyncInstance)).toThrow(/not supported/);
  });

  it("non-iterable sources throw with a helpful message", () => {
    expect(() => normalizeTransformKeyframes(42 as never)).toThrow(/synchronous iterable/);
    expect(() => normalizeTransformKeyframes({ at: 0 } as never)).toThrow(/synchronous iterable/);
  });
});
