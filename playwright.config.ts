import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './test/screenshots',
	use: {
		viewport: { width: 860, height: 620 },
		deviceScaleFactor: 2,
	},
	expect: {
		toHaveScreenshot: {
			scale: 'device',
		},
	},
	projects: [{ name: 'chromium', use: { channel: 'chromium' } }],
	snapshotDir: './test/screenshots/snapshots',
});
