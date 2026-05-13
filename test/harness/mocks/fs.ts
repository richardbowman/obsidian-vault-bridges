/**
 * fs mock for the Vault Bridges harness.
 * Returns plausible values so BridgeManager's sync/link logic runs without errors.
 */

const MOCK_REPO_BASE = '/mock/repos';

// Paths we treat as "existing" symlinks pointing correctly
const symlinkPaths = new Set<string>();
// Paths we treat as directories
const dirPaths = new Set<string>([
	`${MOCK_REPO_BASE}/work-docs`,
	`${MOCK_REPO_BASE}/work-docs/.git`,
	`${MOCK_REPO_BASE}/work-docs/docs`,
	`${MOCK_REPO_BASE}/team-wiki`,
	`${MOCK_REPO_BASE}/team-wiki/.git`,
	`${MOCK_REPO_BASE}/oss-project`,
	`${MOCK_REPO_BASE}/oss-project/.git`,
	`${MOCK_REPO_BASE}/oss-project/docs`,
	'/mock/vault',
	'/mock/vault/Work',
	'/mock/vault/Shared',
]);

export default {
	existsSync: (p: string): boolean => {
		if (symlinkPaths.has(p)) return true;
		return dirPaths.has(p);
	},

	lstatSync: (p: string) => ({
		isSymbolicLink: () => symlinkPaths.has(p),
		isDirectory: () => dirPaths.has(p),
		isFile: () => false,
	}),

	statSync: (p: string) => ({
		isDirectory: () => dirPaths.has(p) || p.includes('repos'),
		isFile: () => false,
		isSymbolicLink: () => false,
	}),

	readlinkSync: (_p: string): string => {
		// Return something — won't match so links get recreated
		return '/wrong/old/path';
	},

	symlinkSync: (src: string, dest: string): void => {
		console.log(`[fs mock] symlink: ${src} → ${dest}`);
		symlinkPaths.add(dest);
	},

	unlinkSync: (p: string): void => {
		console.log(`[fs mock] unlink: ${p}`);
		symlinkPaths.delete(p);
	},

	mkdirSync: (p: string, _opts?: unknown): void => {
		console.log(`[fs mock] mkdir: ${p}`);
		dirPaths.add(p);
	},
};
