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
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
