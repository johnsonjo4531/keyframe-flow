import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t}from"./iframe-DXSg0uKF.js";import{i as n,r,t as i}from"./src-DfDWSzNz.js";import{i as a,n as o,r as s,t as c}from"./playback-story-w1_FZ1Kv.js";function l({duration:e,easing:t}){let i=a(()=>n.from({from:{position:[-120,-40,0]},to:{position:[120,40,0],rotation:[0,0,Math.PI/6]},duration:e,easing:t}),e=>r.html(e),[e,t]);return(0,u.jsxs)(`div`,{style:{display:`grid`,justifyItems:`center`},children:[(0,u.jsx)(`div`,{style:{width:320,height:160,position:`relative`},children:(0,u.jsx)(`div`,{ref:i.hostRef,style:{position:`absolute`,left:`50%`,top:`50%`,width:72,height:72,marginLeft:-36,marginTop:-36,borderRadius:12,background:`linear-gradient(135deg, #f97316, #db2777)`}})}),(0,u.jsx)(o,{handle:i}),(0,u.jsx)(c,{handle:i})]})}var u,d,f,p;function m(){return(m=e((()=>{i(),s(),u=t(),d={title:`Authoring/From To`,component:l,args:{duration:1200,easing:`ease-in-out`},argTypes:{duration:{control:{type:`range`,min:100,max:5e3,step:100}},easing:{control:`select`,options:[`linear`,`ease`,`ease-in`,`ease-out`,`ease-in-out`]}}},f={},typeof d==`object`&&d&&(d.parameters=Object.assign({},d.parameters,{docs:Object.assign({},d.parameters&&d.parameters.docs,{source:Object.assign({},d.parameters&&d.parameters.docs&&d.parameters.docs.source,{code:`import { Animation, target } from "keyframe-flow";
import type { Easing } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport, useKeyframePlayback } from "../playback-story";

/**
 * From/to definitions (§5.2): the simplest authoring style — an explicit
 * start transform, an end transform, and a duration in milliseconds.
 */
function FromToStory({
  duration,
  easing,
}: {
  duration: number;
  easing: string;
}): React.ReactElement {
  const handle = useKeyframePlayback(
    () =>
      Animation.from({
        from: { position: [-120, -40, 0] },
        to: { position: [120, 40, 0], rotation: [0, 0, Math.PI / 6] },
        duration,
        easing: easing as Easing,
      }),
    (host) => target.html(host),
    [duration, easing],
  );

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 320, height: 160, position: "relative" }}>
        <div
          ref={handle.hostRef}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 72,
            height: 72,
            marginLeft: -36,
            marginTop: -36,
            borderRadius: 12,
            background: "linear-gradient(135deg, #f97316, #db2777)",
          }}
        />
      </div>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Authoring/From To",
  component: FromToStory,
  args: { duration: 1200, easing: "ease-in-out" },
  argTypes: {
    duration: { control: { type: "range", min: 100, max: 5000, step: 100 } },
    easing: {
      control: "select",
      options: ["linear", "ease", "ease-in", "ease-out", "ease-in-out"],
    },
  },
} satisfies Meta<typeof FromToStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A slide + tilt driven by a plain from/to definition. */
export const SlideAndTilt: Story = {};
`,originalSource:`import { Animation, target } from "keyframe-flow";
import type { Easing } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport, useKeyframePlayback } from "../playback-story";

/**
 * From/to definitions (§5.2): the simplest authoring style — an explicit
 * start transform, an end transform, and a duration in milliseconds.
 */
function FromToStory({
  duration,
  easing,
}: {
  duration: number;
  easing: string;
}): React.ReactElement {
  const handle = useKeyframePlayback(
    () =>
      Animation.from({
        from: { position: [-120, -40, 0] },
        to: { position: [120, 40, 0], rotation: [0, 0, Math.PI / 6] },
        duration,
        easing: easing as Easing,
      }),
    (host) => target.html(host),
    [duration, easing],
  );

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 320, height: 160, position: "relative" }}>
        <div
          ref={handle.hostRef}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 72,
            height: 72,
            marginLeft: -36,
            marginTop: -36,
            borderRadius: 12,
            background: "linear-gradient(135deg, #f97316, #db2777)",
          }}
        />
      </div>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Authoring/From To",
  component: FromToStory,
  args: { duration: 1200, easing: "ease-in-out" },
  argTypes: {
    duration: { control: { type: "range", min: 100, max: 5000, step: 100 } },
    easing: {
      control: "select",
      options: ["linear", "ease", "ease-in", "ease-out", "ease-in-out"],
    },
  },
} satisfies Meta<typeof FromToStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A slide + tilt driven by a plain from/to definition. */
export const SlideAndTilt: Story = {};
`})})})),p=[`SlideAndTilt`],f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{}`,...f.parameters?.docs?.source},description:{story:`A slide + tilt driven by a plain from/to definition.`,...f.parameters?.docs?.description}}}})))()}m();export{f as SlideAndTilt,p as __namedExportsOrder,d as default};