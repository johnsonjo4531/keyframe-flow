import { Animation, Timeline, target } from "keyframe-flow";
import { column, mountTransport, num, stage, type VanillaMount } from "./harness.ts";

/** Absolutely positioned element inside the stage. */
function box(parent: HTMLElement, style: string): HTMLElement {
  const el = document.createElement("div");
  el.style.cssText = `position:absolute;${style}`;
  parent.appendChild(el);
  return el;
}

/**
 * Timeline parallel (§14.1) — vanilla twin of `Timeline/Parallel`: children
 * start together with independent durations. The ring repeats forever, so the
 * composition's duration is infinite and the run never finishes by itself
 * (§14.3), while the card and badge are finite children that settle inside the
 * endless scene.
 */
export const mount: VanillaMount = (host, args) => {
  const root = column(host);
  const stageEl = stage(root, 340, 210);
  const ring = box(
    stageEl,
    "left:calc(50% - 70px);top:calc(50% - 70px);width:140px;height:140px;border-radius:50%;border:3px dashed #6b7280",
  );
  const card = box(
    stageEl,
    "left:calc(50% - 90px);top:calc(50% - 40px);width:180px;padding:10px 14px;border-radius:10px;background:linear-gradient(135deg,#0f172a,#1e293b);border:1px solid #334155;color:#e6e8ee;font-size:13px",
  );
  card.textContent = "Finite entrance inside an endless scene";
  const badge = box(
    stageEl,
    "left:calc(50% + 46px);top:calc(50% - 58px);padding:3px 10px;border-radius:999px;background:#f59e0b;color:#111;font-size:12px;font-weight:700",
  );
  badge.textContent = "∞";
  const spinDuration = num(args, "spinDuration", 2400);

  const timeline = Timeline.parallel([
    {
      animation: Timeline.repeat(
        Animation.from({ to: { rotation: [0, 0, Math.PI * 2] }, duration: spinDuration }),
        {
          iterations: "infinite",
        },
      ),
      target: target.html(ring),
    },
    {
      animation: Animation.from({
        from: { position: [-180, 0, 0], scale: 0.7 },
        to: { position: [0, 0, 0] },
        duration: 600,
        easing: "ease-out",
      }),
      target: target.html(card),
    },
    {
      animation: Animation.from({
        from: { position: [0, 90, 0], scale: 0 },
        to: { position: [0, 0, 0] },
        duration: 400,
        easing: "ease-out",
      }),
      target: target.html(badge),
    },
  ]);

  const playback = timeline.attach({ autoplay: true });
  mountTransport(root, playback);

  return () => {
    playback.dispose();
    root.remove();
  };
};
