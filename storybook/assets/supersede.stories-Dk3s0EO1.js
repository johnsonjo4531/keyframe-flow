import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,p as n}from"./iframe-DXSg0uKF.js";import{i as r,r as i,t as a}from"./src-DfDWSzNz.js";function o({duration:e}){let t=(0,s.useRef)(null),[n,a]=(0,s.useState)(void 0),[o,l]=(0,s.useState)(void 0),u=(0,s.useRef)({}),d=(0,s.useMemo)(()=>{let e;return t=>(e??=i.html(t),e)},[]);(0,s.useEffect)(()=>{let n=t.current;if(n===null)return;let i=d(n),o=r.from({to:{position:[-140,0,0],scale:2},duration:e,easing:`linear`}).attach(i),s=r.from({to:{position:[140,0,0],rotation:[0,0,Math.PI/2]},duration:e,easing:`linear`}).attach(i);return u.current={a:o,b:s},o.finished.then(a),s.finished.then(l),()=>{o.dispose(),s.dispose(),u.current={}}},[e,d]);let f={padding:`4px 10px`,cursor:`pointer`};return(0,c.jsxs)(`div`,{style:{display:`grid`,justifyItems:`center`},children:[(0,c.jsx)(`div`,{style:{width:360,height:140,position:`relative`},children:(0,c.jsx)(`div`,{ref:t,style:{position:`absolute`,left:`50%`,top:`50%`,width:64,height:64,marginLeft:-32,marginTop:-32,borderRadius:12,background:`linear-gradient(135deg, #64748b, #0f172a)`}})}),(0,c.jsxs)(`div`,{style:{display:`flex`,gap:8},children:[(0,c.jsx)(`button`,{type:`button`,style:f,onClick:()=>u.current.a?.play(),children:`▶ A (grow left)`}),(0,c.jsx)(`button`,{type:`button`,style:f,onClick:()=>u.current.b?.play(),children:`▶ B (spin right — supersedes A)`})]}),(0,c.jsxs)(`div`,{style:{fontFamily:`ui-monospace, monospace`,fontSize:12,marginTop:12,display:`flex`,gap:16},children:[(0,c.jsxs)(`span`,{children:[`A finished: `,n?.status??`pending`]}),(0,c.jsxs)(`span`,{children:[`B finished: `,o?.status??`pending`]})]})]})}var s,c,l,u,d;function f(){return(f=e((()=>{a(),s=n(),c=t(),l={title:`Playback/Target Supersede`,component:o,args:{duration:2e3},argTypes:{duration:{control:{type:`range`,min:500,max:6e3,step:100}}}},u={},typeof l==`object`&&l&&(l.parameters=Object.assign({},l.parameters,{docs:Object.assign({},l.parameters&&l.parameters.docs,{source:Object.assign({},l.parameters&&l.parameters.docs&&l.parameters.docs.source,{code:`import { Animation, target } from "keyframe-flow";
import type { Playback, PlaybackResult, RenderTarget } from "keyframe-flow";
import type * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Target ownership & supersede (§14): a render target is owned by at most one
 * active playback. When a second playback starts on the same target, the
 * previous run is cancelled — its \`finished\` resolves \`{ status: "cancelled" }\`
 * (never rejects) and stops writing to the element. No additive composition,
 * no timers left running.
 */
function SupersedeStory({ duration }: { duration: number }): React.ReactElement {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [statusA, setStatusA] = useState<PlaybackResult | undefined>(undefined);
  const [statusB, setStatusB] = useState<PlaybackResult | undefined>(undefined);
  const playbacksRef = useRef<{ a?: Playback; b?: Playback }>({});

  // One shared render target object — ownership is per target (§14).
  const makeTarget = useMemo(() => {
    let cached: RenderTarget | undefined;
    return (host: HTMLElement): RenderTarget => {
      cached ??= target.html(host);
      return cached;
    };
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (host === null) return;
    const renderTarget = makeTarget(host);

    const a = Animation.from({
      to: { position: [-140, 0, 0], scale: 2 },
      duration,
      easing: "linear",
    }).attach(renderTarget);
    const b = Animation.from({
      to: { position: [140, 0, 0], rotation: [0, 0, Math.PI / 2] },
      duration,
      easing: "linear",
    }).attach(renderTarget);

    playbacksRef.current = { a, b };
    void a.finished.then(setStatusA);
    void b.finished.then(setStatusB);

    return () => {
      a.dispose();
      b.dispose();
      playbacksRef.current = {};
    };
  }, [duration, makeTarget]);

  const button = { padding: "4px 10px", cursor: "pointer" } as const;

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 360, height: 140, position: "relative" }}>
        <div
          ref={hostRef}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 64,
            height: 64,
            marginLeft: -32,
            marginTop: -32,
            borderRadius: 12,
            background: "linear-gradient(135deg, #64748b, #0f172a)",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" style={button} onClick={() => playbacksRef.current.a?.play()}>
          ▶ A (grow left)
        </button>
        <button type="button" style={button} onClick={() => playbacksRef.current.b?.play()}>
          ▶ B (spin right — supersedes A)
        </button>
      </div>
      <div
        style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: 12,
          marginTop: 12,
          display: "flex",
          gap: 16,
        }}
      >
        <span>A finished: {statusA?.status ?? "pending"}</span>
        <span>B finished: {statusB?.status ?? "pending"}</span>
      </div>
    </div>
  );
}

const meta = {
  title: "Playback/Target Supersede",
  component: SupersedeStory,
  args: { duration: 2000 },
  argTypes: {
    duration: { control: { type: "range", min: 500, max: 6000, step: 100 } },
  },
} satisfies Meta<typeof SupersedeStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Start A, then B — watch A resolve \`cancelled\` while B takes over. */
export const OwnershipTransfer: Story = {};
`,originalSource:`import { Animation, target } from "keyframe-flow";
import type { Playback, PlaybackResult, RenderTarget } from "keyframe-flow";
import type * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Target ownership & supersede (§14): a render target is owned by at most one
 * active playback. When a second playback starts on the same target, the
 * previous run is cancelled — its \`finished\` resolves \`{ status: "cancelled" }\`
 * (never rejects) and stops writing to the element. No additive composition,
 * no timers left running.
 */
function SupersedeStory({ duration }: { duration: number }): React.ReactElement {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [statusA, setStatusA] = useState<PlaybackResult | undefined>(undefined);
  const [statusB, setStatusB] = useState<PlaybackResult | undefined>(undefined);
  const playbacksRef = useRef<{ a?: Playback; b?: Playback }>({});

  // One shared render target object — ownership is per target (§14).
  const makeTarget = useMemo(() => {
    let cached: RenderTarget | undefined;
    return (host: HTMLElement): RenderTarget => {
      cached ??= target.html(host);
      return cached;
    };
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (host === null) return;
    const renderTarget = makeTarget(host);

    const a = Animation.from({
      to: { position: [-140, 0, 0], scale: 2 },
      duration,
      easing: "linear",
    }).attach(renderTarget);
    const b = Animation.from({
      to: { position: [140, 0, 0], rotation: [0, 0, Math.PI / 2] },
      duration,
      easing: "linear",
    }).attach(renderTarget);

    playbacksRef.current = { a, b };
    void a.finished.then(setStatusA);
    void b.finished.then(setStatusB);

    return () => {
      a.dispose();
      b.dispose();
      playbacksRef.current = {};
    };
  }, [duration, makeTarget]);

  const button = { padding: "4px 10px", cursor: "pointer" } as const;

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 360, height: 140, position: "relative" }}>
        <div
          ref={hostRef}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 64,
            height: 64,
            marginLeft: -32,
            marginTop: -32,
            borderRadius: 12,
            background: "linear-gradient(135deg, #64748b, #0f172a)",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" style={button} onClick={() => playbacksRef.current.a?.play()}>
          ▶ A (grow left)
        </button>
        <button type="button" style={button} onClick={() => playbacksRef.current.b?.play()}>
          ▶ B (spin right — supersedes A)
        </button>
      </div>
      <div
        style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: 12,
          marginTop: 12,
          display: "flex",
          gap: 16,
        }}
      >
        <span>A finished: {statusA?.status ?? "pending"}</span>
        <span>B finished: {statusB?.status ?? "pending"}</span>
      </div>
    </div>
  );
}

const meta = {
  title: "Playback/Target Supersede",
  component: SupersedeStory,
  args: { duration: 2000 },
  argTypes: {
    duration: { control: { type: "range", min: 500, max: 6000, step: 100 } },
  },
} satisfies Meta<typeof SupersedeStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Start A, then B — watch A resolve \`cancelled\` while B takes over. */
export const OwnershipTransfer: Story = {};
`})})})),d=[`OwnershipTransfer`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source},description:{story:"Start A, then B — watch A resolve `cancelled` while B takes over.",...u.parameters?.docs?.description}}}})))()}f();export{u as OwnershipTransfer,d as __namedExportsOrder,l as default};