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
| No internet connection | Check connectivity; the symlink from a previous sync is still in place |
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

## "Destination exists and is not a symlink"

**Cause:** There's already a real folder or file at the vault destination path — not a symlink. Vault Bridges refuses to overwrite it to prevent data loss.

**Fix:**
1. Move or delete the content at the vault destination path (back it up first if needed)
2. Then sync the bridge — it will create the symlink in the now-empty location

---

## Files appear in the vault but don't update after sync

**Cause:** Obsidian caches the file list. After a sync that pulls new files into the repo, Obsidian may not immediately show them.

**Fix:** Use **Cmd+P → Reload App Without Saving** or close and reopen Obsidian. Alternatively, right-click the bridged folder in the file explorer and choose **Reveal in Finder/Explorer** to confirm the files are there on disk.

---

## Moved the vault — bridges are broken

**Cause:** Symlinks store absolute paths. When you move a vault, symlinks created at the old location still point to the right source, but the vault path metadata stored in the plugin settings may be stale. More commonly, the symlinks themselves still exist but need to be verified.

**Fix:** Open **Settings → Vault Bridges** and use the **Rebuild All Links** button. This tears down and recreates every symlink using the current vault location.

---

## Bridge destination appears as an alias/shortcut on Windows instead of a real folder

**Cause:** Junction points were not created correctly, or a sync service (OneDrive, Dropbox) replaced the junction with a shortcut.

**Fix:**
1. Remove the bridge in settings (this deletes the symlink/junction)
2. Check that no cloud sync tool is interfering (see [Windows Setup](windows.md))
3. Re-add the bridge — it will recreate the junction point

---

## Status bar shows wrong count

**Cause:** The status bar updates when syncs complete and when settings change. If it looks stale, reload the plugin.

**Fix:** Toggle the plugin off and on in **Settings → Community Plugins**, or use **Cmd+P → Reload App Without Saving**.

---

## Obsidian Git is trying to commit my bridge symlinks

**Cause:** If your vault is a git repo managed by Obsidian Git, it will see the symlinks as files to track.

**Fix:** Add your bridge destination paths to the vault's `.gitignore`:

```gitignore
# Vault Bridges — external repo symlinks
Work/Company Docs
Projects/Backend API/Docs
```

Then run `git rm --cached Work/Company\ Docs` (etc.) to untrack any that were already staged.

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
