import { defineConfig, devices } from "@playwright/test";
const previewUrl = process.env.PLAYWRIGHT_BASE_URL;
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  outputDir: ".verify-ui/results",
  use: {
    baseURL: previewUrl || "http://localhost:3100",
    channel: "chrome",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: previewUrl
    ? undefined
    : {
        command: "npm run start -- -p 3100",
        url: "http://localhost:3100",
        reuseExistingServer: !process.env.CI,
        timeout: 60000,
      },
});
