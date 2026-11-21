import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,p as n}from"./iframe-BjydkunC.js";import{i as r,r as i,t as a}from"./src-CIE5dN4r.js";import{i as o,n as s,r as c,t as l}from"./playback-story-5Ss6VQ81.js";function u({duration:e,seek:t}){let n=o(()=>r.from({from:{position:[-130,0,0],rotation:[0,0,-Math.PI/3]},to:{position:[130,0,0],rotation:[0,0,Math.PI/3]},duration:e,easing:`ease-in-out`}),e=>i.html(e),[e]);return(0,d.useEffect)(()=>{n.seekProgress(t)},[t]),(0,f.jsxs)(`div`,{style:{display:`grid`,justifyItems:`center`},children:[(0,f.jsx)(`div`,{style:{width:360,height:140,position:`relative`},children:(0,f.jsx)(`div`,{ref:n.hostRef,style:{position:`absolute`,left:`50%`,top:`50%`,width:64,height:64,marginLeft:-32,marginTop:-32,borderRadius:12,background:`linear-gradient(135deg, #ec4899, #8b5cf6)`}})}),(0,f.jsx)(s,{handle:n}),(0,f.jsx)(l,{handle:n})]})}var d,f,p,m,h;function g(){return(g=e((()=>{a(),d=n(),c(),f=t(),p={title:`Playback/Lifecycle`,component:u,args:{duration:1500,seek:0},argTypes:{duration:{control:{type:`range`,min:200,max:6e3,step:100}},seek:{control:{type:`range`,min:0,max:1,step:.01}}}},m={},typeof p==`object`&&p&&(p.parameters=Object.assign({},p.parameters,{docs:Object.assign({},p.parameters&&p.parameters.docs,{source:Object.assign({},p.parameters&&p.parameters.docs&&p.parameters.docs.source,{code:`import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import { useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport, useKeyframePlayback } from "../playback-story";

/**
 * Playback & lifecycle (§11–§13): independent \`Playback\` state machine with
 * transport controls and scrubbing. State readout shows §12 transitions live;
 * \`finished\` resolves \`finished | cancelled\` and never rejects.
 */
function LifecycleStory({
  duration,
  seek,
}: {
  duration: number;
  seek: number;
}): React.ReactElement {
  const handle = useKeyframePlayback(
    () =>
      Animation.from({
        from: { position: [-130, 0, 0], rotation: [0, 0, -Math.PI / 3] },
        to: { position: [130, 0, 0], rotation: [0, 0, Math.PI / 3] },
        duration,
        easing: "ease-in-out",
      }),
    (host) => target.html(host),
    [duration],
  );

  // Scrub via seekProgress — clamped to [0, 1] by the engine (§12).
  useEffect(() => {
    handle.seekProgress(seek);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seek]);

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 360, height: 140, position: "relative" }}>
        <div
          ref={handle.hostRef}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 64,
            height: 64,
            marginLeft: -32,
            marginTop: -32,
            borderRadius: 12,
            background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
          }}
        />
      </div>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Playback/Lifecycle",
  component: LifecycleStory,
  args: { duration: 1500, seek: 0 },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 6000, step: 100 } },
    seek: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
  },
} satisfies Meta<typeof LifecycleStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Full transport: play, pause, reverse, cancel — plus a progress scrubber. */
export const TransportControls: Story = {};
`,originalSource:`import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import { useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport, useKeyframePlayback } from "../playback-story";

/**
 * Playback & lifecycle (§11–§13): independent \`Playback\` state machine with
 * transport controls and scrubbing. State readout shows §12 transitions live;
 * \`finished\` resolves \`finished | cancelled\` and never rejects.
 */
function LifecycleStory({
  duration,
  seek,
}: {
  duration: number;
  seek: number;
}): React.ReactElement {
  const handle = useKeyframePlayback(
    () =>
      Animation.from({
        from: { position: [-130, 0, 0], rotation: [0, 0, -Math.PI / 3] },
        to: { position: [130, 0, 0], rotation: [0, 0, Math.PI / 3] },
        duration,
        easing: "ease-in-out",
      }),
    (host) => target.html(host),
    [duration],
  );

  // Scrub via seekProgress — clamped to [0, 1] by the engine (§12).
  useEffect(() => {
    handle.seekProgress(seek);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seek]);

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 360, height: 140, position: "relative" }}>
        <div
          ref={handle.hostRef}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 64,
            height: 64,
            marginLeft: -32,
            marginTop: -32,
            borderRadius: 12,
            background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
          }}
        />
      </div>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Playback/Lifecycle",
  component: LifecycleStory,
  args: { duration: 1500, seek: 0 },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 6000, step: 100 } },
    seek: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
  },
} satisfies Meta<typeof LifecycleStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Full transport: play, pause, reverse, cancel — plus a progress scrubber. */
export const TransportControls: Story = {};
`})})})),h=[`TransportControls`],m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{}`,...m.parameters?.docs?.source},description:{story:`Full transport: play, pause, reverse, cancel — plus a progress scrubber.`,...m.parameters?.docs?.description}}}})))()}g();export{m as TransportControls,h as __namedExportsOrder,p as default};