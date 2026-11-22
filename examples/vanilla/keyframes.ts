import { Animation, target, transform } from "keyframe-flow";
import { centeredBox, column, mountTransport, num, stage, type VanillaMount } from "./harness.ts";

/**
 * Static keyframes (§5.3) — vanilla twin of `Authoring/Keyframes`: five keys
 * with `at` as normalized progress in `[0, 1]` — the guide's bounce snippet.
 */
export const mount: VanillaMount = (host, args) => {
  const root = column(host);
  const stageEl = stage(root, 360, 200);
  const box = centeredBox(stageEl, 64, "linear-gradient(135deg, #a855f7, #6366f1)");

  const animation = Animation.from({
    duration: num(args, "duration", 1200), // the guide's bounce duration
    easing: "ease-in-out", // default for segments without an override (§8)
    keyframes: [
      // The guide's bounce snippet — normalized `at` in [0, 1] (§6.1).
      { at: 0, transform: transform().translate(0, -100) }, // starts high
      { at: 0.6, transform: transform() }, // lands at rest by 60 %
      { at: 0.75, transform: transform().translate(0, -30) }, // small rebound
      { at: 0.9, transform: transform() }, // settles again
      { at: 1, transform: transform() }, // holds through the end
    ],
  });

  const playback = animation.attach(target.html(box), {
    iterations: "infinite", // replay the drop-and-settle for demo visibility
  });
  mountTransport(root, playback);
  playback.play();

  return () => {
    playback.dispose();
    root.remove();
  };
};
