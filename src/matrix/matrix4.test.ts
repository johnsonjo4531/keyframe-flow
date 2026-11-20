import { describe, expect, it } from "vite-plus/test";

import { Quaternion } from "../transform/quaternion.ts";
import { Vector3 } from "../transform/vector3.ts";
import { Matrix4 } from "./matrix4.ts";
import { matrix } from "./index.ts";

/** Column-major element order for a pure translation. */
function translation(x: number, y: number, z: number): number[] {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
}

describe("Matrix4 coordinate conventions (§4.4)", () => {
  it("stores elements column-major with translation at indices 12-14", () => {
    const m = matrix.from(translation(5, 6, 7));

    expect(m.toArray()[12]).toBe(5);
    expect(m.toArray()[13]).toBe(6);
    expect(m.toArray()[14]).toBe(7);
    expect(m.at(0, 3)).toBe(5); // row 0, column 3
    expect(m.at(1, 3)).toBe(6);
    expect(m.at(2, 3)).toBe(7);

    // Column c occupies indices 4c .. 4c+3 (top to bottom).
    const m2 = matrix.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    expect(m2.at(0, 0)).toBe(1);
    expect(m2.at(1, 0)).toBe(2);
    expect(m2.at(0, 1)).toBe(5);
    expect(m2.at(3, 2)).toBe(12); // index 2 × 4 + 3 = 11 → value 12
    expect(m2.at(2, 3)).toBe(15); // index 3 × 4 + 2 = 14 → value 15
    expect(m2.at(3, 3)).toBe(16); // index 3 × 4 + 3 = 15 → value 16
  });

  it("runs in Node without any browser globals (§2 principle 1)", () => {
    expect((globalThis as Record<string, unknown>)["document"]).toBeUndefined();
    expect((globalThis as Record<string, unknown>)["window"]).toBeUndefined();
    expect(globalThis.DOMMatrix).toBeUndefined();

    // Every core operation above/below works regardless.
    const m = matrix.from(translation(1, 2, 3));
    expect(m.multiply(m.invert()).equals(Matrix4.identity(), 1e-12)).toBe(true);
  });

  it("multiplies as A × B on column vectors — order matters (§4.4)", () => {
    const t = matrix.from(translation(10, 0, 0)); // translate +10 in x
    const ry = Matrix4.fromTRS(
      [0, 0, 0],
      Quaternion.fromAxisAngle([0, 1, 0], Math.PI / 2),
      [1, 1, 1],
    );

    // (T × R) applies the rotation first, then the translation.
    const tr = t.multiply(ry);
    expect(tr.applyToPoint([1, 0, 0]).toArray()[0]).toBeCloseTo(10);
    expect(tr.applyToPoint([1, 0, 0]).toArray()[2]).toBeCloseTo(-1);

    // (R × T) applies the translation first — a different result.
    const rt = ry.multiply(t);
    expect(rt.applyToPoint([1, 0, 0]).toArray()[0]).toBeCloseTo(0);
    expect(rt.applyToPoint([1, 0, 0]).toArray()[2]).toBeCloseTo(-11);

    expect(tr.equals(rt)).toBe(false);
  });

  it("represents right-handed rotations in radians (§4.4)", () => {
    const identity = Matrix4.identity();

    // +90° about Y (radians): +X → -Z.
    const ry = Matrix4.fromTRS(
      [0, 0, 0],
      Quaternion.fromAxisAngle([0, 1, 0], Math.PI / 2),
      [1, 1, 1],
    );
    expect(ry.applyToVector([1, 0, 0]).toArray()[2]).toBeCloseTo(-1);

    // +90° about Z: +X → +Y (right-handed).
    const rz = Matrix4.fromTRS(
      [0, 0, 0],
      Quaternion.fromAxisAngle([0, 0, 1], Math.PI / 2),
      [1, 1, 1],
    );
    expect(rz.applyToVector([1, 0, 0]).toArray()[1]).toBeCloseTo(1);

    // Two quarter-turns compose into a half-turn: +X → -Z → -X.
    const twoQuarter = ry.multiply(ry);
    expect(twoQuarter.applyToVector([1, 0, 0]).toArray()[0]).toBeCloseTo(-1);
    expect(twoQuarter.applyToVector([1, 0, 0]).toArray()[2]).toBeCloseTo(0);

    // A matrix times its inverse is the identity.
    expect(ry.multiply(ry.invert()).equals(identity, 1e-9)).toBe(true);
  });

  it("places translation in the fourth column and applies it to points only", () => {
    const t = matrix.from(translation(5, 6, 7));
    expect(t.applyToPoint([0, 0, 0]).toArray()).toEqual([5, 6, 7]);
    expect(t.applyToVector([0, 0, 0]).toArray()).toEqual([0, 0, 0]);
    expect(t.applyToPoint([1, 1, 1]).toArray()).toEqual([6, 7, 8]);
  });
});

