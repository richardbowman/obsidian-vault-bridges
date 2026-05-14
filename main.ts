import { Plugin } from 'obsidian';
import { VaultBridgesSettings, DEFAULT_SETTINGS } from './src/types';
import { BridgeManager } from './src/BridgeManager';
import { VaultBridgesSettingsTab } from './src/SettingsTab';
import { StatusBarManager } from './src/StatusBar';

export default class VaultBridgesPlugin extends Plugin {
	settings!: VaultBridgesSettings;
	bridgeManager!: BridgeManager;
	statusBar!: StatusBarManager;

	async onload() {
		await this.loadSettings();

		this.bridgeManager = new BridgeManager(this);
		this.statusBar = new StatusBarManager(this);

		this.addSettingTab(new VaultBridgesSettingsTab(this.app, this));

		this.addCommand({
			id: 'sync-all-bridges',
			name: 'Sync All Bridges',
			callback: () => this.bridgeManager.syncAll(),
		});

		this.addCommand({
			id: 'rebuild-all-links',
			name: 'Rebuild All Links',
			callback: () => this.bridgeManager.rebuildAllLinks(),
		});

		this.addCommand({
			id: 'push-all-bridges',
			name: 'Push All Bridges',
			callback: () => this.bridgeManager.pushAll(),
		});

		// Auto-sync on startup after layout is ready
		this.app.workspace.onLayoutReady(() => {
			this.bridgeManager.syncOnStartup();
		});

		console.log('Vault Bridges: loaded');
	}

	onunload() {
		console.log('Vault Bridges: unloaded');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
