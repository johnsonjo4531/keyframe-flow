import { describe, expect, it } from "vite-plus/test";

import { Matrix4 } from "../matrix/matrix4.ts";
import { matrix } from "../matrix/index.ts";
import { Quaternion } from "./quaternion.ts";
import { transform, Transform } from "./transform.ts";

describe("Transform construction (§4.1, §4.3)", () => {
  it("defaults to the identity transform", () => {
    const t = transform();
    expect(t.components.position.toArray()).toEqual([0, 0, 0]);
    expect(t.components.rotation.equals(Quaternion.identity())).toBe(true);
    expect(t.components.scale.toArray()).toEqual([1, 1, 1]);
    expect(t.toMatrix().equals(Matrix4.identity())).toBe(true);
  });

  it("accepts canonical components directly", () => {
    const t = new Transform({
      position: [1, 2, 3],
      rotation: Quaternion.fromAxisAngle([0, 1, 0], Math.PI / 2),
      scale: [2, 2, 2],
    });
    expect(t.components.position.toArray()).toEqual([1, 2, 3]);
    expect(t.components.scale.toArray()).toEqual([2, 2, 2]);
  });

  it("matches the fluent and declarative examples from §4.1", () => {
    const fluent = transform()
      .translate(100, 50, 0)
      .rotateY(Math.PI / 2)
      .scale(2);
    const declarative = transform({
      position: [100, 50, 0],
      rotation: [0, Math.PI / 2, 0],
      scale: [2, 2, 2],
    });

    expect(declarative.equals(fluent)).toBe(true);
    expect(declarative.toMatrix().equals(fluent.toMatrix(), 1e-9)).toBe(true);
  });

  it("accepts rotation as a quaternion or Euler radians — angles are radians (§4.3, §4.4)", () => {
    const viaQuaternion = transform({ rotation: Quaternion.fromAxisAngle([0, 0, 1], Math.PI / 2) });
    const viaEuler = transform({ rotation: [0, 0, Math.PI / 2] });

    expect(viaQuaternion.equals(viaEuler)).toBe(true);

    // A right angle in radians rotates; the same number interpreted as degrees
    // would not — confirm the actual quarter-turn happened.
    expect(viaEuler.toMatrix().applyToVector([1, 0, 0]).toArray()[1]).toBeCloseTo(1);
  });

  it("accepts a uniform scale shorthand", () => {
    expect(transform({ scale: 3 }).components.scale.toArray()).toEqual([3, 3, 3]);
  });

  it("rejects negative scale explicitly (§4.3)", () => {
    expect(() => transform({ scale: [-1, 1, 1] })).toThrow(/reflection/);
    expect(() => new Transform({ scale: [1, -2, 1] })).toThrow(/reflection/);
  });
});

describe("Transform immutability (§4.2)", () => {
  it("every operation returns a new transform and leaves the source untouched", () => {
    const base = transform().translate(1, 2, 3);
    const positionBefore = base.components.position;
    const rotationBefore = base.components.rotation;

    const moved = base.translate(10, 0, 0);
    const spun = base.rotateY(0.5);
    const grown = base.scale(4);

    expect(moved).not.toBe(base);
    expect(spun).not.toBe(base);
    expect(grown).not.toBe(base);

    expect(base.components.position.toArray()).toEqual([1, 2, 3]);
    expect(base.components.position).toBe(positionBefore);
    expect(base.components.rotation).toBe(rotationBefore);
  });

  it("freezes the canonical components object", () => {
    const t = transform();
    expect(Object.isFrozen(t.components)).toBe(true);

    const mutable = t.components as { scale: unknown };
    expect(() => {
      mutable.scale = [9, 9, 9];
    }).toThrow(TypeError);
  });
});

