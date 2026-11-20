import { defineConfig } from "vite-plus";

// Vite+ configuration shared by `vp dev`, `vp build`, and `vp test` (unit).
// The animation/transform core must run without browser APIs (§2 principle 1),
// so unit tests run in the plain Node environment. Browser-environment tests
// live in separate `*.browser.test.ts` files driven by vitest.browser.config.ts.
export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "keyframe-flow",
    },
    sourcemap: true,
  },
  lint: {
    ignorePatterns: ["dist/**", "node_modules/**"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "src/**/*.browser.test.ts"],
    environment: "node",
  },
});
