import { Animation } from "keyframe-flow";
import { bool, column, num, type VanillaMount } from "./harness.ts";

/**
 * Manual sampling in an external render loop (§10.3) — vanilla twin of
 * `Sampling/Manual Render Loop`: no `attach`, no playback instance, no
 * scheduler. The host owns time and calls `sampleProgress` each frame with
 * its own progress value.
 */
export const mount: VanillaMount = (host, args) => {
  const root = column(host);
  root.style.gap = "12px";

  const canvas = document.createElement("canvas");
  canvas.width = 480;
  canvas.height = 220;
  canvas.style.maxWidth = "100%";
  root.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  const label = document.createElement("label");
  label.style.fontSize = "13px";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = true;
  label.append(checkbox, document.createTextNode(" host loop running"));
  root.appendChild(label);

  if (ctx === null) {
    return () => {
      root.remove();
    };
  }

  const duration = num(args, "duration", 2000);
  const animation = Animation.from({
    from: { position: [-1, 0, 0], scale: 0.6 },
    to: { position: [1, 0, 0], scale: 1.3 },
    duration,
    easing: "ease-in-out",
  });

  let raf = 0;
  const start = performance.now();
  const draw = (now: number): void => {
    const progress = ((now - start) % duration) / duration; // host-owned time
    const transform = animation.sampleProgress(progress); // §10.2 — pure evaluation
    const { position, scale } = transform.components;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2 + position.x * (w / 2 - 60), h / 2 + Math.sin(progress * Math.PI * 2) * 40);
    ctx.scale(scale.x, scale.y);
    ctx.fillStyle = "#10b981";
    ctx.fillRect(-24, -24, 48, 48);
    ctx.restore();

    // The same timeline sampled as text — sampling is just a function call.
    ctx.font = "12px ui-monospace, monospace";
    ctx.fillStyle = "#999";
    ctx.fillText(
      `progress ${progress.toFixed(2)} → x ${position.x.toFixed(2)}, scale ${scale.x.toFixed(2)}`,
      8,
      h - 10,
    );

    raf = requestAnimationFrame(draw);
  };

  const startLoop = (): void => {
    if (checkbox.checked) raf = requestAnimationFrame(draw);
  };
  checkbox.addEventListener("change", () => {
    cancelAnimationFrame(raf); // the host owns its own loop — start and stop it directly
    startLoop();
  });
  if (bool(args, "running", true)) startLoop();

  return () => {
    cancelAnimationFrame(raf);
    root.remove();
  };
};
