import { Animation, target } from "keyframe-flow";
import {
  centeredBox,
  codeLine,
  column,
  mountTransport,
  num,
  stage,
  str,
  type VanillaMount,
} from "./harness.ts";

/**
 * HTML adapter (§17) — vanilla twin of `Targets/HTML Adapter`: the adapter
 * writes CSS `matrix3d()` in column-major order and owns the inline
 * `transform` property; any pre-existing value is replaced on the first
 * evaluated frame (§17.3).
 */
export const mount: VanillaMount = (host, args) => {
  const root = column(host);
  const stageEl = stage(root, 360, 160);
  const box = centeredBox(stageEl, 72, "linear-gradient(135deg, #06b6d4, #3b82f6)");

  const origin = str(args, "origin", "default");
  const animation = Animation.from({
    from: { position: [-100, -30, 0], rotation: [0, 0, 0] },
    to: { position: [100, 30, 0], rotation: [0, 0, Math.PI / 4] },
    duration: num(args, "duration", 1400),
    easing: "ease-in-out",
  });

  const playback = animation.attach(
    target.html(box, origin === "default" ? undefined : { transformOrigin: origin }),
  );

  // Reflect the CSS the adapter actually wrote — browser-parsed truth.
  const code = codeLine(root);
  let raf = 0;
  const poll = (): void => {
    code.textContent = `${box.style.transform.slice(0, 64)}…`;
    if (playback.state === "running") raf = requestAnimationFrame(poll);
  };

  mountTransport(root, playback);
  const kickPoll = (): void => {
    cancelAnimationFrame(raf);
    poll();
  };
  // Re-poll after each control action so the CSS readout never goes stale.
  root.querySelectorAll("button").forEach((button) => button.addEventListener("click", kickPoll));

  playback.play();
  poll(); // start after play() — the loop only keeps ticking while running

  return () => {
    cancelAnimationFrame(raf);
    playback.dispose();
    root.remove();
  };
};
