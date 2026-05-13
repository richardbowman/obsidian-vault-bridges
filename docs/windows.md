# Windows Setup Guide

Vault Bridges works on Windows but has some differences from macOS/Linux due to how Windows handles filesystem links.

---

## Symlinks vs Junction Points

Windows has two types of filesystem links relevant to Vault Bridges:

| Type | Works for | Requires admin? | Requires Developer Mode? |
|---|---|---|---|
| **Junction point** (`mklink /J`) | Directories only | ❌ No | ❌ No |
| **Symlink** (`mklink /D` or `mklink`) | Files and directories | ✅ Usually | ✅ If not admin |

Vault Bridges automatically uses **junction points** for directory bridges on Windows. This covers the vast majority of use cases (linking a folder from a repo) and requires no special permissions.

For **single-file bridges** on Windows, a standard symlink is used, which may require Developer Mode.

---

## Enabling Developer Mode (if needed)

If you need to link individual files rather than directories:

1. Open **Windows Settings** (Win+I)
2. Go to **System → For Developers**
3. Toggle **Developer Mode** on
4. Restart any open terminals

After enabling Developer Mode, non-admin users can create symlinks without elevation.

---

## Verifying Git is in PATH

Vault Bridges runs `git pull` using the system `git` command. On Windows, Git may not be in your PATH depending on how it was installed.

To verify:
1. Open **Command Prompt** or **PowerShell**
2. Run `git --version`

If you get an error, either:

**Option A: Add Git to PATH during install**
When installing [Git for Windows](https://git-scm.com/download/win), choose "Git from the command line and also from 3rd-party software" when prompted.

**Option B: Add Git to PATH manually**
1. Find your Git install (commonly `C:\Program Files\Git\bin\`)
2. Open **System Properties → Environment Variables**
3. Edit the `Path` variable under System Variables
4. Add `C:\Program Files\Git\bin` (or wherever `git.exe` lives)
5. Restart Obsidian

---

## Path Format

On Windows, repo paths should use backslashes or forward slashes — either works:

```
C:\Users\you\projects\my-docs
C:/Users/you/projects/my-docs
```

Both formats are accepted.

---

## OneDrive, Dropbox, and Sync Conflicts

If your Obsidian vault lives in a OneDrive or Dropbox folder, be aware that most cloud sync tools **do not follow junction points or symlinks**. They will either:
- Skip the linked content entirely
- Try to sync the link itself (as a shortcut/alias file), not the contents

If cloud sync is important to you, consider placing your vault outside of a synced folder, or excluding the bridge destination paths from sync.

For OneDrive specifically, you can exclude folders via right-click → "Always keep on this device" / "Free up space" doesn't help here — the better approach is to add the paths to `.cloudstorage-ignore` or use OneDrive's selective sync to exclude the bridge folders.

---

## Known Windows Limitations

- **Junction points are directory-only.** If you need a single-file bridge, Developer Mode is required.
- **Long paths.** If your repo or vault path exceeds 260 characters, enable long path support in Windows: run `git config --system core.longpaths true` in an admin terminal.
- **Antivirus.** Some antivirus tools flag junction points or block `mklink`. If bridge creation fails with a permission error, check your antivirus logs.

---

## Reporting Windows Issues

Windows symlink behavior is the most platform-specific part of this plugin. If you encounter an issue not covered here, please [open a GitHub issue](https://github.com/richardbowman/obsidian-vault-bridges/issues) with:
- Your Windows version
- Whether the bridge is for a directory or a file
- The exact error message from the Vault Bridges settings panel
