import { mount as canvasTargetMount } from "../vanilla/canvas-target.ts";
import { mount as compositionMount } from "../vanilla/composition.ts";
import { mount as customTargetMount } from "../vanilla/custom-target.ts";
import { mount as easingGalleryMount } from "../vanilla/easing-gallery.ts";
import { mount as fromToMount } from "../vanilla/from-to.ts";
import { mount as generatorSourceMount } from "../vanilla/generator-source.ts";
import { mount as guidesCraneVsOrbitMount } from "../vanilla/guides-crane-vs-orbit.ts";
import { mount as guidesFirstAnimationMount } from "../vanilla/guides-first-animation.ts";
import { mount as guidesSampleMount } from "../vanilla/guides-sample-without-playing.ts";
import { mount as htmlTargetMount } from "../vanilla/html-target.ts";
import { mount as keyframesMount } from "../vanilla/keyframes.ts";
import { mount as lifecycleMount } from "../vanilla/lifecycle.ts";
import { mount as manualRenderLoopMount } from "../vanilla/manual-render-loop.ts";
import { mount as propertyLevelMount } from "../vanilla/property-level.ts";
import { mount as repetitionMount } from "../vanilla/repetition.ts";
import { mount as slerpVsAngularMount } from "../vanilla/slerp-vs-angular.ts";
import { mount as stressTestMount } from "../vanilla/stress-test.ts";
import { mount as supersedeMount } from "../vanilla/supersede.ts";
import { mount as svgTargetMount } from "../vanilla/svg-target.ts";
import { mount as timelineParallelMount } from "../vanilla/timeline-parallel.ts";
import { mount as timelineRepeatMount } from "../vanilla/timeline-repeat.ts";
import { mount as timelineSequenceMount } from "../vanilla/timeline-sequence.ts";
import { mount as timelineStaggerMount } from "../vanilla/timeline-stagger.ts";
import { mount as webglTargetMount } from "../vanilla/webgl-target.ts";
import { mount as webgpuTargetMount } from "../vanilla/webgpu-target.ts";
import type { VanillaMount } from "../vanilla/harness.ts";

import canvasTargetTs from "../vanilla/canvas-target.ts?raw";
import compositionTs from "../vanilla/composition.ts?raw";
import customTargetTs from "../vanilla/custom-target.ts?raw";
import easingGalleryTs from "../vanilla/easing-gallery.ts?raw";
import fromToTs from "../vanilla/from-to.ts?raw";
import generatorSourceTs from "../vanilla/generator-source.ts?raw";
import guidesCraneVsOrbitTs from "../vanilla/guides-crane-vs-orbit.ts?raw";
import guidesFirstAnimationTs from "../vanilla/guides-first-animation.ts?raw";
import guidesSampleTs from "../vanilla/guides-sample-without-playing.ts?raw";
import htmlTargetTs from "../vanilla/html-target.ts?raw";
import keyframesTs from "../vanilla/keyframes.ts?raw";
import lifecycleTs from "../vanilla/lifecycle.ts?raw";
import manualRenderLoopTs from "../vanilla/manual-render-loop.ts?raw";
import propertyLevelTs from "../vanilla/property-level.ts?raw";
import repetitionTs from "../vanilla/repetition.ts?raw";
import slerpVsAngularTs from "../vanilla/slerp-vs-angular.ts?raw";
import stressTestTs from "../vanilla/stress-test.ts?raw";
import supersedeTs from "../vanilla/supersede.ts?raw";
import svgTargetTs from "../vanilla/svg-target.ts?raw";
import timelineParallelTs from "../vanilla/timeline-parallel.ts?raw";
import timelineRepeatTs from "../vanilla/timeline-repeat.ts?raw";
import timelineSequenceTs from "../vanilla/timeline-sequence.ts?raw";
import timelineStaggerTs from "../vanilla/timeline-stagger.ts?raw";
import webglTargetTs from "../vanilla/webgl-target.ts?raw";
import webgpuTargetTs from "../vanilla/webgpu-target.ts?raw";

