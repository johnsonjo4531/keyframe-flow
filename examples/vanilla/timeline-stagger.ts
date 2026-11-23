import { Animation, Timeline, target } from "keyframe-flow";
import { column, mountTransport, num, stage, str, type VanillaMount } from "./harness.ts";

const CARDS = 5;

/**
 * Timeline stagger (§14.1) — vanilla twin of `Timeline/Stagger`:
 * `Timeline.stagger` expands to ordinary scheduled entries at `i × delay`, one
 * per render target; `order: "reverse"` flips which index starts first without
 * touching the child definition.
 */
export const mount: VanillaMount = (host, args) => {
  const root = column(host);
  const stageEl = stage(root, 360, 170);
  const cards: HTMLElement[] = [];
  for (let i = 0; i < CARDS; i++) {
    const card = document.createElement("div");
    card.style.cssText = `position:absolute;left:${24 + i * 60}px;top:calc(50% - 34px);width:48px;height:68px;border-radius:8px;box-shadow:0 6px 18px #0006;background:linear-gradient(160deg,hsl(${215 + i * 28} 70% 45%),hsl(${215 + i * 28} 70% 28%))`;
    stageEl.appendChild(card);
    cards.push(card);
  }
  const delay = num(args, "delay", 100);
  const order = str(args, "order", "forward") === "reverse" ? "reverse" : "forward";

  const timeline = Timeline.stagger(
    Animation.from({
      from: { position: [-260, 0, 0], rotation: [0, 0, -Math.PI / 8] },
      to: { position: [0, 0, 0] },
      duration: 450,
      easing: "ease-out",
    }),
    cards.map((card) => target.html(card)),
    { delay, order },
  );

  const playback = timeline.attach({ autoplay: true });
  mountTransport(root, playback);

  return () => {
    playback.dispose();
    root.remove();
  };
};
