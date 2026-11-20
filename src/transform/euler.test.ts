import { describe, expect, it } from "vite-plus/test";

import { Quaternion } from "./quaternion.ts";

/** Orientation equality that ignores the q/−q double cover. */
function sameOrientation(a: Quaternion, b: Quaternion): boolean {
  return Math.abs(Math.abs(a.normalize().dot(b.normalize())) - 1) < 1e-9;
}

describe("Quaternion#toEuler (§4.3, §9.1)", () => {
  it("inverts fromEuler within principal ranges", () => {
    const angles: readonly [number, number, number] = [0.3, -0.4, 0.5];
    const recovered = Quaternion.fromEuler(angles[0], angles[1], angles[2]).toEuler();

    for (let i = 0; i < 3; i++) {
      expect(recovered[i] ?? Number.NaN).toBeCloseTo(angles[i] ?? Number.NaN, 9);
    }
  });

  it("recovers pure axis rotations", () => {
    const cases: Array<[readonly [number, number, number], readonly [number, number, number]]> = [
      [
        [1, 0, 0],
        [1, 0, 0],
      ],
      [
        [0, 0.5, 0],
        [0, 0.5, 0],
      ],
      [
        [0, 0, -2],
        [0, 0, -2],
      ],
    ];
    for (const [euler, expected] of cases) {
      const q = Quaternion.fromEuler(euler[0], euler[1], euler[2]);
      const recovered = q.toEuler();
      expect(Quaternion.fromEuler(recovered[0], recovered[1], recovered[2]).equals(q, 1e-9)).toBe(
        true,
      );
      for (let i = 0; i < 3; i++) {
        expect(recovered[i] ?? Number.NaN).toBeCloseTo(expected[i] ?? Number.NaN, 6);
      }
    }
  });

  it("round-trips orientations over a deterministic angle sweep", () => {
    // A deterministic pseudo-random sweep keeps the test reproducible.
    let seed = 42;
    const next = (): number => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return (seed / 2147483648) * 2.4 - 1.2; // radians in (-1.2, 1.2)
    };

    for (let i = 0; i < 250; i++) {
      const x = next();
      const y = next();
      const z = next();
      const q = Quaternion.fromEuler(x, y, z);
      const angles = q.toEuler();
      const rebuilt = Quaternion.fromEuler(angles[0], angles[1], angles[2]);
      expect(sameOrientation(q, rebuilt)).toBe(true);
    }
  });

  it("resolves gimbal-lock poses (Y at ±90°) with Z set to zero", () => {
    for (const yAngle of [Math.PI / 2, -Math.PI / 2]) {
      const q = Quaternion.fromEuler(0.7, yAngle, -0.3);
      const angles = q.toEuler();
      expect(angles[1] ?? Number.NaN).toBeCloseTo(yAngle, 6); // asin precision at the lock pose
      expect(angles[2]).toBe(0); // resolution convention
      const rebuilt = Quaternion.fromEuler(angles[0], angles[1], angles[2]);
      expect(sameOrientation(q, rebuilt)).toBe(true);
    }
  });

  it("normalizes before decomposing", () => {
    // (0, 3, 0, 3) is a non-unit quaternion for a 90° rotation about Y.
    const angles = new Quaternion(0, 3, 0, 3).toEuler();
    expect(angles[1]).toBeCloseTo(Math.PI / 2, 6);
  });
});
