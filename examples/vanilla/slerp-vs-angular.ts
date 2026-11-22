import { Animation, target } from "keyframe-flow";
import type { RotationMode } from "keyframe-flow";
import { centeredBox, column, mountTransport, stage, str, type VanillaMount } from "./harness.ts";

/**
 * Rotation interpolation (§9) — vanilla twin of `Interpolation/SLERP vs
 * Angular`: quaternion SLERP collapses a full turn (same orientation at both
 * ends); `rotationMode: "angular"` interpolates authored Euler radians.
 */
export const mount: VanillaMount = (host, args) => {
  const root = column(host);
  const stageEl = stage(root, 320, 180, ";perspective:600px");
  // Asymmetric face so the rotation is visible.
  const box = centeredBox(stageEl, 88, "linear-gradient(90deg, #f59e0b 50%, #1d4ed8 50%)");

  const mode = str(args, "mode", "angular") as RotationMode;
  const animation = Animation.from({
    from: { rotation: [0, 0, 0] },
    to: { rotation: [0, Math.PI * 2, 0] }, // one full turn about Y
    duration: 1000, // the guide's spin duration
    rotationMode: mode,
  });

  const note = document.createElement("p");
  note.style.maxWidth = "420px";
  note.style.fontSize = "13px";
  note.style.textAlign = "center";
  note.textContent =
    mode === "quaternion"
      ? "Quaternion mode: both endpoints are the same orientation — SLERP finds nothing to do."
      : "Angular mode: authored Euler radians interpolate component-wise — a visible full revolution.";
  root.appendChild(note);

  const playback = animation.attach(target.html(box));
  mountTransport(root, playback);
  playback.play();

  return () => {
    playback.dispose();
    root.remove();
  };
};