describe("Matrix4 operations", () => {
  it("round-trips through inversion", () => {
    const m = matrix.from([
      0.96,
      -0.28,
      0.24,
      0, //
      0.16,
      0.96,
      -0.24,
      0, //
      -0.24,
      0,
      0.97,
      0, //
      3,
      -2,
      8,
      1, //
    ]);

    const product = m.multiply(m.invert());
    expect(product.equals(Matrix4.identity(), 1e-6)).toBe(true);
  });

  it("throws explicitly when inverting singular matrices", () => {
    expect(() => matrix.from(Array.from({ length: 16 }, () => 0)).invert()).toThrow(/singular/i);

    // Two identical columns → determinant zero.
    const dup = matrix.from([1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    expect(() => dup.invert()).toThrow(/singular/i);
  });

  it("rejects malformed input arrays", () => {
    expect(() => matrix.from([1, 2, 3])).toThrow(RangeError);
    expect(() =>
      matrix.from([...Array.from({ length: 15 }, () => 1), Number.POSITIVE_INFINITY]),
    ).toThrow(/finite/);
    expect(() => matrix.from([...Array.from({ length: 15 }, () => 1), Number.NaN])).toThrow(
      /finite/,
    );
  });

  it("round-trips through Float32Array preserving column-major meaning", () => {
    const m = Matrix4.fromTRS([10, -20, 30], Quaternion.fromAxisAngle([1, 1, 0], 0.7), [2, 3, 4]);

    const f32 = m.toFloat32Array();
    expect(f32).toBeInstanceOf(Float32Array);
    expect(f32.length).toBe(16);

    // Translation lands at indices 12-14 in the array layout.
    expect(f32[12]).toBeCloseTo(10, 4);
    expect(f32[13]).toBeCloseTo(-20, 4);
    expect(f32[14]).toBeCloseTo(30, 4);

    const back = Matrix4.fromFloat32Array(f32);
    expect(back.equals(m, 1e-6)).toBe(true);
  });

  it("does not alias the returned Float32Array with internal storage", () => {
    const m = Matrix4.identity();
    const f32 = m.toFloat32Array();
    f32[0] = 99;
    expect(m.at(0, 0)).toBe(1);
  });

  it("composes TRS into T × R × S (§3.3): scale first, then rotate, then translate", () => {
    const m = Matrix4.fromTRS(
      [7, 8, 9],
      Quaternion.fromAxisAngle([0, 0, 1], Math.PI / 2),
      [2, 3, 4],
    );

    // Point (1, 0, 0): scale → (2,0,0); rotate +90° about Z → (0,2,0); translate.
    const p = m.applyToPoint([1, 0, 0]);
    expect(p.toArray()[0]).toBeCloseTo(7);
    expect(p.toArray()[1]).toBeCloseTo(10);
    expect(p.toArray()[2]).toBeCloseTo(9);
  });

  it("decomposes composed matrices back to components", () => {
    const position = new Vector3(-4, 5, 6);
    const rotation = Quaternion.fromEuler(0.3, -1.1, 0.7);
    const scale = new Vector3(2, 0.5, 4);

    const {
      position: p,
      rotation: r,
      scale: s,
    } = Matrix4.fromTRS(position, rotation, scale).decompose();

    expect(p.equals(position, 1e-9)).toBe(true);
    expect(s.equals(scale, 1e-9)).toBe(true);
    expect(Math.abs(r.dot(rotation))).toBeCloseTo(1, 9);
  });

  it("rejects matrices containing shear (§9.2)", () => {
    // [[1, 1], [0, 1]] embedded in 3D: columns are not orthogonal after
    // scale extraction.
    const shear = matrix.from([1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    expect(() => shear.decompose()).toThrow(/shear/i);
  });

  it("rejects matrices containing reflection (§9.2)", () => {
    const mirror = Matrix4.fromTRS([0, 0, 0], Quaternion.identity(), [-1, 1, 1]);
    expect(() => mirror.decompose()).toThrow(/reflection/i);
  });

  it("rejects matrices containing perspective (§9.2)", () => {
    const perspective = matrix.from([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    // Bottom-row element m34 (index 11) is the perspective divisor.
    const withPerspective = matrix.from([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.5, 0, 0, 0, 1]);
    expect(() => perspective.decompose()).not.toThrow(); // sanity: plain one decomposes
    expect(() => withPerspective.decompose()).toThrow(/perspective/i);

    const nonUnitW = matrix.from([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2]);
    expect(() => nonUnitW.decompose()).toThrow(/perspective/i);
  });

  it("rejects singular matrices (§9.2)", () => {
    const flat = Matrix4.fromTRS([0, 0, 0], Quaternion.identity(), [1, 0, 1]);
    expect(() => flat.decompose()).toThrow(/singular/i);
  });
});

describe("matrix namespace (§15)", () => {
  it("creates matrices from arrays and identity", () => {
    expect(matrix.identity().equals(Matrix4.identity())).toBe(true);
    expect(matrix.from([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 2, 3, 4, 1]).at(0, 3)).toBe(2);
  });

  it("builds TRS matrices with defaulted components", () => {
    const m = matrix.fromTRS({ rotation: Quaternion.fromAxisAngle([0, 1, 0], Math.PI / 2) });
    expect(m.at(0, 3)).toBe(0);
    expect(m.applyToVector([1, 0, 0]).toArray()[2]).toBeCloseTo(-1);
  });
});
