import type { Playback } from "keyframe-flow";

/**
 * Shared plumbing for the vanilla-TypeScript example twins (T54). These
 * modules import nothing React-related — they use only `keyframe-flow` and
 * DOM APIs, which is exactly what makes them readable as framework-free
 * documentation examples.
 */

/** Removes everything a mount created; called when the story unmounts. */
export type Cleanup = () => void;

/** A vanilla example: build itself into `host`, return a cleanup function. */
export type VanillaMount = (host: HTMLElement, args: Readonly<Record<string, unknown>>) => Cleanup;

const BUTTON_STYLE = "padding:4px 10px;cursor:pointer";

/** Storybook passes typed story args through as an untyped record. */
export function num(
  args: Readonly<Record<string, unknown>>,
  key: string,
  fallback: number,
): number {
  const value = args[key];
  return typeof value === "number" ? value : fallback;
}

export function str(
  args: Readonly<Record<string, unknown>>,
  key: string,
  fallback: string,
): string {
  const value = args[key];
  return typeof value === "string" ? value : fallback;
}

export function bool(
  args: Readonly<Record<string, unknown>>,
  key: string,
  fallback: boolean,
): boolean {
  const value = args[key];
  return typeof value === "boolean" ? value : fallback;
}

/** Centered grid column container matching the React stories' layout. */
export function column(host: HTMLElement): HTMLElement {
  const root = document.createElement("div");
  root.style.display = "grid";
  root.style.justifyItems = "center";
  host.appendChild(root);
  return root;
}

/** Positioning stage (relative box) with an absolutely-centered child. */
export function stage(
  parent: HTMLElement,
  width: number,
  height: number,
  extraStyle?: string,
): HTMLElement {
  const box = document.createElement("div");
  box.style.width = `${width}px`;
  box.style.height = `${height}px`;
  box.style.position = "relative";
  if (extraStyle !== undefined) box.style.cssText += extraStyle;
  parent.appendChild(box);
  return box;
}

/** Gradient square centered in a stage — the shared demo subject. */
export function centeredBox(parent: HTMLElement, size: number, gradient: string): HTMLElement {
  const box = document.createElement("div");
  box.style.position = "absolute";
  box.style.left = "50%";
  box.style.top = "50%";
  box.style.width = `${size}px`;
  box.style.height = `${size}px`;
  box.style.marginLeft = `${-size / 2}px`;
  box.style.marginTop = `${-size / 2}px`;
  box.style.borderRadius = size >= 64 ? "12px" : "8px";
  box.style.background = gradient;
  parent.appendChild(box);
  return box;
}

/** Monospace readout line, like the React stories' `<code>` rows. */
export function codeLine(parent: HTMLElement): HTMLElement {
  const code = document.createElement("code");
  code.style.fontSize = "11px";
  code.style.color = "#9ca3af";
  parent.appendChild(code);
  return code;
}

/**
 * Transport buttons + live state readout driven by a `Playback` — the vanilla
 * twin of the React `Transport`/`Readout` pair, with identical semantics:
 * frame-mirrored state that re-kicks after every control action so discrete
 * actions (play after finish, reset, seek) never leave a stale readout.
 */
export function mountTransport(parent: HTMLElement, playback: Playback): Cleanup {
  const buttons = document.createElement("div");
  buttons.style.display = "flex";
  buttons.style.gap = "8px";
  buttons.style.marginTop = "8px";
  parent.appendChild(buttons);

  const add = (label: string, action: () => void): void => {
    const button = document.createElement("button");
    button.type = "button";
    button.style.cssText = BUTTON_STYLE;
    button.textContent = label;
    button.addEventListener("click", action);
    buttons.appendChild(button);
  };

  const readout = document.createElement("div");
  readout.style.fontFamily = "ui-monospace, monospace";
  readout.style.fontSize = "12px";
  readout.style.marginTop = "12px";
  readout.style.display = "flex";
  readout.style.gap = "16px";
  readout.style.flexWrap = "wrap";
  parent.appendChild(readout);

  const stateSpan = document.createElement("span");
  const timeSpan = document.createElement("span");
  const iterationSpan = document.createElement("span");
  const resultSpan = document.createElement("span");
  readout.append(stateSpan, timeSpan, iterationSpan, resultSpan);

  let resultText: string | undefined;
  void playback.finished.then((result) => {
    resultText = result.status;
    kick();
  });

  let raf = 0;
  const sync = (): void => {
    stateSpan.innerHTML = `state: <b>${playback.state}</b>`;
    timeSpan.textContent = `t = ${playback.currentTime.toFixed(0)} ms`;
    iterationSpan.textContent = `iteration #${playback.iterationCount + 1}`;
    resultSpan.textContent = resultText === undefined ? "" : `finished: ${resultText}`;
    if (playback.state === "running") raf = requestAnimationFrame(sync);
  };
  const kick = (): void => {
    cancelAnimationFrame(raf);
    sync();
  };

  add("play", () => {
    playback.play();
    kick();
  });
  add("pause", () => {
    playback.pause();
    kick();
  });
  add("reset", () => {
    // Forward-facing rewind: §12 restarts in the current direction, so undo
    // any reverse() flip before seeking to zero — same semantics as the hook.
    if (playback.reversed) playback.reverse();
    resultText = undefined;
    playback.seek(0);
    kick();
  });
  add("reverse", () => {
    playback.reverse();
    kick();
  });
  add("cancel", () => {
    playback.cancel();
    kick();
  });

  kick();

  return () => {
    cancelAnimationFrame(raf);
  };
}
