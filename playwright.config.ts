import { defineConfig, devices } from "@playwright/test";

const basePath = "/Second-Cast-Thesis-2026";

export default defineConfig({
  testDir: "./tests/smoke",
  fullyParallel: true,
  reporter: "line",
  use: {
    baseURL: `http://127.0.0.1:3000${basePath}/`,
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1",
    url: `http://127.0.0.1:3000${basePath}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