import canvasTargetTsx from "../stories/targets/canvas-target.stories.tsx?raw";
import compositionTsx from "../stories/authoring/composition.stories.tsx?raw";
import customTargetTsx from "../stories/targets/custom-target.stories.tsx?raw";
import easingGalleryTsx from "../stories/easing/easing-gallery.stories.tsx?raw";
import fromToTsx from "../stories/authoring/from-to.stories.tsx?raw";
import generatorSourceTsx from "../stories/authoring/generator-source.stories.tsx?raw";
import guidesCraneVsOrbitTsx from "../stories/guides/core-concepts.stories.tsx?raw";
import guidesGettingStartedTsx from "../stories/guides/getting-started.stories.tsx?raw";
import htmlTargetTsx from "../stories/targets/html-target.stories.tsx?raw";
import keyframesTsx from "../stories/authoring/keyframes.stories.tsx?raw";
import lifecycleTsx from "../stories/playback/lifecycle.stories.tsx?raw";
import manualRenderLoopTsx from "../stories/sampling/manual-render-loop.stories.tsx?raw";
import propertyLevelTsx from "../stories/authoring/property-level.stories.tsx?raw";
import repetitionTsx from "../stories/playback/repetition.stories.tsx?raw";
import slerpVsAngularTsx from "../stories/interpolation/slerp-vs-angular.stories.tsx?raw";
import stressTestTsx from "../stories/performance/stress-test.stories.tsx?raw";
import supersedeTsx from "../stories/playback/supersede.stories.tsx?raw";
import svgTargetTsx from "../stories/targets/svg-target.stories.tsx?raw";
import timelineParallelTsx from "../stories/timeline/parallel.stories.tsx?raw";
import timelineRepeatTsx from "../stories/timeline/repeat.stories.tsx?raw";
import timelineSequenceTsx from "../stories/timeline/sequence.stories.tsx?raw";
import timelineStaggerTsx from "../stories/timeline/stagger.stories.tsx?raw";
import webglTargetTsx from "../stories/targets/webgl-target.stories.tsx?raw";
import webgpuTargetTsx from "../stories/targets/webgpu-target.stories.tsx?raw";

/** One gallery example: live vanilla mount + both implementations' sources. */
export interface GalleryExample {
  /** Storybook story id — keeps docs deep links and gallery routes aligned. */
  readonly id: string;
  readonly title: string;
  readonly section: string;
  readonly description: string;
  /** File name of the vanilla module under examples/vanilla/. */
  readonly tsFile: string;
  readonly mount: VanillaMount;
  readonly args: Readonly<Record<string, unknown>>;
  readonly tsSource: string;
  readonly reactSource: string;
}

/**
 * Registry of vanilla-TypeScript twins for every Storybook example (T56).
 * Ids mirror the Storybook story ids so docs pages can deep-link here and
 * back. Args mirror each story's defaults, passed straight to the mount.
 */
