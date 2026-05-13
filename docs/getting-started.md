# Getting Started

This guide walks you through installing Vault Bridges and setting up your first bridge from scratch.

---

## Prerequisites

- **Obsidian** 0.15.0 or later (desktop only)
- **Git** installed and accessible from your terminal — run `git --version` to verify
- At least one Git repo cloned locally on your machine

Vault Bridges does not clone repos for you. It assumes the repo already exists on disk and manages the connection from there.

---

## Step 1: Install the Plugin

### Via BRAT (easiest for beta)

1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat) from the Obsidian community plugins list
2. Open **Settings → BRAT → Add Beta Plugin**
3. Enter `richardbowman/obsidian-vault-bridges`
4. Enable **Vault Bridges** in **Settings → Community Plugins**

### Manual Install

1. Download `main.js`, `manifest.json`, `styles.css` from the latest [GitHub release](https://github.com/richardbowman/obsidian-vault-bridges/releases)
2. In your vault, create the folder: `.obsidian/plugins/vault-bridges/`
3. Copy the three files into that folder
4. Restart Obsidian
5. Go to **Settings → Community Plugins** and enable **Vault Bridges**

---

## Step 2: Add Your First Bridge

1. Open **Settings → Vault Bridges**
2. Click **+ Add Bridge**
3. Fill in the form:

**Name**
A label you'll recognize — e.g. `Work Docs`, `Team Wiki`, `My Project ADRs`.

**Local repo path**
The absolute path to the Git repo on your machine. This is the folder that contains `.git/`.

Examples:
- macOS/Linux: `/Users/you/projects/company-handbook`
- Windows: `C:\Users\you\projects\company-handbook`

**Source subfolder** *(optional)*
If you only want part of the repo, enter the subfolder path relative to the repo root. Leave blank to link the entire repo.

Examples:
- `docs` — links just the `docs/` folder
- `docs/architecture` — links a nested subfolder
- *(blank)* — links the entire repo root

**Vault destination path**
Where inside your vault the link will appear. This is a path relative to your vault root.

Examples:
- `Work/Docs`
- `References/Company Handbook`
- `Projects/My App/ADRs`

**Branch**
The Git branch to pull from. Defaults to `main`.

**Auto sync on startup**
If enabled, this bridge will be pulled automatically every time Obsidian opens (subject to the global "Sync on startup" setting also being on).

4. Click **Add Bridge** — the plugin pulls the repo and creates the symlink immediately.

Your files now appear inside Obsidian at the vault destination path you specified.

---

## Step 3: Verify It's Working

After adding the bridge:

- Navigate to the vault destination path in Obsidian's file explorer — your repo files should be there
- Check the status bar at the bottom of the screen — you should see `⇅ 1 bridge ✓`
- Open any file from the bridged folder and confirm it renders correctly

If you see ❌ in the status bar, open **Settings → Vault Bridges** — the error message will be shown next to the bridge.

---

## Next Steps

- [Bridges Reference](bridges.md) — detailed explanation of every field and behavior
- [Use Cases](use-cases.md) — common setups and real-world examples
- [Troubleshooting](troubleshooting.md) — fixes for common problems
- [Windows Setup](windows.md) — Windows-specific notes and junction points
