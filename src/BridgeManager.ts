import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { Notice, Platform } from 'obsidian';
import type VaultBridgesPlugin from '../main';
import type { Bridge } from './types';

const execAsync = promisify(exec);

export class BridgeManager {
	constructor(private plugin: VaultBridgesPlugin) {}

	get vaultBasePath(): string {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return (this.plugin.app.vault.adapter as any).basePath as string;
	}

	async syncAll(): Promise<void> {
		const { bridges } = this.plugin.settings;
		if (bridges.length === 0) {
			new Notice('Vault Bridges: No bridges configured.');
			return;
		}

		new Notice(`Vault Bridges: Syncing ${bridges.length} bridge${bridges.length > 1 ? 's' : ''}…`);

		for (const bridge of bridges) {
			await this.syncBridge(bridge);
		}

		await this.plugin.saveSettings();
		this.plugin.statusBar.update();
		new Notice('Vault Bridges: All bridges synced ✓');
	}

	async syncOnStartup(): Promise<void> {
		if (!this.plugin.settings.syncOnStartup) return;
		const autoBridges = this.plugin.settings.bridges.filter(b => b.autoSync);
		if (autoBridges.length === 0) return;

		for (const bridge of autoBridges) {
			await this.syncBridge(bridge);
		}
		await this.plugin.saveSettings();
		this.plugin.statusBar.update();
	}

	async syncBridge(bridge: Bridge): Promise<void> {
		bridge.status = 'syncing';
		this.plugin.statusBar.update();

		try {
			await this.gitPull(bridge);
			await this.ensureLink(bridge);

			bridge.status = 'ok';
			bridge.lastSynced = new Date().toISOString();
			bridge.lastError = undefined;
		} catch (err) {
			bridge.status = 'error';
			bridge.lastError = err instanceof Error ? err.message : String(err);
			console.error(`Vault Bridges: Error syncing "${bridge.name}":`, err);
			new Notice(`Vault Bridges: ❌ "${bridge.name}" — ${bridge.lastError}`, 8000);
		}
	}

	private async gitPull(bridge: Bridge): Promise<void> {
		if (!fs.existsSync(bridge.repoPath)) {
			throw new Error(`Repo path does not exist: ${bridge.repoPath}`);
		}

		const gitDir = path.join(bridge.repoPath, '.git');
		if (!fs.existsSync(gitDir)) {
			throw new Error(`Not a git repository: ${bridge.repoPath}`);
		}

		try {
			const { stdout, stderr } = await execAsync(
				`git -C "${bridge.repoPath}" pull origin ${bridge.branch}`,
				{ timeout: 30000 }
			);
			console.log(`Vault Bridges: Pulled "${bridge.name}":`, stdout || stderr);
		} catch (err) {
			throw new Error(`git pull failed: ${err instanceof Error ? err.message : String(err)}`);
		}
	}

	async ensureLink(bridge: Bridge): Promise<void> {
		const sourcePath = bridge.sourcePath
			? path.join(bridge.repoPath, bridge.sourcePath)
			: bridge.repoPath;

		const destPath = path.join(this.vaultBasePath, bridge.vaultPath);

		if (!fs.existsSync(sourcePath)) {
			throw new Error(`Source path does not exist: ${sourcePath}`);
		}

		// Ensure parent directory exists
		const destParent = path.dirname(destPath);
		if (!fs.existsSync(destParent)) {
			fs.mkdirSync(destParent, { recursive: true });
		}

		// If link already exists, check if it's correct
		if (fs.existsSync(destPath) || this.isSymlink(destPath)) {
			const stat = fs.lstatSync(destPath);
			if (stat.isSymbolicLink()) {
				const existing = fs.readlinkSync(destPath);
				if (existing === sourcePath) return; // Already correct
				fs.unlinkSync(destPath);
			} else {
				throw new Error(`Destination exists and is not a symlink: ${destPath}`);
			}
		}

		await this.createLink(sourcePath, destPath);
	}

	private isSymlink(p: string): boolean {
		try {
			return fs.lstatSync(p).isSymbolicLink();
		} catch {
			return false;
		}
	}

	private async createLink(src: string, dest: string): Promise<void> {
		if (Platform.isWin) {
			const stat = fs.statSync(src);
			if (stat.isDirectory()) {
				// Junction points don't require admin or Developer Mode on Windows
				await execAsync(`mklink /J "${dest}" "${src}"`);
			} else {
				fs.symlinkSync(src, dest);
			}
		} else {
			fs.symlinkSync(src, dest);
		}
	}

	async removeLink(bridge: Bridge): Promise<void> {
		const destPath = path.join(this.vaultBasePath, bridge.vaultPath);
		if (this.isSymlink(destPath)) {
			fs.unlinkSync(destPath);
		}
		bridge.status = 'unlinked';
	}

	async rebuildAllLinks(): Promise<void> {
		for (const bridge of this.plugin.settings.bridges) {
			try {
				await this.ensureLink(bridge);
			} catch (err) {
				console.error(`Vault Bridges: Failed to rebuild link for "${bridge.name}":`, err);
			}
		}
		await this.plugin.saveSettings();
		new Notice('Vault Bridges: All links rebuilt ✓');
	}
}
