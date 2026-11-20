import type { Decorator, Preview } from "@storybook/react";

const centerStage: Decorator = (Story) => (
  <div
    style={{
      display: "grid",
      placeItems: "center",
      minHeight: "60vh",
      padding: 24,
      background: "repeating-conic-gradient(#80808014 0% 25%, transparent 0% 50%) 50% / 16px 16px",
    }}
  >
    <Story />
  </div>
);

const preview: Preview = {
  decorators: [centerStage],
  parameters: {
    // Show each story's source next to its canvas (docs Code panel), so the
    // published examples are readable as code, not just as running demos.
    // The snippet itself is the real story-file source, injected by the
    // keyframe-flow-story-source Vite plugin in main.ts (minified builds make
    // auto-generated `<Component {...args}/>` snippets unreadable).
    docs: { codePanel: true, source: { type: "static" } },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
