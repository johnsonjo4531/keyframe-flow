/**
 * A monotonic-ish time source returning milliseconds (§16). Clocks provide
 * time; schedulers coordinate updates — scheduling is not timekeeping
 * (Appendix B.7). The clock and scheduler are separate injectable interfaces
 * so the playback engine can drive animations in any environment.
 */
export interface Clock {
  /** Current time in milliseconds, from an arbitrary but stable origin. */
  now(): number;
}

/**
 * The default clock: `performance.now()` when available, otherwise
 * `Date.now()`. Works unchanged in browsers and Node.js with no browser-API
 * dependency at import time (§2 principle 1).
 */
export const systemClock: Clock = {
  now(): number {
    const performanceLike = (globalThis as { performance?: { now?: () => number } }).performance;
    if (performanceLike !== undefined && typeof performanceLike.now === "function") {
      return performanceLike.now();
    }
    return Date.now();
  },
};

/**
 * A clock whose time only moves when a test or host says so (§16). Ideal for
 * deterministic playback tests: animation time is timestamp-based, never
 * frame-count-based (§16), and this makes every timestamp explicit.
 *
 * ```ts
 * const clock = new ManualClock(0);
 * clock.advance(16); // clock.now() === 16
 * clock.set(5000);   // clock.now() === 5000
 * ```
 */
export class ManualClock implements Clock {
  private _time: number;

  /** Starts at `start` milliseconds (default `0`). */
  constructor(start = 0) {
    if (!Number.isFinite(start)) {
      throw new TypeError("ManualClock start time must be a finite number of milliseconds.");
    }
    this._time = start;
  }

  now(): number {
    return this._time;
  }

  /** Jumps the clock to an absolute timestamp in milliseconds. */
  set(timeMs: number): void {
    if (!Number.isFinite(timeMs)) {
      throw new TypeError("ManualClock timestamps must be finite numbers of milliseconds.");
    }
    this._time = timeMs;
  }

  /** Moves the clock forward (or back) by `deltaMs` milliseconds. */
  advance(deltaMs: number): void {
    if (!Number.isFinite(deltaMs)) {
      throw new TypeError("ManualClock advances must be finite numbers of milliseconds.");
    }
    this._time += deltaMs;
  }
}
