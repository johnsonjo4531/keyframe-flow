import { describe, expect, it } from "vite-plus/test";

import { Quaternion } from "../transform/quaternion.ts";
import { transform } from "../transform/transform.ts";
import { interpolateRotation, interpolateTransforms, lerp } from "./interpolation.ts";

const DEG = Math.PI / 180;

describe("Scalar and vector interpolation (§9)", () => {
  it("lerp interpolates linearly including endpoints", () => {
    expect(lerp(0, 100, 0)).toBe(0);
    expect(lerp(0, 100, 0.5)).toBe(50);
    expect(lerp(0, 100, 1)).toBe(100);
    expect(lerp(-20, 20, 0.25)).toBeCloseTo(-10, 10);
  });

  it("translation interpolates linearly", () => {
    const a = transform().translate(0, 0, 0);
    const b = transform().translate(100, -40, 8);
    const mid = interpolateTransforms(a, b, 0.5);
    expect(mid.components.position.toArray()).toEqual([50, -20, 4]);
  });

  it("scale interpolates linearly", () => {
    const a = transform().scale(1);
    const b = transform().scale(2, 4, 8);
    const mid = interpolateTransforms(a, b, 0.5);
    expect(mid.components.scale.toArray()).toEqual([1.5, 2.5, 4.5]);
  });
});

describe("Quaternion rotation interpolation (§9.1)", () => {
  it("SLERP bisects a 3D rotation", () => {
    const a = transform();
    const b = transform().rotateY(Math.PI / 2);
    const mid = interpolateTransforms(a, b, 0.5);

    // Half of a quarter turn about Y maps +X toward -Z by 45°.
    const rotated = mid.toMatrix().applyToVector([1, 0, 0]);
    expect(rotated.x).toBeCloseTo(Math.SQRT1_2, 6);
    expect(rotated.z).toBeCloseTo(-Math.SQRT1_2, 6);
    expect(rotated.y).toBeCloseTo(0, 6);
  });

  it("SLERP takes the shortest path by default", () => {
    // 170° and -170° are 20° apart through 180°, not 340° the other way.
    const a = transform().rotateZ(170 * DEG);
    const b = transform().rotateZ(-170 * DEG);
    const mid = interpolateTransforms(a, b, 0.5);

    const rotated = mid.toMatrix().applyToVector([1, 0, 0]);
    expect(rotated.x).toBeCloseTo(-1, 6);
    expect(rotated.y).toBeCloseTo(0, 6);

    // A quarter of the way must be at 175°, not near -120°.
    const quarter = interpolateTransforms(a, b, 0.25);
    const qRot = quarter.toMatrix().applyToVector([1, 0, 0]);
    expect(qRot.x).toBeCloseTo(Math.cos(175 * DEG), 4);
    expect(qRot.y).toBeCloseTo(Math.sin(175 * DEG), 4);
  });

  it("rotation endpoints reproduce the inputs exactly", () => {
    const a = transform().rotateX(0.3).rotateY(-1.2);
    const b = transform().rotateZ(2.1).scale(3);

    expect(interpolateTransforms(a, b, 0).equals(a)).toBe(true);
    expect(interpolateTransforms(a, b, 1).equals(b)).toBe(true);
  });

  it("rotation interpolation normalizes non-unit quaternion inputs", () => {
    const a = new Quaternion(0, 0, 0, 2); // 2× identity
    const b = Quaternion.fromAxisAngle([0, 0, 1], Math.PI / 2).multiply({ x: 0, y: 0, z: 0, w: 3 });
    const mid = interpolateRotation(a, b, 0.5);
    expect(mid.length()).toBeCloseTo(1, 9);

    const expected = Quaternion.fromAxisAngle([0, 0, 1], Math.PI / 4);
    expect(mid.equals(expected, 1e-9)).toBe(true);
  });
});

describe("2D rotation uses angular interpolation (§9)", () => {
  it("pure-Z rotations interpolate by angle with shortest-path wrapping", () => {
    const a = Quaternion.fromAxisAngle([0, 0, 1], -170 * DEG);
    const b = Quaternion.fromAxisAngle([0, 0, 1], 170 * DEG);
    const mid = interpolateRotation(a, b, 0.5);

    // The shortest arc from −170° to +170° is 20° through ±180°, not the
    // long way around through 0°. The midpoint must therefore be a half
    // turn, not the identity.
    expect(mid.z).toBeCloseTo(-1, 6);
    expect(Math.abs(mid.w)).toBeCloseTo(0, 6);

    // And a path that genuinely passes through 0° must take it: −45° → +45°.
    const c = Quaternion.fromAxisAngle([0, 0, 1], -45 * DEG);
    const d = Quaternion.fromAxisAngle([0, 0, 1], 45 * DEG);
    const throughZero = interpolateRotation(c, d, 0.5);
    expect(throughZero.w).toBeCloseTo(1, 6);
    expect(throughZero.z).toBeCloseTo(0, 6);
  });

  it("the angular path agrees with SLERP for pure-Z rotations", () => {
    const angles = [0, 30, 90, 170, -45, -170];
    for (const startDeg of angles) {
      for (const endDeg of angles) {
        const a = Quaternion.fromAxisAngle([0, 0, 1], startDeg * DEG);
        const b = Quaternion.fromAxisAngle([0, 0, 1], endDeg * DEG);
        for (const t of [0, 0.25, 0.5, 0.75, 1]) {
          const angular = interpolateRotation(a, b, t);
          const spherical = a.slerp(b, t);
          expect(angular.equals(spherical, 1e-9)).toBe(true);
        }
      }
    }
  });

  it("mixed-axis rotations fall through to SLERP", () => {
    const a = Quaternion.fromAxisAngle([0, 0, 1], Math.PI / 3);
    const b = Quaternion.fromAxisAngle([1, 0, 0], Math.PI / 3);
    expect(interpolateRotation(a, b, 0.5).equals(a.slerp(b, 0.5), 1e-12)).toBe(true);
  });
});

describe("Raw matrix interpolation is never the default (§9)", () => {
  it("the midpoint of two rotations is a proper rotation, not an averaged matrix", () => {
    const a = transform();
    const b = transform().rotateZ(Math.PI / 2);
    const mid = interpolateTransforms(a, b, 0.5);

    // Property-aware: exactly a 45° rotation of a unit vector (length 1).
    const rotated = mid.toMatrix().applyToVector([1, 0, 0]);
    expect(rotated.length()).toBeCloseTo(1, 9);
    expect(rotated.x).toBeCloseTo(Math.SQRT1_2, 6);

    // Element-wise matrix averaging would give [0.5, 0.5, 0] (length ≈ 0.707).
    expect(rotated.x).not.toBeCloseTo(0.5, 6);
  });

  it("rotation and scale interpolate independently", () => {
    const a = transform();
    const b = transform()
      .rotateZ(Math.PI / 2)
      .scale(2);
    const mid = interpolateTransforms(a, b, 0.5);

    expect(mid.components.scale.toArray()).toEqual([1.5, 1.5, 1.5]);
    const expectedRotation = Quaternion.fromAxisAngle([0, 0, 1], Math.PI / 4);
    expect(mid.components.rotation.equals(expectedRotation, 1e-9)).toBe(true);

    // A raw matrix average of T×R×S endpoints would not decompose into this
    // clean rotation + uniform scale; verify the matrix matches TRS exactly.
    const expected = mid.toMatrix();
    const rebuilt = transform({
      position: mid.components.position,
      rotation: mid.components.rotation,
      scale: mid.components.scale,
    }).toMatrix();
    expect(expected.equals(rebuilt, 1e-9)).toBe(true);
  });
});
