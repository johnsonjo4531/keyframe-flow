import { Animation, target } from "keyframe-flow";
import type { PlaybackDirectionMode } from "keyframe-flow";
import {
  centeredBox,
  column,
  mountTransport,
  num,
  stage,
  str,
  type VanillaMount,
} from "./harness.ts";

/**
 * Repetition & direction (§13) — vanilla twin of `Playback/Repetition &
 * Direction`: iteration counts (finite or `"infinite"`) and direction modes
 * are engine-loop concerns; keyframes are never duplicated.
 */
export const mount: VanillaMount = (host, args) => {
  const root = column(host);
  const stageEl = stage(root, 360, 140);
  const box = centeredBox(stageEl, 64, "linear-gradient(135deg, #f97316, #eab308)");

  const iterationsArg = args["iterations"];
  const animation = Animation.from({
    from: { position: [-140, 0, 0] },
    to: { position: [140, 0, 0], scale: 1.5 },
    duration: num(args, "duration", 1000),
    easing: "ease-in-out",
  });

  const playback = animation.attach(target.html(box), {
    iterations:
      typeof iterationsArg === "number"
        ? iterationsArg
        : iterationsArg === "infinite"
          ? "infinite"
          : 3,
    direction: str(args, "direction", "alternate") as PlaybackDirectionMode,
  });
  mountTransport(root, playback);
  playback.play();

  return () => {
    playback.dispose();
    root.remove();
  };
};
