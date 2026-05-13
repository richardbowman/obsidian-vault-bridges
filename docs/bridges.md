# Bridges Reference

A **bridge** is the core concept in Vault Bridges. Each bridge represents a connection between a source location (a path inside a local Git repo) and a destination location (a path inside your vault).

---

## How a Bridge Works

When you sync a bridge, the plugin does two things in order:

1. **Git pull** — runs `git pull origin <branch>` in the repo directory to fetch the latest changes
2. **Symlink verify** — checks that the symlink at the vault destination exists and points to the correct source; creates or repairs it if not

The result is a symlink in your vault that always reflects the current state of the repo after the last pull.

---

## Bridge Fields

### Name
A human-readable label used throughout the UI and command palette. Choose something descriptive — you may have several bridges and will need to distinguish them.

### Local Repo Path
The absolute filesystem path to the root of a locally-cloned Git repo. This is the directory that contains the `.git/` folder.

The repo must already exist on disk. Vault Bridges does not clone repos from a URL.

```
/Users/you/projects/company-docs       ← correct: contains .git/
/Users/you/projects/company-docs/docs  ← wrong: use Source Subfolder for this
```

### Source Subfolder
Optional. A path relative to the repo root specifying which subfolder to link into the vault.

| Source Subfolder | What gets linked |
|---|---|
| *(blank)* | The entire repo root |
| `docs` | The `docs/` folder only |
| `docs/architecture/decisions` | A deeply nested subfolder |

When blank, the entire repo root is linked. This means everything in the repo — including the `.git/` folder — is visible in Obsidian's file explorer (though `.git` files are filtered by Obsidian's excluded files setting).

For most use cases, specifying a `docs` or `notes` subfolder is cleaner.

### Vault Destination Path
The path inside your vault where the symlink will be created. This is relative to the vault root.

```
Work/Docs              ← creates a "Docs" folder inside "Work"
References/Handbook    ← creates "Handbook" inside "References"
ADRs                   ← creates "ADRs" at the vault root level
```

Parent folders are created automatically if they don't exist.

> **Important:** Do not set this to an existing vault folder that already has content. The plugin will refuse to overwrite a non-symlink path.

### Branch
The Git branch to pull from when syncing. Defaults to `main`.

If your repo uses a different default branch (`master`, `develop`, `trunk`), set this accordingly per bridge.

### Auto Sync on Startup
When enabled, this bridge is included in the startup sync batch. This is subject to the global **Sync on startup** toggle also being enabled.

Disable this for bridges that are large, slow to pull, or that you only want to sync manually.

---

## Bridge Status

Each bridge tracks its current state:

| Status | Meaning |
|---|---|
| `ok` | Last sync completed without errors. Symlink is in place. |
| `error` | Last sync failed. The error message is shown in settings. |
| `syncing` | A sync operation is currently in progress. |
| `unlinked` | The symlink has been removed (bridge removed from settings or `removeLink` was called). |
| `unknown` | Bridge was just added and has never been synced. |

The `lastSynced` timestamp records the ISO timestamp of the most recent successful sync.

---

## Sync Behavior

### What "sync" does

For each bridge, sync:
1. Checks the repo path exists and contains a `.git/` directory
2. Runs `git pull origin <branch>` with a 30-second timeout
3. Checks whether the symlink at the vault destination exists and points to the correct source
4. Creates or repairs the symlink if needed
5. Updates `status`, `lastSynced`, and `lastError`

### What sync does NOT do

- It does not `git clone` a new repo — the repo must already exist
- It does not push any changes back to the remote
- It does not handle merge conflicts — if the pull results in a conflict, the error is surfaced and the bridge is marked as errored
- It does not track changes you make in Obsidian back to Git — edits are written to the real files via the symlink, but committing and pushing is your responsibility

### Pull errors vs link errors

If `git pull` fails (e.g. no network, merge conflict, authentication error), the sync is marked as errored. The symlink may still be in place from a previous sync, meaning you can still read and edit files — they just may not be up to date.

If the symlink is missing or broken but the pull succeeded, the plugin recreates it. These two steps are semi-independent.

---

## Managing Multiple Bridges

There's no limit on the number of bridges. Each is synced independently and can have its own branch, subfolder, and auto-sync setting.

**Recommended layout for multiple bridges:**

```
vault/
  Work/
    Company Handbook/    ← bridge from company-docs repo, docs/ subfolder
    ADRs/                ← bridge from backend-api repo, docs/adr/ subfolder
  Open Source/
    Plugin Notes/        ← bridge from obsidian-plugin repo, notes/ subfolder
```

---

## Coexistence with Obsidian Git

If your vault is itself a Git repo managed by [Obsidian Git](https://github.com/Vinzent03/obsidian-git), you should add your bridge destination paths to the vault's `.gitignore`. Otherwise, Obsidian Git will attempt to stage the symlink itself (as a file pointer), which is usually not what you want.

Example `.gitignore` entry at your vault root:
```
# Vault Bridges symlinks
Work/Company Handbook
Work/ADRs
Open Source/Plugin Notes
```

---

## Editing Bridged Files

Because bridges use symlinks, any file you edit in Obsidian is edited **in-place in the original repo**. Changes are immediately reflected in the repo's working directory.

This means:
- You can use Obsidian to edit files in the repo (e.g. fix a typo in a doc)
- You still need to commit and push from a terminal or another Git tool
- There's no risk of losing changes to a "synced copy" — there is only one copy

If you prefer read-only access, the simplest approach is to not edit the files, or to set up a `.gitignore` in the repo that excludes Obsidian-specific files (`.obsidian/`, `*.canvas`, etc.) if you ever accidentally commit from the vault side.
