import { getDefaultEngine, type PlaybackEngine } from "../playback/engine.ts";
import { claimTarget, releaseTarget } from "../playback/ownership.ts";
import type {
  PlaybackDirectionMode,
  PlaybackOptions,
  PlaybackResult,
  PlaybackState,
} from "../playback/playback.ts";
import type { RenderTarget } from "../targets/types.ts";
import { Timeline } from "./timeline.ts";

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

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/** Every render target bound anywhere in a timeline tree, in schedule order (§14.4). */
function collectTargets(timeline: Timeline): RenderTarget[] {
  const targets: RenderTarget[] = [];
  for (const entry of timeline.entries) {
    if (entry.target !== undefined) targets.push(entry.target);
    if (entry.source instanceof Timeline) targets.push(...collectTargets(entry.source));
  }
  return targets;
}

/**
 * The execution instance of a {@link Timeline}, created by `timeline.attach()`
 * (§16.1). One timeline playback owns the shared transport — play, pause,
 * reverse, seek, playback rate, cancellation, and disposal apply to the whole
 * composed definition — while every child derives its local time from the
 * single shared timeline time; children never create their own clocks or frame
 * requests (Appendix B.1). It registers as one scheduled unit on the
 * centralized `PlaybackEngine`, so coordinated updates stay in the scheduler
 * (§16.1, Appendix B.7) and lifecycle follows the same state machine as
 * animation playback: idle → running → paused/finished/cancelled → disposed
 * (§12).
 *
 * @remarks
 * Repetition composes at both levels (§14.2): these playback-level options
 * repeat the complete choreography — whether it ends naturally or is infinite
 * inside — while entry repeats affect only their own scheduled segment (§16.1).
 * `currentTime` is elapsed timeline time in milliseconds within the current
 * iteration; for an infinite-duration timeline runs never complete naturally.
 *
 * Every bound target follows §14 replacement semantics: starting supersedes
 * whatever playback previously owned those targets. Unlike `Animation.attach`,
 * a timeline never takes ownership of its adapters — entries may share targets
 * across definitions, so {@link TimelinePlayback.dispose} releases bindings but
 * does not invoke adapter `dispose`; the host keeps that responsibility
 * (Appendix B.8).
 *
 * @example
 * ```ts
 * const playback = scene.attach({ iterations: 2, autoplay: true });
 * playback.seek(1000); // absolute timeline milliseconds — children remap locally
 * await playback.finished; // { status: "finished" } — never rejects (§11.1)
 * ```
 */
export class TimelinePlayback {
  /** The immutable composition being played (§16.1). */
  readonly timeline: Timeline;

  /** Every render target bound in the timeline tree, in schedule order (§14.4). */
  readonly targets: readonly RenderTarget[];

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

