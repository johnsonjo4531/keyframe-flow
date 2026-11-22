import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,p as n}from"./iframe-CE9T6iTY.js";import{i as r,r as i,t as a}from"./src-B0K7CDl1.js";import{n as o,r as s,t as c}from"./playback-story-Dz0vCChe.js";import{r as l,t as u}from"./react-C8WRvr0x.js";function d({duration:e,toScale:t}){let n=(0,f.useMemo)(()=>r.from({to:{scale:t},duration:e}),[e,t]),a=(0,f.useCallback)(e=>i.html(e),[]),s=l(n,{autoplay:!0,iterations:`infinite`,direction:`alternate`,makeTarget:a});return(0,p.jsxs)(`div`,{style:{display:`grid`,justifyItems:`center`},children:[(0,p.jsx)(`div`,{style:{width:320,height:160,position:`relative`},children:(0,p.jsx)(`div`,{ref:s.ref,style:{position:`absolute`,left:`50%`,top:`50%`,width:72,height:72,marginLeft:-36,marginTop:-36,borderRadius:12,background:`linear-gradient(135deg, #0ea5e9, #22c55e)`}})}),(0,p.jsx)(o,{handle:s}),(0,p.jsx)(c,{handle:s})]})}var f,p,m,h,g;function _(){return(_=e((()=>{a(),f=n(),s(),u(),p=t(),m={title:`Authoring/Property Level`,component:d,args:{duration:250,toScale:1.5},argTypes:{duration:{control:{type:`range`,min:100,max:5e3,step:100}},toScale:{control:{type:`range`,min:.2,max:3,step:.1}}}},h={},typeof m==`object`&&m&&(m.parameters=Object.assign({},m.parameters,{docs:Object.assign({},m.parameters&&m.parameters.docs,{source:Object.assign({},m.parameters&&m.parameters.docs&&m.parameters.docs.source,{code:`import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useMemo } from "react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

/**
 * Property-level definitions (§7), mirroring the \`grow\` snippet in the
 * [Animation authoring guide](https://johnsonjo4531.github.io/keyframe-flow/docs/animation-authoring/):
 * no \`from\` at all — the start is documented identity — and only \`scale\` is
 * animated, so position and rotation are untouched property tracks. The loop
 * options exist only to keep the 250 ms snippet visible between replays.
 */
function PropertyLevelStory({
  duration,
  toScale,
}: {
  duration: number;
  toScale: number;
}): React.ReactElement {
  const animation = useMemo(
    () =>
      Animation.from({
        // No \`from\`: starts from identity (§7). Only scale changes.
        to: { scale: toScale },
        duration,
      }),
    [duration, toScale],
  );
  const makeTarget = useCallback((host: HTMLElement) => target.html(host), []);
  const handle = useKeyframePlayback(animation, {
    autoplay: true,
    iterations: "infinite", // loop the short snippet for demo visibility
    direction: "alternate",
    makeTarget,
  });

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 320, height: 160, position: "relative" }}>
        <div
          ref={handle.ref}
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
  args: {
    duration: 250, // the guide's grow duration
    toScale: 1.5,
  },
  argTypes: {
    duration: { control: { type: "range", min: 100, max: 5000, step: 100 } },
    toScale: { control: { type: "range", min: 0.2, max: 3, step: 0.1 } },
  },
} satisfies Meta<typeof PropertyLevelStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The guide's \`grow\`: scale 1 → 1.5 from identity — position/rotation untouched. */
export const ScaleOnly: Story = {};
`,originalSource:`import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useMemo } from "react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

/**
 * Property-level definitions (§7), mirroring the \`grow\` snippet in the
 * [Animation authoring guide](https://johnsonjo4531.github.io/keyframe-flow/docs/animation-authoring/):
 * no \`from\` at all — the start is documented identity — and only \`scale\` is
 * animated, so position and rotation are untouched property tracks. The loop
 * options exist only to keep the 250 ms snippet visible between replays.
 */
function PropertyLevelStory({
  duration,
  toScale,
}: {
  duration: number;
  toScale: number;
}): React.ReactElement {
  const animation = useMemo(
    () =>
      Animation.from({
        // No \`from\`: starts from identity (§7). Only scale changes.
        to: { scale: toScale },
        duration,
      }),
    [duration, toScale],
  );
  const makeTarget = useCallback((host: HTMLElement) => target.html(host), []);
  const handle = useKeyframePlayback(animation, {
    autoplay: true,
    iterations: "infinite", // loop the short snippet for demo visibility
    direction: "alternate",
    makeTarget,
  });

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 320, height: 160, position: "relative" }}>
        <div
          ref={handle.ref}
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
  args: {
    duration: 250, // the guide's grow duration
    toScale: 1.5,
  },
  argTypes: {
    duration: { control: { type: "range", min: 100, max: 5000, step: 100 } },
    toScale: { control: { type: "range", min: 0.2, max: 3, step: 0.1 } },
  },
} satisfies Meta<typeof PropertyLevelStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The guide's \`grow\`: scale 1 → 1.5 from identity — position/rotation untouched. */
export const ScaleOnly: Story = {};
`})})})),g=[`ScaleOnly`],h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{}`,...h.parameters?.docs?.source},description:{story:"The guide's `grow`: scale 1 → 1.5 from identity — position/rotation untouched.",...h.parameters?.docs?.description}}}})))()}_();export{h as ScaleOnly,g as __namedExportsOrder,m as default};