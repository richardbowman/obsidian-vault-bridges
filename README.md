# Vault Bridges — Obsidian Plugin

**Connect external Git repositories into your vault via managed symlinks.**

Vault Bridges lets you point at any locally-cloned Git repo (or a subfolder within one), pull the latest changes, and access those files directly inside Obsidian — fully searchable, linkable, and editable. No manual symlinking, no copy-paste sync.

---

## Screenshots

![Vault Bridges settings panel showing three bridges with different statuses](docs/screenshot-settings.png)

![Add Bridge modal with form filled in](docs/screenshot-add-bridge.png)

---

## Why Vault Bridges?

Obsidian is vault-bound by design. If you have notes, docs, or ADRs living in a Git repo outside your vault, your options are usually "copy them in manually" or "give up on linking them."

Vault Bridges adds a third option: a managed symlink that stays fresh. Each **bridge** is a named connection between a local repo (or subfolder) and a destination path in your vault. The plugin handles creating the symlink, pulling the latest from Git, and showing you status at a glance.

**Common use cases:**
- Surfacing `docs/` or `ADRs/` from a work repo into your PKM
- Keeping a shared team knowledge base in sync
- Reading changelogs and READMEs from projects you maintain
- Linking dotfiles docs into your vault

---

## Features

- **Git pull on demand** — sync any bridge from the command palette, settings panel, or automatically on Obsidian startup
- **Symlink management** — creates, verifies, and repairs symlinks automatically; no manual `ln -s` required
- **Subfolder support** — link a whole repo or just a subdirectory (e.g. `docs/adr`)
- **Per-bridge controls** — sync, edit, or remove each bridge independently
- **Status bar indicator** — see bridge health at a glance; click to open settings
- **Cross-platform** — uses symlinks on macOS/Linux, junction points on Windows (no admin rights required for directories)
- **Desktop only** — symlinks require filesystem access; mobile is not supported

---

## Installation

### Option 1: BRAT (recommended for beta users)

1. Install the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat) from the Obsidian community plugins list
2. Open BRAT settings → **Add Beta Plugin**
3. Enter: `richardbowman/obsidian-vault-bridges`
4. Enable **Vault Bridges** in Settings → Community Plugins

### Option 2: Manual

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/richardbowman/obsidian-vault-bridges/releases)
2. Create the folder `.obsidian/plugins/vault-bridges/` inside your vault
3. Copy the three files into that folder
4. Restart Obsidian and enable the plugin in Settings → Community Plugins

---

## Quick Start

1. Enable the plugin in **Settings → Community Plugins → Vault Bridges**
2. Open **Settings → Vault Bridges**
3. Click **+ Add Bridge**
4. Fill in:
   - **Name** — e.g. `Work Docs`
   - **Local repo path** — e.g. `/Users/you/projects/company-docs`
   - **Source subfolder** — e.g. `docs/adr` (leave blank for the whole repo)
   - **Vault destination** — e.g. `Work/ADRs`
   - **Branch** — default `main`
5. Save — the plugin will pull and create the symlink immediately

Your files now appear at `Work/ADRs` inside your vault and are fully accessible.

---

## Configuration Reference

### Settings Panel

| Setting | Description |
|---|---|
| **Sync on startup** | Pull all auto-sync bridges when Obsidian opens |

### Per-Bridge Fields

| Field | Required | Description |
|---|---|---|
| **Name** | ✅ | Display label for this bridge |
| **Local repo path** | ✅ | Absolute path to the git repo root on your machine |
| **Source subfolder** | — | Subfolder within the repo to link. Leave blank to link the entire repo root |
| **Vault destination path** | ✅ | Relative path inside your vault where the symlink will appear |
| **Branch** | ✅ | Git branch to pull from (default: `main`) |
| **Auto sync on startup** | — | Pull this specific bridge on Obsidian startup |

### Status Indicators

| Icon | Meaning |
|---|---|
| ✅ | Last sync succeeded |
| ❌ | Last sync failed — hover or open settings to see the error |
| 🔄 | Currently syncing |
| 🔗 | Symlink removed (bridge is registered but unlinked) |
| ⚪ | Never synced |

---

## Commands

Access via **Cmd/Ctrl+P**:

| Command | Description |
|---|---|
| `Vault Bridges: Sync All Bridges` | Pull and verify every bridge |
| `Vault Bridges: Rebuild All Links` | Tear down and recreate all symlinks — useful after moving the vault |

Individual bridge sync is available from the **Settings → Vault Bridges** panel via the refresh icon next to each bridge.

---

## Platform Notes

### macOS / Linux

Standard symlinks (`fs.symlink`) are used. No special permissions required.

### Windows

Directory bridges use **junction points** (`mklink /J`) rather than symlinks. Junction points don't require Administrator rights or Developer Mode, making them the safe default for directory links.

For **file-level** bridges on Windows (i.e. linking a single file rather than a directory), a standard symlink is used, which may require Developer Mode to be enabled in Windows Settings.

See [Windows Setup Guide](docs/windows.md) for detailed instructions.

---

## Known Limitations

- **Read-only pull only** — the plugin pulls but does not push. If you edit bridged files in Obsidian, you'll need to push from a terminal.
- **Repo must be cloned locally** — the plugin does not clone repos from a URL. You need to have the repo on disk already.
- **No mobile support** — symlinks require filesystem access not available on Obsidian Mobile.
- **Vault move** — if you move your vault, run `Vault Bridges: Rebuild All Links` to recreate symlinks at the new absolute path.
- **Obsidian Git coexistence** — if your vault is itself a git repo managed by Obsidian Git, add your bridge destination paths to the vault's `.gitignore` to prevent double-tracking.

---

## Development

```bash
git clone https://github.com/richardbowman/obsidian-vault-bridges
cd obsidian-vault-bridges
npm install

# Watch mode — rebuilds on every save
npm run dev

# Type-check only
npm run typecheck

# Production build + copy to vault
npm run deploy
```

The plugin is written in TypeScript and uses esbuild for bundling. Source files live in `src/`; the entry point is `main.ts`.

See [Development Guide](docs/development.md) for architecture details, adding new features, and testing.

---

## Contributing

Issues and PRs welcome. If you have a use case that isn't covered — clone-from-URL, push support, sync scheduling — please open an issue first to discuss the approach before building.

---

## License

MIT © Rick Bowman
