import { Animation, Timeline, target } from "keyframe-flow";
import { column, mountTransport, num, stage, type VanillaMount } from "./harness.ts";

/** Absolutely positioned row inside the stage — one choreographed element. */
function row(parent: HTMLElement, top: number, gradient: string, label: string): HTMLElement {
  const el = document.createElement("div");
  el.textContent = label;
  el.style.cssText = `position:absolute;left:20px;top:${top}px;padding:6px 14px;border-radius:8px;color:#e6e8ee;font:600 13px ui-sans-serif,system-ui,sans-serif;background:${gradient}`;
  parent.appendChild(el);
  return el;
}

/**
 * Timeline sequence (§14.1) — vanilla twin of `Timeline/Sequence`: three rows
 * enter back to back, each starting after the previous child's intrinsic
 * duration plus `gap`. Placement never re-times children.
 */
export const mount: VanillaMount = (host, args) => {
  const root = column(host);
  const stageEl = stage(root, 380, 190);
  const logo = row(stageEl, 32, "linear-gradient(135deg, #f59e0b, #ef4444)", "LOGO");
  const heading = row(
    stageEl,
    80,
    "linear-gradient(135deg, #14b8a6, #3b82f6)",
    "Heading enters second",
  );
  const subtitle = row(stageEl, 128, "linear-gradient(135deg, #8b5cf6, #ec4899)", "…subtitle last");
  const gap = num(args, "gap", 120);

  const timeline = Timeline.sequence(
    [
      {
        animation: Animation.from({
          from: { position: [-240, 0, 0] },
          to: { position: [0, 0, 0] },
          duration: 350,
          easing: "ease-out",
        }),
        target: target.html(logo),
      },
      {
        animation: Animation.from({
          from: { position: [-240, 0, 0], scale: 0.9 },
          to: { position: [0, 0, 0] },
          duration: 450,
          easing: "ease-out",
        }),
        target: target.html(heading),
      },
      {
        animation: Animation.from({
          from: { position: [-240, 0, 0], scale: 0.8 },
          to: { position: [0, 0, 0] },
          duration: 300,
          easing: "ease-in-out",
        }),
        target: target.html(subtitle),
      },
    ],
    { gap },
  );

  const playback = timeline.attach({ autoplay: true });
  mountTransport(root, playback);

  return () => {
    playback.dispose();
    root.remove();
  };
};
