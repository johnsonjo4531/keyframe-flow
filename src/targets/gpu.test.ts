import { describe, expect, it } from "vite-plus/test";

import { Animation } from "../animation/animation.ts";
import { Matrix4 } from "../matrix/matrix4.ts";
import { ManualClock } from "../timing/clock.ts";
import { ManualScheduler } from "../timing/scheduler.ts";
import { PlaybackEngine } from "../playback/engine.ts";
import { Quaternion } from "../transform/quaternion.ts";
import type { RenderTarget } from "./types.ts";
import { webgl, WebGLRenderTarget, type WebGLRenderTargetOptions } from "./webgl.ts";
import { webgpu, WebGPURenderTarget, type WebGPURenderTargetOptions } from "./webgpu.ts";

function translationMatrix(x: number, y: number, z: number): Matrix4 {
  return Matrix4.fromTRS([x, y, z], Quaternion.identity(), [1, 1, 1]);
}

const identityValues = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

interface GpuAdapter {
  readonly matrixValues: Float32Array;
  setTransform(matrix: Matrix4): void;
  copyMatrixValuesTo(out: Float32Array): void;
}

describe.each([
  ["webgl", (options?: WebGLRenderTargetOptions) => webgl(options)],
  ["webgpu", (options?: WebGPURenderTargetOptions) => webgpu(options)],
] as const)("%s adapter (§3.6, §20 M5)", (_name, create) => {
  it("starts at identity and stores the latest transform column-major (§15)", () => {
    const target = create();
    expect(Array.from(target.matrixValues)).toEqual(identityValues);

    target.setTransform(translationMatrix(10, 20, 30));
    const values = target.matrixValues;
    // Column-major upload order: translation lives at indices 12–14, exactly
    // what gl.uniformMatrix4fv and WGSL mat4x4<f32> consume (§15).
    expect(values[12]).toBeCloseTo(10);
    expect(values[13]).toBeCloseTo(20);
    expect(values[14]).toBeCloseTo(30);

    // Latest value replaces — adapters accumulate nothing.
    target.setTransform(translationMatrix(1, 2, 3));
    expect(Array.from(target.matrixValues).slice(12, 15)).toEqual([1, 2, 3]);
  });

  it("returns copies so stored state cannot be mutated through the getter", () => {
    const target = create();
    const values = target.matrixValues;
    values[0] = 99;
    expect(target.matrixValues[0]).toBe(1);
  });

  it("notifies the upload hook on every evaluation", () => {
    const uploads: Float32Array[] = [];
    const target = create({ onTransform: (matrix) => uploads.push(matrix) });

    target.setTransform(translationMatrix(5, 0, 0));
    target.setTransform(translationMatrix(7, 0, 0));

    expect(uploads).toHaveLength(2);
    expect(uploads[0]?.[12]).toBeCloseTo(5);
    expect(uploads[1]?.[12]).toBeCloseTo(7);
  });

  it("copyMatrixValuesTo fills an existing buffer without allocation (§2.9)", () => {
    const target = create();
    target.setTransform(translationMatrix(4, 5, 6));
    const out = new Float32Array(16);
    target.copyMatrixValuesTo(out);
    expect(out[12]).toBeCloseTo(4);
    expect(out[15]).toBeCloseTo(1);
    expect(() => target.copyMatrixValuesTo(new Float32Array(4))).toThrow(RangeError);
  });

  it("drives from the playback engine with zero engine changes (§17.1)", () => {
    const uploads: number[] = [];
    const adapter = create({ onTransform: (matrix) => uploads.push(matrix[12] ?? 0) });
    const target: RenderTarget & GpuAdapter = adapter;

    const clock = new ManualClock(0);
    const scheduler = new ManualScheduler();
    const engine = new PlaybackEngine({ clock, scheduler });
    const animation = Animation.from({
      from: { position: [0, 0, 0] as [number, number, number] },
      to: { position: [100, 0, 0] as [number, number, number] },
      duration: 1000,
    });

    const playback = animation.attach(target, { engine });
    playback.play();
    clock.advance(500);
    scheduler.tick(clock.now());
    expect(uploads[uploads.length - 1]).toBeCloseTo(50);

    // Disposal releases the adapter's role but destroys nothing (Appendix
    // B.8): hosts may keep the adapter and its latest values afterwards.
    playback.dispose();
    target.setTransform(translationMatrix(9, 9, 9));
    expect(target.matrixValues[12]).toBeCloseTo(9);
  });

  it("exposes a public class usable directly without the factory", () => {
    const Direct = _name === "webgl" ? WebGLRenderTarget : WebGPURenderTarget;
    const direct = new Direct();
    direct.setTransform(Matrix4.identity());
    expect(Array.from(direct.matrixValues)).toEqual(identityValues);
  });
});
