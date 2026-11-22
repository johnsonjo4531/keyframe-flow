import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,p as n}from"./iframe-CE9T6iTY.js";import{i as r,r as i,t as a}from"./src-B0K7CDl1.js";import{n as o,r as s,t as c}from"./playback-story-Dz0vCChe.js";import{r as l,t as u}from"./react-C8WRvr0x.js";function d({duration:e,layout:t}){let n=(0,f.useMemo)(()=>{let n=r.from({to:{position:[200,0,0]},duration:e}),i=r.from({to:{rotation:[0,Math.PI,0]},duration:e}),a=r.from({to:{scale:1.4},duration:e/2});return t===`combine`?r.combine([n,i,a]):t===`parallel`?r.group([n,i,a],{layout:`parallel`}):r.group([r.group([n,i]),a])},[e,t]),a=(0,f.useCallback)(e=>i.html(e),[]),s=l(n,{autoplay:!0,makeTarget:a});return(0,p.jsxs)(`div`,{style:{display:`grid`,justifyItems:`center`},children:[(0,p.jsx)(`div`,{style:{width:360,height:180,position:`relative`},children:(0,p.jsx)(`div`,{ref:s.ref,style:{position:`absolute`,left:`50%`,top:`50%`,width:64,height:64,marginLeft:-32,marginTop:-32,borderRadius:12,background:`linear-gradient(135deg, #14b8a6, #3b82f6)`}})}),(0,p.jsx)(o,{handle:s}),(0,p.jsx)(c,{handle:s})]})}var f,p,m,h,g;function _(){return(_=e((()=>{a(),f=n(),s(),u(),p=t(),m={title:`Authoring/Composition`,component:d,args:{duration:1e3,layout:`combine`},argTypes:{duration:{control:{type:`range`,min:200,max:5e3,step:100}},layout:{control:`inline-radio`,options:[`combine`,`sequence`,`parallel`]}}},h={},typeof m==`object`&&m&&(m.parameters=Object.assign({},m.parameters,{docs:Object.assign({},m.parameters&&m.parameters.docs,{source:Object.assign({},m.parameters&&m.parameters.docs&&m.parameters.docs.source,{code:`import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useMemo } from "react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

/**
 * Composition (§14), mirroring the move/spin/pulse snippet in the
 * [Animation authoring guide](https://johnsonjo4531.github.io/keyframe-flow/docs/animation-authoring/):
 * \`Animation.combine\` merges by property track — each input overrides only
 * the properties it actually animates, no merged keyframes; \`Animation.group\`
 * sequences children back to back and nests freely (§19). At the default
 * duration the inputs are exactly the guide's: 200 px move + half-turn + 1.4×
 * pulse over half the time.
 */
function CompositionStory({
  duration,
  layout,
}: {
  duration: number;
  layout: "combine" | "sequence" | "parallel";
}): React.ReactElement {
  const animation = useMemo(() => {
    const move = Animation.from({ to: { position: [200, 0, 0] }, duration });
    const spin = Animation.from({ to: { rotation: [0, Math.PI, 0] }, duration });
    const pulse = Animation.from({ to: { scale: 1.4 }, duration: duration / 2 });

    if (layout === "combine") return Animation.combine([move, spin, pulse]);
    if (layout === "parallel") return Animation.group([move, spin, pulse], { layout: "parallel" });
    // Sequence — including a nested group inside the timeline.
    return Animation.group([Animation.group([move, spin]), pulse]);
  }, [duration, layout]);
  const makeTarget = useCallback((host: HTMLElement) => target.html(host), []);
  const handle = useKeyframePlayback(animation, { autoplay: true, makeTarget });

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 360, height: 180, position: "relative" }}>
        <div
          ref={handle.ref}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 64,
            height: 64,
            marginLeft: -32,
            marginTop: -32,
            borderRadius: 12,
            background: "linear-gradient(135deg, #14b8a6, #3b82f6)",
          }}
        />
      </div>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Authoring/Composition",
  component: CompositionStory,
  args: {
    duration: 1000, // the guide's move/spin length; pulse is half (§5 snippet)
    layout: "combine",
  },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 5000, step: 100 } },
    layout: { control: "inline-radio", options: ["combine", "sequence", "parallel"] },
  },
} satisfies Meta<typeof CompositionStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Move + rotate + scale authored as three independent animations. */
export const CombineTracks: Story = {};
`,originalSource:`import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useMemo } from "react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

/**
 * Composition (§14), mirroring the move/spin/pulse snippet in the
 * [Animation authoring guide](https://johnsonjo4531.github.io/keyframe-flow/docs/animation-authoring/):
 * \`Animation.combine\` merges by property track — each input overrides only
 * the properties it actually animates, no merged keyframes; \`Animation.group\`
 * sequences children back to back and nests freely (§19). At the default
 * duration the inputs are exactly the guide's: 200 px move + half-turn + 1.4×
 * pulse over half the time.
 */
function CompositionStory({
  duration,
  layout,
}: {
  duration: number;
  layout: "combine" | "sequence" | "parallel";
}): React.ReactElement {
  const animation = useMemo(() => {
    const move = Animation.from({ to: { position: [200, 0, 0] }, duration });
    const spin = Animation.from({ to: { rotation: [0, Math.PI, 0] }, duration });
    const pulse = Animation.from({ to: { scale: 1.4 }, duration: duration / 2 });

    if (layout === "combine") return Animation.combine([move, spin, pulse]);
    if (layout === "parallel") return Animation.group([move, spin, pulse], { layout: "parallel" });
    // Sequence — including a nested group inside the timeline.
    return Animation.group([Animation.group([move, spin]), pulse]);
  }, [duration, layout]);
  const makeTarget = useCallback((host: HTMLElement) => target.html(host), []);
  const handle = useKeyframePlayback(animation, { autoplay: true, makeTarget });

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 360, height: 180, position: "relative" }}>
        <div
          ref={handle.ref}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 64,
            height: 64,
            marginLeft: -32,
            marginTop: -32,
            borderRadius: 12,
            background: "linear-gradient(135deg, #14b8a6, #3b82f6)",
          }}
        />
      </div>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Authoring/Composition",
  component: CompositionStory,
  args: {
    duration: 1000, // the guide's move/spin length; pulse is half (§5 snippet)
    layout: "combine",
  },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 5000, step: 100 } },
    layout: { control: "inline-radio", options: ["combine", "sequence", "parallel"] },
  },
} satisfies Meta<typeof CompositionStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Move + rotate + scale authored as three independent animations. */
export const CombineTracks: Story = {};
`})})})),g=[`CombineTracks`],h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{}`,...h.parameters?.docs?.source},description:{story:`Move + rotate + scale authored as three independent animations.`,...h.parameters?.docs?.description}}}})))()}_();export{h as CombineTracks,g as __namedExportsOrder,m as default};