/**
 * Custom easing function (§8): maps normalized progress in `[0, 1]` to an
 * eased value. Values outside `[0, 1]` are permitted (overshoot) but must be
 * finite; non-finite results throw at sampling time.
 */
export type EasingFunction = (progress: number) => number;

/** The identity easing — the default when no easing is specified (§8). */
export const linear: EasingFunction = (progress) => progress;

const BEZIER_TOLERANCE = 1e-6;
const NEWTON_ITERATIONS = 8;

/** Cubic Bézier axis polynomial with fixed endpoints P0=0, P3=1. */
function bezierAxis(c1: number, c2: number, t: number): number {
  const inv = 1 - t;
  return 3 * inv * inv * t * c1 + 3 * inv * t * t * c2 + t * t * t;
}

/** Derivative of `bezierAxis` with respect to `t`. */
function bezierAxisDerivative(c1: number, c2: number, t: number): number {
  const inv = 1 - t;
  return 3 * inv * inv * c1 + 6 * inv * t * (c2 - c1) + 3 * t * t * (1 - c2);
}

/** Solves `bezierAxis(x1, x2, t) = x` for `t` in `[0, 1]`. */
function solveCurveX(x: number, x1: number, x2: number): number {
  // Newton–Raphson converges fast for well-behaved curves.
  let t = x;
  for (let i = 0; i < NEWTON_ITERATIONS; i++) {
    const error = bezierAxis(x1, x2, t) - x;
    if (Math.abs(error) < BEZIER_TOLERANCE) return t;
    const derivative = bezierAxisDerivative(x1, x2, t);
    if (Math.abs(derivative) < 1e-7) break;
    t -= error / derivative;
  }

  // Guaranteed-convergent bisection fallback over the monotonic X curve.
  let lo = 0;
  let hi = 1;
  while (hi - lo > BEZIER_TOLERANCE) {
    const mid = (lo + hi) / 2;
    if (bezierAxis(x1, x2, mid) < x) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}

/**
 * Creates an easing from a cubic Bézier curve with control points
 * `(x1, y1)` and `(x2, y2)`, matching CSS timing-function semantics.
 */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): EasingFunction {
  return (progress) => {
    const p = progress < 0 ? 0 : progress > 1 ? 1 : progress;
    if (p === 0) return 0;
    if (p === 1) return 1;
    return bezierAxis(y1, y2, solveCurveX(p, x1, x2));
  };
}

/**
 * Built-in named easings (§8): the common linear / ease-in / ease-out /
 * ease-in-out variants. The bare `ease*` names follow CSS timing-function
 * curves; the suffixed variants are the standard sine/quad/cubic/quart/
 * quint/expo/circ families.
 */
const builtinEasings = {
  linear,

  ease: cubicBezier(0.25, 0.1, 0.25, 1),
  "ease-in": cubicBezier(0.42, 0, 1, 1),
  "ease-out": cubicBezier(0, 0, 0.58, 1),
  "ease-in-out": cubicBezier(0.42, 0, 0.58, 1),

  "ease-in-sine": (t: number) => 1 - Math.cos((t * Math.PI) / 2),
  "ease-out-sine": (t: number) => Math.sin((t * Math.PI) / 2),
  "ease-in-out-sine": (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,

  "ease-in-quad": (t: number) => t * t,
  "ease-out-quad": (t: number) => 1 - (1 - t) * (1 - t),
  "ease-in-out-quad": (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2),

  "ease-in-cubic": (t: number) => t ** 3,
  "ease-out-cubic": (t: number) => 1 - (1 - t) ** 3,
  "ease-in-out-cubic": (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),

  "ease-in-quart": (t: number) => t ** 4,
  "ease-out-quart": (t: number) => 1 - (1 - t) ** 4,
  "ease-in-out-quart": (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2),

  "ease-in-quint": (t: number) => t ** 5,
  "ease-out-quint": (t: number) => 1 - (1 - t) ** 5,
  "ease-in-out-quint": (t: number) => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2),

  "ease-in-expo": (t: number) => (t === 0 ? 0 : 2 ** (10 * t - 10)),
  "ease-out-expo": (t: number) => (t === 1 ? 1 : 1 - 2 ** (-10 * t)),
  "ease-in-out-expo": (t: number) =>
    t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (1 - 20 * t)) / 2,

  "ease-in-circ": (t: number) => 1 - Math.sqrt(1 - t * t),
  "ease-out-circ": (t: number) => Math.sqrt(1 - (t - 1) ** 2),
  "ease-in-out-circ": (t: number) =>
    t < 0.5 ? (1 - Math.sqrt(1 - (2 * t) ** 2)) / 2 : (Math.sqrt(1 - (-2 * t + 2) ** 2) + 1) / 2,
  // The explicit `EasingName` union (below) is the public contract; `satisfies`
  // keeps it exhaustive in both directions — a name added or removed here that
  // drifts from the union fails to compile.
} as const satisfies Record<EasingName, EasingFunction>;

/** A built-in easing name such as `"linear"` or `"ease-in-out-cubic"` (§8). */
export type EasingName =
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "ease-in-sine"
  | "ease-out-sine"
  | "ease-in-out-sine"
  | "ease-in-quad"
  | "ease-out-quad"
  | "ease-in-out-quad"
  | "ease-in-cubic"
  | "ease-out-cubic"
  | "ease-in-out-cubic"
  | "ease-in-quart"
  | "ease-out-quart"
  | "ease-in-out-quart"
  | "ease-in-quint"
  | "ease-out-quint"
  | "ease-in-out-quint"
  | "ease-in-expo"
  | "ease-out-expo"
  | "ease-in-out-expo"
  | "ease-in-circ"
  | "ease-out-circ"
  | "ease-in-out-circ";

/**
 * Any easing: a built-in name or a custom function. Custom easings need no
 * global registration (§8).
 */
export type Easing = EasingName | EasingFunction;

/**
 * Resolves an easing option to a callable function, validating named easings
 * eagerly so unknown names fail explicitly instead of silently defaulting.
 */
export function resolveEasing(
  easing: Easing | undefined,
  fallback: EasingFunction,
): EasingFunction {
  if (easing === undefined) return fallback;
  if (typeof easing === "function") return easing;
  const named = (builtinEasings as Record<string, EasingFunction | undefined>)[easing];
  if (named === undefined) {
    throw new Error(
      `Unknown easing name "${String(easing)}". Expected one of: ${Object.keys(builtinEasings).join(", ")}, or an easing function.`,
    );
  }
  return named;
}
