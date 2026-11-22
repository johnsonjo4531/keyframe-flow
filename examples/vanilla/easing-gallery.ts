import { Animation } from "keyframe-flow";
import type { EasingName } from "keyframe-flow";
import { bool, codeLine, column, str, type VanillaMount } from "./harness.ts";

/** Custom easing — no registration required (§8). */
const overshoot = (t: number): number => {
  const c = 1.70158;
  const u = t - 1;
  return u * u * ((c + 1) * u + c) + 1;
};

/**
 * Easing gallery (§8) — vanilla twin of `Easing/Easing Gallery`: plot any of
 * the 26 named curves (or a custom function) purely by manual sampling
 * (§10.2). No playback, no scheduler, no render target — just a function call
 * per pixel column.
 */
export const mount: VanillaMount = (host, args) => {
  const root = column(host);
  root.style.gap = "12px";

  const name = str(args, "name", "ease-in-out-cubic") as EasingName;
  const custom = bool(args, "custom", false);

  const canvas = document.createElement("canvas");
  canvas.width = 480;
  canvas.height = 200;
  canvas.style.maxWidth = "100%";
  root.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  // A pure-sampling demo: no playback, no scheduler, no render target.
  const probe = Animation.from({
    from: { position: [0, 0, 0] },
    to: { position: [1, 0, 0] },
    duration: 1,
    easing: custom ? overshoot : name,
  });

  if (ctx !== null) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "#8884";
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1);

    ctx.beginPath();
    const steps = 96;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const eased = probe.sampleProgress(t).components.position.x; // ∈ [0,1] (+overshoot)
      const x = t * w;
      const y = h - eased * (h - 8) - 4; // flip Y for screen space
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  const code = codeLine(root);
  code.style.fontSize = "12px";
  code.textContent = `easing: ${custom ? "(custom function — easeOutBack)" : JSON.stringify(name)}`;

  return () => {
    root.remove();
  };
};
