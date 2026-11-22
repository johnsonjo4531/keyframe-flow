import { Animation, transform } from "keyframe-flow";
import { centeredBox, codeLine, column, stage, type VanillaMount } from "./harness.ts";

/**
 * Sample without playing — vanilla twin of `Guides/Getting Started → Sample
 * Without Playing`. The same `slide` definition is evaluated at any time with
 * no scheduler, no playback instance, and no render target (§10): the host's
 * own requestAnimationFrame loop calls `slide.sample(t)` and writes the
 * result itself. Definitions are pure functions of time — this is the hook
 * for hosts that already run a frame loop.
 */
export const mount: VanillaMount = (host) => {
  const root = column(host);
  const stageEl = stage(root, 320, 180);
  const box = centeredBox(stageEl, 72, "linear-gradient(135deg, #0ea5e9, #22c55e)");
  const readout = codeLine(root);

  const slide = Animation.from({
    from: transform(), // the same definition as First Animation
    to: transform().translate(100, 50),
    duration: 800,
    easing: "ease-out-cubic",
  });

  let raf = 0;
  const start = performance.now();
  const frame = (now: number): void => {
    // Ping-pong across [0, duration] so the sampled value sweeps both ways.
    const phase = (now - start) % (slide.duration * 2);
    const t = phase < slide.duration ? phase : slide.duration * 2 - phase;

    const transformAtT = slide.sample(t); // Transform at t ms — pure call
    const matrix = transformAtT.toMatrix(); // Matrix4 for your own upload path
    box.style.transform = `matrix3d(${matrix.toArray().join(",")})`;

    const p = transformAtT.components.position.toArray();
    readout.textContent =
      `slide.sample(${t.toFixed(0)}) → position [${p[0].toFixed(1)}, ${p[1].toFixed(1)}] · ` +
      `sampleProgress(${(t / slide.duration).toFixed(2)}) is identical`;

    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    root.remove();
  };
};