describe("Transform composition (§4.4)", () => {
  it("applies fluent operations in call order as local-space operations", () => {
    // §4.4: translate then rotateY → "a rotated local object positioned at
    // the translated location".
    const t = transform()
      .translate(100, 0, 0)
      .rotateY(Math.PI / 2);

    expect(t.components.position.toArray()[0]).toBeCloseTo(100);
    expect(
      t.components.rotation.equals(Quaternion.fromAxisAngle([0, 1, 0], Math.PI / 2), 1e-9),
    ).toBe(true);

    // A point on the object's local +X axis is rotated first, then translated.
    const p = t.toMatrix().applyToPoint([1, 0, 0]);
    expect(p.toArray()[0]).toBeCloseTo(100);
    expect(p.toArray()[2]).toBeCloseTo(-1);
  });

  it("translates along the object's local axes after rotation", () => {
    // rotateY(+90°) sends local +X onto world -Z.
    const t = transform()
      .rotateY(Math.PI / 2)
      .translate(100, 0, 0);

    expect(t.components.position.toArray()[0]).toBeCloseTo(0);
    expect(t.components.position.toArray()[2]).toBeCloseTo(-100);
    expect(
      t.components.rotation.equals(Quaternion.fromAxisAngle([0, 1, 0], Math.PI / 2), 1e-9),
    ).toBe(true);
  });

  it("local translation is measured in scaled local units", () => {
    // M ← S × T equals T_(s·t) × S: the object moves 2×3 = 6 world units.
    const t = transform().scale(2).translate(3, 0, 0);
    expect(t.components.position.toArray()[0]).toBeCloseTo(6);

    // Same for a rotated object: local +X now points to world -Z.
    const spun = transform()
      .scale(2)
      .rotateY(Math.PI / 2)
      .translate(3, 0, 0);
    expect(spun.components.position.toArray()[2]).toBeCloseTo(-6);
  });

  it("uniform scale commutes with rotation, so either call order matches", () => {
    const scaleThenRotate = transform()
      .scale(2)
      .rotateY(Math.PI / 2);
    const rotateThenScale = transform()
      .rotateY(Math.PI / 2)
      .scale(2);

    expect(scaleThenRotate.equals(rotateThenScale)).toBe(true);
    expect(scaleThenRotate.toMatrix().equals(rotateThenScale.toMatrix(), 1e-9)).toBe(true);
  });

  it("throws explicitly when non-uniform scale followed by rotation would produce shear (§4.3, §9.2)", () => {
    // M ← S × R genuinely contains shear and cannot be represented as ordinary
    // TRS components — the library must fail rather than approximate.
    expect(() =>
      transform()
        .scale(2, 1, 1)
        .rotateY(Math.PI / 4),
    ).toThrow(/shear/i);

    // The canonical call order (rotate then scale) is representable.
    expect(() =>
      transform()
        .rotateY(Math.PI / 4)
        .scale(2, 1, 1),
    ).not.toThrow();
  });

  it("composes parent-to-child via Parent × Local (§4.4)", () => {
    const parent = transform()
      .translate(100, 0, 0)
      .rotateY(Math.PI / 2);
    const local = transform().translate(0, 0, 50);

    // world = P × L: the child sits 50 along the parent's (rotated) local Z.
    const composed = parent.compose(local);

    expect(composed.components.position.toArray()[0]).toBeCloseTo(150);
    expect(composed.components.position.toArray()[2]).toBeCloseTo(0);
    expect(composed.components.rotation.equals(parent.components.rotation, 1e-9)).toBe(true);

    // Static form is equivalent.
    expect(Transform.compose(parent, local).equals(composed)).toBe(true);
  });

  it("world-space operations act in the parent coordinate system (§4.4)", () => {
    const t = transform()
      .rotateY(Math.PI / 2)
      .translate(100, 0, 0);

    // worldTranslate adds along parent axes regardless of local rotation.
    const moved = t.worldTranslate(0, 10, 0);
    expect(moved.components.position.toArray()[1]).toBeCloseTo(10);
    expect(moved.components.position.toArray()[2]).toBeCloseTo(-100);

    // worldRotateY orbits the object around the parent's Y axis through the origin.
    const orbiting = transform()
      .translate(0, 0, 10)
      .worldRotateY(Math.PI / 2);
    expect(orbiting.components.position.toArray()[0]).toBeCloseTo(10);
    expect(orbiting.components.position.toArray()[2]).toBeCloseTo(0);
    expect(
      orbiting.components.rotation.equals(Quaternion.fromAxisAngle([0, 1, 0], Math.PI / 2), 1e-9),
    ).toBe(true);
  });

  it("world operations never mutate the source", () => {
    const t = transform().translate(5, 0, 0);
    t.worldTranslate(1, 0, 0);
    t.worldRotateZ(Math.PI);
    expect(t.components.position.toArray()).toEqual([5, 0, 0]);
  });
});

describe("Transform ⇄ Matrix conversion (§3.3, §15.1)", () => {
  it("round-trips through decomposition", () => {
    const t = transform().translate(-4, 5, 6).rotateY(0.8).scale(2, 0.5, 4);

    expect(Transform.fromMatrix(t.toMatrix()).equals(t, 1e-9)).toBe(true);
  });

  it("fromMatrix throws for matrices that are not TRS-decomposable", () => {
    const shear = matrix.from([1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    expect(() => Transform.fromMatrix(shear)).toThrow(/shear/i);

    const perspective = matrix.from([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.25, 0, 0, 0, 1]);
    expect(() => Transform.fromMatrix(perspective)).toThrow(/perspective/i);
  });

  it("equals() ignores quaternion sign ambiguity (§4.3)", () => {
    // q and -q describe the same orientation; a transform constructed with
    // the negated identity quaternion must equal the identity transform.
    const negated = new Transform({ rotation: new Quaternion(0, 0, 0, -1) });
    expect(negated.components.rotation.w).toBeCloseTo(-1);
    expect(negated.equals(transform())).toBe(true);

    // A full turn through the fluent API lands on the same orientation too.
    const spun = transform().rotateY(Math.PI * 2);
    expect(spun.equals(transform())).toBe(true);
  });
});
