import { describe, expect, it } from "vite-plus/test";

import { Quaternion } from "./quaternion.ts";

const q = (x: number, y: number, z: number, w: number) => new Quaternion(x, y, z, w);

describe("Quaternion", () => {
  it("has an identity that leaves rotations unchanged", () => {
    const id = Quaternion.identity();
    expect(id.toArray()).toEqual([0, 0, 0, 1]);
    expect(id.length()).toBeCloseTo(1);

    const v = new Quaternion(0.1, 0.2, 0.3, 0.9);
    expect(v.multiply(id).equals(v, 1e-12)).toBe(true);
    expect(id.multiply(v).equals(v, 1e-12)).toBe(true);
  });

  it("builds right-handed axis-angle rotations (§4.4)", () => {
    // +90° about Y maps +X onto -Z (right-hand rule, right-handed coordinates).
    const qy = Quaternion.fromAxisAngle([0, 1, 0], Math.PI / 2);
    const rotated = qy.rotateVector([1, 0, 0]);

    expect(rotated.toArray()[0]).toBeCloseTo(0);
    expect(rotated.toArray()[1]).toBeCloseTo(0);
    expect(rotated.toArray()[2]).toBeCloseTo(-1);

    // +90° about Z maps +X onto +Y.
    const qz = Quaternion.fromAxisAngle([0, 0, 1], Math.PI / 2);
    expect(qz.rotateVector([1, 0, 0]).toArray()[1]).toBeCloseTo(1);

    // +90° about X maps +Y onto +Z.
    const qx = Quaternion.fromAxisAngle([1, 0, 0], Math.PI / 2);
    expect(qx.rotateVector([0, 1, 0]).toArray()[2]).toBeCloseTo(1);
  });

  it("normalizes the axis for fromAxisAngle", () => {
    const a = Quaternion.fromAxisAngle([0, 3, 0], Math.PI / 3);
    const b = Quaternion.fromAxisAngle([0, 1, 0], Math.PI / 3);
    expect(a.equals(b, 1e-12)).toBe(true);
  });

  it("multiplies in matrix-consistent order: a.multiply(b) applies b first", () => {
    const q90x = Quaternion.fromAxisAngle([1, 0, 0], Math.PI / 2);
    const q90y = Quaternion.fromAxisAngle([0, 1, 0], Math.PI / 2);

    // (Y then X) in matrix notation R_y · R_x on column vectors: apply x first.
    const combined = q90y.multiply(q90x);

    // Start from +X: q90x leaves it on the axis, then q90y sends +X to -Z.
    const result = combined.rotateVector([1, 0, 0]);
    expect(result.toArray()[2]).toBeCloseTo(-1);

    // Order matters: the opposite product sends +X to +Y first, which stays
    // on the Y axis under q90x... check inequality instead.
    const reversed = q90x.multiply(q90y).rotateVector([1, 0, 0]);
    expect(reversed.equals(result, 1e-6)).toBe(false);
  });

  it("creates Euler rotations in intrinsic X → Y → Z order (§4.3)", () => {
    // Intrinsic: rotate about X first, then about the new local Y.
    // Applied to +X: Rx(90°) leaves +X; the rotated local Y axis is world +Z,
    // and rotating +90° about it sends +X onto +Y.
    const q = Quaternion.fromEuler(Math.PI / 2, Math.PI / 2, 0);
    const result = q.rotateVector([1, 0, 0]);

    expect(result.toArray()[0]).toBeCloseTo(0);
    expect(result.toArray()[1]).toBeCloseTo(1);
    expect(result.toArray()[2]).toBeCloseTo(0);

    // Single-axis Euler angles match fromAxisAngle exactly.
    expect(
      Quaternion.fromEuler(0, Math.PI / 3, 0).equals(
        Quaternion.fromAxisAngle([0, 1, 0], Math.PI / 3),
        1e-12,
      ),
    ).toBe(true);
    expect(Quaternion.fromEuler(0, 0, 0).equals(Quaternion.identity(), 1e-12)).toBe(true);
  });

  it("normalizes without mutating and throws on zero length", () => {
    const v = q(0, 2, 0, 0);
    expect(v.normalize().length()).toBeCloseTo(1);
    expect(v.length()).toBeCloseTo(2);
    expect(() => q(0, 0, 0, 0).normalize()).toThrow(/zero-length/);
  });

  it("conjugates to the inverse rotation", () => {
    const rot = Quaternion.fromAxisAngle([1, 2, 3], 1.25);
    const back = rot.conjugate();
    const roundTrip = rot.multiply(back).normalize();

    expect(roundTrip.equals(Quaternion.identity(), 1e-9)).toBe(true);
  });

  it("interpolates endpoints exactly with slerp", () => {
    const a = Quaternion.fromAxisAngle([0, 1, 0], 0.3);
    const b = Quaternion.fromAxisAngle([1, 0, 0], 1.1);

    expect(a.slerp(b, 0).equals(a, 1e-9)).toBe(true);
    expect(a.slerp(b, 1).equals(b, 1e-9)).toBe(true);
  });

  it("interpolates at constant angular rate", () => {
    const a = Quaternion.fromAxisAngle([0, 0, 1], 0);
    const b = Quaternion.fromAxisAngle([0, 0, 1], Math.PI / 2);

    const mid = a.slerp(b, 0.5);
    expect(mid.equals(Quaternion.fromAxisAngle([0, 0, 1], Math.PI / 4), 1e-9)).toBe(true);
  });

  it("takes the shortest path by default (§9.1)", () => {
    // Orientations at +162° and -162° about Y are only 36° apart through ±180°.
    const a = Quaternion.fromAxisAngle([0, 1, 0], 0.9 * Math.PI);
    const b = Quaternion.fromAxisAngle([0, 1, 0], -0.9 * Math.PI);

    const mid = a.slerp(b, 0.5);
    const throughPi = Quaternion.fromAxisAngle([0, 1, 0], Math.PI);

    // Same orientation regardless of quaternion sign.
    expect(Math.abs(mid.dot(throughPi))).toBeCloseTo(1, 9);
  });

  it("normalizes slerp inputs that are not unit length", () => {
    const a = q(0, 0, 0, 2); // 2× identity
    const b = q(0, 3, 0, 0); // 3× a half-turn about Y (pure-vector quaternion)
    const mid = a.slerp(b, 0.5);

    expect(mid.length()).toBeCloseTo(1);
    // Halfway between identity and a 180° turn is a 90° turn.
    expect(Math.abs(mid.dot(Quaternion.fromAxisAngle([0, 1, 0], Math.PI / 2)))).toBeCloseTo(1, 9);
  });

  it("computes the dot product", () => {
    expect(Quaternion.identity().dot(Quaternion.identity())).toBeCloseTo(1);
    expect(q(1, 0, 0, 0).dot(q(-1, 0, 0, 0))).toBeCloseTo(-1);
  });
});
