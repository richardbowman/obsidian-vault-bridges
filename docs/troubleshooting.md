# Troubleshooting

Solutions for common problems with Vault Bridges.

---

## Bridge shows ❌ — how do I see the error?

Open **Settings → Vault Bridges**. The description line below each bridge name shows the error message after "Error:". Common errors are listed below.

You can also open the **Obsidian developer console** (Cmd+Option+I on macOS, Ctrl+Shift+I on Windows) and filter for `Vault Bridges:` to see detailed logs.

---

## "Repo path does not exist"

**Cause:** The path in the **Local repo path** field doesn't exist on disk.

**Fix:**
1. Open a terminal and verify the path: `ls /your/repo/path` (macOS) or `dir C:\your\repo\path` (Windows)
2. If the repo was moved, edit the bridge with the correct path
3. If the repo hasn't been cloned yet, clone it: `git clone <url> /your/repo/path`

---

## "Not a git repository"

**Cause:** The local repo path exists but doesn't contain a `.git/` folder — it's not a git repo root.

**Fix:** Check that you're pointing at the repo root (the folder that contains `.git/`), not a subfolder within it. Use the **Source subfolder** field for subfolders.

Wrong:
```
Local repo path: /Users/you/projects/my-docs/docs   ← this is a subfolder
```

Correct:
```
Local repo path:   /Users/you/projects/my-docs      ← repo root
Source subfolder:  docs                              ← subfolder goes here
```

---

## "git pull failed"

**Cause:** The `git pull` command returned a non-zero exit code. This can happen for several reasons:

| Reason | Fix |
|---|---|
| No internet connection | Check connectivity; any previously copied files remain in place |
| Authentication required | Pull manually in a terminal to enter credentials or set up SSH keys |
| Merge conflict | Resolve the conflict in the repo via terminal, then sync again |
| Wrong branch name | Edit the bridge and correct the **Branch** field |
| Remote doesn't exist | The repo may be local-only; verify with `git remote -v` |

For authentication issues, after resolving them in the terminal, the next sync from Vault Bridges will succeed (it inherits your system's Git credential store).

---

## "Source path does not exist"

**Cause:** The **Source subfolder** path doesn't exist within the repo.

**Fix:** Verify the subfolder exists in the repo: `ls /your/repo/path/your-subfolder`. Check for typos and case sensitivity (macOS paths are case-insensitive by default, Linux is not).

---

## "Vault path does not exist: run a pull sync first"

**Cause:** The bridge has never been synced. No files have been copied to the vault destination yet.

**Fix:** Click the **Pull** button (or the sync icon) for the bridge in Settings → Vault Bridges. This copies files from the repo into the vault for the first time.

---

## "push failed: authentication"

**Cause:** Git could not authenticate with the remote when attempting to push. This usually means credentials aren't cached for the remote.

**Fix:**
1. Open a terminal and `cd` to the repo path
2. Run `git push` manually — this will prompt for credentials or trigger your SSH/credential helper
3. Once credentials are cached, retry the push from Vault Bridges

For long-term fix, set up SSH keys or a credential helper (e.g., `git config --global credential.helper osxkeychain` on macOS).

---

## "nothing to push, already up to date"

This is not an error. It means the local repo is already in sync with the remote — no new commits were created (either because no vault files changed, or the last push already captured all changes).

---

## "My vault edits got overwritten"

**Cause:** You edited files in the vault copy of a bridge and then ran a Pull without Pushing first. Pull always wins — it overwrites vault files with the repo's current contents.

**Fix:**
- **Prevention:** Always Push before you Pull if you have unsaved edits in the vault.
- **Recovery:** If the overwritten content was committed to git at any point, retrieve it with `git log` and `git show`. If it was never committed, it cannot be recovered.

**Workflow to remember:** Edit in Obsidian → **Push** (commits and pushes your edits) → **Pull** (safe to pull now, your changes are upstream).

---

## Files appear in the vault but don't update after sync

**Cause:** A Pull sync hasn't been run since the repo received new changes.

**Fix:** Click the sync/Pull button for the bridge. Because the vault contains real copied files (not symlinks), Obsidian picks up changes as soon as they land on disk — no app reload needed.

---

## Moved the vault — bridges are broken

**Cause:** The plugin's stored vault path metadata may be stale after moving the vault, and any previously copied files are now in the old location.

**Fix:** Open **Settings → Vault Bridges** and use the **Rebuild All Copies** button. This re-copies all files from their repos into the new vault location, replacing any stale content.

---

## Status bar shows wrong count

**Cause:** The status bar updates when syncs complete and when settings change. If it looks stale, reload the plugin.

**Fix:** Toggle the plugin off and on in **Settings → Community Plugins**, or use **Cmd+P → Reload App Without Saving**.

---

## Obsidian Git is trying to commit my bridged files

**Cause:** If your vault is a git repo managed by Obsidian Git, it will see the copied bridge files as files to track and commit.

**Fix:** Add your bridge destination paths to the vault's `.gitignore`:

```gitignore
# Vault Bridges — copied external repo content
Work/Company Docs
Projects/Backend API/Docs
```

Then run `git rm -r --cached "Work/Company Docs"` (etc.) to untrack any files that were already staged.

---

## Plugin doesn't appear in Community Plugins list

**Cause:** Vault Bridges is currently in beta and not yet in the official Obsidian community plugins directory.

**Fix:** Install via [BRAT](https://github.com/TfTHacker/obsidian42-brat) (see [Getting Started](getting-started.md)) or install manually.

---

## Something else?

[Open a GitHub issue](https://github.com/richardbowman/obsidian-vault-bridges/issues) and include:
- Your OS and version
- Obsidian version
- The exact error message from the settings panel or developer console
- Steps to reproduce
