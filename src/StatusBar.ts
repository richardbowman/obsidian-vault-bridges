import type VaultBridgesPlugin from '../main';

export class StatusBarManager {
	private statusBarItem: HTMLElement;

	constructor(private plugin: VaultBridgesPlugin) {
		this.statusBarItem = plugin.addStatusBarItem();
		this.statusBarItem.addClass('vault-bridges-status-bar');
		this.statusBarItem.style.cursor = 'pointer';
		this.statusBarItem.setAttribute('aria-label', 'Vault Bridges status');
		this.statusBarItem.addEventListener('click', () => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const setting = (plugin.app as any).setting;
			setting?.open();
			setting?.openTabById('vault-bridges');
		});
		this.update();
	}

	update(): void {
		const { bridges } = this.plugin.settings;

		if (bridges.length === 0) {
			this.statusBarItem.setText('⇅ Bridges');
			this.statusBarItem.setAttribute('aria-label', 'Vault Bridges: no bridges configured');
			return;
		}

		const errorCount = bridges.filter(b => b.status === 'error').length;
		const syncingCount = bridges.filter(b => b.status === 'syncing').length;
		const dirtyCount = bridges.filter(b => b.isDirty).length;
		const total = bridges.length;

		if (syncingCount > 0) {
			this.statusBarItem.setText('⇅ Syncing…');
			this.statusBarItem.setAttribute('aria-label', 'Vault Bridges: syncing');
		} else if (errorCount > 0) {
			this.statusBarItem.setText(`⇅ ${total - errorCount}/${total} ❌`);
			this.statusBarItem.setAttribute('aria-label', `Vault Bridges: ${errorCount} error${errorCount > 1 ? 's' : ''}`);
		} else if (dirtyCount > 0) {
			const cleanCount = total - dirtyCount;
			const text = cleanCount > 0
				? `⇅ ${cleanCount}/${total} ✓ · ${dirtyCount} ⚠️`
				: `⇅ ${total} bridge${total !== 1 ? 's' : ''} ⚠️`;
			this.statusBarItem.setText(text);
			this.statusBarItem.setAttribute('aria-label', `Vault Bridges: ${dirtyCount} bridge${dirtyCount !== 1 ? 's' : ''} with unsaved edits`);
		} else {
			this.statusBarItem.setText(`⇅ ${total} bridge${total !== 1 ? 's' : ''} ✓`);
			this.statusBarItem.setAttribute('aria-label', `Vault Bridges: ${total} bridge${total !== 1 ? 's' : ''} synced`);
		}
	}
}
