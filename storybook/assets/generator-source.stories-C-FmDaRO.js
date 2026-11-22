import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,p as n}from"./iframe-CE9T6iTY.js";import{i as r,r as i,s as a,t as o}from"./src-B0K7CDl1.js";import{n as s,r as c,t as l}from"./playback-story-Dz0vCChe.js";import{r as u,t as d}from"./react-C8WRvr0x.js";function*f(e){for(let t=0;t<=e;t++){let n=t/e*Math.PI*2;yield{at:t/e,transform:a().translate(Math.cos(n)*80,Math.sin(n)*80)}}}function p({duration:e,samples:t}){let n=(0,m.useMemo)(()=>r.from({duration:e,keyframes:f(t)}),[e,t]),a=(0,m.useCallback)(e=>i.html(e),[]),o=u(n,{autoplay:!0,makeTarget:a});return(0,h.jsxs)(`div`,{style:{display:`grid`,justifyItems:`center`},children:[(0,h.jsx)(`div`,{style:{width:320,height:200,position:`relative`},children:(0,h.jsx)(`div`,{ref:o.ref,style:{position:`absolute`,left:`50%`,top:`50%`,width:48,height:48,marginLeft:-24,marginTop:-24,borderRadius:8,background:`linear-gradient(135deg, #eab308, #ef4444)`}})}),(0,h.jsx)(s,{handle:o}),(0,h.jsx)(l,{handle:o})]})}var m,h,g,_,v;function y(){return(y=e((()=>{o(),m=n(),c(),d(),h=t(),g={title:`Authoring/Generator Source`,component:p,args:{duration:4e3,samples:24},argTypes:{duration:{control:{type:`range`,min:500,max:8e3,step:100}},samples:{control:{type:`range`,min:4,max:64,step:2}}}},_={},typeof g==`object`&&g&&(g.parameters=Object.assign({},g.parameters,{docs:Object.assign({},g.parameters&&g.parameters.docs,{source:Object.assign({},g.parameters&&g.parameters.docs&&g.parameters.docs.source,{code:`import { Animation, target, transform } from "keyframe-flow";
import type { TransformKeyframe } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useMemo } from "react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

/** The guide's \`orbitKeyframes\`: a circle of radius 80, one keyframe per step. */
function* orbitKeyframes(count: number): Generator<TransformKeyframe> {
  for (let i = 0; i <= count; i++) {
    const angle = (i / count) * Math.PI * 2;
    yield {
      at: i / count,
      transform: transform().translate(Math.cos(angle) * 80, Math.sin(angle) * 80),
    };
  }
}

/**
 * Generator sources (§5.4–§5.5), mirroring the \`orbit\` snippet in the
 * [Animation authoring guide](https://johnsonjo4531.github.io/keyframe-flow/docs/animation-authoring/):
 * any synchronous iterable is a keyframe source, consumed eagerly and exactly
 * once when \`Animation.from()\` runs — playback afterwards reads a frozen
 * shared timeline, so the generator never re-runs per frame.
 */
function GeneratorStory({
  duration,
  samples,
}: {
  duration: number;
  samples: number;
}): React.ReactElement {
  const animation = useMemo(
    () => Animation.from({ duration, keyframes: orbitKeyframes(samples) }),
    [duration, samples],
  );
  const makeTarget = useCallback((host: HTMLElement) => target.html(host), []);
  const handle = useKeyframePlayback(animation, { autoplay: true, makeTarget });

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 320, height: 200, position: "relative" }}>
        <div
          ref={handle.ref}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 48,
            height: 48,
            marginLeft: -24,
            marginTop: -24,
            borderRadius: 8,
            background: "linear-gradient(135deg, #eab308, #ef4444)",
          }}
        />
      </div>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Authoring/Generator Source",
  component: GeneratorStory,
  args: {
    duration: 4000, // the guide's orbit duration
    samples: 24,
  },
  argTypes: {
    duration: { control: { type: "range", min: 500, max: 8000, step: 100 } },
    samples: { control: { type: "range", min: 4, max: 64, step: 2 } },
  },
} satisfies Meta<typeof GeneratorStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The guide's \`orbit\`: 24 circular keyframes produced by a generator function. */
export const Orbit: Story = {};
`,originalSource:`import { Animation, target, transform } from "keyframe-flow";
import type { TransformKeyframe } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useMemo } from "react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

/** The guide's \`orbitKeyframes\`: a circle of radius 80, one keyframe per step. */
function* orbitKeyframes(count: number): Generator<TransformKeyframe> {
  for (let i = 0; i <= count; i++) {
    const angle = (i / count) * Math.PI * 2;
    yield {
      at: i / count,
      transform: transform().translate(Math.cos(angle) * 80, Math.sin(angle) * 80),
    };
  }
}

/**
 * Generator sources (§5.4–§5.5), mirroring the \`orbit\` snippet in the
 * [Animation authoring guide](https://johnsonjo4531.github.io/keyframe-flow/docs/animation-authoring/):
 * any synchronous iterable is a keyframe source, consumed eagerly and exactly
 * once when \`Animation.from()\` runs — playback afterwards reads a frozen
 * shared timeline, so the generator never re-runs per frame.
 */
function GeneratorStory({
  duration,
  samples,
}: {
  duration: number;
  samples: number;
}): React.ReactElement {
  const animation = useMemo(
    () => Animation.from({ duration, keyframes: orbitKeyframes(samples) }),
    [duration, samples],
  );
  const makeTarget = useCallback((host: HTMLElement) => target.html(host), []);
  const handle = useKeyframePlayback(animation, { autoplay: true, makeTarget });

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 320, height: 200, position: "relative" }}>
        <div
          ref={handle.ref}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 48,
            height: 48,
            marginLeft: -24,
            marginTop: -24,
            borderRadius: 8,
            background: "linear-gradient(135deg, #eab308, #ef4444)",
          }}
        />
      </div>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Authoring/Generator Source",
  component: GeneratorStory,
  args: {
    duration: 4000, // the guide's orbit duration
    samples: 24,
  },
  argTypes: {
    duration: { control: { type: "range", min: 500, max: 8000, step: 100 } },
    samples: { control: { type: "range", min: 4, max: 64, step: 2 } },
  },
} satisfies Meta<typeof GeneratorStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The guide's \`orbit\`: 24 circular keyframes produced by a generator function. */
export const Orbit: Story = {};
`})})})),v=[`Orbit`],_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{}`,..._.parameters?.docs?.source},description:{story:"The guide's `orbit`: 24 circular keyframes produced by a generator function.",..._.parameters?.docs?.description}}}})))()}y();export{_ as Orbit,v as __namedExportsOrder,g as default};