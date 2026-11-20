import { describe, expect, it } from "vite-plus/test";

import { Quaternion } from "../transform/quaternion.ts";
import { Matrix4 } from "./matrix4.ts";
import { matrix } from "./index.ts";
import type { DOMMatrixWritable } from "../types.d.ts";

const Ctor = globalThis.DOMMatrix;
if (Ctor === undefined) {
  throw new Error("Browser test suite requires the native DOMMatrix API.");
}

/** A deliberately asymmetric matrix: transpose mistakes become visible. */
function makeNative(): DOMMatrixWritable {
  const m = new Ctor();
  m.m11 = 0.5;
  m.m12 = -0.3;
  m.m13 = 0.2;
  m.m14 = 12; //
  m.m21 = 0.4;
  m.m22 = 0.6;
  m.m23 = -0.1;
  m.m24 = -7; //
  m.m31 = 0.1;
  m.m32 = 0.5;
  m.m33 = 0.9;
  m.m34 = 3; //
  m.m41 = 1;
  m.m42 = 2;
  m.m43 = 3;
  m.m44 = 4; //
  return m;
}

describe("Matrix4 ⇄ native DOMMatrix interoperability (§15.2)", () => {
  it("reads a real DOMMatrix through its named members", () => {
    const native = makeNative();
    const m = matrix.from(native);

    // CSSOM names members m<column><row>: member m12 is math row 1, col 0.
    expect(m.at(0, 0)).toBeCloseTo(0.5);
    expect(m.at(0, 1)).toBeCloseTo(native.m21);
    expect(m.at(1, 0)).toBeCloseTo(native.m12);
    expect(m.at(0, 3)).toBeCloseTo(native.m41); // translation members
    expect(m.at(1, 3)).toBeCloseTo(native.m42);
    expect(m.at(2, 3)).toBeCloseTo(native.m43);
    expect(m.at(2, 2)).toBeCloseTo(0.9);
    expect(m.at(3, 3)).toBeCloseTo(4);
  });

  it("writes a real DOMMatrix whose named members match exactly", () => {
    const m = Matrix4.fromTRS([10, 20, 30], Quaternion.fromAxisAngle([1, 2, 3], 1.0), [2, 3, 4]);
    const native = m.toDOMMatrix();

    expect(native).toBeInstanceOf(Ctor);
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        // Member m<column+1><row+1> holds the math element at (row, column).
        const member = `m${c + 1}${r + 1}` as keyof typeof native;
        expect(native[member]).toBeCloseTo(m.at(r, c), 9);
      }
    }
  });

  it("applies the same transform to points as the native matrix (meaning, not elements)", () => {
    const m = Matrix4.fromTRS([10, -20, 30], Quaternion.fromEuler(0.4, 1.2, -0.8), [2, 0.5, 3]);
    const native = m.toDOMMatrix();

    const points: Array<[number, number, number]> = [
      [0, 0, 0],
      [1, 0, 0],
      [-4, 7, 2],
      [100, -100, 0.5],
    ];

    for (const [x, y, z] of points) {
      const ours = m.applyToPoint([x, y, z]);
      const theirs = native.transformPoint({ x, y, z });

      expect(theirs.x).toBeCloseTo(ours.x, 6);
      expect(theirs.y).toBeCloseTo(ours.y, 6);
      expect(theirs.z).toBeCloseTo(ours.z, 6);
    }
  });

  it("agrees with native multiplication order on column vectors", () => {
    const a = Matrix4.fromTRS([10, 0, 0], Quaternion.identity(), [1, 1, 1]); // translate x +10
    const b = Matrix4.fromTRS(
      [0, 0, 0],
      Quaternion.fromAxisAngle([0, 1, 0], Math.PI / 2),
      [1, 1, 1], // rotateY 90°
    );

    const ours = a.multiply(b).applyToPoint([1, 0, 0]);
    const theirs = a.toDOMMatrix().multiply(b.toDOMMatrix()).transformPoint({ x: 1, y: 0, z: 0 });

    expect(theirs.x).toBeCloseTo(ours.x, 6);
    expect(theirs.y).toBeCloseTo(ours.y, 6);
    expect(theirs.z).toBeCloseTo(ours.z, 6);
  });

  it("exposes column-major array layout to native consumers", () => {
    // A pure translation must land at indices 12-14 of the column-major array
    // that WebGL-style consumers expect.
    const t = Matrix4.fromTRS([5, 6, 7], Quaternion.identity(), [1, 1, 1]);
    const native = t.toDOMMatrix();

    const f64 = native.toFloat64Array();
    expect(f64.length).toBe(16);
    expect(f64[0]).toBeCloseTo(1);
    expect(f64[5]).toBeCloseTo(1);
    expect(f64[10]).toBeCloseTo(1);
    expect(f64[12]).toBeCloseTo(5);
    expect(f64[13]).toBeCloseTo(6);
    expect(f64[14]).toBeCloseTo(7);
    expect(f64[15]).toBeCloseTo(1);

    // Our own Float32Array export uses the identical layout.
    const f32 = t.toFloat32Array();
    for (let i = 0; i < 16; i++) {
      expect(f32[i] ?? Number.NaN).toBeCloseTo(f64[i] ?? Number.NaN, 5);
    }
  });

  it("round-trips Matrix4 → DOMMatrix → Matrix4", () => {
    const m = Matrix4.fromTRS([1, 2, 3], Quaternion.fromEuler(0.2, 0.5, -0.9), [1.5, 1.5, 1.5]);
    expect(matrix.from(m.toDOMMatrix()).equals(m, 1e-9)).toBe(true);
  });

  it("round-trips DOMMatrix → Matrix4 → DOMMatrix", () => {
    const native = makeNative();
    const back = matrix.from(native).toDOMMatrix();

    expect(back.m12).toBeCloseTo(native.m12, 9);
    expect(back.m21).toBeCloseTo(native.m21, 9);
    expect(back.m44).toBeCloseTo(native.m44, 9);
    expect(back.toFloat64Array().length).toBe(16);
  });
});