  constructor(timeline: Timeline, options: PlaybackOptions = {}) {
    this.timeline = timeline;
    this.targets = Object.freeze(collectTargets(timeline));
    this._engine = options.engine ?? getDefaultEngine();

    const iterations = options.iterations ?? 1;
    if (iterations !== "infinite") {
      if (!Number.isFinite(iterations) || !Number.isInteger(iterations) || iterations < 1) {
        throw new RangeError(
          `timeline.attach() \`iterations\` must be a positive integer or "infinite" (§13.1); received ${String(iterations)}.`,
        );
      }
    }
    this._iterations = iterations;

    const direction = options.direction ?? "normal";
    if (!DIRECTION_MODES.includes(direction)) {
      throw new RangeError(
        `timeline.attach() \`direction\` must be one of ${DIRECTION_MODES.join(", ")} (§13.1); received ${String(direction)}.`,
      );
    }
    this._directionMode = direction;
    this._alternates = direction === "alternate" || direction === "alternate-reverse";
    this._flipped = direction === "reverse" || direction === "alternate-reverse";

    if (options.playbackRate !== undefined) {
      if (typeof options.playbackRate !== "number" || !Number.isFinite(options.playbackRate)) {
        throw new TypeError("timeline.attach() `playbackRate` must be a finite number (§12).");
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
   * Elapsed shared timeline time in milliseconds within the current iteration.
   * Unbounded above for infinite-duration timelines; children receive local
   * times derived from it (§16.1, §14.4).
   */
  get currentTime(): number {
    return this._time;
  }

  /**
   * The completion promise of the current run (§11.1): resolves with
   * `{ status: "finished" }` when all iterations complete naturally, or
   * `{ status: "cancelled" }` on ordinary cancellation — never a rejection.
   * Each run started by `play()` gets its own promise.
   */
  get finished(): Promise<PlaybackResult> {
    return this._deferred.promise;
  }

  /** Configured total playback-level iterations, including the initial one (§13.1). */
  get iterations(): number | "infinite" {
    return this._iterations;
  }

  /** The authored direction mode for the composed run (§13.1). */
  get directionMode(): PlaybackDirectionMode {
    return this._directionMode;
  }

  /** Whether the current iteration runs backwards, after any `reverse()` calls. */
  get reversed(): boolean {
    return this._flipped;
  }

  /** The completed playback-level iterations of the current run (§13.1). */
  get iterationCount(): number {
    return this._iteration;
  }

  /**
   * The playback rate multiplier for the whole composition (§16.1). Changing
   * it never jumps shared timeline time — only future elapsed-time deltas are
   * scaled from the current timestamp, and every child sees the same rate
   * through the shared clock.
   */
  get playbackRate(): number {
    return this._rate;
  }

  /**
   * Sets the playback rate multiplier for the whole composition (§16.1).
   * Accepts any finite number; shared timeline time is never jumped — the new
   * rate scales future elapsed-time deltas from the current timestamp, and
   * non-finite values throw `TypeError`.
   */
  set playbackRate(rate: number) {
    this._assertNotDisposed("playbackRate");
    if (typeof rate !== "number" || !Number.isFinite(rate)) {
      throw new TypeError(
        `TimelinePlayback \`playbackRate\` must be a finite number (§12); received ${String(rate)}.`,
      );
    }
    this._rate = rate;
  }

  /**
   * Starts or resumes the composed run (§12). Resuming a paused instance
   * continues at the retained shared time; starting from `idle`, `finished`, or
   * `cancelled` begins a new run from the beginning of the timeline in the
   * current direction with its own `finished` promise. Starting (or resuming)
   * claims every bound target, superseding existing owners (§14).
   */
  play(): void {
    this._assertNotDisposed("play()");
    if (this._state === "running") return;

    if (this._state === "paused") {
      this._state = "running";
      this._claimTargets();
      this._anchor(this._engine.clock.now());
      this._register();
      return;
    }

    // idle | finished | cancelled → new run from the beginning in the current
    // direction (§12).
    this._claimTargets();
    this._iteration = 0;
    this._time = this._flipped ? this.timeline.duration : 0;
    if (this._settled) {
      this._deferred = createDeferred();
      this._settled = false;
    }
    this._state = "running";

    if (this.timeline.duration === 0 && this._iterations !== "infinite") {
      // A zero-duration finite run has no interior: every iteration completes
      // instantly at its terminal value (§12).
      this._time = 0;
      this._iteration = this._iterations as number;
      this._state = "finished";
      this._renderAt(this._flipped ? 0 : Number.MIN_VALUE);
      this._complete("finished");
      return;
    }

    this._render();
    this._anchor(this._engine.clock.now());
    this._register();
  }

  /** Stops time advancement while retaining state and shared time (§12). No-op unless running. */
  pause(): void {
    this._assertNotDisposed("pause()");
    if (this._state !== "running") return;
    this._unregister();
    this._state = "paused";
  }

  /**
   * Flips the shared direction (§12, §13.1). Time is retained and continues in
   * the new direction; every child sees the flipped shared time through its
   * local mapping. Restarted runs use the current direction (§12).
   */
  reverse(): void {
    this._assertNotDisposed("reverse()");
    this._flipped = !this._flipped;
  }

  /**
   * Sets elapsed shared timeline time within the current iteration, in absolute
   * milliseconds (§12, §16.1). Children immediately re-derive their local times
   * and bound targets receive fresh outputs; finite timelines clamp to
   * `[0, duration]`, infinite ones accept any non-negative time.
   */
  seek(timeMs: number): void {
    this._assertNotDisposed("seek()");
    if (typeof timeMs !== "number" || !Number.isFinite(timeMs)) {
      throw new TypeError(
        "timeline playback.seek() requires a finite number of milliseconds (§12).",
      );
    }
    this._time = clamp(timeMs, 0, this.timeline.duration);
    this._render();
  }

  /**
   * Sets normalized progress in `[0, 1]` over the timeline's total duration
   * (§12), equivalent to `seek(progress × duration)`. Throws for
   * infinite-duration timelines — there is no finite horizon to normalize
   * against; seek absolute milliseconds instead (§14.3).
   */
  seekProgress(progress: number): void {
    this._assertNotDisposed("seekProgress()");
    if (typeof progress !== "number" || !Number.isFinite(progress)) {
      throw new TypeError(
        "timeline playback.seekProgress() requires a finite number in [0, 1] (§12).",
      );
    }
    if (!Number.isFinite(this.timeline.duration)) {
      throw new Error(
        "seekProgress() is undefined for infinite-duration timelines — seek absolute milliseconds instead (§14.3).",
      );
    }
    this.seek(clamp(progress, 0, 1) * this.timeline.duration);
  }

  /**
   * Stops the run and resolves its promise with `{ status: "cancelled" }`
   * (§12). Bound targets retain their last rendered outputs — cancellation
   * never attempts to restore unknown originals. Separate from natural
   * completion; ignored on finished or already-cancelled instances.
   */
  cancel(): void {
    this._assertNotDisposed("cancel()");
    if (this._state === "finished" || this._state === "cancelled") return;
    this._unregister();
    this._releaseTargets();
    this._complete("cancelled");
  }

  /**
   * Permanently releases the run (§12): unregisters from the engine and
   * releases every target binding so later playbacks own them. Adapter-owned
   * render objects are never destroyed here — timeline targets may be shared
   * across definitions, so adapter disposal remains the host's responsibility
   * (Appendix B.8). Settles any pending `finished` promise as cancelled so
   * awaiting code cannot hang. Idempotent; every other operation on a disposed
   * instance throws (§12).
   */
  dispose(): void {
    if (this._state === "disposed") return;
    this._unregister();
    this._releaseTargets();
    if (!this._settled) {
      this._settled = true;
      this._deferred.resolve({ status: "cancelled" });
    }
    this._state = "disposed";
  }

  /**
   * Called by the `PlaybackEngine` with the current clock timestamp (§16.1).
   * Advances the shared timeline time by the elapsed wall-clock delta scaled
   * by `playbackRate` — timestamp-based, never frame-count-based — then
   * re-evaluates every started child at its derived local time (§14.4).
   */
  onEngineUpdate(timeMs: number): void {
    if (this._state !== "running") return;
    // Ignore non-forward timestamps (§16): the engine steps from its Clock, so
    // this never fires with a monotonic clock — but hosts can inject one, and
    // time must never step backwards across a run's boundary start.
    const delta = timeMs - this._lastTimestamp;
    if (delta <= 0) return;
    this._lastTimestamp = timeMs;
    this._advance(delta * this._rate);
    if (this._state === "running") {
      this._render();
    }
  }

  /**
   * Superseded by another execution instance on one of the timeline's targets
   * (§14). Part of the internal `TargetOwner` contract shared with `Playback`;
   * not part of the user-facing transport.
   */
  supersedeByReplacement(): void {
    if (this._state === "finished" || this._state === "cancelled" || this._state === "disposed") {
      return;
    }
    this._unregister();
    this._complete("cancelled");
  }

  // ---------------------------------------------------------------------------
  // Internals
  // ---------------------------------------------------------------------------

  /** Advances the shared time within/across playback-level iterations (§13.1). */
  private _advance(delta: number): void {
    let remaining = delta * (this._flipped ? -1 : 1);
    const duration = this.timeline.duration;
    let guard = 0;

    while (remaining !== 0) {
      if (++guard > 10_000) {
        throw new Error(
          "TimelinePlayback crossed more than 10,000 iterations in a single update. Check the timeline duration and playbackRate.",
        );
      }

      const next = this._time + remaining;
      if (next >= 0 && next <= duration) {
        this._time = next;
        return;
      }

      // A boundary was crossed: the current composed iteration just completed.
      const overflow = next > duration ? next - duration : -next;
      this._iteration += 1;

      if (this._iterations !== "infinite" && this._iteration >= this._iterations) {
        // Hold the terminal outputs of the final iteration, then finish (§13.1).
        // `_time` now sits on the terminal boundary — forward at the horizon,
        // reversed at zero — so a plain render submits each child's endpoint.
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
    this._releaseTargets();
    this._state = status;
    if (!this._settled) {
      this._settled = true;
      this._deferred.resolve({ status });
    }
  }

  /** Re-evaluates the composition at the current shared time and submits outputs. */
  private _render(): void {
    this._renderAt(this._time);
  }

  private _renderAt(timeMs: number): void {
    for (const output of this.timeline.sample(timeMs)) {
      if (output.target !== undefined) {
        output.target.setTransform(output.transform.toMatrix());
      }
    }
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

  /** §14 replacement semantics across every bound target. */
  private _claimTargets(): void {
    for (const target of this.targets) {
      claimTarget(target, this);
    }
  }

  private _releaseTargets(): void {
    for (const target of this.targets) {
      releaseTarget(target, this);
    }
  }

  private _assertNotDisposed(operation: string): void {
    if (this._state === "disposed") {
      throw new Error(
        `timeline playback.${operation} was called on a disposed playback instance (§12). Disposed playbacks cannot be revived.`,
      );
    }
  }
}
