import { Animation } from "../animation/animation.ts";
import type { PlaybackDirectionMode, PlaybackOptions } from "../playback/playback.ts";
import type { RenderTarget } from "../targets/types.ts";
import type { Transform } from "../transform/transform.ts";
import { TimelinePlayback } from "./timeline-playback.ts";

/**
 * A definition a timeline can schedule: an {@link Animation} motion definition
 * or another `Timeline` — nested timelines are first-class children and compose
 * naturally (§14.1, Appendix A.1).
 */
export type TimelineChild = Animation | Timeline;

/**
 * Repetition options for a scheduled segment (§13.1, §14.2). These semantics
 * are shared by every repeat level — entry repeats, {@link Timeline.repeat},
 * and playback-level repetition:
 *
 * - `iterations` is the total number of iterations **including the first**:
 *   `1` runs once, a finite positive integer repeats, `"infinite"` (or
 *   `Infinity`) never naturally completes (§13.1).
 * - `direction`: `"normal"` plays each iteration forward; `"alternate"`
 *   reverses on alternating iterations without snapping back to the start;
 *   `"reverse"`/`"alternate-reverse"` start reversed for parity with playback
 *   direction modes (§13).
 * - `delay` is the gap **between** iterations, in milliseconds — it never
 *   delays the first iteration (§13.1).
 */
export interface TimelineRepeatOptions {
  /** Total iterations including the first; positive integer, `"infinite"`, or `Infinity`. Defaults to `1` (§13.1). */
  readonly iterations?: number | "infinite" | undefined;
  /** Direction behavior across iterations (§13.1). Defaults to `"normal"`. */
  readonly direction?: PlaybackDirectionMode | undefined;
  /** Gap between iterations in milliseconds, never before the first (§13.1). Defaults to `0`. */
  readonly delay?: number | undefined;
}

/** A scheduled child with explicit placement and optional target binding (§14.1). */
export interface TimelineEntryInput extends TimelineRepeatOptions {
  /** The animation or nested timeline being scheduled. */
  readonly animation: TimelineChild;
  /** Start time in milliseconds from the timeline's origin (§14.1). Defaults to `0`. */
  readonly at?: number | undefined;
  /** Render target receiving this child's evaluated output (§14.4). Attachment stays data — definitions never render. */
  readonly target?: RenderTarget | undefined;
}

/** Any child a composition accepts: a bare definition or an entry input with placement (§14.1). */
export type TimelineChildInput = TimelineChild | TimelineEntryInput;

/** Options for {@link Timeline.sequence}. */
export interface TimelineSequenceOptions {
  /** Gap in milliseconds between consecutive children (§14.1). Defaults to `0`. */
  readonly gap?: number | undefined;
}

/** Ordering of a stagger expansion: index 0 starts first, or last (§14.1). */
export type StaggerOrder = "forward" | "reverse";

/**
 * Options for {@link Timeline.stagger}. `delay` is the **start interval**
 * between expanded entries — deliberately distinct from repeat `delay`, which
 * is a gap between iterations of one entry (repeat delays, when wanted, come
 * from the staggered child's own entry input; §13.1, §14.1).
 */
export interface TimelineStaggerOptions {
  /** Start interval between consecutive entries, in milliseconds (§14.1). Required — there is no sensible default. */
  readonly delay: number;
  /** Which index starts first. Defaults to `"forward"` (§14.1). */
  readonly order?: StaggerOrder | undefined;
  /** Repeat count applied to every expanded entry (§14.2 level 2). */
  readonly iterations?: number | "infinite" | undefined;
  /** Repeat direction applied to every expanded entry (§13.1). */
  readonly direction?: PlaybackDirectionMode | undefined;
}

/** One evaluated child output at a timeline time (§14.4). */
export interface TimelineSample {
  /** The originating entry's name when it came from `Timeline.from`; otherwise `undefined`. */
  readonly name: string | undefined;
  /** The render target bound to the originating entry, if any (§14.4). */
  readonly target: RenderTarget | undefined;
  /** The child-local time this output was evaluated at, in milliseconds: `timelineTime − childStart` (§14.4). */
  readonly localTime: number;
  /** The transform the originating animation evaluated to at {@link TimelineSample.localTime}. */
  readonly transform: Transform;
}

