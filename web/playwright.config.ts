import { defineConfig, devices } from '@playwright/test'

/**
 * On Windows the npm binary must be invoked as `npm.cmd` — the bare `npm`
 * resolves to a PowerShell shim that the local execution policy blocks. On
 * Linux and macOS (and therefore on GitHub's Ubuntu runners) `npm.cmd` does
 * not exist at all, and using it fails with exit code 127 before any test runs.
 */
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'

export default defineConfig({
  testDir: './e2e',
  // The hero suite scrolls through 400vh and waits for rAF settling.
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  // Retry once in CI: software WebGL rendering is slower and occasionally
  // misses a settling deadline that passes comfortably on a real GPU.
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['github']] : [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 900 },
    trace: process.env.CI ? 'retain-on-failure' : 'off',
    screenshot: 'only-on-failure',
    launchOptions: {
      args: [
        // CI runners have no GPU. These force a software WebGL implementation
        // so Three.js actually renders and useFrame runs — without them the
        // canvas never produces a frame and window.__hero is never published.
        '--enable-unsafe-swiftshader',
        '--use-gl=angle',
        '--use-angle=swiftshader',
      ],
    },
  },
  webServer: {
    command: `${npm} run preview -- --port 4173 --strictPort`,
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
