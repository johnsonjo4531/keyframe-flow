import { defineConfig } from "vite-plus";

// Vite+ configuration shared by `vp dev`, `vp build`, and `vp test` (unit).
// The animation/transform core must run without browser APIs (§2 principle 1),
// so unit tests run in the plain Node environment. Browser-environment tests
// live in separate `*.browser.test.ts` files driven by vitest.browser.config.ts.
export default defineConfig({
  build: {
    lib: {
      // Two entry points: the framework-free core and the React integration
      // (T52), published as "." and "./react" via package.json exports.
      entry: { index: "src/index.ts", react: "src/react/index.ts" },
      formats: ["es"],
      // Rolldown takes `fileName` verbatim, so spell out the extension.
      fileName: (_format, entryName) =>
        entryName === "index" ? "keyframe-flow.js" : `keyframe-flow.${entryName}.js`,
    },
    // React is a peer of the ./react subpath only — never bundled into output.
    rollupOptions: { external: [/^react(\/|$)/] },
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
