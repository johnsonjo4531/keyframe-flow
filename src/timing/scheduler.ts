import { systemClock } from "./clock.ts";

/**
 * A frame callback source (§16). One `request` schedules exactly one callback
 * invocation — the same contract as `requestAnimationFrame` — and `cancel`
 * aborts a request that has not fired yet. The clock and scheduler are kept
 * separate on purpose: scheduling is not timekeeping (Appendix B.7), so the
 * engine reads timestamps from a `Clock` rather than trusting callback
 * arguments.
 */
export interface Scheduler {
  /** Schedules `callback` for the next frame; returns a cancelable handle. */
  request(callback: (time: number) => void): unknown;
  /** Cancels a previously requested callback that has not fired yet. */
  cancel(handle: unknown): void;
}

/** The nominal browser refresh interval used by the timer fallback (§16). */
const FALLBACK_FRAME_MS = 16;

/** A `requestAnimationFrame`-like function resolved from the environment. */
type RequestFrame = (callback: (time: number) => void) => unknown;
type CancelFrame = (handle: unknown) => void;

interface FrameHost {
  request: RequestFrame;
  cancel: CancelFrame;
}

/**
 * Resolves a frame host from the environment. Browsers get
 * `requestAnimationFrame`/`cancelAnimationFrame` — the default browser
 * implementation required by §16. Environments without rAF (Node.js, workers)
 * fall back to timer-based scheduling so playback still runs.
 */
function resolveFrameHost(): FrameHost {
  const host = globalThis as unknown as {
    requestAnimationFrame?: RequestFrame;
    cancelAnimationFrame?: CancelFrame;
  };

  if (typeof host.requestAnimationFrame === "function") {
    const request = host.requestAnimationFrame;
    const cancel =
      typeof host.cancelAnimationFrame === "function" ? host.cancelAnimationFrame : () => {};
    return { request, cancel };
  }

  // Timer fallback for non-browser environments (§16: Node.js, tests).
  return {
    request(callback) {
      return setTimeout(() => callback(systemClock.now()), FALLBACK_FRAME_MS);
    },
    cancel(handle) {
      clearTimeout(handle as ReturnType<typeof setTimeout>);
    },
  };
}

/**
 * Creates the default frame scheduler (§16): `requestAnimationFrame` in
 * browsers, timer-based scheduling elsewhere. Resolution happens at call
 * time — not import time — so the core never touches browser APIs merely by
 * being loaded (§2 principle 1).
 */
export function createFrameScheduler(): Scheduler {
  const host = resolveFrameHost();
  return {
    request(callback) {
      return host.request(callback);
    },
    cancel(handle) {
      host.cancel(handle);
    },
  };
}

/**
 * A scheduler that only fires frames when a test or host calls
 * `ManualScheduler.tick` (§16). Pair it with `ManualClock` for fully
 * deterministic playback tests.
 * ```ts
 * const clock = new ManualClock(0);
 * const scheduler = new ManualScheduler();
 * const engine = new PlaybackEngine({ clock, scheduler });
 * // ...start a playback...
 * clock.advance(16);
 * scheduler.tick(clock.now()); // drives exactly one engine update
 * ```
 */
export class ManualScheduler implements Scheduler {
  private readonly _pending = new Map<number, (time: number) => void>();
  private _nextHandle = 1;

  request(callback: (time: number) => void): unknown {
    const handle = this._nextHandle++;
    this._pending.set(handle, callback);
    return handle;
  }

  cancel(handle: unknown): void {
    if (typeof handle === "number") {
      this._pending.delete(handle);
    }
  }

  /** `true` while at least one requested frame is waiting to fire. */
  get hasPending(): boolean {
    return this._pending.size > 0;
  }

  /** The number of requested frames waiting to fire. */
  get pendingCount(): number {
    return this._pending.size;
  }

  /**
   * Fires every pending callback once, in request order, with `time` (the
   * scheduler's own view of the frame timestamp). Requests are one-shot like
   * `requestAnimationFrame`: each must re-request for the next tick.
   */
  tick(time: number): void {
    if (!Number.isFinite(time)) {
      throw new TypeError("ManualScheduler.tick requires a finite timestamp in milliseconds.");
    }
    const batch = [...this._pending.entries()];
    this._pending.clear();
    for (const [, callback] of batch) {
      callback(time);
    }
  }
}