/** A normalized, frozen scheduled entry — the immutable data form of a timeline child (Appendix A.1). */
export interface TimelineEntry {
  /** Entry name from `Timeline.from`, or `undefined` for positional children. */
  readonly name: string | undefined;
  /** The scheduled definition (§3.7). */
  readonly source: TimelineChild;
  /** Start offset in milliseconds from the timeline origin (§14.1). */
  readonly at: number;
  /** Bound render target, if any (§14.4). */
  readonly target: RenderTarget | undefined;
  /** Normalized total iterations including the first (§13.1). */
  readonly iterations: number | "infinite";
  /** Normalized repeat direction (§13.1). */
  readonly direction: PlaybackDirectionMode;
  /** Repeat delay between iterations in milliseconds, never before the first (§13.1). */
  readonly delay: number;
  /** Total window this entry occupies including repeats and inter-iteration delays; may be `Infinity` (§14.3). */
  readonly duration: number;
}

const DIRECTION_MODES: readonly PlaybackDirectionMode[] = [
  "normal",
  "reverse",
  "alternate",
  "alternate-reverse",
];

function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

/** Finite, non-negative millisecond values shared by placement times and delays. */
function validateNonNegativeMs(context: string, label: string, value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(
      `${context} \`${label}\` must be a finite number of milliseconds (§14.1); received ${String(value)}.`,
    );
  }
  if (value < 0) {
    throw new RangeError(`${context} \`${label}\` cannot be negative; received ${value}.`);
  }
  return value;
}

/** Normalizes repeat options to validated canonical values (§13.1). */
function normalizeRepeat(
  context: string,
  iterations: number | "infinite" | undefined,
  direction: PlaybackDirectionMode | undefined,
  delay: number | undefined,
): { iterations: number | "infinite"; direction: PlaybackDirectionMode; delay: number } {
  let normalizedIterations: number | "infinite" = iterations ?? 1;
  if (normalizedIterations === Number.POSITIVE_INFINITY) {
    // §13.1: infinite repetition is represented explicitly — `Infinity` and
    // `"infinite"` normalize to the same canonical form.
    normalizedIterations = "infinite";
  } else if (normalizedIterations !== "infinite") {
    if (
      !Number.isFinite(normalizedIterations) ||
      !Number.isInteger(normalizedIterations) ||
      normalizedIterations < 1
    ) {
      throw new RangeError(
        `${context} \`iterations\` must be a positive integer total count including the first, or "infinite" (§13.1); received ${String(iterations)}.`,
      );
    }
  }

  const normalizedDirection = direction ?? "normal";
  if (!DIRECTION_MODES.includes(normalizedDirection)) {
    throw new RangeError(
      `${context} \`direction\` must be one of ${DIRECTION_MODES.join(", ")} (§13.1); received ${String(direction)}.`,
    );
  }

  const normalizedDelay = delay === undefined ? 0 : validateNonNegativeMs(context, "delay", delay);
  return {
    iterations: normalizedIterations,
    direction: normalizedDirection,
    delay: normalizedDelay,
  };
}

/**
 * Window a repeated entry occupies (§14.3): for child duration `D`, total
 * iteration count `N`, and repeat delay `R`, the finite repeated duration is
 * `D × N + R × (N − 1)` — the delay after the final iteration is omitted.
 */
function repeatedDuration(
  childDuration: number,
  iterations: number | "infinite",
  delay: number,
): number {
  if (iterations === "infinite") return Number.POSITIVE_INFINITY;
  return childDuration * iterations + delay * (iterations - 1);
}

/** Whether iteration `index` runs backwards for a direction mode (§13.1). */
function isReversedIteration(direction: PlaybackDirectionMode, index: number): boolean {
  switch (direction) {
    case "reverse":
      return true;
    case "alternate":
      return index % 2 === 1;
    case "alternate-reverse":
      return index % 2 === 0;
    default:
      return false;
  }
}

/**
 * An infinite-duration child has no horizon to complete an iteration against:
 * a second iteration is unreachable, and reversing counts back from a finite
 * endpoint that does not exist. Such children may only be scheduled unrepeated
 * and forward — everything else must be rejected explicitly (§14.3).
 */
function validateRepeatableSource(
  context: string,
  source: TimelineChild,
  repeat: { iterations: number | "infinite"; direction: PlaybackDirectionMode },
): void {
  if (Number.isFinite(source.duration)) return;
  const reachesSecondIteration = repeat.iterations === "infinite" || repeat.iterations > 1;
  if (reachesSecondIteration || isReversedIteration(repeat.direction, 0)) {
    throw new RangeError(
      `${context} cannot repeat or reverse an infinite-duration child — iterations beyond the first are unreachable and reversed time has no horizon to count back from (§14.3).`,
    );
  }
}

