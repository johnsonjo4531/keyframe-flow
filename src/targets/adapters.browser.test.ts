import { describe, expect, it } from "vite-plus/test";

import { Animation } from "../animation/animation.ts";
import { ManualClock } from "../timing/clock.ts";
import { ManualScheduler } from "../timing/scheduler.ts";
import { PlaybackEngine } from "../playback/engine.ts";
import { Matrix4 } from "../matrix/matrix4.ts";
import { Transform } from "../transform/transform.ts";
import { Quaternion } from "../transform/quaternion.ts";
import { canvas, html, svg, target } from "./index.ts";
import { projectToCanvas2D } from "./canvas.ts";
import type { RenderTarget } from "./types.ts";

const doc = globalThis.document;
if (doc === undefined) {
  throw new Error("Browser test suite requires a DOM environment.");
}

const MatrixCtor = globalThis.DOMMatrix;
if (MatrixCtor === undefined) {
  throw new Error("Browser test suite requires the native DOMMatrix API.");
}

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

function moveAnimation(duration = 1000): Animation {
  return Animation.from({
    from: { position: [0, 0, 0] as [number, number, number] },
    to: { position: [100, 50, 0] as [number, number, number] },
    duration,
  });
}

function deterministicEngine(): {
  engine: PlaybackEngine;
  clock: ManualClock;
  tick: (d: number) => void;
} {
  const clock = new ManualClock(0);
  const scheduler = new ManualScheduler();
  const engine = new PlaybackEngine({ clock, scheduler });
  return {
    engine,
    clock,
    tick(d) {
      clock.advance(d);
      scheduler.tick(clock.now());
    },
  };
}

describe("target.html adapter (§17)", () => {
  it("writes matrix3d() values the browser's own CSS parser agrees with", () => {
    const element = doc.createElement("div");
    const h = deterministicEngine();
    const playback = moveAnimation(1000).attach(target.html(element), { engine: h.engine });

    playback.play();
    h.tick(500); // halfway → translation (50, 25)

    expect(element.style.transform.startsWith("matrix3d(")).toBe(true);

    // Let the browser parse what we wrote: DOMMatrix accepts CSS transform
    // lists, so agreement proves our column-major argument order is right.
    const parsed = new MatrixCtor(element.style.transform);
    expect(parsed.m41).toBeCloseTo(50); // CSSOM m<column><row>: translation x
    expect(parsed.m42).toBeCloseTo(25);
    expect(parsed.m11).toBeCloseTo(1);

    h.tick(500);
    const end = new MatrixCtor(element.style.transform);
    expect(end.m41).toBeCloseTo(100);
    expect(end.m42).toBeCloseTo(50);
  });

  it("replaces any pre-existing inline transform (adapter owns the property)", () => {
    const element = doc.createElement("div");
    element.style.transform = "translateX(5px)";

    target.html(element).setTransform(Matrix4.fromTRS([1, 2, 3], Quaternion.identity(), [1, 1, 1]));

    expect(element.style.transform.startsWith("matrix3d(")).toBe(true);
    const parsed = new MatrixCtor(element.style.transform);
    expect(parsed.m41).toBeCloseTo(1);
    expect(parsed.m42).toBeCloseTo(2);
    expect(parsed.m43).toBeCloseTo(3);
  });

  it("applies an explicit transform-origin when requested (§17.3)", () => {
    const element = doc.createElement("div");
    target.html(element, { transformOrigin: "0 0" }).setTransform(Matrix4.identity());
    // CSSOM normalizes lengths; accept either bare zeros or px units.
    expect(element.style.transformOrigin).toMatch(/^0(px)? 0(px)?$/);
  });
});

describe("target.svg adapter (§17)", () => {
  it("writes SVG matrix() attributes the browser parses back identically", () => {
    const group = doc.createElementNS(SVG_NAMESPACE, "g");
    const h = deterministicEngine();
    const playback = moveAnimation(1000).attach(target.svg(group), { engine: h.engine });

    playback.play();
    h.tick(250); // quarter → translation (25, 12.5)

    const value = group.getAttribute("transform");
    expect(value).not.toBeNull();
    expect(value?.startsWith("matrix(")).toBe(true);

    const parsed = new MatrixCtor(value ?? "");
    expect(parsed.m41).toBeCloseTo(25);
    expect(parsed.m42).toBeCloseTo(12.5);
  });
});

