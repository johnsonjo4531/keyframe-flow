docs(storybook): show real example source in the Code panel (T47)

Every published example now renders its authored TSX next to the live
canvas, so readers see actual keyframe-flow usage — imports, animation
definitions, adapter wiring — not just a running demo.

- Enable the Code panel project-wide via `parameters.docs.codePanel: true`
  in examples/.storybook/preview.tsx (the recommended global location).
- Add @storybook/addon-docs (^10.6.7) as a devDependency and register it in
  examples/.storybook/main.ts — the Code panel is contributed by the docs
  addon's manager entry, so the parameter alone does nothing without it.
- Inject real story source with a small `enforce: "pre"` Vite plugin
  (`injectStorySourcePlugin`): Storybook's auto-generated
  `<Component {...args}/>` snippet renders as `<l …/>` in minified builds,
  and neither `source.type: "static"` nor `originalSource` outrank it. The
  plugin appends each `.stories.tsx` module's verbatim source into
  `meta.parameters.docs.source.code`, the panel's highest-precedence key,
  matching the files' uniform `const meta = …; export default meta;` shape.
- Documented the mechanism in docs/contributing-docs.md (Storybook section).
- Verified with Playwright against the rebuilt static site: all 18 stories
  open a Code tab containing authored TSX (`import { Animation, target }
  from "keyframe-flow"` etc.), zero console errors; examples tsc, unit suite
  (245), and vp check all green.
