import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t}from"./iframe-BjydkunC.js";import{i as n,r,t as i}from"./src-CIE5dN4r.js";import{i as a,n as o,r as s,t as c}from"./playback-story-5Ss6VQ81.js";function*l(e){for(let t=0;t<=e;t++){let n=t/e,r=n*Math.PI*2;yield{at:n,transform:{position:[Math.cos(r)*110,Math.sin(r)*70,0],rotation:[0,0,r]}}}}function u({duration:e,samples:t}){let i=a(()=>n.from({duration:e,keyframes:l(t)}),e=>r.html(e),[e,t]);return(0,d.jsxs)(`div`,{style:{display:`grid`,justifyItems:`center`},children:[(0,d.jsx)(`div`,{style:{width:320,height:200,position:`relative`},children:(0,d.jsx)(`div`,{ref:i.hostRef,style:{position:`absolute`,left:`50%`,top:`50%`,width:48,height:48,marginLeft:-24,marginTop:-24,borderRadius:8,background:`linear-gradient(135deg, #eab308, #ef4444)`}})}),(0,d.jsx)(o,{handle:i}),(0,d.jsx)(c,{handle:i})]})}var d,f,p,m;function h(){return(h=e((()=>{i(),s(),d=t(),f={title:`Authoring/Generator Source`,component:u,args:{duration:3e3,samples:24},argTypes:{duration:{control:{type:`range`,min:500,max:8e3,step:100}},samples:{control:{type:`range`,min:4,max:64,step:2}}}},p={},typeof f==`object`&&f&&(f.parameters=Object.assign({},f.parameters,{docs:Object.assign({},f.parameters&&f.parameters.docs,{source:Object.assign({},f.parameters&&f.parameters.docs&&f.parameters.docs.source,{code:`import { Animation, target } from "keyframe-flow";
import type { TransformKeyframe } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport, useKeyframePlayback } from "../playback-story";

/** Generator keyframes (§5.4): any synchronous iterable works (§5.3). */
function* orbitKeyframes(samples: number): Generator<TransformKeyframe> {
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const angle = t * Math.PI * 2;
    yield {
      at: t,
      transform: {
        position: [Math.cos(angle) * 110, Math.sin(angle) * 70, 0],
        rotation: [0, 0, angle], // keep the box facing along the path
      },
    };
  }
}

/**
 * Generator sources (§5.4–§5.5): \`Animation.from\` consumes the iterable
 * eagerly and exactly once at definition time — playback afterwards reads a
 * frozen shared timeline, so generators never re-run per frame.
 */
function GeneratorStory({
  duration,
  samples,
}: {
  duration: number;
  samples: number;
}): React.ReactElement {
  const handle = useKeyframePlayback(
    () => Animation.from({ duration, keyframes: orbitKeyframes(samples) }),
    (host) => target.html(host),
    [duration, samples],
  );

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 320, height: 200, position: "relative" }}>
        <div
          ref={handle.hostRef}
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
  args: { duration: 3000, samples: 24 },
  argTypes: {
    duration: { control: { type: "range", min: 500, max: 8000, step: 100 } },
    samples: { control: { type: "range", min: 4, max: 64, step: 2 } },
  },
} satisfies Meta<typeof GeneratorStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An elliptical orbit generated from a factory function. */
export const Orbit: Story = {};
`,originalSource:`import { Animation, target } from "keyframe-flow";
import type { TransformKeyframe } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport, useKeyframePlayback } from "../playback-story";

/** Generator keyframes (§5.4): any synchronous iterable works (§5.3). */
function* orbitKeyframes(samples: number): Generator<TransformKeyframe> {
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const angle = t * Math.PI * 2;
    yield {
      at: t,
      transform: {
        position: [Math.cos(angle) * 110, Math.sin(angle) * 70, 0],
        rotation: [0, 0, angle], // keep the box facing along the path
      },
    };
  }
}

/**
 * Generator sources (§5.4–§5.5): \`Animation.from\` consumes the iterable
 * eagerly and exactly once at definition time — playback afterwards reads a
 * frozen shared timeline, so generators never re-run per frame.
 */
function GeneratorStory({
  duration,
  samples,
}: {
  duration: number;
  samples: number;
}): React.ReactElement {
  const handle = useKeyframePlayback(
    () => Animation.from({ duration, keyframes: orbitKeyframes(samples) }),
    (host) => target.html(host),
    [duration, samples],
  );

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 320, height: 200, position: "relative" }}>
        <div
          ref={handle.hostRef}
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
  args: { duration: 3000, samples: 24 },
  argTypes: {
    duration: { control: { type: "range", min: 500, max: 8000, step: 100 } },
    samples: { control: { type: "range", min: 4, max: 64, step: 2 } },
  },
} satisfies Meta<typeof GeneratorStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An elliptical orbit generated from a factory function. */
export const Orbit: Story = {};
`})})})),m=[`Orbit`],p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{}`,...p.parameters?.docs?.source},description:{story:`An elliptical orbit generated from a factory function.`,...p.parameters?.docs?.description}}}})))()}h();export{p as Orbit,m as __namedExportsOrder,f as default};