import { describe, expect, it } from "vite-plus/test";

import { Matrix4 } from "../matrix/matrix4.ts";
import { Quaternion } from "../transform/quaternion.ts";
import { matrixToCssTransform } from "./html.ts";
import { matrixToSvgTransform } from "./svg.ts";
import { projectToCanvas2D } from "./canvas.ts";

function translation(x: number, y: number, z = 0): Matrix4 {
  return Matrix4.fromTRS([x, y, z], Quaternion.identity(), [1, 1, 1]);
}

describe("matrixToCssTransform (§17)", () => {
  it("emits matrix3d() with column-major arguments matching storage order", () => {
    const m = translation(10, 20, 30);
    const css = matrixToCssTransform(m);

    expect(css.startsWith("matrix3d(")).toBe(true);
    expect(css.endsWith(")")).toBe(true);

    const args = css.slice("matrix3d(".length, -1).split(", ").map(Number);
    expect(args).toHaveLength(16);
    // Translation lives at CSS argument positions 13–15 (4th column), matching
    // column-major storage — not transposed (§15.2).
    expect(args[12]).toBeCloseTo(10);
    expect(args[13]).toBeCloseTo(20);
    expect(args[14]).toBeCloseTo(30);
    expect(args[15]).toBeCloseTo(1);
    expect(args[0]).toBeCloseTo(1); // diagonal stays identity for a translation
  });

  it("preserves rotation column layout without transposition", () => {
    const m = Matrix4.fromTRS(
      [0, 0, 0],
      Quaternion.fromAxisAngle([0, 0, 1], Math.PI / 2),
      [1, 1, 1],
    );
    const args = matrixToCssTransform(m).slice("matrix3d(".length, -1).split(", ").map(Number);

    // rotateZ +90° maps x̂ → ŷ: column 0 = (0, 1, 0).
    expect(args[0]).toBeCloseTo(0);
    expect(args[1]).toBeCloseTo(1);
    // Column 1 = (−1, 0, 0).
    expect(args[4]).toBeCloseTo(-1);
    expect(args[5]).toBeCloseTo(0);
  });
});

describe("matrixToSvgTransform (§17)", () => {
  it("emits the SVG 2D affine form from column vectors", () => {
    const m = Matrix4.fromTRS([5, 7, 0], Quaternion.identity(), [2, 3, 1]);
    const value = matrixToSvgTransform(m);

    expect(value.startsWith("matrix(")).toBe(true);
    const parts = value.slice("matrix(".length, -1).split(", ").map(Number);
    expect(parts).toHaveLength(6);
    // a,b = col₀; c,d = col₁; e,f = translation (§17).
    const [a, b, c, d, e, f] = parts as [number, number, number, number, number, number];
    expect(a).toBeCloseTo(2);
    expect(b).toBeCloseTo(0);
    expect(c).toBeCloseTo(0);
    expect(d).toBeCloseTo(3);
    expect(e).toBeCloseTo(5);
    expect(f).toBeCloseTo(7);
  });
});

describe("projectToCanvas2D (§17.3)", () => {
  it("reduces to the affine part for affine inputs (orthographic default)", () => {
    const m = Matrix4.fromTRS(
      [5, 7, 0],
      Quaternion.fromAxisAngle([0, 0, 1], Math.PI / 2),
      [2, 2, 1],
    );
    const [a, b, c, d, e, f] = projectToCanvas2D(m);

    // col₀ of T×R×S at 90°: R maps x̂→ŷ then scale (2,2): (0, 2).
    expect(a).toBeCloseTo(0);
    expect(b).toBeCloseTo(2);
    expect(c).toBeCloseTo(-2);
    expect(d).toBeCloseTo(0);
    expect(e).toBeCloseTo(5);
    expect(f).toBeCloseTo(7);
  });

  it("applies the camera perspective step instead of forwarding raw depth", () => {
    // A point translated +10 x and +50 z viewed with a camera at distance 100
    // projects to x = 10 / (1 − 50/100) = 20 — the projection step must not be
    // skipped (§17.3).
    const m = translation(10, 0, 50);
    const ortho = projectToCanvas2D(m);
    const perspective = projectToCanvas2D(m, { perspective: 100 });

    expect(ortho[4]).toBeCloseTo(10);
    expect(perspective[4]).toBeCloseTo(20);
    expect(perspective[5]).toBeCloseTo(0);
  });

  it("stays finite for matrices projecting past the camera plane", () => {
    const m = translation(1, 2, 100); // exactly at a distance-100 camera plane
    const projected = projectToCanvas2D(m, { perspective: 100 });
    for (const value of projected) {
      expect(Number.isFinite(value)).toBe(true);
    }
  });

  it("identity projects to the identity affine", () => {
    expect(Array.from(projectToCanvas2D(Matrix4.identity()))).toEqual([1, 0, 0, 1, 0, 0]);
  });
});
