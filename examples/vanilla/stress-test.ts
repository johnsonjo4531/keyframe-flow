import { Animation, target } from "keyframe-flow";
import type { Playback, PlaybackResult, PlaybackState } from "keyframe-flow";
import {
  column,
  mountTransport,
  num,
  stage,
  type TransportablePlayback,
  type VanillaMount,
} from "./harness.ts";

const COLUMNS = 20;
const CELL = 28;
const DOT = 16;
const BUTTON_STYLE = "padding:4px 10px;cursor:pointer";

/** Aggregate view across every playback: running if any runs, else paused. */
function aggregateState(playbacks: readonly Playback[]): PlaybackState {
  let sawPaused = false;
  for (const playback of playbacks) {
    if (playback.state === "running") return "running";
    if (playback.state === "paused") sawPaused = true;
  }
  const first = playbacks[0];
  return sawPaused ? "paused" : first !== undefined ? first.state : "idle";
}

/**
 * Performance stress test (§16) — vanilla twin of `Performance/Stress Test`:
 * one shared `Animation` definition drives hundreds of independent playbacks,
 * all scheduled by the library's single centralized frame loop. The buttons
 * add animated elements live — each `attach` creates an independent playback
 * on the running engine without disturbing existing ones (§11) — and the FPS
 * readout shows where scaling starts to cost. Transport controls fan out to
 * every playback through one structurally-typed handle; pausing all of them
 * drops the scheduler's frame requests entirely, so idle overhead is zero (§16).
 */
export const mount: VanillaMount = (host, args) => {
  const root = column(host);
  const duration = num(args, "duration", 900);
  const stageEl = stage(
    root,
    COLUMNS * CELL,
    180,
    ";outline:1px dashed #6b728055;border-radius:8px",
  );

  const pulse = Animation.from({
    from: { position: [0, 14, 0], scale: 0.5 },
    to: { position: [0, -20, 0], scale: 1.2 },
    duration,
    easing: "ease-in-out",
  });

  const playbacks: Playback[] = [];

  const add = (count: number): void => {
    for (let k = 0; k < count; k++) {
      const i = playbacks.length;
      const dot = document.createElement("div");
      dot.style.cssText = `position:absolute;left:${(i % COLUMNS) * CELL + (CELL - DOT) / 2}px;top:${Math.floor(i / COLUMNS) * CELL}px;width:${DOT}px;height:${DOT}px;border-radius:9999px;background:hsl(${(i * 47) % 360} 85% 55%)`;
      stageEl.appendChild(dot);

      const playback = pulse.attach(target.html(dot), {
        iterations: "infinite",
        direction: "alternate",
      });
      // Deterministic phase offsets from the shared timeline (§12) — the wave
      // pattern needs no per-element timers or delays.
      playback.seek((i * 97) % duration);
      playback.play();
      playbacks.push(playback);
    }
    stageEl.style.height = `${Math.max(180, Math.ceil(playbacks.length / COLUMNS) * CELL + 24)}px`;
    renderStats(); // counts update immediately; rAF can stall while occluded (§16)
  };

  const clear = (): void => {
    // Disposing every playback unregisters it from the shared scheduler — no
    // leaked scheduled units when elements leave the field (§12).
    for (const playback of playbacks) playback.dispose();
    playbacks.length = 0;
    stageEl.replaceChildren();
    stageEl.style.height = "180px";
    renderStats();
  };

  // Group view: any object with the transport contract's shape can drive the
  // shared chrome, so these fan out to every playback at once (§12).
  const firstPlayback = (): Playback | undefined => playbacks[0];
  const group: TransportablePlayback = {
    get state(): PlaybackState {
      return aggregateState(playbacks);
    },
    get currentTime(): number {
      return firstPlayback()?.currentTime ?? 0;
    },
    get iterationCount(): number {
      return firstPlayback()?.iterationCount ?? 0;
    },
    get reversed(): boolean {
      return firstPlayback()?.reversed ?? false;
    },
    get finished(): Promise<PlaybackResult> {
      // Representative: the first playback's run. Infinite playbacks keep it pending (§13).
      const playback = firstPlayback();
      return playback !== undefined ? playback.finished : new Promise<PlaybackResult>(() => {});
    },
    play(): void {
      for (const playback of playbacks) playback.play();
      renderStats();
    },
    pause(): void {
      for (const playback of playbacks) playback.pause();
      renderStats();
    },
    reverse(): void {
      for (const playback of playbacks) playback.reverse();
      renderStats();
    },
    seek(timeMs: number): void {
      for (const playback of playbacks) playback.seek(timeMs);
      renderStats();
    },
    cancel(): void {
      for (const playback of playbacks) playback.cancel();
      renderStats();
    },
  };

  const addButton = (parent: HTMLElement, label: string, action: () => void): void => {
    const button = document.createElement("button");
    button.type = "button";
    button.style.cssText = BUTTON_STYLE;
    button.textContent = label;
    button.addEventListener("click", action);
    parent.appendChild(button);
  };

  const controls = document.createElement("div");
  controls.style.display = "flex";
  controls.style.gap = "8px";
  controls.style.marginTop = "8px";
  controls.style.alignItems = "center";
  root.appendChild(controls);
  addButton(controls, "+10", () => add(10));
  addButton(controls, "+100", () => add(100));
  const customInput = document.createElement("input");
  customInput.type = "number";
  customInput.min = "1";
  customInput.max = "5000";
  customInput.value = "500";
  customInput.style.width = "72px";
  customInput.setAttribute("aria-label", "Number of elements to add");
  controls.appendChild(customInput);
  addButton(controls, "add", () => add(Math.max(1, Math.floor(Number(customInput.value)))));
  addButton(controls, "clear all", clear);

  // Performance readout: measured by a separate rAF subscriber — the engine's
  // scheduler is its own (§16), so this loop only samples actual frame delivery.
  const readout = codeRow(root);
  let lastFps = 0;
  let lastFrameMs = 0;
  const renderStats = (): void => {
    let running = 0;
    for (const playback of playbacks) if (playback.state === "running") running += 1;
    readout.textContent = [
      `elements: ${playbacks.length}`,
      `running: ${running}`,
      `state: ${aggregateState(playbacks)}`,
      `fps: ${lastFps.toFixed(1)}`,
      `frame: ${lastFrameMs.toFixed(2)} ms`,
    ].join(" · ");
  };

  let raf = 0;
  let frames = 0;
  let elapsed = 0;
  let sumDelta = 0;
  let last = performance.now();
  const tick = (now: number): void => {
    const delta = now - last;
    last = now;
    frames += 1;
    elapsed += delta;
    sumDelta += delta;
    if (elapsed >= 500) {
      lastFps = (frames * 1000) / elapsed;
      lastFrameMs = sumDelta / frames;
      renderStats();
      frames = 0;
      elapsed = 0;
      sumDelta = 0;
    }
    raf = requestAnimationFrame(tick);
  };

  add(num(args, "count", 150));
  mountTransport(root, group);
  raf = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(raf);
    clear(); // dispose every playback — nothing keeps running after unmount
    root.remove();
  };
};

/** Monospace stats row, styled like the harness readout. */
function codeRow(parent: HTMLElement): HTMLElement {
  const line = document.createElement("div");
  line.style.fontFamily = "ui-monospace, monospace";
  line.style.fontSize = "12px";
  line.style.marginTop = "12px";
  parent.appendChild(line);
  return line;
}
