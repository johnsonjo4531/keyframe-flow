import { describe, expect, it } from "vite-plus/test";

import { Vector3 } from "./vector3.ts";

describe("Vector3", () => {
  it("adds components without mutating either operand", () => {
    const a = new Vector3(1, 2, 3);
    const b = new Vector3(10, -2, 0.5);
    const sum = a.add(b);

    expect(sum.toArray()).toEqual([11, 0, 3.5]);
    expect(a.toArray()).toEqual([1, 2, 3]);
    expect(b.toArray()).toEqual([10, -2, 0.5]);
    expect(sum).not.toBe(a);
  });

  it("scales uniformly by a scalar and per-axis by a vector", () => {
    const v = new Vector3(1, 2, 3);
    expect(v.scale(2).toArray()).toEqual([2, 4, 6]);
    expect(v.scale(new Vector3(10, 0, -1)).toArray()).toEqual([10, 0, -3]);
    expect(v.toArray()).toEqual([1, 2, 3]);
  });

  it("computes dot products", () => {
    expect(new Vector3(1, 2, 3).dot([4, -5, 6])).toBeCloseTo(4 - 10 + 18);
    expect(new Vector3(1, 0, 0).dot([0, 1, 0])).toBe(0);
  });

  it("computes right-handed cross products (§4.4)", () => {
    const x = new Vector3(1, 0, 0);
    const y = new Vector3(0, 1, 0);
    const z = new Vector3(0, 0, 1);

    // The defining right-handed identity: X × Y = Z.
    expect(x.cross(y).toArray()).toEqual([0, 0, 1]);
    expect(y.cross(z).toArray()).toEqual([1, 0, 0]);
    expect(z.cross(x).toArray()).toEqual([0, 1, 0]);

    // Anti-commutativity.
    expect(y.cross(x).toArray()).toEqual([0, 0, -1]);
  });

  it("computes lengths", () => {
    expect(new Vector3(3, 4, 0).length()).toBeCloseTo(5);
    expect(Vector3.zero().length()).toBe(0);
    expect(new Vector3(1, 2, 3).lengthSquared()).toBe(14);
  });

  it("normalizes to unit length without mutating the source", () => {
    const v = new Vector3(0, 3, -4);
    const unit = v.normalize();

    expect(unit.length()).toBeCloseTo(1);
    expect(unit.toArray()[1]).toBeCloseTo(0.6);
    expect(unit.toArray()[2]).toBeCloseTo(-0.8);
    expect(v.length()).toBeCloseTo(5);
  });

  it("throws explicitly when normalizing a zero vector", () => {
    expect(() => Vector3.zero().normalize()).toThrow(/zero-length/);
  });

  it("accepts tuples and objects interchangeably", () => {
    expect(Vector3.from([1, 2, 3]).toArray()).toEqual([1, 2, 3]);
    expect(Vector3.from({ x: 4, y: 5, z: 6 }).toArray()).toEqual([4, 5, 6]);
  });
});
