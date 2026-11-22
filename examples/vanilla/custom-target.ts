import { Animation } from "keyframe-flow";
import type { Matrix4, RenderTarget } from "keyframe-flow";
import { codeLine, column, mountTransport, num, stage, type VanillaMount } from "./harness.ts";

/**
 * Custom structural target (§17.1) — vanilla twin of `Targets/Custom
 * Structural Target`: any object with `setTransform(matrix)` is a valid
 * render target — no base class, no library imports inside the renderer.
 * This recorder counts every evaluated matrix and positions the dot itself
 * from column-major translation members (§15). Disposal leaves it intact.
 */
export const mount: VanillaMount = (host, args) => {
  const root = column(host);
  const stageEl = stage(root, 360, 160);

  const dot = document.createElement("div");
  dot.style.position = "absolute";
  dot.style.left = "50%";
  dot.style.top = "50%";
  dot.style.width = "64px";
  dot.style.height = "64px";
  dot.style.marginLeft = "-32px";
  dot.style.marginTop = "-32px";
  dot.style.borderRadius = "50%";
  dot.style.background = "linear-gradient(135deg, #facc15, #fb7185)";
  stageEl.appendChild(dot);

  let frames = 0;
  const recorder: RenderTarget = {
    setTransform(matrix: Matrix4): void {
      frames += 1;
      // Column-major storage: translation lives at indices 12–14 (§15). The
      // custom target receives raw matrices — reading them is the host's job.
      dot.style.left = `calc(50% + ${matrix.at(0, 3).toFixed(1)}px)`;
      dot.style.top = `calc(50% + ${matrix.at(1, 3).toFixed(1)}px)`;
      code.textContent = `setTransform calls: ${frames} — matrices recorded by the custom target`;
    },
  };

  const code = codeLine(root);

  const animation = Animation.from({
    from: { position: [-120, -40, 0] },
    to: { position: [120, 40, 0], rotation: [0, 0, Math.PI / 3] },
    duration: num(args, "duration", 1600),
    easing: "ease-in-out",
  });

  const playback = animation.attach(recorder);
  mountTransport(root, playback);
  playback.play();

  return () => {
    playback.dispose();
    root.remove();
  };
};