/**
 * Maps an entry-relative time to the child's local time through its repeat
 * schedule (§13.1, §14.4). Times inside a repeat delay gap hold the terminal
 * value of the iteration that just ended; `alternate` reverses progress
 * without snapping to the beginning between alternating iterations.
 */
function mapRepeatLocalTime(
  entry: TimelineEntry,
  timeInEntryMs: number,
): { localTime: number; iteration: number } {
  // Unrepeated forward entries pass their window straight through — also the
  // only legal mapping for infinite-duration children (§14.3).
  if (entry.iterations === 1 && entry.direction === "normal") {
    return { localTime: timeInEntryMs, iteration: 0 };
  }

  const childDuration = entry.source.duration;
  if (childDuration === 0) {
    // Zero-duration child: only endpoints exist — exactly 0 reads as the start
    // value, any positive time as the terminal value (Animation.sample
    // semantics), so a finished zero-duration run can hold its final output.
    return { localTime: timeInEntryMs <= 0 ? 0 : Number.MIN_VALUE, iteration: 0 };
  }
  const period = childDuration + entry.delay;
  if (period === 0) return { localTime: 0, iteration: 0 };

  let iteration = Math.floor(timeInEntryMs / period);
  if (entry.iterations !== "infinite" && iteration > entry.iterations - 1) {
    iteration = entry.iterations - 1;
  }
  let phase = timeInEntryMs - iteration * period;
  // Inside the inter-iteration delay gap: hold the just-ended iteration's
  // terminal value instead of advancing (§13.1).
  if (phase > childDuration) phase = childDuration;

  const localTime = isReversedIteration(entry.direction, iteration) ? childDuration - phase : phase;
  return { localTime, iteration };
}

/** Validates one child input and extracts its definition, target, and repeat schedule. */
function resolveChildInput(
  context: string,
  input: TimelineChildInput,
): Omit<TimelineEntry, "at" | "duration"> {
  if (input instanceof Animation || input instanceof Timeline) {
    return {
      name: undefined,
      source: input,
      target: undefined,
      ...normalizeRepeat(context, undefined, undefined, undefined),
    };
  }

  const asEntry = input as TimelineEntryInput;
  if (
    asEntry === null ||
    typeof asEntry !== "object" ||
    !(asEntry.animation instanceof Animation || asEntry.animation instanceof Timeline)
  ) {
    throw new TypeError(
      `${context} children must be Animation or Timeline instances, or entry objects such as { animation, at, target } (§14.1).`,
    );
  }

  return {
    name: undefined,
    source: asEntry.animation,
    target: asEntry.target,
    ...normalizeRepeat(context, asEntry.iterations, asEntry.direction, asEntry.delay),
  };
}

/** Normalizes one child into a frozen entry at `at` (or its own placement when `at` is unset). */
function buildEntry(
  context: string,
  input: TimelineChildInput,
  at: number | undefined,
  name?: string,
): TimelineEntry {
  const base = resolveChildInput(context, input);
  validateRepeatableSource(context, base.source, base);
  const explicitAt = (input as TimelineEntryInput).at;
  const placement =
    at ?? (explicitAt === undefined ? 0 : validateNonNegativeMs(context, "at", explicitAt));
  return Object.freeze({
    ...base,
    name: name ?? base.name,
    at: placement,
    duration: repeatedDuration(base.source.duration, base.iterations, base.delay),
  });
}

/** Validates the shared non-empty array contract of sequence/parallel. */
function validateChildren(
  context: string,
  children: readonly TimelineChildInput[],
): readonly TimelineChildInput[] {
  if (!Array.isArray(children) || children.length === 0) {
    throw new TypeError(`${context} requires a non-empty array of children (§14.1).`);
  }
  return children;
}

