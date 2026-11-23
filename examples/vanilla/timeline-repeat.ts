import { Animation, Timeline, target } from "keyframe-flow";
import type { TimelinePlayback } from "keyframe-flow";
import { column, mountTransport, num, stage, str, type VanillaMount } from "./harness.ts";

/** Absolutely positioned square inside the stage. */
function box(parent: HTMLElement, style: string): HTMLElement {
  const el = document.createElement("div");
  el.style.cssText = `position:absolute;${style}`;
  parent.appendChild(el);
  return el;
}

/**
 * Timeline repetition (§13.1, §14.2) — vanilla twin of `Timeline/Repeat`:
 * `iterations` counts total iterations including the first, `direction:
 * "alternate"` ping-pongs progress without snapping to the start, and `delay`
 * spaces iterations (never before the first). Repeating a whole sequence is a
 * single compact entry — never expanded into copies.
 */
export const mount: VanillaMount = (host, args) => {
  const root = column(host);
  const stageEl = stage(root, 380, 150);
  const layout = str(args, "layout", "pulse");
  const iterations = num(args, "iterations", 6);
  const delay = num(args, "delay", 300);

  let playback: TimelinePlayback;
  if (layout === "choreography") {
    const a = box(
      stageEl,
      "left:calc(50% - 24px);top:calc(50% - 38px);width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg,#14b8a6,#3b82f6)",
    );
    const b = box(
      stageEl,
      "left:calc(50% - 24px);top:calc(50% + 2px);width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg,#8b5cf6,#ec4899)",
    );
    const choreography = Timeline.sequence([
      {
        animation: Animation.from({
          from: { position: [-150, 0, 0] },
          to: { position: [0, 0, 0] },
          duration: 260,
        }),
        target: target.html(a),
      },
      {
        animation: Animation.from({
          from: { position: [0, 0, 0] },
          to: { position: [150, 0, 0] },
          duration: 260,
        }),
        target: target.html(b),
      },
    ]);
    playback = Timeline.repeat(choreography, { iterations, delay }).attach({ autoplay: true });
  } else {
    const dot = box(
      stageEl,
      "left:calc(50% - 20px);top:calc(50% - 20px);width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#ef4444)",
    );
    playback = Timeline.repeat(
      {
        animation: Animation.from({ from: { scale: 1 }, to: { scale: 2.2 }, duration: 500 }),
        target: target.html(dot),
      },
      { iterations, direction: "alternate" },
    ).attach({ autoplay: true });
  }

  mountTransport(root, playback);

  return () => {
    playback.dispose();
    root.remove();
  };
};
