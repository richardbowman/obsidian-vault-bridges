import type { Bridge } from '../../src/types';

const now = Date.now();

export const fixtureBridges: Bridge[] = [
	{
		id: 'bridge-work-docs',
		name: 'Work Docs',
		repoPath: '/mock/repos/work-docs',
		sourcePath: 'docs',
		vaultPath: 'Work/Docs',
		branch: 'main',
		autoSync: true,
		status: 'ok',
		lastSynced: new Date(now - 4 * 60 * 1000).toISOString(), // 4 minutes ago
	},
	{
		id: 'bridge-team-wiki',
		name: 'Team Wiki',
		repoPath: '/mock/repos/team-wiki',
		sourcePath: '',
		vaultPath: 'Shared/Team Wiki',
		branch: 'main',
		autoSync: true,
		status: 'error',
		lastSynced: new Date(now - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
		lastError: 'git pull failed: Authentication required',
	},
	{
		id: 'bridge-oss',
		name: 'OSS Project Docs',
		repoPath: '/mock/repos/oss-project',
		sourcePath: 'docs',
		vaultPath: 'Open Source/My Project',
		branch: 'main',
		autoSync: false,
		status: 'unknown',
	},
];

export const emptyBridges: Bridge[] = [];
