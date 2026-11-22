import { Animation, target, transform } from "keyframe-flow";
import { centeredBox, column, mountTransport, num, stage, type VanillaMount } from "./harness.ts";

/**
 * From/to definitions (§5.2) — vanilla twin of the `Authoring/From To` story:
 * an explicit start and end transform over a duration, rendered to a DOM
 * element through the HTML adapter. No framework involved: create the
 * animation, attach the target, press play.
 */
export const mount: VanillaMount = (host, args) => {
  const root = column(host);
  const stageEl = stage(root, 320, 160);
  const box = centeredBox(stageEl, 72, "linear-gradient(135deg, #f97316, #db2777)");

  // The guide's fadeUp snippet, verbatim (§5.2).
  const animation = Animation.from({
    from: transform().translate(0, 20), // start 20 px below the end pose
    to: transform(), // identity — where everything ends up
    duration: num(args, "duration", 300), // milliseconds (§6.2)
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