/**
 * An immutable temporal composition definition over a shared time axis (§3.7).
 * A `Timeline` schedules multiple {@link Animation} or nested `Timeline`
 * definitions at explicit start times with independent intrinsic durations —
 * placement never re-times children (§14.1). It is a composition definition,
 * not a replacement for `Animation`, `Playback`, `Scheduler`, or
 * `RenderTarget`: motion stays in animations, transport and lifecycle stay in
 * playback, coordinated updates stay in the scheduler, and rendering stays in
 * adapters (Appendix B.1).
 *
 * @remarks
 * Like every definition, a timeline is pure data: platform-independent,
 * deterministic, DOM-free, and sampleable at an absolute elapsed time without
 * any scheduler or render target (§14.4). {@link Timeline.attach} creates the
 * execution instance that drives it through the centralized engine (§16.1).
 *
 * @example
 * ```ts
 * import { Animation, Timeline, target } from "keyframe-flow";
 *
 * const headingIn = Animation.from({ to: { position: [0, 0, 0] }, duration: 300 });
 * const subtitleIn = Animation.from({ to: { scale: 1 }, duration: 250 });
 * const scene = Timeline.from({
 *   heading: { animation: headingIn, target: target.html(headingElement), at: 0 },
 *   subtitle: { animation: subtitleIn, target: target.html(subtitleElement), at: 200 },
 * });
 * scene.duration; // max(at + childDuration) across children (§14.3)
 * ```
 */
export class Timeline {
  /** Total duration in milliseconds, `Infinity` when an infinite child is scheduled parallel or last (§14.3). */
  readonly duration: number;

  /** The eagerly normalized, frozen schedule the whole timeline evaluates from (§20.1 step 1). */
  readonly entries: readonly TimelineEntry[];

  private constructor(entries: TimelineEntry[]) {
    this.entries = Object.freeze(entries);
    let duration = 0;
    for (const entry of entries) {
      duration = Math.max(duration, entry.at + entry.duration);
    }
    this.duration = duration;
  }

  /**
   * Creates a timeline from named children placed at absolute times — the
   * "at / absolute placement" form (§14.1). Values may be full entry objects
   * (`{ animation, target?, at?, iterations?, direction?, delay? }`) or bare
   * `Animation`/`Timeline` definitions (placed at `0`). Entry names are kept on
   * samples for attribution.
   *
   * @example
   * ```ts
   * const scene = Timeline.from({
   *   heading: { animation: headingIn, target: target.html(headingElement), at: 0 },
   *   card: { animation: cardIn, target: target.html(cardElement), at: 450 },
   * });
   * ```
   */
  static from(children: Record<string, TimelineChildInput>): Timeline {
    if (children === null || typeof children !== "object" || Array.isArray(children)) {
      throw new TypeError("Timeline.from() expects a record of named children (§14.1).");
    }
    const names = Object.keys(children);
    if (names.length === 0) {
      throw new TypeError("Timeline.from() requires at least one child (§14.1).");
    }
    return new Timeline(
      names.map((name) =>
        buildEntry("Timeline.from()", children[name] as TimelineChildInput, undefined, name),
      ),
    );
  }

  /**
   * Sequences children back to back: each starts after the preceding child's
   * intrinsic duration plus an optional `gap` (§14.1). Children keep their own
   * durations — sequence places them, it never normalizes timing. An infinite
   * non-final child is rejected explicitly because it would make every later
   * sibling unreachable; an infinite final child simply makes the sequence's
   * duration infinite (§14.3).
   *
   * @example
   * ```ts
   * const entrance = Timeline.sequence([logoIn, headerTimeline], { gap: 120 });
   * ```
   */
  static sequence(
    children: readonly TimelineChildInput[],
    options?: TimelineSequenceOptions,
  ): Timeline {
    const context = "Timeline.sequence()";
    const list = validateChildren(context, children);
    const gap = options?.gap === undefined ? 0 : validateNonNegativeMs(context, "gap", options.gap);

    const entries: TimelineEntry[] = [];
    let cursor = 0;
    for (let i = 0; i < list.length; i++) {
      const entry = buildEntry(context, list[i] as TimelineChildInput, cursor);
      entries.push(entry);
      if (!Number.isFinite(entry.duration)) {
        // An infinite final child is legal — the composition just never ends
        // (§14.3). Anywhere else it would strand every later sibling.
        if (i === list.length - 1) break;
        throw new RangeError(
          "Timeline.sequence() cannot place children after an infinite-duration child — later siblings would be unreachable (§14.3). Use Timeline.parallel for concurrent infinite segments.",
        );
      }
      cursor += entry.duration + gap;
    }
    return new Timeline(entries);
  }

