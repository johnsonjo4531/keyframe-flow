import { Animation, target } from "keyframe-flow";
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
 * Composition (§14) — vanilla twin of `Authoring/Composition`: `combine`
 * merges by property track; `group` sequences or aligns children. The layout
 * comes from storybook args (`combine` | `sequence` | `parallel`).
 */
export const mount: VanillaMount = (host, args) => {
  const root = column(host);
  const stageEl = stage(root, 360, 180);
  const box = centeredBox(stageEl, 64, "linear-gradient(135deg, #14b8a6, #3b82f6)");
  const duration = num(args, "duration", 1000); // the guide's move/spin length
  const layout = str(args, "layout", "combine");

  const move = Animation.from({ to: { position: [200, 0, 0] }, duration });
  const spin = Animation.from({ to: { rotation: [0, Math.PI, 0] }, duration });
  const pulse = Animation.from({ to: { scale: 1.4 }, duration: duration / 2 });

  const animation =
    layout === "combine"
      ? Animation.combine([move, spin, pulse])
      : layout === "parallel"
        ? Animation.group([move, spin, pulse], { layout: "parallel" })
        : Animation.group([Animation.group([move, spin]), pulse]);

  const playback = animation.attach(target.html(box));
  mountTransport(root, playback);
  playback.play();

  return () => {
    playback.dispose();
    root.remove();
  };
};
