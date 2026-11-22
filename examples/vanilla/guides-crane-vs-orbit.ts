import { Animation, target, transform } from "keyframe-flow";
import {
  centeredBox,
  codeLine,
  column,
  mountTransport,
  stage,
  type VanillaMount,
} from "./harness.ts";

/**
 * Crane vs orbit — vanilla twin of `Guides/Core Concepts → Crane Vs Orbit`,
 * running the Core concepts guide's composition-order snippets. Fluent calls
 * apply in local space (`M ← M × Op`): translate-then-rotate extends a crane
 * arm and swings it; rotate-then-translate orbits the original origin. Each
 * box animates from identity to its composed result, so the different
 * endpoints show the order-dependence directly.
 */
export const mount: VanillaMount = (host) => {
  const root = column(host);

  // Translate first, THEN rotate — rotation happens about the object's now
  // displaced local origin, like a crane arm swinging after extending.
  const crane = transform()
    .translate(100, 0)
    .rotateZ(Math.PI / 2);
  // Rotating before translating orbits the original origin instead.
  const orbit = transform()
    .rotateZ(Math.PI / 2)
    .translate(100, 0);

  const cleanups: Array<() => void> = [];

  for (const [label, to, gradient] of [
    ["crane — translate, then rotate", crane, "linear-gradient(135deg, #f97316, #db2777)"],
    ["orbit — rotate, then translate", orbit, "linear-gradient(135deg, #0ea5e9, #22c55e)"],
  ] as const) {
    const side = column(root);
    const title = document.createElement("p");
    title.textContent = label;
    title.style.cssText = "font-size:12px;margin:0 0 4px;text-align:center;max-width:200px";
    side.appendChild(title);

    const stageEl = stage(side, 200, 200);
    const box = centeredBox(stageEl, 48, gradient);

    const playback = Animation.from({ from: transform(), to, duration: 1200 }).attach(
      target.html(box),
      { iterations: "infinite", direction: "alternate" }, // keep endpoints visible
    );
    mountTransport(side, playback);

    const matrix = to.toMatrix();
    const readout = codeLine(side);
    readout.textContent = `translation (${matrix.el(12).toFixed(0)}, ${matrix.el(13).toFixed(0)})`;

    playback.play();
    cleanups.push(() => {
      playback.dispose();
      side.remove();
    });
  }

  return () => {
    for (const cleanup of cleanups) cleanup();
    root.remove();
  };
};
