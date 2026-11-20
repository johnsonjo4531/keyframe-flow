import { describe, expect, it } from "vite-plus/test";

import { Animation } from "../animation/animation.ts";
import { ManualClock } from "../timing/clock.ts";
import { ManualScheduler } from "../timing/scheduler.ts";
import { PlaybackEngine } from "../playback/engine.ts";
import { webgl } from "./webgl.ts";

const doc = globalThis.document;
if (doc === undefined) {
  throw new Error("Browser test suite requires a DOM environment.");
}

/** The structural subset of WebGLRenderingContext this test exercises. */
interface BrowserWebGLContext {
  createShader(type: number): unknown;
  shaderSource(shader: unknown, source: string): void;
  compileShader(shader: unknown): void;
  getShaderParameter(shader: unknown, pname: number): unknown;
  createProgram(): unknown;
  attachShader(program: unknown, shader: unknown): void;
  linkProgram(program: unknown): void;
  getProgramParameter(program: unknown, pname: number): unknown;
  useProgram(program: unknown): void;
  getUniformLocation(program: unknown, name: string): unknown;
  uniformMatrix4fv(location: unknown, transpose: boolean, value: Float32Array | number[]): void;
  getUniform(program: unknown, location: unknown): Float32Array | null;
}

// WebGL enum values (WebGL 1.0 spec constants).
const VERTEX_SHADER = 35633; // gl.VERTEX_SHADER
const FRAGMENT_SHADER = 35632; // gl.FRAGMENT_SHADER
const COMPILE_STATUS = 35713; // gl.COMPILE_STATUS
const LINK_STATUS = 35714; // gl.LINK_STATUS

describe("target.webgl adapter against a real GL context (§3.6, §20 M5)", () => {
  it("uploads evaluated transforms through uniformMatrix4fv and reads them back", () => {
    const canvasElement = doc.createElement("canvas");
    const gl = (canvasElement.getContext("webgl") as BrowserWebGLContext | null) ?? null;
    if (gl === null) {
      // Software-rendered headless environments may lack GL; nothing to verify.
      console.warn("WebGL unavailable in this browser environment; skipping assertion.");
      return;
    }

    const vertexSource = [
      "attribute vec4 a_position;",
      "uniform mat4 u_model;",
      "void main() { gl_Position = u_model * a_position; }",
    ].join("\n");

    const fragmentSource = "precision mediump float; void main() { gl_FragColor = vec4(1.0); }";

    const vertexShader = gl.createShader(VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexSource);
    gl.compileShader(vertexShader);
    expect(gl.getShaderParameter(vertexShader, COMPILE_STATUS)).toBeTruthy();

    // Linking requires both shader stages in WebGL.
    const fragmentShader = gl.createShader(FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);
    expect(gl.getShaderParameter(fragmentShader, COMPILE_STATUS)).toBeTruthy();

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    expect(gl.getProgramParameter(program, LINK_STATUS)).toBeTruthy();
    gl.useProgram(program);

    const location = gl.getUniformLocation(program, "u_model");
    expect(location).not.toBeNull();

    // The adapter's upload hook performs the host-side GL call verbatim.
    const adapter = webgl({
      onTransform: (values) => {
        gl.uniformMatrix4fv(location, false, values);
      },
    });

    const clock = new ManualClock(0);
    const scheduler = new ManualScheduler();
    const engine = new PlaybackEngine({ clock, scheduler });
    const animation = Animation.from({
      from: { position: [0, 0, 0] as [number, number, number] },
      to: { position: [100, 50, 0] as [number, number, number] },
      duration: 1000,
    });

    const playback = animation.attach(adapter, { engine });
    playback.play();
    clock.advance(500);
    scheduler.tick(clock.now());

    // Read the uniform back from the GPU program state: column-major values
    // land in the mat4 exactly where GLSL expects them (§15).
    const uploaded = gl.getUniform(program, location);
    expect(uploaded).not.toBeNull();
    if (uploaded === null) return;
    expect(uploaded[12]).toBeCloseTo(50, 3); // translation x at column 3
    expect(uploaded[13]).toBeCloseTo(25, 3);
    expect(uploaded[0]).toBeCloseTo(1, 3);

    playback.dispose();
  });
});
