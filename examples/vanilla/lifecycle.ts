import { Animation, target } from "keyframe-flow";
import { centeredBox, column, mountTransport, num, stage, type VanillaMount } from "./harness.ts";

/**
 * Playback & lifecycle (§11–§13) — vanilla twin of `Playback/Lifecycle`:
 * transport controls plus a progress scrubber (`seekProgress`, clamped to
 * `[0, 1]` by the engine).
 */
export const mount: VanillaMount = (host, args) => {
  const root = column(host);
  const stageEl = stage(root, 360, 140);
  const box = centeredBox(stageEl, 64, "linear-gradient(135deg, #ec4899, #8b5cf6)");

  const animation = Animation.from({
    from: { position: [-130, 0, 0], rotation: [0, 0, -Math.PI / 3] },
    to: { position: [130, 0, 0], rotation: [0, 0, Math.PI / 3] },
    duration: num(args, "duration", 1500),
    easing: "ease-in-out",
  });

  const playback = animation.attach(target.html(box));
  mountTransport(root, playback);

  const scrub = document.createElement("input");
  scrub.type = "range";
  scrub.min = "0";
  scrub.max = "1";
  scrub.step = "0.01";
  scrub.value = String(num(args, "seek", 0));
  scrub.style.marginTop = "8px";
  scrub.addEventListener("input", () => {
    playback.seekProgress(Number(scrub.value)); // clamped to [0, 1] by the engine (§12)
  });
  root.appendChild(scrub);

  playback.play();
  if (num(args, "seek", 0) > 0) playback.seekProgress(num(args, "seek", 0));

  return () => {
    playback.dispose();
    root.remove();
  };
};
