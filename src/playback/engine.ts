import type { Clock } from "../timing/clock.ts";
import { systemClock } from "../timing/clock.ts";
import type { Scheduler } from "../timing/scheduler.ts";
import { createFrameScheduler } from "../timing/scheduler.ts";

/**
 * The minimal contract the engine needs from a playback instance. Playback
 * instances implement it; keeping it structural avoids a runtime import cycle
 * between the engine and playback modules.
 */
export interface EngineTickable {
  /** Called by the engine with the current clock timestamp in ms (§16). */
  onEngineUpdate(timeMs: number): void;
}

/** Injectable time sources for a `PlaybackEngine` (§16). */
export interface PlaybackEngineOptions {
  /** Time source. Defaults to `systemClock`. */
  readonly clock?: Clock;
  /** Frame callback source. Defaults to `createFrameScheduler()`. */
  readonly scheduler?: Scheduler;
}

/**
 * The centralized playback scheduler (§16). One engine drives all active
 * playback instances: it reads the current time from its injectable
 * `Clock`, steps every registered playback, and requests the next frame
 * from its injectable `Scheduler` only while at least one playback is
 * active — so there are no unnecessary updates when nothing is playing (§16).
 * Animation time is timestamp-based, never frame-count-based: each update
 * advances playbacks by the elapsed clock time scaled by their playback rate.
 * Custom clocks and schedulers integrate without modifying the core (§21).
 * ```ts
 * const engine = new PlaybackEngine({ clock: myClock, scheduler: myScheduler });
 * const playback = animation.attach(target, { engine });
 * playback.play(); // driven by `engine` instead of the shared default
 * ```
 */
export class PlaybackEngine {
  /** The time source this engine reads timestamps from. */
  readonly clock: Clock;

  private readonly _scheduler: Scheduler;
  private readonly _active = new Set<EngineTickable>();
  private _frameHandle: unknown = null;

  constructor(options: PlaybackEngineOptions = {}) {
    this.clock = options.clock ?? systemClock;
    this._scheduler = options.scheduler ?? createFrameScheduler();
  }

  /** The number of playback instances currently being driven. */
  get activeCount(): number {
    return this._active.size;
  }

  /** Registers a running playback for updates, starting frames if needed. */
  add(playback: EngineTickable): void {
    const wasIdle = this._active.size === 0;
    this._active.add(playback);
    if (wasIdle && this._frameHandle === null) {
      this._requestFrame();
    }
  }

  /** Removes a playback from the update set. */
  remove(playback: EngineTickable): void {
    this._active.delete(playback);
  }

  /**
   * Stops scheduling entirely (pending frame cancelled, active set cleared).
   * Used by hosts that want to shut an engine down; playbacks can re-register
   * afterwards.
   */
  stop(): void {
    if (this._frameHandle !== null) {
      this._scheduler.cancel(this._frameHandle);
      this._frameHandle = null;
    }
    this._active.clear();
  }

  private _requestFrame(): void {
    this._frameHandle = this._scheduler.request(() => {
      this._frameHandle = null;
      // Read the timestamp from the Clock, never trust the scheduler callback
      // argument (Appendix B.7): frame timestamps can lag a realm's clock — a
      // nested iframe's rAF timestamp can stall relative to its own
      // `performance.now()` — and anchoring on `clock.now()` while stepping by
      // the callback argument would then freeze playbacks against the
      // non-forward guard, or finish them instantly (§16).
      this._updateAll(this.clock.now());
    });
  }

  private _updateAll(timeMs: number): void {
    // Iterate a snapshot: playbacks may finish, cancel, or be superseded —
    // removing themselves — while the frame is being dispatched.
    const batch = [...this._active];
    for (const playback of batch) {
      if (!this._active.has(playback)) continue;
      playback.onEngineUpdate(timeMs);
    }
    // Only keep requesting frames while something remains active (§16).
    if (this._active.size > 0 && this._frameHandle === null) {
      this._requestFrame();
    }
  }
}

let defaultEngine: PlaybackEngine | undefined;

/**
 * The lazily created shared `PlaybackEngine` used by playbacks that do
 * not inject their own. It combines `systemClock` with the default frame
 * scheduler (`requestAnimationFrame` in browsers, timer-based elsewhere).
 * Resolution is deferred to first use so importing the library never touches
 * browser APIs (§2 principle 1).
 */
export function getDefaultEngine(): PlaybackEngine {
  if (defaultEngine === undefined) {
    defaultEngine = new PlaybackEngine();
  }
  return defaultEngine;
}
