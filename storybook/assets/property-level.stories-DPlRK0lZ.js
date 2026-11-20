import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t}from"./iframe-DXSg0uKF.js";import{i as n,r,t as i}from"./src-DfDWSzNz.js";import{i as a,n as o,r as s,t as c}from"./playback-story-w1_FZ1Kv.js";function l({duration:e,toScale:t}){let i=a(()=>n.from({from:{position:[-60,20,0],rotation:[0,0,-Math.PI/8]},to:{scale:t},duration:e}),e=>r.html(e),[e,t]);return(0,u.jsxs)(`div`,{style:{display:`grid`,justifyItems:`center`},children:[(0,u.jsx)(`div`,{style:{width:320,height:160,position:`relative`},children:(0,u.jsx)(`div`,{ref:i.hostRef,style:{position:`absolute`,left:`50%`,top:`50%`,width:72,height:72,marginLeft:-36,marginTop:-36,borderRadius:12,background:`linear-gradient(135deg, #0ea5e9, #22c55e)`}})}),(0,u.jsx)(o,{handle:i}),(0,u.jsx)(c,{handle:i})]})}var u,d,f,p;function m(){return(m=e((()=>{i(),s(),u=t(),d={title:`Authoring/Property Level`,component:l,args:{duration:900,toScale:1.8},argTypes:{duration:{control:{type:`range`,min:100,max:5e3,step:100}},toScale:{control:{type:`range`,min:.2,max:3,step:.1}}}},f={},typeof d==`object`&&d&&(d.parameters=Object.assign({},d.parameters,{docs:Object.assign({},d.parameters&&d.parameters.docs,{source:Object.assign({},d.parameters&&d.parameters.docs&&d.parameters.docs.source,{code:`import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport, useKeyframePlayback } from "../playback-story";

/**
 * Property-level definitions (§7): specify only the properties that change —
 * everything else is preserved from the start transform. Here only \`scale\`
 * animates; position and rotation stay exactly as authored.
 */
function PropertyLevelStory({
  duration,
  toScale,
}: {
  duration: number;
  toScale: number;
}): React.ReactElement {
  const handle = useKeyframePlayback(
    () =>
      Animation.from({
        from: { position: [-60, 20, 0], rotation: [0, 0, -Math.PI / 8] },
        to: { scale: toScale }, // only scale changes (§7)
        duration,
      }),
    (host) => target.html(host),
    [duration, toScale],
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
            background: "linear-gradient(135deg, #0ea5e9, #22c55e)",
          }}
        />
      </div>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Authoring/Property Level",
  component: PropertyLevelStory,
  args: { duration: 900, toScale: 1.8 },
  argTypes: {
    duration: { control: { type: "range", min: 100, max: 5000, step: 100 } },
    toScale: { control: { type: "range", min: 0.2, max: 3, step: 0.1 } },
  },
} satisfies Meta<typeof PropertyLevelStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A scale-only animation over a non-identity start transform. */
export const ScaleOnly: Story = {};
`,originalSource:`import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport, useKeyframePlayback } from "../playback-story";

/**
 * Property-level definitions (§7): specify only the properties that change —
 * everything else is preserved from the start transform. Here only \`scale\`
 * animates; position and rotation stay exactly as authored.
 */
function PropertyLevelStory({
  duration,
  toScale,
}: {
  duration: number;
  toScale: number;
}): React.ReactElement {
  const handle = useKeyframePlayback(
    () =>
      Animation.from({
        from: { position: [-60, 20, 0], rotation: [0, 0, -Math.PI / 8] },
        to: { scale: toScale }, // only scale changes (§7)
        duration,
      }),
    (host) => target.html(host),
    [duration, toScale],
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
            background: "linear-gradient(135deg, #0ea5e9, #22c55e)",
          }}
        />
      </div>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Authoring/Property Level",
  component: PropertyLevelStory,
  args: { duration: 900, toScale: 1.8 },
  argTypes: {
    duration: { control: { type: "range", min: 100, max: 5000, step: 100 } },
    toScale: { control: { type: "range", min: 0.2, max: 3, step: 0.1 } },
  },
} satisfies Meta<typeof PropertyLevelStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A scale-only animation over a non-identity start transform. */
export const ScaleOnly: Story = {};
`})})})),p=[`ScaleOnly`],f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{}`,...f.parameters?.docs?.source},description:{story:`A scale-only animation over a non-identity start transform.`,...f.parameters?.docs?.description}}}})))()}m();export{f as ScaleOnly,p as __namedExportsOrder,d as default};