export const EXAMPLES: readonly GalleryExample[] = [
  {
    id: "guides-getting-started--first-animation",
    title: "Your first animation (Getting Started)",
    section: "Guides",
    description: "The guide's three-object model, verbatim: definition, playback, HTML target.",
    mount: guidesFirstAnimationMount,
    tsFile: "guides-first-animation",
    args: {},
    tsSource: guidesFirstAnimationTs,
    reactSource: guidesGettingStartedTsx,
  },
  {
    id: "guides-getting-started--sample-without-playing",
    title: "Sample without playing (Getting Started)",
    section: "Guides",
    description:
      "The same definition evaluated by the host's own rAF loop — no playback, no target (§10).",
    mount: guidesSampleMount,
    tsFile: "guides-sample-without-playing",
    args: {},
    tsSource: guidesSampleTs,
    reactSource: guidesGettingStartedTsx,
  },
  {
    id: "guides-core-concepts--crane-vs-orbit",
    title: "Crane vs orbit (Core Concepts)",
    section: "Guides",
    description: "Composition order in local space: same operations, different endpoints (§4.4).",
    mount: guidesCraneVsOrbitMount,
    tsFile: "guides-crane-vs-orbit",
    args: {},
    tsSource: guidesCraneVsOrbitTs,
    reactSource: guidesCraneVsOrbitTsx,
  },
  {
    id: "authoring-from-to--fade-up",
    title: "Fade up (from/to)",
    section: "Authoring",
    description: "The guide's `fadeUp`: explicit from/to over a duration (§5.2).",
    mount: fromToMount,
    tsFile: "from-to",
    args: { duration: 300 },
    tsSource: fromToTs,
    reactSource: fromToTsx,
  },
  {
    id: "authoring-property-level--scale-only",
    title: "Scale only (property level)",
    section: "Authoring",
    description: "Only `scale` is animated; position and rotation are preserved (§7).",
    mount: propertyLevelMount,
    tsFile: "property-level",
    args: { duration: 250, toScale: 1.5 },
    tsSource: propertyLevelTs,
    reactSource: propertyLevelTsx,
  },
  {
    id: "authoring-keyframes--bounce",
    title: "Bounce keyframes",
    section: "Authoring",
    description:
      "The guide's `bounce`: normalized `at` in [0, 1], so re-timing only changes duration (§5.3, §6.1).",
    mount: keyframesMount,
    tsFile: "keyframes",
    args: { duration: 1200 },
    tsSource: keyframesTs,
    reactSource: keyframesTsx,
  },
  {
    id: "authoring-generator-source--orbit",
    title: "Generator-produced orbit",
    section: "Authoring",
    description:
      "Any synchronous iterable yields keyframes, consumed once at definition time (§5.4–§5.5).",
    mount: generatorSourceMount,
    tsFile: "generator-source",
    args: { duration: 4000, samples: 24 },
    tsSource: generatorSourceTs,
    reactSource: generatorSourceTsx,
  },
  {
    id: "authoring-composition--combine-tracks",
    title: "Combined move + spin + pulse tracks",
    section: "Authoring",
    description:
      "`Animation.combine` merges by property track; `group` sequences or aligns (§14, §19).",
    mount: compositionMount,
    tsFile: "composition",
    args: { duration: 1000, layout: "combine" },
    tsSource: compositionTs,
    reactSource: compositionTsx,
  },
  {
    id: "easing-easing-gallery--curves",
    title: "Easing curve gallery",
    section: "Easing",
    description: "Named curves and custom easings plotted by pure manual sampling (§8, §10).",
    mount: easingGalleryMount,
    tsFile: "easing-gallery",
    args: { name: "ease-in-out-cubic", custom: false },
    tsSource: easingGalleryTs,
    reactSource: easingGalleryTsx,
  },
  {
    id: "interpolation-slerp-vs-angular--full-revolution",
    title: "SLERP vs angular full revolution",
    section: "Interpolation",
    description:
      "Quaternion SLERP collapses a full turn; angular mode interpolates authored radians (§9).",
    mount: slerpVsAngularMount,
    tsFile: "slerp-vs-angular",
    args: { mode: "angular" },
    tsSource: slerpVsAngularTs,
    reactSource: slerpVsAngularTsx,
  },
  {
    id: "playback-lifecycle--transport-controls",
    title: "Lifecycle transport controls",
    section: "Playback",
    description: "Independent Playback state machine with transport and scrubbing (§11–§13).",
    mount: lifecycleMount,
    tsFile: "lifecycle",
    args: { duration: 1500, seek: 0 },
    tsSource: lifecycleTs,
    reactSource: lifecycleTsx,
  },
  {
    id: "playback-repetition-direction--alternate-thrice",
    title: "Three alternating iterations",
    section: "Playback",
    description: "Iteration counts and direction modes are engine-loop concerns (§13).",
    mount: repetitionMount,
    tsFile: "repetition",
    args: { duration: 1000, iterations: 3, direction: "alternate" },
    tsSource: repetitionTs,
    reactSource: repetitionTsx,
  },
  {
    id: "playback-repetition-direction--infinite-alternate",
    title: "Infinite alternate ping-pong",
    section: "Playback",
    description: '`iterations: "infinite"` — `finished` stays pending (§12, §13).',
    mount: repetitionMount,
    tsFile: "repetition",
    args: { duration: 1000, iterations: "infinite", direction: "alternate" },
    tsSource: repetitionTs,
    reactSource: repetitionTsx,
  },
  {
    id: "playback-target-supersede--ownership-transfer",
    title: "Target supersede and ownership transfer",
    section: "Playback",
    description: "A second playback on one target cancels the first (§14).",
    mount: supersedeMount,
    tsFile: "supersede",
    args: { duration: 2000 },
    tsSource: supersedeTs,
    reactSource: supersedeTsx,
  },
  {
    id: "sampling-manual-render-loop--external-loop",
    title: "Manual sampling in a host render loop",
    section: "Sampling",
    description: "No attach, no playback — the host owns time and calls sampleProgress (§10.3).",
    mount: manualRenderLoopMount,
    tsFile: "manual-render-loop",
    args: { duration: 2000 },
    tsSource: manualRenderLoopTs,
    reactSource: manualRenderLoopTsx,
  },
  {
    id: "timeline-sequence--entrance",
    title: "Sequence: rows enter back to back",
    section: "Timeline",
    description:
      "`sequence` places children by their intrinsic durations plus a gap — never re-times them (§14.1).",
    mount: timelineSequenceMount,
    tsFile: "timeline-sequence",
    args: { gap: 120 },
    tsSource: timelineSequenceTs,
    reactSource: timelineSequenceTsx,
  },
  {
    id: "timeline-parallel--endless-scene",
    title: "Parallel: finite children in an endless scene",
    section: "Timeline",
    description:
      "Children start together with independent durations; an infinite child makes the horizon infinite (§14.1, §14.3).",
    mount: timelineParallelMount,
    tsFile: "timeline-parallel",
    args: { spinDuration: 2400 },
    tsSource: timelineParallelTs,
    reactSource: timelineParallelTsx,
  },
  {
    id: "timeline-stagger--card-fan",
    title: "Stagger: a card fan from one definition",
    section: "Timeline",
    description:
      "`stagger` compiles to ordinary entries at `i × delay`, binding one render target each (§14.1).",
    mount: timelineStaggerMount,
    tsFile: "timeline-stagger",
    args: { delay: 100, order: "forward" },
    tsSource: timelineStaggerTs,
    reactSource: timelineStaggerTsx,
  },
  {
    id: "timeline-repeat--alternate-pulse",
    title: "Repeat: alternating pulse without snapping",
    section: "Timeline",
    description: '`direction: "alternate"` ping-pongs progress between iterations (§13.1).',
    mount: timelineRepeatMount,
    tsFile: "timeline-repeat",
    args: { layout: "pulse", iterations: 6, delay: 300 },
    tsSource: timelineRepeatTs,
    reactSource: timelineRepeatTsx,
  },
  {
    id: "timeline-repeat--repeated-choreography",
    title: "Repeat: a whole sequence repeated with gaps",
    section: "Timeline",
    description:
      "`repeat` wraps a child in one compact entry — terminal values hold across each delay gap (§14.2, §13.1).",
    mount: timelineRepeatMount,
    tsFile: "timeline-repeat",
    args: { layout: "choreography", iterations: 3, delay: 300 },
    tsSource: timelineRepeatTs,
    reactSource: timelineRepeatTsx,
  },
  {
    id: "targets-custom-structural-target--matrix-recorder",
    title: "Custom structural target recording matrices",
    section: "Targets",
    description: "Any object with setTransform(matrix) is a render target (§17.1).",
    mount: customTargetMount,
    tsFile: "custom-target",
    args: { duration: 1600 },
    tsSource: customTargetTs,
    reactSource: customTargetTsx,
  },
  {
    id: "targets-html-adapter--matrix-3-d",
    title: "HTML adapter writing matrix3d",
    section: "Targets",
    description: "The HTML adapter owns the inline transform property (§17).",
    mount: htmlTargetMount,
    tsFile: "html-target",
    args: { duration: 1400, origin: "default" },
    tsSource: htmlTargetTs,
    reactSource: htmlTargetTsx,
  },
  {
    id: "targets-svg-adapter--matrix-attribute",
    title: "SVG adapter writing the matrix attribute",
    section: "Targets",
    description: 'SVG 1.1 transform="matrix(a,b,c,d,e,f)" from column vectors (§17).',
    mount: svgTargetMount,
    tsFile: "svg-target",
    args: { duration: 1400 },
    tsSource: svgTargetTs,
    reactSource: svgTargetTsx,
  },
  {
    id: "targets-canvas-2d-adapter--projected-motion",
    title: "Canvas 2D adapter with projected CTM",
    section: "Targets",
    description: "The 4×4 matrix goes through an explicit projection step (§17.3).",
    mount: canvasTargetMount,
    tsFile: "canvas-target",
    args: { duration: 1800, perspective: 400 },
    tsSource: canvasTargetTs,
    reactSource: canvasTargetTsx,
  },
  {
    id: "targets-webgl-adapter--uniform-upload",
    title: "WebGL adapter uploading a mat4 uniform",
    section: "Targets",
    description: "A column-major Float32Array handed straight to uniformMatrix4fv (§3.6, §15.2).",
    mount: webglTargetMount,
    tsFile: "webgl-target",
    args: { duration: 1600 },
    tsSource: webglTargetTs,
    reactSource: webglTargetTsx,
  },
  {
    id: "targets-webgpu-adapter--uniform-write",
    title: "WebGPU adapter uniform buffer write values",
    section: "Targets",
    description: "Each frame hands the host a Float32Array ready for queue.writeBuffer (§3.6).",
    mount: webgpuTargetMount,
    tsFile: "webgpu-target",
    args: { duration: 1600 },
    tsSource: webgpuTargetTs,
    reactSource: webgpuTargetTsx,
  },
  {
    id: "performance-stress-test--heavy-field",
    title: "Stress test: heavy animated field",
    section: "Performance",
    description:
      "One shared definition, hundreds of independent playbacks on one centralized frame loop — add elements live and watch FPS hold (§16).",
    mount: stressTestMount,
    tsFile: "stress-test",
    args: { count: 150, duration: 900 },
    tsSource: stressTestTs,
    reactSource: stressTestTsx,
  },
];
