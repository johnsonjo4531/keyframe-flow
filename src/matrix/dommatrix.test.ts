import { describe, expect, it } from "vite-plus/test";

import { Quaternion } from "../transform/quaternion.ts";
import { Matrix4 } from "./matrix4.ts";
import { matrix } from "./index.ts";
import type { DOMMatrixLike } from "../types.d.ts";

/**
 * A structural stand-in for `DOMMatrix` (§15.2): plain objects exposing the
 * named members must be accepted anywhere a native instance would be, so the
 * core keeps working in Node where no DOMMatrix exists (§2 principle 1).
 */
function domLike(values: Partial<Record<keyof DOMMatrixLike, number>>): DOMMatrixLike {
  const base: Record<string, number> = {
    m11: 1,
    m12: 0,
    m13: 0,
    m14: 0, //
    m21: 0,
    m22: 1,
    m23: 0,
    m24: 0, //
    m31: 0,
    m32: 0,
    m33: 1,
    m34: 0, //
    m41: 0,
    m42: 0,
    m43: 0,
    m44: 1, //
  };
  return { ...base, ...values } as DOMMatrixLike;
}

describe("DOMMatrix interop without a browser (§15.2)", () => {
  it("reads named members under CSSOM's m<column><row> naming", () => {
    // Deliberately asymmetric: m12 ≠ m21, so a naive "math m<row><column>"
    // reading would silently transpose the matrix.
    const source = domLike({
      m11: 0.5,
      m12: -0.3,
      m13: 0.2,
      m14: 12, //
      m21: 0.4,
      m22: 0.6,
      m23: -0.1,
      m24: -7, //
      m31: 0.1,
      m32: 0.5,
      m33: 0.9,
      m34: 3, //
      m41: 1,
      m42: 2,
      m43: 3,
      m44: 4, //
    });

    const m = matrix.from(source);

    expect(m.at(0, 0)).toBe(0.5);
    expect(m.at(0, 1)).toBe(0.4); // math row 0, col 1 ← member m21
    expect(m.at(1, 0)).toBe(-0.3); // math row 1, col 0 ← member m12
    expect(m.at(3, 0)).toBe(12); // math row 3, col 0 ← member m14
    expect(m.at(0, 3)).toBe(1); // translation x lives in member m41
    expect(m.at(1, 3)).toBe(2); // translation y is m42
    expect(m.at(2, 3)).toBe(3); // translation z is m43
    expect(m.at(3, 3)).toBe(4);
  });

  it("round-trips a transform through the structural interface", () => {
    const m = Matrix4.fromTRS([10, 20, 30], Quaternion.fromAxisAngle([1, 0, 1], 1.0), [2, 2, 2]);

    // Emulate what toDOMMatrix() writes into a native instance: members in
    // name order from column-major storage (CSSOM m<column><row> naming).
    const e = m.toArray() as [
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
    ];
    const asLike: DOMMatrixLike = {
      m11: e[0],
      m12: e[1],
      m13: e[2],
      m14: e[3], //
      m21: e[4],
      m22: e[5],
      m23: e[6],
      m24: e[7], //
      m31: e[8],
      m32: e[9],
      m33: e[10],
      m34: e[11], //
      m41: e[12],
      m42: e[13],
      m43: e[14],
      m44: e[15], //
    };

    expect(matrix.from(asLike).equals(m, 1e-12)).toBe(true);
  });

  it("rejects structural sources with missing or non-finite members", () => {
    const bad = { ...domLike({}), m11: Number.NaN } as unknown as DOMMatrixLike;
    expect(() => matrix.from(bad)).toThrow(/non-finite/i);

    const missing = { m11: 1 } as unknown as DOMMatrixLike;
    expect(() => matrix.from(missing)).toThrow(/non-finite/i);
  });

  it("throws a helpful error for toDOMMatrix() outside the browser", () => {
    expect(globalThis.DOMMatrix).toBeUndefined();
    expect(() => Matrix4.identity().toDOMMatrix()).toThrow(/not available/);
  });

  it("dispatches matrix.from between array-like and DOMMatrix-like inputs", () => {
    const fromArray = matrix.from([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 9, 8, 7, 1]);
    expect(fromArray.at(0, 3)).toBe(9);

    // m41 is the translation-x member.
    const fromLike = matrix.from(domLike({ m41: 9 }));
    expect(fromLike.at(0, 3)).toBe(9);
    expect(fromLike.at(3, 0)).toBe(0);
  });
});
