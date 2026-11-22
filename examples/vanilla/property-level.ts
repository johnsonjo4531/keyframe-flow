import { Animation, target } from "keyframe-flow";
import { centeredBox, column, mountTransport, num, stage, type VanillaMount } from "./harness.ts";

/**
 * Property-level definitions (§7) — vanilla twin of `Authoring/Property Level`:
 * only `scale` is animated; position and rotation are preserved from the start.
 */
export const mount: VanillaMount = (host, args) => {
  const root = column(host);
  const stageEl = stage(root, 320, 160);
  const box = centeredBox(stageEl, 72, "linear-gradient(135deg, #0ea5e9, #22c55e)");

  const animation = Animation.from({
    // The guide's grow snippet: no `from` (identity start), scale-only track.
    to: { scale: num(args, "toScale", 1.5) }, // only scale changes (§7)
    duration: num(args, "duration", 250),
  });

  const playback = animation.attach(target.html(box), {
    iterations: "infinite", // loop the short snippet for demo visibility
    direction: "alternate",
  });
  mountTransport(root, playback);
  playback.play();

  return () => {
    playback.dispose();
    root.remove();
  };
};
