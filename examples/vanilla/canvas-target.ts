import { Animation, projectToCanvas2D, target } from "keyframe-flow";
import { codeLine, column, mountTransport, num, type VanillaMount } from "./harness.ts";

/**
 * Canvas 2D adapter (§17.3) — vanilla twin of `Targets/Canvas 2D Adapter`:
 * the evaluated 4×4 matrix goes through an explicit projection step
 * (`projectToCanvas2D`, applied per frame by the adapter — never forwarded
 * raw), and the fitted affine is installed with `setTransform`, replacing the
 * context CTM deterministically. The host just draws under that CTM.
 */
export const mount: VanillaMount = (host, args) => {
  const root = column(host);

  const canvas = document.createElement("canvas");
  canvas.width = 420;
  canvas.height = 180;
  root.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (ctx === null) {
    return () => {
      root.remove();
    };
  }

  void projectToCanvas2D; // referenced in docs: the adapter applies this step per frame

  const perspective = num(args, "perspective", 400);
  const animation = Animation.from({
    from: { position: [-120, 0, -40], rotation: [0, 0, 0] },
    to: { position: [120, 0, 80], rotation: [0, 0, Math.PI / 5] },
    duration: num(args, "duration", 1800),
    easing: "linear",
  });

  const playback = animation.attach(
    target.canvas(ctx, perspective > 0 ? { perspective } : undefined),
  );

  // The adapter owns the CTM; this loop just draws with it every frame.
  const code = codeLine(root);
  let raf = 0;
  const draw = (): void => {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Draw under the CTM the adapter installed via setTransform.
    const m = ctx.getTransform();
    code.textContent = `CTM: e=${m.e.toFixed(1)} f=${m.f.toFixed(1)}`;
    ctx.fillStyle = "#84cc16";
    ctx.fillRect(-30, -30, 60, 60);

    raf = requestAnimationFrame(draw);
  };
  raf = requestAnimationFrame(draw);

  mountTransport(root, playback);
  playback.play();

  return () => {
    cancelAnimationFrame(raf);
    playback.dispose();
    root.remove();
  };
};
