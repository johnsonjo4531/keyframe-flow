import type { Animation } from "../animation/animation.ts";
import type { RenderTarget } from "../targets/types.ts";
import { getDefaultEngine, type PlaybackEngine } from "./engine.ts";

/** The lifecycle states of a playback instance (§12). */
export type PlaybackState = "idle" | "running" | "paused" | "finished" | "cancelled" | "disposed";

/**
 * The outcome a run's `Playback.finished` promise resolves with.
 * Ordinary cancellation resolves rather than rejects (§11.1).
 */
/** The run reached its natural end (§12). */
export interface PlaybackFinishedResult {
  /** Completion status discriminator. */
  readonly status: "finished";
}

/** The run was cancelled (superseded, `cancel()`, or disposal) before finishing (§12). */
export interface PlaybackCancelledResult {
  /** Cancellation status discriminator. */
  readonly status: "cancelled";
}

/** Outcome delivered by the `finished` promise of a playback run (§12). */
export type PlaybackResult = PlaybackFinishedResult | PlaybackCancelledResult;

/**
 * How playback direction behaves between iterations (§13). `alternate` and
 * `alternate-reverse` flip direction every iteration; `normal` and `reverse`
 * keep one direction for the whole run.
 */
export type PlaybackDirectionMode = "normal" | "reverse" | "alternate" | "alternate-reverse";

/** Construction options for `Animation.attach` / `Playback`. */
export interface PlaybackOptions {
  /**
   * Total iterations including the initial one (§13): `1` (default) plays
   * once, a finite integer ≥ 1 repeats, `"infinite"` never naturally
   * completes.
   */
  readonly iterations?: number | "infinite";
  /** Direction behavior across iterations (§13). Defaults to `"normal"`. */
  readonly direction?: PlaybackDirectionMode;
  /** Initial playback rate (§11.1). Any finite number; defaults to `1`. */
  readonly playbackRate?: number;
  /** When `true`, start playing immediately on attach. Defaults to `false`. */
  readonly autoplay?: boolean;
  /** Engine driving this playback. Defaults to the shared default engine. */
  readonly engine?: PlaybackEngine;
}

/** Target ownership registry enforcing §14 replacement semantics. */
const targetOwners = new WeakMap<RenderTarget, Playback>();

const DIRECTION_MODES: readonly PlaybackDirectionMode[] = [
  "normal",
  "reverse",
  "alternate",
  "alternate-reverse",
];

interface Deferred {
  readonly promise: Promise<PlaybackResult>;
  resolve(result: PlaybackResult): void;
}

