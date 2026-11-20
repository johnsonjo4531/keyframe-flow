import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t}from"./iframe-DXSg0uKF.js";import{i as n,r,t as i}from"./src-DfDWSzNz.js";import{i as a,n as o,r as s,t as c}from"./playback-story-w1_FZ1Kv.js";function l({duration:e,iterations:t,direction:i}){let s=a(()=>n.from({from:{position:[-140,0,0]},to:{position:[140,0,0],scale:1.5},duration:e,easing:`ease-in-out`}),e=>r.html(e),[e,t,i],()=>({iterations:t,direction:i}));return(0,u.jsxs)(`div`,{style:{display:`grid`,justifyItems:`center`},children:[(0,u.jsx)(`div`,{style:{width:360,height:140,position:`relative`},children:(0,u.jsx)(`div`,{ref:s.hostRef,style:{position:`absolute`,left:`50%`,top:`50%`,width:64,height:64,marginLeft:-32,marginTop:-32,borderRadius:12,background:`linear-gradient(135deg, #f97316, #eab308)`}})}),(0,u.jsx)(o,{handle:s}),(0,u.jsx)(c,{handle:s})]})}var u,d,f,p,m;function h(){return(h=e((()=>{i(),s(),u=t(),d={title:`Playback/Repetition & Direction`,component:l,args:{duration:1e3,iterations:3,direction:`alternate`},argTypes:{duration:{control:{type:`range`,min:200,max:4e3,step:100}},iterations:{control:{type:`number`,min:1}},direction:{control:`inline-radio`,options:[`normal`,`reverse`,`alternate`,`alternate-reverse`]}}},f={},p={args:{iterations:`infinite`,direction:`alternate`}},typeof d==`object`&&d&&(d.parameters=Object.assign({},d.parameters,{docs:Object.assign({},d.parameters&&d.parameters.docs,{source:Object.assign({},d.parameters&&d.parameters.docs&&d.parameters.docs.source,{code:`import { Animation, target } from "keyframe-flow";
import type { PlaybackDirectionMode } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport, useKeyframePlayback } from "../playback-story";

/**
 * Repetition & direction (§13): iteration counts (finite or infinite) and
 * direction modes are handled by the engine loop — keyframes are never
 * duplicated, and multiple boundaries can cross in one frame without losing
 * sync. Changing an option re-attaches a fresh playback (§11 options are set
 * at attach time).
 */
function RepetitionStory({
  duration,
  iterations,
  direction,
}: {
  duration: number;
  iterations: number | "infinite";
  direction: PlaybackDirectionMode;
}): React.ReactElement {
  const handle = useKeyframePlayback(
    () =>
      Animation.from({
        from: { position: [-140, 0, 0] },
        to: { position: [140, 0, 0], scale: 1.5 },
        duration,
        easing: "ease-in-out",
      }),
    (host) => target.html(host),
    [duration, iterations, direction], // any option change re-attaches
    () => ({ iterations, direction }),
  );

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
            background: "linear-gradient(135deg, #f97316, #eab308)",
          }}
        />
      </div>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Playback/Repetition & Direction",
  component: RepetitionStory,
  args: {
    duration: 1000,
    iterations: 3 as number | "infinite",
    direction: "alternate" as PlaybackDirectionMode,
  },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 4000, step: 100 } },
    iterations: { control: { type: "number", min: 1 } },
    direction: {
      control: "inline-radio",
      options: ["normal", "reverse", "alternate", "alternate-reverse"],
    },
  },
} satisfies Meta<typeof RepetitionStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Three alternating back-and-forth passes. */
export const AlternateThrice: Story = {};

/** Never-ending alternate ping-pong — \`finished\` stays pending (§12). */
export const InfiniteAlternate: Story = {
  args: { iterations: "infinite", direction: "alternate" },
};
`,originalSource:`import { Animation, target } from "keyframe-flow";
import type { PlaybackDirectionMode } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport, useKeyframePlayback } from "../playback-story";

/**
 * Repetition & direction (§13): iteration counts (finite or infinite) and
 * direction modes are handled by the engine loop — keyframes are never
 * duplicated, and multiple boundaries can cross in one frame without losing
 * sync. Changing an option re-attaches a fresh playback (§11 options are set
 * at attach time).
 */
function RepetitionStory({
  duration,
  iterations,
  direction,
}: {
  duration: number;
  iterations: number | "infinite";
  direction: PlaybackDirectionMode;
}): React.ReactElement {
  const handle = useKeyframePlayback(
    () =>
      Animation.from({
        from: { position: [-140, 0, 0] },
        to: { position: [140, 0, 0], scale: 1.5 },
        duration,
        easing: "ease-in-out",
      }),
    (host) => target.html(host),
    [duration, iterations, direction], // any option change re-attaches
    () => ({ iterations, direction }),
  );

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
            background: "linear-gradient(135deg, #f97316, #eab308)",
          }}
        />
      </div>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Playback/Repetition & Direction",
  component: RepetitionStory,
  args: {
    duration: 1000,
    iterations: 3 as number | "infinite",
    direction: "alternate" as PlaybackDirectionMode,
  },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 4000, step: 100 } },
    iterations: { control: { type: "number", min: 1 } },
    direction: {
      control: "inline-radio",
      options: ["normal", "reverse", "alternate", "alternate-reverse"],
    },
  },
} satisfies Meta<typeof RepetitionStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Three alternating back-and-forth passes. */
export const AlternateThrice: Story = {};

/** Never-ending alternate ping-pong — \`finished\` stays pending (§12). */
export const InfiniteAlternate: Story = {
  args: { iterations: "infinite", direction: "alternate" },
};
`})})})),m=[`AlternateThrice`,`InfiniteAlternate`],f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{}`,...f.parameters?.docs?.source},description:{story:`Three alternating back-and-forth passes.`,...f.parameters?.docs?.description}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    iterations: "infinite",
    direction: "alternate"
  }
}`,...p.parameters?.docs?.source},description:{story:"Never-ending alternate ping-pong — `finished` stays pending (§12).",...p.parameters?.docs?.description}}}})))()}h();export{f as AlternateThrice,p as InfiniteAlternate,m as __namedExportsOrder,d as default};