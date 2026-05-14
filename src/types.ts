export interface Bridge {
	id: string;
	name: string;
	repoPath: string;      // absolute local path to git repo root
	sourcePath: string;    // subfolder within repo to link (empty = whole repo)
	vaultPath: string;     // destination path inside vault
	branch: string;
	autoSync: boolean;
	lastSynced?: string;   // ISO timestamp (kept for backward compat, mirrors lastPulled)
	lastPulled?: string;   // ISO timestamp of last successful pull
	lastPushed?: string;   // ISO timestamp of last successful push
	fileManifest?: Record<string, number>; // vault-relative path → mtimeMs, recorded after each pull
	isDirty?: boolean;     // true if vault files have been modified since last pull
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
