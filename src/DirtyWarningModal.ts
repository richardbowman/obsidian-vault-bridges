import { App, Modal, Setting } from 'obsidian';
import type { Bridge } from './types';

export interface DirtyWarningCallbacks {
	onPushThenPull: () => Promise<void>;
	onPullAnyway: () => Promise<void>;
}

export class DirtyWarningModal extends Modal {
	constructor(
		app: App,
		private bridge: Bridge,
		private callbacks: DirtyWarningCallbacks,
	) {
		super(app);
	}

	onOpen(): void {
		const { contentEl } = this;

		contentEl.createEl('h2', { text: '⚠️ Unsaved Edits Detected' });
		contentEl.createEl('p', {
			text: `"${this.bridge.name}" has vault edits that haven't been pushed yet. Pulling now will overwrite those edits with the repo's current state.`,
		});
		contentEl.createEl('p', {
			text: 'What would you like to do?',
			cls: 'vault-bridges-dirty-subtitle',
		});

		new Setting(contentEl)
			.addButton(btn =>
				btn
					.setButtonText('Push then Pull')
					.setTooltip('Commit and push your vault edits to the repo, then pull the latest')
					.setCta()
					.onClick(async () => {
						this.close();
						await this.callbacks.onPushThenPull();
					})
			)
			.addButton(btn =>
				btn
					.setButtonText('Pull anyway')
					.setTooltip('Discard your vault edits and overwrite with the repo state')
					.setWarning()
					.onClick(async () => {
						this.close();
						await this.callbacks.onPullAnyway();
					})
			)
			.addButton(btn =>
				btn
					.setButtonText('Cancel')
					.onClick(() => this.close())
			);
	}

	onClose(): void {
		this.contentEl.empty();
	}
}
