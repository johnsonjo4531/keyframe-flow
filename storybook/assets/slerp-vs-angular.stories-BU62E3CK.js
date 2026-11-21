import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t}from"./iframe-BjydkunC.js";import{i as n,r,t as i}from"./src-CIE5dN4r.js";import{i as a,n as o,r as s,t as c}from"./playback-story-5Ss6VQ81.js";function l({mode:e}){let t=a(()=>n.from({from:{rotation:[0,0,0]},to:{rotation:[0,Math.PI*2,0]},duration:2400,rotationMode:e}),e=>r.html(e),[e]);return(0,u.jsxs)(`div`,{style:{display:`grid`,justifyItems:`center`},children:[(0,u.jsx)(`div`,{style:{width:320,height:180,perspective:600,position:`relative`},children:(0,u.jsx)(`div`,{ref:t.hostRef,style:{position:`absolute`,left:`50%`,top:`50%`,width:88,height:88,marginLeft:-44,marginTop:-44,borderRadius:12,background:`linear-gradient(90deg, #f59e0b 50%, #1d4ed8 50%)`}})}),(0,u.jsx)(`p`,{style:{maxWidth:420,fontSize:13,textAlign:`center`},children:e===`quaternion`?`Quaternion mode: both endpoints are the same orientation — SLERP finds nothing to do.`:`Angular mode: authored Euler radians interpolate component-wise — a visible full revolution.`}),(0,u.jsx)(o,{handle:t}),(0,u.jsx)(c,{handle:t})]})}var u,d,f,p;function m(){return(m=e((()=>{i(),s(),u=t(),d={title:`Interpolation/SLERP vs Angular`,component:l,args:{mode:`angular`},argTypes:{mode:{control:`inline-radio`,options:[`quaternion`,`angular`]}}},f={},typeof d==`object`&&d&&(d.parameters=Object.assign({},d.parameters,{docs:Object.assign({},d.parameters&&d.parameters.docs,{source:Object.assign({},d.parameters&&d.parameters.docs&&d.parameters.docs.source,{code:`import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport, useKeyframePlayback } from "../playback-story";

/**
 * Rotation interpolation (§9): the default quaternion SLERP takes the
 * shortest path between orientations — a full turn from 0 to 2π collapses to
 * no motion. \`rotationMode: "angular"\` interpolates authored Euler radians
 * instead, so one revolution needs no intermediate keyframes. Raw element-
 * wise matrix lerp is never the default (§9.2).
 */
function InterpolationStory({ mode }: { mode: "quaternion" | "angular" }): React.ReactElement {
  const handle = useKeyframePlayback(
    () =>
      Animation.from({
        from: { rotation: [0, 0, 0] },
        to: { rotation: [0, Math.PI * 2, 0] }, // one full turn about Y
        duration: 2400,
        rotationMode: mode,
      }),
    (host) => target.html(host),
    [mode],
  );

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 320, height: 180, perspective: 600, position: "relative" }}>
        <div
          ref={handle.hostRef}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 88,
            height: 88,
            marginLeft: -44,
            marginTop: -44,
            borderRadius: 12,
            // Asymmetric face so the rotation is visible.
            background: "linear-gradient(90deg, #f59e0b 50%, #1d4ed8 50%)",
          }}
        />
      </div>
      <p style={{ maxWidth: 420, fontSize: 13, textAlign: "center" }}>
        {mode === "quaternion"
          ? "Quaternion mode: both endpoints are the same orientation — SLERP finds nothing to do."
          : "Angular mode: authored Euler radians interpolate component-wise — a visible full revolution."}
      </p>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Interpolation/SLERP vs Angular",
  component: InterpolationStory,
  args: { mode: "angular" },
  argTypes: {
    mode: { control: "inline-radio", options: ["quaternion", "angular"] },
  },
} satisfies Meta<typeof InterpolationStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Toggle between quaternion (shortest path) and angular (full turn). */
export const FullRevolution: Story = {};
`,originalSource:`import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport, useKeyframePlayback } from "../playback-story";

/**
 * Rotation interpolation (§9): the default quaternion SLERP takes the
 * shortest path between orientations — a full turn from 0 to 2π collapses to
 * no motion. \`rotationMode: "angular"\` interpolates authored Euler radians
 * instead, so one revolution needs no intermediate keyframes. Raw element-
 * wise matrix lerp is never the default (§9.2).
 */
function InterpolationStory({ mode }: { mode: "quaternion" | "angular" }): React.ReactElement {
  const handle = useKeyframePlayback(
    () =>
      Animation.from({
        from: { rotation: [0, 0, 0] },
        to: { rotation: [0, Math.PI * 2, 0] }, // one full turn about Y
        duration: 2400,
        rotationMode: mode,
      }),
    (host) => target.html(host),
    [mode],
  );

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 320, height: 180, perspective: 600, position: "relative" }}>
        <div
          ref={handle.hostRef}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 88,
            height: 88,
            marginLeft: -44,
            marginTop: -44,
            borderRadius: 12,
            // Asymmetric face so the rotation is visible.
            background: "linear-gradient(90deg, #f59e0b 50%, #1d4ed8 50%)",
          }}
        />
      </div>
      <p style={{ maxWidth: 420, fontSize: 13, textAlign: "center" }}>
        {mode === "quaternion"
          ? "Quaternion mode: both endpoints are the same orientation — SLERP finds nothing to do."
          : "Angular mode: authored Euler radians interpolate component-wise — a visible full revolution."}
      </p>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Interpolation/SLERP vs Angular",
  component: InterpolationStory,
  args: { mode: "angular" },
  argTypes: {
    mode: { control: "inline-radio", options: ["quaternion", "angular"] },
  },
} satisfies Meta<typeof InterpolationStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Toggle between quaternion (shortest path) and angular (full turn). */
export const FullRevolution: Story = {};
`})})})),p=[`FullRevolution`],f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{}`,...f.parameters?.docs?.source},description:{story:`Toggle between quaternion (shortest path) and angular (full turn).`,...f.parameters?.docs?.description}}}})))()}m();export{f as FullRevolution,p as __namedExportsOrder,d as default};