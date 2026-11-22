import { Animation, target } from "keyframe-flow";
import type { PlaybackResult, RenderTarget } from "keyframe-flow";
import { centeredBox, column, num, stage, type VanillaMount } from "./harness.ts";

/**
 * Target ownership & supersede (§14) — vanilla twin of `Playback/Target
 * Supersede`: one shared render target, two playbacks; starting B cancels A,
 * whose `finished` resolves `{ status: "cancelled" }` and never rejects.
 */
export const mount: VanillaMount = (host, args) => {
  const root = column(host);
  const stageEl = stage(root, 360, 140);
  const box = centeredBox(stageEl, 64, "linear-gradient(135deg, #64748b, #0f172a)");
  const duration = num(args, "duration", 2000);

  // One shared render target object — ownership is per target (§14).
  const renderTarget: RenderTarget = target.html(box);

  const a = Animation.from({
    to: { position: [-140, 0, 0], scale: 2 },
    duration,
    easing: "linear",
  }).attach(renderTarget);
  const b = Animation.from({
    to: { position: [140, 0, 0], rotation: [0, 0, Math.PI / 2] },
    duration,
    easing: "linear",
  }).attach(renderTarget);

  const buttonStyle = "padding:4px 10px;cursor:pointer";
  const buttons = document.createElement("div");
  buttons.style.display = "flex";
  buttons.style.gap = "8px";
  root.appendChild(buttons);

  const add = (label: string, playback: typeof a): void => {
    const button = document.createElement("button");
    button.type = "button";
    button.style.cssText = buttonStyle;
    button.textContent = label;
    button.addEventListener("click", () => playback.play());
    buttons.appendChild(button);
  };
  add("▶ A (grow left)", a);
  add("▶ B (spin right — supersedes A)", b);

  const readout = document.createElement("div");
  readout.style.fontFamily = "ui-monospace, monospace";
  readout.style.fontSize = "12px";
  readout.style.marginTop = "12px";
  readout.style.display = "flex";
  readout.style.gap = "16px";
  root.appendChild(readout);
  const statusA = document.createElement("span");
  const statusB = document.createElement("span");
  statusA.textContent = "A finished: pending";
  statusB.textContent = "B finished: pending";
  readout.append(statusA, statusB);

  void a.finished.then((r: PlaybackResult) => {
    statusA.textContent = `A finished: ${r.status}`;
  });
  void b.finished.then((r: PlaybackResult) => {
    statusB.textContent = `B finished: ${r.status}`;
  });

  return () => {
    a.dispose();
    b.dispose();
    root.remove();
  };
};
