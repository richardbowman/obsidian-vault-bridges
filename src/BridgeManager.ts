import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { Notice } from 'obsidian';
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
			await this.copyFiles(bridge);

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

		// Validate branch contains no shell metacharacters before interpolation
		if (!/^[a-zA-Z0-9._\-/]+$/.test(bridge.branch)) {
			throw new Error(`Invalid branch name: "${bridge.branch}"`);
		}

		try {
			const { stdout, stderr } = await execAsync(
				`git -C "${bridge.repoPath}" pull origin "${bridge.branch}"`,
				{ timeout: 30000 }
			);
			console.log(`Vault Bridges: Pulled "${bridge.name}":`, stdout || stderr);
		} catch (err) {
			throw new Error(`git pull failed: ${err instanceof Error ? err.message : String(err)}`);
		}
	}

	async copyFiles(bridge: Bridge): Promise<void> {
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

		// If destination is a legacy symlink, remove it before copying
		if (this.isSymlink(destPath)) {
			fs.unlinkSync(destPath);
		}

		const stat = fs.statSync(sourcePath);
		if (stat.isDirectory()) {
			fs.cpSync(sourcePath, destPath, {
				recursive: true,
				force: true,
				filter: (src: string) => path.basename(src) !== '.git',
			});
		} else {
			fs.copyFileSync(sourcePath, destPath);
		}
	}

	private isSymlink(p: string): boolean {
		try {
			return fs.lstatSync(p).isSymbolicLink();
		} catch {
			return false;
		}
	}

	async removeLink(bridge: Bridge): Promise<void> {
		const destPath = path.join(this.vaultBasePath, bridge.vaultPath);
		if (this.isSymlink(destPath)) {
			fs.unlinkSync(destPath);
		} else if (fs.existsSync(destPath)) {
			fs.rmSync(destPath, { recursive: true, force: true });
		}
		bridge.status = 'unlinked';
	}

	async rebuildAllLinks(): Promise<void> {
		for (const bridge of this.plugin.settings.bridges) {
			try {
				await this.copyFiles(bridge);
			} catch (err) {
				console.error(`Vault Bridges: Failed to rebuild copy for "${bridge.name}":`, err);
			}
		}
		await this.plugin.saveSettings();
		new Notice('Vault Bridges: All copies rebuilt ✓');
	}

	async pushAll(): Promise<void> {
		const { bridges } = this.plugin.settings;
		if (bridges.length === 0) {
			new Notice('Vault Bridges: No bridges configured.');
			return;
		}
		new Notice(`Vault Bridges: Pushing ${bridges.length} bridge${bridges.length > 1 ? 's' : ''}…`);
		for (const bridge of bridges) {
			await this.pushBridge(bridge);
		}
		await this.plugin.saveSettings();
		this.plugin.statusBar.update();
		new Notice('Vault Bridges: All bridges pushed ✓');
	}

	async pushBridge(bridge: Bridge): Promise<void> {
		bridge.status = 'syncing';
		this.plugin.statusBar.update();

		try {
			// Validate branch
			if (!/^[a-zA-Z0-9._\-/]+$/.test(bridge.branch)) {
				throw new Error(`Invalid branch name: "${bridge.branch}"`);
			}

			const sourcePath = bridge.sourcePath
				? path.join(bridge.repoPath, bridge.sourcePath)
				: bridge.repoPath;
			const vaultPath = path.join(this.vaultBasePath, bridge.vaultPath);

			if (!fs.existsSync(vaultPath)) {
				throw new Error(`Vault path does not exist: ${vaultPath}. Run a pull sync first.`);
			}

			// Copy vault → repo (reverse direction)
			const stat = fs.statSync(vaultPath);
			if (stat.isDirectory()) {
				fs.cpSync(vaultPath, sourcePath, { recursive: true, force: true });
			} else {
				fs.copyFileSync(vaultPath, sourcePath);
			}

			// Stage all changes
			await execAsync(`git -C "${bridge.repoPath}" add -A`, { timeout: 15000 });

			// Check if anything actually changed
			const { stdout: statusOut } = await execAsync(
				`git -C "${bridge.repoPath}" status --porcelain`,
				{ timeout: 15000 }
			);

			if (!statusOut.trim()) {
				new Notice(`Vault Bridges: "${bridge.name}" — nothing to push, already up to date`);
				bridge.status = 'ok';
				return;
			}

			// Commit and push
			const timestamp = new Date().toLocaleString();
			await execAsync(
				`git -C "${bridge.repoPath}" commit -m "Update from Obsidian vault (${timestamp})"`,
				{ timeout: 15000 }
			);
			await execAsync(
				`git -C "${bridge.repoPath}" push origin "${bridge.branch}"`,
				{ timeout: 30000 }
			);

			bridge.status = 'ok';
			bridge.lastSynced = new Date().toISOString();
			bridge.lastError = undefined;
			new Notice(`Vault Bridges: ✓ "${bridge.name}" pushed to ${bridge.branch}`);
		} catch (err) {
			bridge.status = 'error';
			bridge.lastError = err instanceof Error ? err.message : String(err);
			console.error(`Vault Bridges: Error pushing "${bridge.name}":`, err);
			new Notice(`Vault Bridges: ❌ "${bridge.name}" push failed — ${bridge.lastError}`, 8000);
		} finally {
			await this.plugin.saveSettings();
			this.plugin.statusBar.update();
		}
	}
}
