import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: isCI,
    retries: isCI ? 2 : 0,
    workers: isCI ? 1 : undefined,
    reporter: [
        ['list'],
        ['html', { open: 'never' }]
    ],
    use: {
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
        colorScheme: 'dark',
        screenshot: 'on'
    },
    projects: [
        {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
        },
    ],
    // boot Vite when running test:ui
    webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !isCI,
    stdout: 'ignore',
  },
});
