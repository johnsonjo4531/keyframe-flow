import { defineConfig } from "vite-plus";
import { playwright } from "vite-plus/test/browser-playwright";

// Browser test configuration, run via `vp test run --config vitest.browser.config.ts`
// (the `make test-browser` target). These tests validate interoperability with
// real browser APIs (native DOMMatrix) while the library core itself remains
// free of browser dependencies (§2 principle 1, §15.2).
export default defineConfig({
  test: {
    include: ["src/**/*.browser.test.ts", "src/**/*.browser.test.tsx"],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
});
