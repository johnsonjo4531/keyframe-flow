import { describe, expect, it } from "vite-plus/test";

import { cubicBezier, linear, resolveEasing } from "./easing.ts";
import type { EasingFunction, EasingName } from "./easing.ts";

// Enumerated here so a typo fails the type check (EasingName) and a missing
// builtin fails `resolveEasing` at runtime.
const BUILTIN_NAMES: readonly EasingName[] = [
  "linear",
  "ease",
  "ease-in",
  "ease-out",
  "ease-in-out",
  "ease-in-sine",
  "ease-out-sine",
  "ease-in-out-sine",
  "ease-in-quad",
  "ease-out-quad",
  "ease-in-out-quad",
  "ease-in-cubic",
  "ease-out-cubic",
  "ease-in-out-cubic",
  "ease-in-quart",
  "ease-out-quart",
  "ease-in-out-quart",
  "ease-in-quint",
  "ease-out-quint",
  "ease-in-out-quint",
  "ease-in-expo",
  "ease-out-expo",
  "ease-in-out-expo",
  "ease-in-circ",
  "ease-out-circ",
  "ease-in-out-circ",
] as const;

function sampleGrid(fn: EasingFunction): number[] {
  const values: number[] = [];
  for (let i = 0; i <= 100; i++) values.push(fn(i / 100));
  return values;
}

describe("Easing types and custom functions (§8)", () => {
  it("accepts a plain (progress) => number function without global registration", () => {
    const custom: EasingFunction = (progress) => progress ** 3;
    expect(resolveEasing(custom, linear)).toBe(custom);
  });

  it("falls back when no easing is supplied", () => {
    expect(resolveEasing(undefined, linear)).toBe(linear);
    const fallback: EasingFunction = (t) => 1 - t;
    expect(resolveEasing(undefined, fallback)).toBe(fallback);
  });

  it("throws explicitly for unknown easing names", () => {
    // Cast through string to simulate untyped JavaScript callers.
    const bogus = "ease-in-mango" as string as EasingName;
    const empty = "" as string as EasingName;
    expect(() => resolveEasing(bogus, linear)).toThrow(/Unknown easing/);
    expect(() => resolveEasing(empty, linear)).toThrow(/Unknown easing/);
  });

  it("linear is the identity easing", () => {
    expect(linear(0)).toBe(0);
    expect(linear(0.5)).toBe(0.5);
    expect(linear(1)).toBe(1);
  });
});

describe("Built-in named easings (§8)", () => {
  for (const name of BUILTIN_NAMES) {
    it(`${name} maps progress 0→0 and 1→1 and is monotonic`, () => {
      const fn = resolveEasing(name, linear);
      expect(fn(0)).toBeCloseTo(0, 6);
      expect(fn(1)).toBeCloseTo(1, 6);

      const values = sampleGrid(fn);
      for (let i = 1; i < values.length; i++) {
        expect(values[i]!).toBeGreaterThanOrEqual(values[i - 1]! - 1e-9);
      }
    });
  }

  it("includes the common linear / ease-in / ease-out / ease-in-out variants", () => {
    for (const name of ["linear", "ease-in", "ease-out", "ease-in-out"] as const) {
      expect(typeof resolveEasing(name, linear)).toBe("function");
    }
  });

  it("ease-in starts slower than linear and ease-out starts faster (§8 CSS semantics)", () => {
    const easeIn = resolveEasing("ease-in", linear);
    const easeOut = resolveEasing("ease-out", linear);
    expect(easeIn(0.5)).toBeLessThan(0.5);
    expect(easeOut(0.5)).toBeGreaterThan(0.5);
  });

  it("ease-in and ease-out are mirror curves", () => {
    const easeIn = resolveEasing("ease-in", linear);
    const easeOut = resolveEasing("ease-out", linear);
    for (let i = 1; i < 100; i++) {
      const t = i / 100;
      expect(easeIn(t)).toBeCloseTo(1 - easeOut(1 - t), 4);
    }
  });

  it("polynomial variants match their defining powers", () => {
    expect(resolveEasing("ease-in-quad", linear)(0.5)).toBeCloseTo(0.25, 10);
    expect(resolveEasing("ease-in-cubic", linear)(0.5)).toBeCloseTo(0.125, 10);
    expect(resolveEasing("ease-in-quart", linear)(0.5)).toBeCloseTo(0.0625, 10);
    expect(resolveEasing("ease-in-quint", linear)(0.5)).toBeCloseTo(0.03125, 10);
  });
});

describe("cubicBezier (§8 built-in curve support)", () => {
  it("cubic-bezier(0, 0, 1, 1) is linear", () => {
    const fn = cubicBezier(0, 0, 1, 1);
    for (let i = 0; i <= 10; i++) {
      expect(fn(i / 10)).toBeCloseTo(i / 10, 5);
    }
  });

  it("reproduces the CSS ease-in curve at known points", () => {
    const easeIn = cubicBezier(0.42, 0, 1, 1);
    expect(easeIn(0)).toBe(0);
    expect(easeIn(1)).toBe(1);
    // The exact midpoint of the CSS ease-in timing function curve.
    expect(easeIn(0.5)).toBeCloseTo(0.3154, 3);
  });

  it("clamps out-of-range progress like other easings", () => {
    const fn = cubicBezier(0.42, 0, 1, 1);
    expect(fn(-0.5)).toBe(0);
    expect(fn(1.5)).toBe(1);
  });
});
