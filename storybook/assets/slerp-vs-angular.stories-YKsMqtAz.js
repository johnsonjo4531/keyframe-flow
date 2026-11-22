import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,p as n}from"./iframe-CE9T6iTY.js";import{i as r,r as i,t as a}from"./src-B0K7CDl1.js";import{n as o,r as s,t as c}from"./playback-story-Dz0vCChe.js";import{r as l,t as u}from"./react-C8WRvr0x.js";function d({mode:e}){let t=(0,f.useMemo)(()=>r.from({from:{rotation:[0,0,0]},to:{rotation:[0,Math.PI*2,0]},duration:1e3,rotationMode:e}),[e]),n=(0,f.useCallback)(e=>i.html(e),[]),a=l(t,{autoplay:!0,makeTarget:n});return(0,p.jsxs)(`div`,{style:{display:`grid`,justifyItems:`center`},children:[(0,p.jsx)(`div`,{style:{width:320,height:180,perspective:600,position:`relative`},children:(0,p.jsx)(`div`,{ref:a.ref,style:{position:`absolute`,left:`50%`,top:`50%`,width:88,height:88,marginLeft:-44,marginTop:-44,borderRadius:12,background:`linear-gradient(90deg, #f59e0b 50%, #1d4ed8 50%)`}})}),(0,p.jsx)(`p`,{style:{maxWidth:420,fontSize:13,textAlign:`center`},children:e===`quaternion`?`Quaternion mode: both endpoints are the same orientation — SLERP finds nothing to do.`:`Angular mode: authored Euler radians interpolate component-wise — a visible full revolution.`}),(0,p.jsx)(o,{handle:a}),(0,p.jsx)(c,{handle:a})]})}var f,p,m,h,g;function _(){return(_=e((()=>{a(),f=n(),s(),u(),p=t(),m={title:`Interpolation/SLERP vs Angular`,component:d,args:{mode:`angular`},argTypes:{mode:{control:`inline-radio`,options:[`quaternion`,`angular`]}}},h={},typeof m==`object`&&m&&(m.parameters=Object.assign({},m.parameters,{docs:Object.assign({},m.parameters&&m.parameters.docs,{source:Object.assign({},m.parameters&&m.parameters.docs&&m.parameters.docs.source,{code:`import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useMemo } from "react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

/**
 * Rotation interpolation (§9), mirroring the \`spin\` snippet in the
 * [Easing & interpolation guide](https://johnsonjo4531.github.io/keyframe-flow/docs/easing-interpolation/):
 * 0 → 2π about Y over 1000 ms. In the default quaternion mode the endpoints
 * are the same orientation, so SLERP collapses the turn to nothing; with
 * \`rotationMode: "angular"\` the authored Euler radians interpolate
 * component-wise — a visible full revolution, no intermediate keyframes.
 * Switch the \`mode\` arg to compare. Raw element-wise matrix lerp is never
 * the default (§9.2).
 */
function InterpolationStory({ mode }: { mode: "quaternion" | "angular" }): React.ReactElement {
  const animation = useMemo(
    () =>
      Animation.from({
        from: { rotation: [0, 0, 0] },
        to: { rotation: [0, Math.PI * 2, 0] }, // one full turn about Y
        duration: 1000, // the guide's spin duration
        rotationMode: mode,
      }),
    [mode],
  );
  const makeTarget = useCallback((host: HTMLElement) => target.html(host), []);
  const handle = useKeyframePlayback(animation, { autoplay: true, makeTarget });

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 320, height: 180, perspective: 600, position: "relative" }}>
        <div
          ref={handle.ref}
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
  args: {
    mode: "angular",
  },
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
import { useCallback, useMemo } from "react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

/**
 * Rotation interpolation (§9), mirroring the \`spin\` snippet in the
 * [Easing & interpolation guide](https://johnsonjo4531.github.io/keyframe-flow/docs/easing-interpolation/):
 * 0 → 2π about Y over 1000 ms. In the default quaternion mode the endpoints
 * are the same orientation, so SLERP collapses the turn to nothing; with
 * \`rotationMode: "angular"\` the authored Euler radians interpolate
 * component-wise — a visible full revolution, no intermediate keyframes.
 * Switch the \`mode\` arg to compare. Raw element-wise matrix lerp is never
 * the default (§9.2).
 */
function InterpolationStory({ mode }: { mode: "quaternion" | "angular" }): React.ReactElement {
  const animation = useMemo(
    () =>
      Animation.from({
        from: { rotation: [0, 0, 0] },
        to: { rotation: [0, Math.PI * 2, 0] }, // one full turn about Y
        duration: 1000, // the guide's spin duration
        rotationMode: mode,
      }),
    [mode],
  );
  const makeTarget = useCallback((host: HTMLElement) => target.html(host), []);
  const handle = useKeyframePlayback(animation, { autoplay: true, makeTarget });

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 320, height: 180, perspective: 600, position: "relative" }}>
        <div
          ref={handle.ref}
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
  args: {
    mode: "angular",
  },
  argTypes: {
    mode: { control: "inline-radio", options: ["quaternion", "angular"] },
  },
} satisfies Meta<typeof InterpolationStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Toggle between quaternion (shortest path) and angular (full turn). */
export const FullRevolution: Story = {};
`})})})),g=[`FullRevolution`],h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{}`,...h.parameters?.docs?.source},description:{story:`Toggle between quaternion (shortest path) and angular (full turn).`,...h.parameters?.docs?.description}}}})))()}_();export{h as FullRevolution,g as __namedExportsOrder,m as default};