describe("target.canvas adapter (§17, §17.3)", () => {
  it("drives the real context transform through the projection step", () => {
    const canvasElement = doc.createElement("canvas");
    const context = canvasElement.getContext("2d");
    expect(context).not.toBeNull();
    if (context === null) return;

    const h = deterministicEngine();
    const playback = moveAnimation(1000).attach(target.canvas(context), { engine: h.engine });

    playback.play();
    h.tick(500); // translation (50, 25) — affine input projects exactly

    const ctm = context.getTransform();
    expect(ctm.a).toBeCloseTo(1);
    expect(ctm.b).toBeCloseTo(0);
    expect(ctm.c).toBeCloseTo(0);
    expect(ctm.d).toBeCloseTo(1);
    expect(ctm.e).toBeCloseTo(50);
    expect(ctm.f).toBeCloseTo(25);
  });

  it("projects 3D transforms rather than forwarding a raw matrix (§17.3)", () => {
    const canvasElement = doc.createElement("canvas");
    const context = canvasElement.getContext("2d");
    if (context === null) throw new Error("Canvas 2D unavailable.");

    const depth = Matrix4.fromTRS([10, 0, 50], Quaternion.identity(), [1, 1, 1]);
    canvas(context, { perspective: 100 }).setTransform(depth);

    const expected = projectToCanvas2D(depth, { perspective: 100 });
    const ctm = context.getTransform();
    expect(ctm.a).toBeCloseTo(expected[0], 9);
    expect(ctm.b).toBeCloseTo(expected[1], 9);
    expect(ctm.c).toBeCloseTo(expected[2], 9);
    expect(ctm.d).toBeCloseTo(expected[3], 9);
    expect(ctm.e).toBeCloseTo(expected[4], 9);
    expect(ctm.f).toBeCloseTo(expected[5], 9);

    // The projected translation is amplified by the camera, unlike raw use.
    expect(ctm.e).toBeCloseTo(20);
  });
});

describe("custom structural targets (§17.1) and ownership (§17.2)", () => {
  it("a plain object works as a target with no library base class or engine change", () => {
    const received: Matrix4[] = [];
    const customTarget: RenderTarget = {
      setTransform(matrix) {
        received.push(matrix);
      },
    };

    const h = deterministicEngine();
    const playback = moveAnimation(1000).attach(customTarget, { engine: h.engine });
    playback.play();
    h.tick(400);

    expect(received.length).toBeGreaterThan(0);
    const last = received[received.length - 1];
    if (last === undefined) throw new Error("expected a submitted transform");
    const position = Transform.fromMatrix(last).components.position;
    expect(position.x).toBeCloseTo(40);
    expect(position.y).toBeCloseTo(20);
  });

  it("disposing playback never destroys the element, context, or custom objects (§17.2)", () => {
    // HTML: the element keeps its last transform and remains usable.
    const element = doc.createElement("div");
    const h = deterministicEngine();
    const htmlPlayback = moveAnimation(100).attach(target.html(element), { engine: h.engine });
    htmlPlayback.play();
    h.tick(100);
    expect(element.style.transform.length).toBeGreaterThan(0);
    htmlPlayback.dispose();
    expect(element.style.transform.length).toBeGreaterThan(0); // retained
    element.style.transform = "matrix(1, 0, 0, 1, 7, 8)"; // still writable

    // Canvas: the context survives and still draws.
    const canvasElement = doc.createElement("canvas");
    const context = canvasElement.getContext("2d");
    if (context === null) throw new Error("Canvas 2D unavailable.");
    const canvasPlayback = moveAnimation(100).attach(target.canvas(context), { engine: h.engine });
    canvasPlayback.play();
    h.tick(50);
    canvasPlayback.dispose();
    expect(() => context.fillRect(0, 0, 1, 1)).not.toThrow(); // context alive

    // Custom target: adapter-level dispose runs; the object itself is intact.
    let disposeCalls = 0;
    const matrices: Matrix4[] = [];
    const customTarget: RenderTarget = {
      setTransform(matrix) {
        matrices.push(matrix);
      },
      dispose() {
        disposeCalls += 1;
      },
    };
    const customPlayback = moveAnimation(10).attach(customTarget, { engine: h.engine });
    customPlayback.play();
    h.tick(20);
    customPlayback.dispose();
    expect(disposeCalls).toBe(1);
    expect(matrices.length).toBeGreaterThan(0); // recorded data intact
    customPlayback.dispose(); // idempotent — no double cleanup (§12)
    expect(disposeCalls).toBe(1);
  });

  it("svg adapter can be attached directly without the target namespace", () => {
    const group = doc.createElementNS(SVG_NAMESPACE, "rect");
    svg(group).setTransform(Matrix4.fromTRS([3, 4, 0], Quaternion.identity(), [1, 1, 1]));
    expect(group.getAttribute("transform")).toContain("matrix(");
    void html; // namespace-free imports are equivalent to target.html/svg/canvas
  });
});