function createDeferred(): Deferred {
  let resolve!: (result: PlaybackResult) => void;
  const promise = new Promise<PlaybackResult>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

/** Clamp helper shared by seeking and progress computation. */
function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/**
 * An independent playback instance created by `Animation.attach` (§11).
 * Definitions describe motion; playback instances execute it (Appendix B.1):
 * every instance owns its execution state — time, direction, iteration,
 * lifecycle — while sharing the definition's immutable normalized timeline.
 * Playback without a target is fully supported for pure time control (§11).
 *
 * @remarks
 * Time semantics: {@link Playback.currentTime} is elapsed animation time in
 * milliseconds within the current iteration, always in `[0, duration]`. Time
 * progression is timestamp-based via the engine's clock, never frame-count-
 * based (§16), and playback-rate changes never introduce discontinuities
 * because future deltas are simply scaled by the new rate.
 *
 * Repetition and direction (§13) are evaluated here — the animation
 * definition and its keyframes are never duplicated. Concurrent playbacks on
 * one target follow replacement semantics: the most recently started playback
 * owns the target, and superseded playbacks are cancelled without additive
 * composition (§14).
 *
 * @example
 * ```ts
 * const playback = slide.attach(target.html(element), { iterations: "infinite" });
 * playback.play();
 * // later…
 * playback.pause();
 * playback.seek(0);
 * playback.dispose();
 * ```
 */
export class Playback {
  /** The immutable definition being played (§11). */
  readonly animation: Animation;

  /** The render target receiving evaluated transforms, if any (§11). */
  readonly target: RenderTarget | undefined;

  private readonly _engine: PlaybackEngine;
  private readonly _iterations: number | "infinite";
  private readonly _directionMode: PlaybackDirectionMode;
  private readonly _alternates: boolean;

  private _state: PlaybackState = "idle";
  private _time = 0;
  private _iteration = 0;
  private _flipped: boolean;
  private _rate = 1;
  private _lastTimestamp = 0;
  private _deferred: Deferred;
  private _settled = false;
  private _registered = false;

  constructor(animation: Animation, target?: RenderTarget, options: PlaybackOptions = {}) {
    this.animation = animation;
    this.target = target;
    this._engine = options.engine ?? getDefaultEngine();

    const iterations = options.iterations ?? 1;
    if (iterations !== "infinite") {
      if (!Number.isFinite(iterations) || !Number.isInteger(iterations) || iterations < 1) {
        throw new RangeError(
          `Playback \`iterations\` must be a positive integer or "infinite" (§13); received ${String(iterations)}.`,
        );
      }
    }
    this._iterations = iterations;

    const direction = options.direction ?? "normal";
    if (!DIRECTION_MODES.includes(direction)) {
      throw new RangeError(
        `Playback \`direction\` must be one of ${DIRECTION_MODES.join(", ")} (§13); received ${String(direction)}.`,
      );
    }
    this._directionMode = direction;
    this._alternates = direction === "alternate" || direction === "alternate-reverse";
    this._flipped = direction === "reverse" || direction === "alternate-reverse";

    if (options.playbackRate !== undefined) {
      if (typeof options.playbackRate !== "number" || !Number.isFinite(options.playbackRate)) {
        throw new TypeError("Playback `playbackRate` must be a finite number (§12).");
      }
      this._rate = options.playbackRate;
    }

    this._deferred = createDeferred();
    if (options.autoplay === true) {
      this.play();
    }
  }

  /** The current lifecycle state (§12). */
  get state(): PlaybackState {
    return this._state;
  }

  /**
   * Elapsed animation time in milliseconds within the current iteration,
   * always clamped to `[0, duration]` (§11.1).
   */
  get currentTime(): number {
    return this._time;
  }

  /**
   * The completion promise of the current run (§11.1). It resolves with
   * `{ status: "finished" }` when all iterations complete naturally, or
   * `{ status: "cancelled" }` on ordinary cancellation — never a rejection.
   * Each run started by `play()` gets its own promise; awaiting this getter
   * before any run settles waits for the next settlement of whatever run is
   * current when read.
   */
  get finished(): Promise<PlaybackResult> {
    return this._deferred.promise;
  }

  /** Configured total iterations, including the initial one (§13). */
  get iterations(): number | "infinite" {
    return this._iterations;
  }

  /** The authored direction mode (§13). */
  get directionMode(): PlaybackDirectionMode {
    return this._directionMode;
  }

  /** Whether the current iteration runs backwards, after any `reverse()` calls. */
  get reversed(): boolean {
    return this._flipped;
  }

  /** The completed iterations of the current run (§13). */
  get iterationCount(): number {
    return this._iteration;
  }

  /**
   * The playback rate multiplier (§11.1, §16). Any finite number is accepted:
   * `2` plays twice as fast, `-1` runs backwards, `0` holds time. Changing
   * the rate never jumps animation time — only future elapsed-time deltas are
   * scaled relative to the current timestamp (§12, §16).
   */
  get playbackRate(): number {
    return this._rate;
  }

  /**
   * Sets the playback rate multiplier (§11.1). Accepts any finite number;
   * animation time is never jumped — the new rate scales future elapsed-time
   * deltas from the current timestamp, and non-finite values throw
   * `TypeError`.
   */
  set playbackRate(rate: number) {
    this._assertNotDisposed("playbackRate");
    if (typeof rate !== "number" || !Number.isFinite(rate)) {
      throw new TypeError(
        `Playback \`playbackRate\` must be a finite number (§12); received ${String(rate)}.`,
      );
    }
    // Continuity: `currentTime` is untouched here; subsequent engine updates
    // scale elapsed clock time by the new rate from the current timestamp.
    this._rate = rate;
  }

  /**
   * Starts or resumes playback (§12). Resuming a paused instance continues at
   * the retained time; starting from `idle`, `finished`, or `cancelled` begins
   * a new run from the beginning of the timeline in the current direction
   * (§12) with its own `Playback.finished` promise. Starting (or
   * resuming) takes target ownership, superseding any other playback on the
   * same target (§14).
   */
  play(): void {
    this._assertNotDisposed("play()");
    if (this._state === "running") return;

    if (this._state === "paused") {
      this._state = "running";
      this._claimTarget();
      this._anchor(this._engine.clock.now());
      this._register();
      return;
    }

    // idle | finished | cancelled → new run from the beginning in the current
    // direction (§12).
    this._claimTarget();
    this._iteration = 0;
    this._time = this._flipped ? this.animation.duration : 0;
    // Each *run* gets its own completion promise (§11.1): a fresh deferred is
    // only created when the previous run settled. Awaiting `finished` before
    // the first play waits on that first run rather than an orphan promise.
    if (this._settled) {
      this._deferred = createDeferred();
      this._settled = false;
    }
    this._state = "running";

    if (this.animation.duration === 0 && this._iterations !== "infinite") {
      // A zero-duration finite run has no interior to play through: every
      // iteration completes instantly at its terminal value.
      this._time = 0;
      this._iteration = this._iterations as number;
      this._state = "finished";
      this._render(); // submit the terminal transform before settling
      this._complete("finished");
      return;
    }

    this._render();
    this._anchor(this._engine.clock.now());
    this._register();
  }

  /**
   * Stops time advancement while retaining playback state and time (§12).
   * A later `play()` resumes from the retained time. No-op unless running.
   */
  pause(): void {
    this._assertNotDisposed("pause()");
    if (this._state !== "running") return;
    this._unregister();
    this._state = "paused";
  }

  /**
   * Changes playback direction (§12, §13). Time is retained and continues in
   * the new direction from wherever it currently sits. The changed direction
   * is also the direction a restarted run uses — `play()` after finishing
   * restarts "in current direction" (§12).
   */
  reverse(): void {
    this._assertNotDisposed("reverse()");
    this._flipped = !this._flipped;
  }

  /**
   * Sets elapsed animation time within the current iteration, in
   * milliseconds (§12). Out-of-range times clamp to `[0, duration]`. Seeking
   * immediately re-evaluates and submits the transform to the target when one
   * is attached, without changing playback state.
   */
  seek(timeMs: number): void {
    this._assertNotDisposed("seek()");
    if (typeof timeMs !== "number" || !Number.isFinite(timeMs)) {
      throw new TypeError(`playback.seek() requires a finite number of milliseconds (§12).`);
    }
    this._time = clamp(timeMs, 0, this.animation.duration);
    this._render();
  }

  /**
   * Sets normalized animation progress in `[0, 1]` within the current
   * iteration (§12), equivalent to `seek(progress × duration)`. Out-of-range
   * progress clamps to the boundaries.
   */
  seekProgress(progress: number): void {
    this._assertNotDisposed("seekProgress()");
    if (typeof progress !== "number" || !Number.isFinite(progress)) {
      throw new TypeError(`playback.seekProgress() requires a finite number in [0, 1] (§12).`);
    }
    this.seek(clamp(progress, 0, 1) * this.animation.duration);
  }

  /**
   * Stops playback and resolves the run's promise with
   * `{ status: "cancelled" }` (§12). The last rendered transform is retained
   * — cancellation does not attempt to restore an unknown original target
   * transform. Cancellation and natural completion are separate outcomes; a
   * finished or already-cancelled instance ignores this call.
   */
  cancel(): void {
    this._assertNotDisposed("cancel()");
    if (this._state === "finished" || this._state === "cancelled") return;
    this._unregister();
    this._releaseTargetOwnership();
    this._complete("cancelled");
  }

  /**
   * Permanently releases playback resources (§12): unregisters from the
   * engine, releases target ownership, invokes the adapter's optional
   * `dispose` cleanup hook (§17.1) — never destroying the underlying DOM
   * element, canvas context, or graphics resource (Appendix B.8) — and
   * settles any pending `finished` promise as cancelled so awaiting code
   * cannot hang. Idempotent; every other operation on a disposed instance
   * throws (§12).
   */
  dispose(): void {
    if (this._state === "disposed") return;
    this._unregister();
    this._releaseTargetOwnership();
    if (!this._settled) {
      this._settled = true;
      this._deferred.resolve({ status: "cancelled" });
    }
    this.target?.dispose?.();
    this._state = "disposed";
  }

  // ---------------------------------------------------------------------------
  // Engine integration (§16)
  // ---------------------------------------------------------------------------

  /**
   * Called by the `PlaybackEngine` with the current clock timestamp.
   * Advances time by the elapsed wall-clock delta scaled by `playbackRate`
   * and the iteration direction — timestamp-based, never frame-count-based
   * (§16).
   */
  onEngineUpdate(timeMs: number): void {
    if (this._state !== "running") return;
    // Ignore non-forward timestamps (§16): a frame callback can deliver the
    // timestamp of a frame that began before the last anchor — e.g. an input
    // event dispatched inside an already-started frame calls `play()`, which
    // anchors to `clock.now()` ahead of that frame's timestamp. A run always
    // starts exactly on a timeline boundary (`t = 0` forward, `t = duration`
    // reversed), so even a few ms of negative delta would cross the opposite
    // boundary and finish the run in a single step. The anchor is left ahead
    // so the ignored interval is never double-counted later.
    const delta = timeMs - this._lastTimestamp;
    if (delta <= 0) return;
    this._lastTimestamp = timeMs;
    this._advance(delta * this._rate);
    if (this._state === "running") {
      this._render();
    }
  }

  // ---------------------------------------------------------------------------
  // Internals
  // ---------------------------------------------------------------------------

  /** Progress in `[0, 1]` for the current iteration time. */
  private _progress(): number {
    if (this.animation.duration === 0) {
      // A zero-duration timeline has no interior: a finished forward run
      // holds the final value; everything else holds the first.
      return this._state === "finished" && !this._flipped ? 1 : 0;
    }
    return clamp(this._time / this.animation.duration, 0, 1);
  }

  /** Advances within/across iterations, handling repetition and direction (§13). */
  private _advance(delta: number): void {
    let remaining = delta * (this._flipped ? -1 : 1);
    const duration = this.animation.duration;
    let guard = 0;

    while (remaining !== 0) {
      if (++guard > 10_000) {
        throw new Error(
          "Playback crossed more than 10,000 iterations in a single update. Check the animation duration and playbackRate.",
        );
      }

      const next = this._time + remaining;
      if (next >= 0 && next <= duration) {
        this._time = next;
        return;
      }

      // A boundary was crossed: the current iteration just completed.
      const overflow = next > duration ? next - duration : -next;
      this._iteration += 1;

      if (this._iterations !== "infinite" && this._iteration >= this._iterations) {
        // Hold the terminal value of the final iteration, then finish (§13).
        this._time = this._flipped ? 0 : duration;
        this._render();
        this._complete("finished");
        return;
      }

      if (this._alternates) {
        this._flipped = !this._flipped;
      }
      this._time = this._flipped ? duration : 0;
      remaining = overflow * (this._flipped ? -1 : 1);
    }
  }

  private _complete(status: PlaybackResult["status"]): void {
    this._unregister();
    this._releaseTargetOwnership();
    this._state = status;
    if (!this._settled) {
      this._settled = true;
      this._deferred.resolve({ status });
    }
  }

  private _render(): void {
    if (this.target === undefined || this.target === null) return;
    this.target.setTransform(this.animation.sampleProgress(this._progress()).toMatrix());
  }

  private _register(): void {
    if (this._registered) return;
    this._engine.add(this);
    this._registered = true;
  }

  private _unregister(): void {
    if (!this._registered) return;
    this._engine.remove(this);
    this._registered = false;
  }

  private _anchor(timestampMs: number): void {
    this._lastTimestamp = timestampMs;
  }

  /** §14 replacement semantics: starting here supersedes the current owner. */
  private _claimTarget(): void {
    if (this.target === undefined || this.target === null) return;
    const owner = targetOwners.get(this.target);
    if (owner !== undefined && owner !== this) {
      owner._supersede();
    }
    targetOwners.set(this.target, this);
  }

  private _releaseTargetOwnership(): void {
    if (this.target === undefined || this.target === null) return;
    if (targetOwners.get(this.target) === this) {
      targetOwners.delete(this.target);
    }
  }

  /** Superseded by another playback on the same target (§14). */
  private _supersede(): void {
    if (this._state === "finished" || this._state === "cancelled" || this._state === "disposed") {
      return;
    }
    this._unregister();
    this._complete("cancelled");
  }

  private _assertNotDisposed(operation: string): void {
    if (this._state === "disposed") {
      throw new Error(
        `playback.${operation} was called on a disposed playback instance (§12). Disposed playbacks cannot be revived.`,
      );
    }
  }
}
