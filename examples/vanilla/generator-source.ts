import { Animation, target, transform } from "keyframe-flow";
import type { TransformKeyframe } from "keyframe-flow";
import { centeredBox, column, mountTransport, num, stage, type VanillaMount } from "./harness.ts";

/** Generator keyframes (§5.4): any synchronous iterable works (§5.3). */
function* orbitKeyframes(samples: number): Generator<TransformKeyframe> {
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const angle = t * Math.PI * 2;
    yield {
      at: t,
      // The guide's orbitKeyframes step: a circle of radius 80.
      transform: transform().translate(Math.cos(angle) * 80, Math.sin(angle) * 80),
    };
  }
}

/**
 * Generator sources (§5.4–§5.5) — vanilla twin of `Authoring/Generator Source`:
 * `Animation.from` consumes the iterable eagerly and exactly once at
 * definition time; playback reads a frozen shared timeline afterwards.
 */
export const mount: VanillaMount = (host, args) => {
  const root = column(host);
  const stageEl = stage(root, 320, 200);
  const box = centeredBox(stageEl, 48, "linear-gradient(135deg, #eab308, #ef4444)");

  const animation = Animation.from({
    duration: num(args, "duration", 4000), // the guide's orbit duration
    keyframes: orbitKeyframes(num(args, "samples", 24)),
  });

  const playback = animation.attach(target.html(box));
  mountTransport(root, playback);
  playback.play();

  return () => {
    playback.dispose();
    root.remove();
  };
};