  /**
   * Runs children concurrently: all start at `0` unless an entry specifies its
   * own `at`, and each keeps its intrinsic duration — parallel placement lets
   * durations differ freely (§14.1). The timeline ends when the longest finite
   * child ends; an infinite child makes the whole composition infinite (§14.3).
   *
   * @example
   * ```ts
   * const scene = Timeline.parallel([
   *   Timeline.repeat(backgroundSpin, { iterations: "infinite" }),
   *   headingIn,
   * ]);
   * ```
   */
  static parallel(children: readonly TimelineChildInput[]): Timeline {
    const list = validateChildren("Timeline.parallel()", children);
    return new Timeline(list.map((child) => buildEntry("Timeline.parallel()", child, undefined)));
  }

  /**
   * Wraps a child in a compact repeat operation — a single-entry timeline whose
   * entry carries the repeat schedule (§14.2). Repeated segments are never
   * eagerly expanded into one entry per iteration; this representation stays
   * compact for large finite counts and infinite repetition, and because the
   * result is an ordinary `Timeline` it nests anywhere a child is accepted:
   * sequences, parallels, and other repeats. Outer and child repeats compose
   * independently — repeating the outer timeline repeats the whole
   * choreography; repeating a child affects only its segment (§16.1).
   *
   * @example
   * ```ts
   * const repeatedSequence = Timeline.repeat(entrance, { iterations: 3, delay: 500 });
   * const pulse = Timeline.repeat(buttonPulse, { iterations: Infinity, direction: "alternate" });
   * ```
   */
  static repeat(child: TimelineChildInput, options?: TimelineRepeatOptions): Timeline {
    const context = "Timeline.repeat()";
    const base = buildEntry(context, child, 0);
    if (options === undefined) return new Timeline([base]);

    const repeat = normalizeRepeat(
      context,
      options.iterations ?? base.iterations,
      options.direction ?? base.direction,
      options.delay ?? base.delay,
    );
    validateRepeatableSource(context, base.source, repeat);
    return new Timeline([
      Object.freeze({
        ...base,
        ...repeat,
        duration: repeatedDuration(base.source.duration, repeat.iterations, repeat.delay),
      }),
    ]);
  }

  /**
   * Expands a child into scheduled entries with a fixed start interval —
   * staggering is a convenience over the same scheduling model everything else
   * uses, compiling to ordinary entries rather than a special runtime node
   * (§14.1). `items` is either an entry count or an array of render targets
   * (each expanded entry binds one target); `order` decides explicitly whether
   * index 0 starts first (`"forward"`, default) or last (`"reverse"`). The
   * stagger's `delay` spaces the entries; repeat delays for each entry come
   * from the child's own entry input (§13.1).
   *
   * @example
   * ```ts
   * // Five cards, each starting 100 ms after the previous.
   * const fan = Timeline.stagger(
   *   cardIn,
   *   cardElements.map((el) => target.html(el)),
   *   { delay: 100 },
   * );
   * ```
   */
  static stagger(
    child: TimelineChildInput,
    items: number | readonly RenderTarget[],
    options: TimelineStaggerOptions,
  ): Timeline {
    const context = "Timeline.stagger()";
    if (options === null || typeof options !== "object") {
      throw new TypeError(`${context} requires options such as { delay: 100 } (§14.1).`);
    }
    const interval = validateNonNegativeMs(context, "delay", options.delay);
    const order = options.order ?? "forward";
    if (order !== "forward" && order !== "reverse") {
      throw new RangeError(
        `${context} \`order\` must be "forward" or "reverse" (§14.1); received ${String(options.order)}.`,
      );
    }

    const targets: readonly (RenderTarget | undefined)[] =
      typeof items === "number"
        ? Array.from({ length: items }, (): RenderTarget | undefined => undefined)
        : items;
    if (targets.length < 1) {
      throw new RangeError(`${context} requires at least one item (§14.1).`);
    }
    if (typeof items !== "number") {
      for (const [i, t] of items.entries()) {
        if (t === null || typeof t !== "object" || typeof t.setTransform !== "function") {
          throw new TypeError(
            `${context} item array must contain render targets (§14.1); item ${i} is not one.`,
          );
        }
      }
    }

    const base = resolveChildInput(context, child);
    // Stagger options override the child input's repeat schedule; the stagger
    // interval never doubles as a repeat delay (§13.1).
    const repeat = normalizeRepeat(
      context,
      options.iterations ?? base.iterations,
      options.direction ?? base.direction,
      base.delay,
    );
    validateRepeatableSource(context, base.source, repeat);
    const duration = repeatedDuration(base.source.duration, repeat.iterations, repeat.delay);

    const count = targets.length;
    const entries: TimelineEntry[] = [];
    for (let i = 0; i < count; i++) {
      const offset = order === "forward" ? i * interval : (count - 1 - i) * interval;
      const boundTarget = targets[i];
      entries.push(
        Object.freeze({
          ...base,
          ...repeat,
          name: undefined,
          at: offset,
          target: boundTarget ?? base.target,
          duration,
        }),
      );
    }
    return new Timeline(entries);
  }

