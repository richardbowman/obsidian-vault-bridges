import { App, PluginSettingTab, Setting } from 'obsidian';
import type VaultBridgesPlugin from '../main';
import type { Bridge } from './types';
import { AddBridgeModal } from './AddBridgeModal';

export class VaultBridgesSettingsTab extends PluginSettingTab {
	constructor(app: App, private plugin: VaultBridgesPlugin) {
		super(app, plugin);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Vault Bridges' });
		containerEl.createEl('p', {
			text: 'Connect external Git repositories into your vault via symlinks. Each bridge pulls the latest from a local repo and creates a symlink at your chosen vault path.',
			cls: 'vault-bridges-description',
		});

		// Global toggle
		new Setting(containerEl)
			.setName('Sync on startup')
			.setDesc('Pull and verify all auto-sync bridges when Obsidian opens.')
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.syncOnStartup)
					.onChange(async value => {
						this.plugin.settings.syncOnStartup = value;
						await this.plugin.saveSettings();
					})
			);

		// Bridges list
		containerEl.createEl('h3', { text: 'Bridges' });

		if (this.plugin.settings.bridges.length === 0) {
			containerEl.createEl('p', {
				text: 'No bridges yet. Add one below.',
				cls: 'vault-bridges-empty',
			});
		} else {
			this.renderBridges(containerEl);
		}

		// Add bridge
		new Setting(containerEl)
			.addButton(btn =>
				btn
					.setButtonText('+ Add Bridge')
					.setCta()
					.onClick(() => {
						new AddBridgeModal(this.app, this.plugin, null, () => this.display()).open();
					})
			);

		// Bulk actions
		if (this.plugin.settings.bridges.length > 0) {
			new Setting(containerEl)
				.setName('Bulk actions')
				.addButton(btn =>
					btn
						.setButtonText('Sync All Now')
						.onClick(async () => {
							await this.plugin.bridgeManager.syncAll();
							this.display();
						})
				)
				.addButton(btn =>
					btn
						.setButtonText('Rebuild All Links')
						.setTooltip('Tear down and recreate every symlink — useful after moving the vault')
						.onClick(async () => {
							await this.plugin.bridgeManager.rebuildAllLinks();
							this.display();
						})
				);
		}
	}

	private renderBridges(containerEl: HTMLElement): void {
		for (const bridge of this.plugin.settings.bridges) {
			const setting = new Setting(containerEl)
				.setName(bridge.name)
				.setDesc(this.descriptionFor(bridge));

			// Inline status badge
			setting.nameEl.createSpan({
				text: ` ${this.statusEmoji(bridge.status)}`,
				cls: `vault-bridges-badge vault-bridges-badge-${bridge.status}`,
			});

			setting
				.addButton(btn =>
					btn
						.setIcon('refresh-cw')
						.setTooltip('Sync this bridge')
						.onClick(async () => {
							await this.plugin.bridgeManager.syncBridge(bridge);
							await this.plugin.saveSettings();
							this.display();
						})
				)
				.addButton(btn =>
					btn
						.setIcon('pencil')
						.setTooltip('Edit bridge')
						.onClick(() => {
							new AddBridgeModal(this.app, this.plugin, bridge, () => this.display()).open();
						})
				)
				.addButton(btn =>
					btn
						.setIcon('trash')
						.setTooltip('Remove bridge and delete symlink')
						.setWarning()
						.onClick(async () => {
							await this.plugin.bridgeManager.removeLink(bridge);
							this.plugin.settings.bridges = this.plugin.settings.bridges.filter(
								b => b.id !== bridge.id
							);
							await this.plugin.saveSettings();
							this.plugin.statusBar.update();
							this.display();
						})
				);
		}
	}

	private descriptionFor(bridge: Bridge): string {
		const src = bridge.sourcePath
			? `${bridge.repoPath}/${bridge.sourcePath}`
			: bridge.repoPath;
		const arrow = '→';
		const syncLabel = bridge.lastSynced
			? `Last synced ${new Date(bridge.lastSynced).toLocaleString()}`
			: 'Never synced';
		const errorNote = bridge.lastError ? ` · Error: ${bridge.lastError}` : '';
		return `${src} ${arrow} ${bridge.vaultPath} · ${syncLabel}${errorNote}`;
	}

	private statusEmoji(status: Bridge['status']): string {
		const map: Record<Bridge['status'], string> = {
			ok: '✅',
			error: '❌',
			syncing: '🔄',
			unlinked: '🔗',
			unknown: '⚪',
		};
		return map[status] ?? '⚪';
	}
}
