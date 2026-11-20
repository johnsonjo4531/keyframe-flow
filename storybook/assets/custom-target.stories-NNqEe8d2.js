import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,p as n}from"./iframe-DXSg0uKF.js";import{i as r,t as i}from"./src-DfDWSzNz.js";import{i as a,n as o,r as s,t as c}from"./playback-story-w1_FZ1Kv.js";function l({duration:e}){let[t,n]=(0,u.useState)(0),[i,s]=(0,u.useState)(void 0),l=(0,u.useMemo)(()=>{let e={frames:0,setTransform(t){e.frames+=1,queueMicrotask(()=>{n(e.frames),s(t)})}};return e},[]),f=a(()=>r.from({from:{position:[-120,-40,0]},to:{position:[120,40,0],rotation:[0,0,Math.PI/3]},duration:e,easing:`ease-in-out`}),()=>l,[e,l]),p=i?.at(0,3),m=i?.at(1,3);return(0,d.jsxs)(`div`,{style:{display:`grid`,justifyItems:`center`},children:[(0,d.jsx)(`div`,{style:{width:360,height:160,position:`relative`},children:(0,d.jsx)(`div`,{ref:f.hostRef,style:{position:`absolute`,left:`calc(50% + ${(p??-120).toFixed(1)}px)`,top:`calc(50% + ${(m??-40).toFixed(1)}px)`,width:64,height:64,marginLeft:-32,marginTop:-32,borderRadius:`50%`,background:`linear-gradient(135deg, #facc15, #fb7185)`}})}),(0,d.jsxs)(`code`,{style:{fontSize:11,color:`#9ca3af`},children:[`setTransform calls: `,t,` — matrices recorded by the custom target`]}),(0,d.jsx)(o,{handle:f}),(0,d.jsx)(c,{handle:f})]})}var u,d,f,p,m;function h(){return(h=e((()=>{i(),u=n(),s(),d=t(),f={title:`Targets/Custom Structural Target`,component:l,args:{duration:1600},argTypes:{duration:{control:{type:`range`,min:200,max:5e3,step:100}}}},p={},typeof f==`object`&&f&&(f.parameters=Object.assign({},f.parameters,{docs:Object.assign({},f.parameters&&f.parameters.docs,{source:Object.assign({},f.parameters&&f.parameters.docs&&f.parameters.docs.source,{code:`import { Animation } from "keyframe-flow";
import type { Matrix4, RenderTarget } from "keyframe-flow";
import type * as React from "react";
import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport, useKeyframePlayback } from "../playback-story";

/**
 * Custom structural target (§17.1): any object with \`setTransform(matrix)\`
 * is a valid render target — no base class, no library imports inside the
 * renderer, zero engine changes. This recorder stores every evaluated matrix
 * and renders one itself; disposal leaves it fully intact (§17.2).
 */
function CustomTargetStory({ duration }: { duration: number }): React.ReactElement {
  const [frames, setFrames] = useState(0);
  const [latest, setLatest] = useState<Matrix4 | undefined>(undefined);
  const recorder = useMemo<RenderTarget & { frames: number }>(() => {
    const targetObject = {
      frames: 0,
      setTransform(matrix: Matrix4): void {
        targetObject.frames += 1;
        // React state updates from the engine's frame callback are fine here.
        queueMicrotask(() => {
          setFrames(targetObject.frames);
          setLatest(matrix);
        });
      },
    };
    return targetObject;
  }, []);

  const handle = useKeyframePlayback(
    () =>
      Animation.from({
        from: { position: [-120, -40, 0] },
        to: { position: [120, 40, 0], rotation: [0, 0, Math.PI / 3] },
        duration,
        easing: "ease-in-out",
      }),
    () => recorder,
    [duration, recorder],
  );

  // Column-major storage: translation lives at indices 12–14 (§15). The
  // custom target receives raw matrices — reading elements directly is the
  // host's job.
  const x = latest?.at(0, 3);
  const y = latest?.at(1, 3);

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 360, height: 160, position: "relative" }}>
        <div
          ref={handle.hostRef} // host only for layout; the custom target ignores it
          style={{
            position: "absolute",
            left: \`calc(50% + \${(x ?? -120).toFixed(1)}px)\`,
            top: \`calc(50% + \${(y ?? -40).toFixed(1)}px)\`,
            width: 64,
            height: 64,
            marginLeft: -32,
            marginTop: -32,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #facc15, #fb7185)",
          }}
        />
      </div>
      <code style={{ fontSize: 11, color: "#9ca3af" }}>
        setTransform calls: {frames} — matrices recorded by the custom target
      </code>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Targets/Custom Structural Target",
  component: CustomTargetStory,
  args: { duration: 1600 },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 5000, step: 100 } },
  },
} satisfies Meta<typeof CustomTargetStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A plain object target receiving evaluated matrices per frame. */
export const MatrixRecorder: Story = {};
`,originalSource:`import { Animation } from "keyframe-flow";
import type { Matrix4, RenderTarget } from "keyframe-flow";
import type * as React from "react";
import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport, useKeyframePlayback } from "../playback-story";

/**
 * Custom structural target (§17.1): any object with \`setTransform(matrix)\`
 * is a valid render target — no base class, no library imports inside the
 * renderer, zero engine changes. This recorder stores every evaluated matrix
 * and renders one itself; disposal leaves it fully intact (§17.2).
 */
function CustomTargetStory({ duration }: { duration: number }): React.ReactElement {
  const [frames, setFrames] = useState(0);
  const [latest, setLatest] = useState<Matrix4 | undefined>(undefined);
  const recorder = useMemo<RenderTarget & { frames: number }>(() => {
    const targetObject = {
      frames: 0,
      setTransform(matrix: Matrix4): void {
        targetObject.frames += 1;
        // React state updates from the engine's frame callback are fine here.
        queueMicrotask(() => {
          setFrames(targetObject.frames);
          setLatest(matrix);
        });
      },
    };
    return targetObject;
  }, []);

  const handle = useKeyframePlayback(
    () =>
      Animation.from({
        from: { position: [-120, -40, 0] },
        to: { position: [120, 40, 0], rotation: [0, 0, Math.PI / 3] },
        duration,
        easing: "ease-in-out",
      }),
    () => recorder,
    [duration, recorder],
  );

  // Column-major storage: translation lives at indices 12–14 (§15). The
  // custom target receives raw matrices — reading elements directly is the
  // host's job.
  const x = latest?.at(0, 3);
  const y = latest?.at(1, 3);

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 360, height: 160, position: "relative" }}>
        <div
          ref={handle.hostRef} // host only for layout; the custom target ignores it
          style={{
            position: "absolute",
            left: \`calc(50% + \${(x ?? -120).toFixed(1)}px)\`,
            top: \`calc(50% + \${(y ?? -40).toFixed(1)}px)\`,
            width: 64,
            height: 64,
            marginLeft: -32,
            marginTop: -32,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #facc15, #fb7185)",
          }}
        />
      </div>
      <code style={{ fontSize: 11, color: "#9ca3af" }}>
        setTransform calls: {frames} — matrices recorded by the custom target
      </code>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Targets/Custom Structural Target",
  component: CustomTargetStory,
  args: { duration: 1600 },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 5000, step: 100 } },
  },
} satisfies Meta<typeof CustomTargetStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A plain object target receiving evaluated matrices per frame. */
export const MatrixRecorder: Story = {};
`})})})),m=[`MatrixRecorder`],p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{}`,...p.parameters?.docs?.source},description:{story:`A plain object target receiving evaluated matrices per frame.`,...p.parameters?.docs?.description}}}})))()}h();export{p as MatrixRecorder,m as __namedExportsOrder,f as default};