  /**
   * Evaluates the timeline deterministically at an absolute elapsed time — no
   * scheduler or render target required (§14.4). Every started child is sampled
   * at its local time `childLocalTime = timelineTime − childStart`; children
   * before their start contribute nothing, completed children follow their
   * endpoint behavior (clamped finals), and repeat schedules map through
   * iteration, delay-gap holds, and direction (§13.1). Nested timelines flatten
   * into the same sample list. When several active entries share one target the
   * last entry in schedule order wins — replacement semantics by explicit
   * ordering, never additive composition (§14.4).
   *
   * @example
   * ```ts
   * const outputs = scene.sample(300); // every child started by t = 300 ms
   * for (const output of outputs) {
   *   if (output.target !== undefined) output.target.setTransform(output.transform.toMatrix());
   * }
   * ```
   */
  sample(timeMs: number): readonly TimelineSample[] {
    if (typeof timeMs !== "number" || !Number.isFinite(timeMs)) {
      throw new TypeError("timeline.sample() requires a finite number of milliseconds (§14.4).");
    }

    const samples: TimelineSample[] = [];
    for (const entry of this.entries) {
      let localT = timeMs - entry.at;
      if (localT < 0) continue; // before start: not begun, nothing to report (§14.4)
      // Completed entries clamp to their window end and hold the endpoint
      // behavior of the underlying definition (§14.4). Zero-duration entries
      // pass positive times through so "just past the boundary" reads as the
      // terminal value, matching Animation.sample semantics.
      if (entry.duration > 0 && Number.isFinite(entry.duration) && localT > entry.duration) {
        localT = entry.duration;
      }
      const { localTime } = mapRepeatLocalTime(entry, localT);

      if (entry.source instanceof Timeline) {
        // Nested timelines flatten; inner bindings win, and unbound inner
        // outputs inherit the outer entry's name/target so wrapping a child in
        // e.g. `Timeline.repeat` keeps its placement binding (§14.4).
        for (const output of entry.source.sample(localTime)) {
          samples.push({
            name: output.name ?? entry.name,
            target: output.target ?? entry.target,
            localTime: output.localTime,
            transform: output.transform,
          });
        }
      } else {
        samples.push({
          name: entry.name,
          target: entry.target,
          localTime,
          transform: entry.source.sample(localTime),
        });
      }
    }
    return samples;
  }

  /**
   * Evaluates the timeline at normalized progress in `[0, 1]` over its total
   * duration (§14.3). Throws when the duration is infinite — progress is
   * undefined without a finite horizon; use {@link Timeline.sample} with
   * absolute milliseconds instead.
   */
  sampleProgress(progress: number): readonly TimelineSample[] {
    if (typeof progress !== "number" || !Number.isFinite(progress)) {
      throw new TypeError("timeline.sampleProgress() requires a finite number in [0, 1] (§14.3).");
    }
    if (!Number.isFinite(this.duration)) {
      throw new Error(
        "timeline.sampleProgress() is undefined for infinite-duration timelines — sample absolute milliseconds instead (§14.3).",
      );
    }
    return this.sample(clamp01(progress) * this.duration);
  }

  /**
   * Creates an independent {@link TimelinePlayback} execution instance (§16.1,
   * Appendix B.1): the playback owns one shared transport — play/pause/reverse/
   * seek/rate/cancel/dispose and the per-run `finished` promise — while every
   * child derives its local time from the single shared timeline clock. It
   * registers as one scheduled unit on the centralized `PlaybackEngine`, so
   * children never create their own clocks or frame requests (§16.1,
   * Appendix B.7). Repetition composes at both levels: playback-level options
   * repeat the whole choreography, entry repeats affect only their segment.
   *
   * @example
   * ```ts
   * const playback = scene.attach({ autoplay: true });
   * await playback.finished; // { status: "finished" } — never rejects (§12)
   * ```
   */
  attach(options?: PlaybackOptions): TimelinePlayback {
    return new TimelinePlayback(this, options);
  }
}
