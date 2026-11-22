import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,p as n}from"./iframe-CE9T6iTY.js";import{i as r,r as i,s as a,t as o}from"./src-B0K7CDl1.js";import{n as s,r as c,t as l}from"./playback-story-Dz0vCChe.js";import{r as u,t as d}from"./react-C8WRvr0x.js";function f({duration:e}){let t=(0,p.useMemo)(()=>r.from({duration:e,keyframes:[{at:0,transform:a().translate(0,-100)},{at:.6,transform:a()},{at:.75,transform:a().translate(0,-30)},{at:.9,transform:a()},{at:1,transform:a()}]}),[e]),n=(0,p.useCallback)(e=>i.html(e),[]),o=u(t,{autoplay:!0,iterations:`infinite`,makeTarget:n});return(0,m.jsxs)(`div`,{style:{display:`grid`,justifyItems:`center`},children:[(0,m.jsx)(`div`,{style:{width:360,height:200,position:`relative`},children:(0,m.jsx)(`div`,{ref:o.ref,style:{position:`absolute`,left:`50%`,top:`50%`,width:64,height:64,marginLeft:-32,marginTop:-32,borderRadius:12,background:`linear-gradient(135deg, #a855f7, #6366f1)`}})}),(0,m.jsx)(s,{handle:o}),(0,m.jsx)(l,{handle:o})]})}var p,m,h,g,_;function v(){return(v=e((()=>{o(),p=n(),c(),d(),m=t(),h={title:`Authoring/Keyframes`,component:f,args:{duration:1200},argTypes:{duration:{control:{type:`range`,min:200,max:8e3,step:100}}}},g={},typeof h==`object`&&h&&(h.parameters=Object.assign({},h.parameters,{docs:Object.assign({},h.parameters&&h.parameters.docs,{source:Object.assign({},h.parameters&&h.parameters.docs&&h.parameters.docs.source,{code:`import { Animation, target, transform } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useMemo } from "react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

/**
 * Keyframe definitions (§5.3, §6.1), mirroring the \`bounce\` snippet in the
 * [Animation authoring guide](https://johnsonjo4531.github.io/keyframe-flow/docs/animation-authoring/):
 * \`at\` is normalized progress in \`[0, 1]\` — fractions of the timeline,
 * independent of \`duration\` — so re-timing never rewrites keyframes.
 * Validation is eager and strict (§6.3): timestamps must be finite, in range,
 * and strictly increasing. The infinite loop just replays the drop-and-settle.
 */
function KeyframesStory({ duration }: { duration: number }): React.ReactElement {
  const animation = useMemo(
    () =>
      Animation.from({
        duration,
        keyframes: [
          { at: 0, transform: transform().translate(0, -100) }, // starts high
          { at: 0.6, transform: transform() }, // lands at rest by 60 %
          { at: 0.75, transform: transform().translate(0, -30) }, // small rebound
          { at: 0.9, transform: transform() }, // settles again
          { at: 1, transform: transform() }, // holds through the end
        ],
      }),
    [duration],
  );
  const makeTarget = useCallback((host: HTMLElement) => target.html(host), []);
  const handle = useKeyframePlayback(animation, {
    autoplay: true,
    iterations: "infinite", // replay the drop-and-settle for demo visibility
    makeTarget,
  });

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 360, height: 200, position: "relative" }}>
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
            background: "linear-gradient(135deg, #a855f7, #6366f1)",
          }}
        />
      </div>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Authoring/Keyframes",
  component: KeyframesStory,
  args: {
    duration: 1200, // the guide's bounce duration
  },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 8000, step: 100 } },
  },
} satisfies Meta<typeof KeyframesStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The guide's \`bounce\`: drop, land, rebound, settle — normalized keyframes. */
export const Bounce: Story = {};
`,originalSource:`import { Animation, target, transform } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useMemo } from "react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

/**
 * Keyframe definitions (§5.3, §6.1), mirroring the \`bounce\` snippet in the
 * [Animation authoring guide](https://johnsonjo4531.github.io/keyframe-flow/docs/animation-authoring/):
 * \`at\` is normalized progress in \`[0, 1]\` — fractions of the timeline,
 * independent of \`duration\` — so re-timing never rewrites keyframes.
 * Validation is eager and strict (§6.3): timestamps must be finite, in range,
 * and strictly increasing. The infinite loop just replays the drop-and-settle.
 */
function KeyframesStory({ duration }: { duration: number }): React.ReactElement {
  const animation = useMemo(
    () =>
      Animation.from({
        duration,
        keyframes: [
          { at: 0, transform: transform().translate(0, -100) }, // starts high
          { at: 0.6, transform: transform() }, // lands at rest by 60 %
          { at: 0.75, transform: transform().translate(0, -30) }, // small rebound
          { at: 0.9, transform: transform() }, // settles again
          { at: 1, transform: transform() }, // holds through the end
        ],
      }),
    [duration],
  );
  const makeTarget = useCallback((host: HTMLElement) => target.html(host), []);
  const handle = useKeyframePlayback(animation, {
    autoplay: true,
    iterations: "infinite", // replay the drop-and-settle for demo visibility
    makeTarget,
  });

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 360, height: 200, position: "relative" }}>
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
            background: "linear-gradient(135deg, #a855f7, #6366f1)",
          }}
        />
      </div>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Authoring/Keyframes",
  component: KeyframesStory,
  args: {
    duration: 1200, // the guide's bounce duration
  },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 8000, step: 100 } },
  },
} satisfies Meta<typeof KeyframesStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The guide's \`bounce\`: drop, land, rebound, settle — normalized keyframes. */
export const Bounce: Story = {};
`})})})),_=[`Bounce`],g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{}`,...g.parameters?.docs?.source},description:{story:"The guide's `bounce`: drop, land, rebound, settle — normalized keyframes.",...g.parameters?.docs?.description}}}})))()}v();export{g as Bounce,_ as __namedExportsOrder,h as default};