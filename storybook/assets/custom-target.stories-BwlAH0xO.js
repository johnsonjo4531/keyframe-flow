import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,p as n}from"./iframe-CE9T6iTY.js";import{i as r,t as i}from"./src-B0K7CDl1.js";import{n as a,r as o,t as s}from"./playback-story-Dz0vCChe.js";import{r as c,t as l}from"./react-C8WRvr0x.js";function u({duration:e}){let[t,n]=(0,d.useState)(0),[i,o]=(0,d.useState)(void 0),l=(0,d.useMemo)(()=>{let e={frames:0,setTransform(t){e.frames+=1,queueMicrotask(()=>{n(e.frames),o(t)})}};return e},[]),u=(0,d.useMemo)(()=>r.from({from:{position:[-120,-40,0]},to:{position:[120,40,0],rotation:[0,0,Math.PI/3]},duration:e,easing:`ease-in-out`}),[e,l]),p=(0,d.useCallback)(()=>l,[l]),m=c(u,{autoplay:!0,makeTarget:p}),h=i?.at(0,3),g=i?.at(1,3);return(0,f.jsxs)(`div`,{style:{display:`grid`,justifyItems:`center`},children:[(0,f.jsx)(`div`,{style:{width:360,height:160,position:`relative`},children:(0,f.jsx)(`div`,{ref:m.ref,style:{position:`absolute`,left:`calc(50% + ${(h??-120).toFixed(1)}px)`,top:`calc(50% + ${(g??-40).toFixed(1)}px)`,width:64,height:64,marginLeft:-32,marginTop:-32,borderRadius:`50%`,background:`linear-gradient(135deg, #facc15, #fb7185)`}})}),(0,f.jsxs)(`code`,{style:{fontSize:11,color:`#9ca3af`},children:[`setTransform calls: `,t,` — matrices recorded by the custom target`]}),(0,f.jsx)(a,{handle:m}),(0,f.jsx)(s,{handle:m})]})}var d,f,p,m,h;function g(){return(g=e((()=>{i(),d=n(),o(),l(),f=t(),p={title:`Targets/Custom Structural Target`,component:u,args:{duration:1600},argTypes:{duration:{control:{type:`range`,min:200,max:5e3,step:100}}}},m={},typeof p==`object`&&p&&(p.parameters=Object.assign({},p.parameters,{docs:Object.assign({},p.parameters&&p.parameters.docs,{source:Object.assign({},p.parameters&&p.parameters.docs&&p.parameters.docs.source,{code:`import { Animation } from "keyframe-flow";
import type { Matrix4, RenderTarget } from "keyframe-flow";
import type * as React from "react";
import { useCallback, useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

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

  const animation = useMemo(
    () =>
      Animation.from({
        from: { position: [-120, -40, 0] },
        to: { position: [120, 40, 0], rotation: [0, 0, Math.PI / 3] },
        duration,
        easing: "ease-in-out",
      }),
    [duration, recorder],
  );
  const makeTarget = useCallback(() => recorder, [recorder]);
  const handle = useKeyframePlayback(animation, { autoplay: true, makeTarget });

  // Column-major storage: translation lives at indices 12–14 (§15). The
  // custom target receives raw matrices — reading elements directly is the
  // host's job.
  const x = latest?.at(0, 3);
  const y = latest?.at(1, 3);

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 360, height: 160, position: "relative" }}>
        <div
          ref={handle.ref} // host only for layout; the custom target ignores it
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
  args: {
    duration: 1600,
  },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 5000, step: 100 } },
  },
} satisfies Meta<typeof CustomTargetStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The custom-target section of the
 * [Render adapters guide](https://johnsonjo4531.github.io/keyframe-flow/docs/render-adapters/):
 * the recorder below is a plain object with one method,
 * \`setTransform(matrix)\` — that is the entire contract (§17.1). It stores
 * every evaluated matrix and renders itself; disposal leaves it fully intact
 * (§17.2), which the readout proves after you press cancel.
 */
export const MatrixRecorder: Story = {};
`,originalSource:`import { Animation } from "keyframe-flow";
import type { Matrix4, RenderTarget } from "keyframe-flow";
import type * as React from "react";
import { useCallback, useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

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

  const animation = useMemo(
    () =>
      Animation.from({
        from: { position: [-120, -40, 0] },
        to: { position: [120, 40, 0], rotation: [0, 0, Math.PI / 3] },
        duration,
        easing: "ease-in-out",
      }),
    [duration, recorder],
  );
  const makeTarget = useCallback(() => recorder, [recorder]);
  const handle = useKeyframePlayback(animation, { autoplay: true, makeTarget });

  // Column-major storage: translation lives at indices 12–14 (§15). The
  // custom target receives raw matrices — reading elements directly is the
  // host's job.
  const x = latest?.at(0, 3);
  const y = latest?.at(1, 3);

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 360, height: 160, position: "relative" }}>
        <div
          ref={handle.ref} // host only for layout; the custom target ignores it
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
  args: {
    duration: 1600,
  },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 5000, step: 100 } },
  },
} satisfies Meta<typeof CustomTargetStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The custom-target section of the
 * [Render adapters guide](https://johnsonjo4531.github.io/keyframe-flow/docs/render-adapters/):
 * the recorder below is a plain object with one method,
 * \`setTransform(matrix)\` — that is the entire contract (§17.1). It stores
 * every evaluated matrix and renders itself; disposal leaves it fully intact
 * (§17.2), which the readout proves after you press cancel.
 */
export const MatrixRecorder: Story = {};
`})})})),h=[`MatrixRecorder`],m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{}`,...m.parameters?.docs?.source},description:{story:`The custom-target section of the
[Render adapters guide](https://johnsonjo4531.github.io/keyframe-flow/docs/render-adapters/):
the recorder below is a plain object with one method,
\`setTransform(matrix)\` — that is the entire contract (§17.1). It stores
every evaluated matrix and renders itself; disposal leaves it fully intact
(§17.2), which the readout proves after you press cancel.`,...m.parameters?.docs?.description}}}})))()}g();export{m as MatrixRecorder,h as __namedExportsOrder,p as default};