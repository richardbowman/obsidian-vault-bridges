# Bridges Reference

A **bridge** is the core concept in Vault Bridges. Each bridge represents a connection between a source location (a path inside a local Git repo) and a destination location (a path inside your vault).

---

## How a Bridge Works

A bridge supports two operations: **Pull** and **Push**.

### Pull (repo → vault)

1. Runs `git pull origin <branch>` in the repo directory to fetch the latest changes from the remote
2. Copies files from the source path in the repo into the vault destination using a recursive file copy — the `.git/` folder is excluded
3. If a legacy symlink exists at the vault destination, it is removed first and replaced with real files

The result is a set of real files in your vault that reflect the state of the repo after the last pull. These files are fully indexed by Obsidian — they appear in search, Quick Switcher, backlinks, and the graph view just like any other vault note.

### Push (vault → repo)

1. Copies files from the vault destination back to the source path in the repo
2. Stages all changes with `git add -A`
3. Checks `git status --porcelain` — if nothing changed, the commit and push are skipped
4. Commits with an auto-generated message: `Update from Obsidian vault (<timestamp>)`
5. Pushes to `origin <branch>`

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
Optional. A path relative to the repo root specifying which subfolder to copy into the vault.

| Source Subfolder | What gets copied |
|---|---|
| *(blank)* | The entire repo root (excluding `.git/`) |
| `docs` | The `docs/` folder only |
| `docs/architecture/decisions` | A deeply nested subfolder |

For most use cases, specifying a `docs` or `notes` subfolder is cleaner than copying the entire repo root.

### Vault Destination Path
The path inside your vault where the copied files will be placed. This is relative to the vault root.

```
Work/Docs              ← copies files into a "Docs" folder inside "Work"
References/Handbook    ← copies files into "Handbook" inside "References"
ADRs                   ← copies files into "ADRs" at the vault root level
```

Parent folders are created automatically if they don't exist.

### Branch
The Git branch to pull from and push to. Defaults to `main`.

If your repo uses a different default branch (`master`, `develop`, `trunk`), set this accordingly per bridge.

### Auto Sync on Startup
When enabled, this bridge is included in the startup sync batch. This is subject to the global **Sync on startup** toggle also being enabled.

Disable this for bridges that are large, slow to pull, or that you only want to sync manually.

---

## Bridge Status

Each bridge tracks its current state:

| Status | Meaning |
|---|---|
| `ok` | Last sync completed without errors. |
| `error` | Last sync or push failed. The error message is shown in settings. |
| `syncing` | A sync or push operation is currently in progress. |
| `unlinked` | The bridge destination has been removed (bridge was deleted from settings). |
| `unknown` | Bridge was just added and has never been synced. |

The `lastSynced` timestamp records the ISO timestamp of the most recent successful sync.

---

## Sync Behavior

### What "sync" (pull) does

For each bridge, sync:
1. Checks the repo path exists and contains a `.git/` directory
2. Runs `git pull origin <branch>` with a 30-second timeout
3. Copies files from the repo source path into the vault destination (`.git/` excluded)
4. Updates `status`, `lastSynced`, and `lastError`

### What "push" does

1. Validates the branch name
2. Checks the vault destination path exists
3. Copies files from the vault destination back to the repo source path
4. Stages all changes with `git add -A`
5. Checks `git status --porcelain` — if nothing has changed, skips the commit and push
6. Commits with the message `Update from Obsidian vault (<timestamp>)` and pushes to `origin <branch>`

### What bridges do NOT do

- Clone repos from a URL — the repo must already exist on disk
- Handle merge conflicts — if `git pull` results in a conflict, the error is surfaced and the bridge is marked as errored
- Resolve conflicts between vault edits and repo changes — pull will overwrite the vault copy with repo state

---

## Editing Bridged Files

Files at the vault destination are real copies, not symlinks. You can edit them directly in Obsidian like any other note.

Workflow for making edits:

1. Edit the file in your vault
2. Hit **Push** to copy your changes back to the repo and commit them
3. The next **Pull** will overwrite the vault copy with the repo's state — push first if you have unsaved edits you want to keep

> **Important:** If you pull without pushing first, any vault edits that were not yet pushed will be overwritten by the incoming repo state.

---

## Managing Multiple Bridges

There's no limit on the number of bridges. Each is synced and pushed independently and can have its own branch, subfolder, and auto-sync setting.

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

If your vault is itself a Git repo managed by [Obsidian Git](https://github.com/Vinzent03/obsidian-git), add your bridge destination paths to the vault's `.gitignore`. This prevents Obsidian Git from staging and committing the copied files, which would double-track content that is already versioned in its own repo.

Example `.gitignore` entry at your vault root:

```
# Vault Bridges destinations
Work/Company Handbook/
Work/ADRs/
Open Source/Plugin Notes/
```
