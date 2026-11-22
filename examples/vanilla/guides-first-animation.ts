import { Animation, target, transform } from "keyframe-flow";
import {
  centeredBox,
  codeLine,
  column,
  mountTransport,
  stage,
  type VanillaMount,
} from "./harness.ts";

/**
 * Your first animation — vanilla twin of `Guides/Getting Started → First
 * Animation`, running the Getting Started guide's `slide` snippet verbatim:
 * a definition (what moves), a playback created by `slide.attach(...)` (when
 * and how it plays), and an HTML render target (where it appears).
 */
export const mount: VanillaMount = (host) => {
  const root = column(host);
  const stageEl = stage(root, 320, 180);
  const box = centeredBox(stageEl, 72, "linear-gradient(135deg, #f97316, #db2777)");

  // 1. A definition — immutable, reusable, no execution state.
  const slide = Animation.from({
    from: transform(), // identity: position (0,0,0), no rotation, scale 1
    to: transform().translate(100, 50), // move +100 x, +50 y
    duration: 800, // milliseconds
    easing: "ease-out-cubic",
  });

  // 2. A playback — an independent instance with its own time and lifecycle.
  const playback = slide.attach(target.html(box));

  mountTransport(root, playback);

  // 3. Drive it. finished resolves { status: "finished" } — never rejects.
  void playback.finished.then((result) => {
    const line = codeLine(root);
    line.textContent = `await playback.finished → ${JSON.stringify(result)}`;
  });
  playback.play();

  return () => {
    playback.dispose();
    root.remove();
  };
};
