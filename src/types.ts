export interface Bridge {
	id: string;
	name: string;
	repoPath: string;      // absolute local path to git repo root
	sourcePath: string;    // subfolder within repo to link (empty = whole repo)
	vaultPath: string;     // destination path inside vault
	branch: string;
	autoSync: boolean;
	lastSynced?: string;   // ISO timestamp
	status: 'ok' | 'error' | 'syncing' | 'unlinked' | 'unknown';
	lastError?: string;
}

export interface VaultBridgesSettings {
	bridges: Bridge[];
	syncOnStartup: boolean;
}

export const DEFAULT_SETTINGS: VaultBridgesSettings = {
	bridges: [],
	syncOnStartup: true,
};
