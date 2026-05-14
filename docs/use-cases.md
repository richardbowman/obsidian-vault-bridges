# Use Cases

Real-world examples of how to use Vault Bridges to connect external repos to your vault.

---

## Developer Documentation in Your PKM

**Scenario:** You maintain a backend API with `docs/adr/` (Architecture Decision Records) and `docs/runbooks/` that you want accessible and linkable from Obsidian.

**Setup:**

| Field | Value |
|---|---|
| Name | `API Docs` |
| Local repo path | `/Users/you/projects/backend-api` |
| Source subfolder | `docs` |
| Vault destination | `Projects/Backend API/Docs` |
| Branch | `main` |
| Auto sync | ✅ |

**Result:** All your ADRs, runbooks, and developer docs appear inside Obsidian and can be linked from meeting notes, project plans, and other vault content. When a teammate pushes updated docs, a Pull sync brings them in.

---

## Shared Team Knowledge Base

**Scenario:** Your team maintains a shared `team-wiki` repo with markdown notes, onboarding docs, and process guides. You want it in your personal vault and want to be able to contribute edits back.

**Setup:**

| Field | Value |
|---|---|
| Name | `Team Wiki` |
| Local repo path | `/Users/you/projects/team-wiki` |
| Source subfolder | *(blank — copy the whole repo)* |
| Vault destination | `Shared/Team Wiki` |
| Branch | `main` |
| Auto sync | ✅ |

**Result:** The entire team wiki is accessible in your vault. You can read and edit it directly in Obsidian, then hit **Push** (⬆) to commit your changes and push them back to the shared repo. Your teammates' changes show up the next time you Pull.

---

## Multiple Repos, One Vault Section

**Scenario:** You work across several projects and want each project's docs in a consistent place inside your vault.

**Setup:** Add one bridge per project:

```
Projects/
  Backend API/Docs   ← bridge from backend-api repo, docs/ subfolder
  Mobile App/Docs    ← bridge from mobile-app repo, docs/ subfolder
  Infrastructure/    ← bridge from infra repo, docs/ subfolder
```

Each bridge syncs independently. You can disable auto-sync on repos you rarely need and sync manually.

---

## Open Source Project You Contribute To

**Scenario:** You contribute to an open source project and want its documentation and contributor guides in Obsidian so you can take notes alongside them.

**Setup:**

| Field | Value |
|---|---|
| Name | `OSS Project Docs` |
| Local repo path | `/Users/you/projects/some-oss-project` |
| Source subfolder | `docs` |
| Vault destination | `Open Source/Some Project` |
| Branch | `main` |
| Auto sync | ❌ (sync manually before contributing sessions) |

**Result:** The project's docs are in your vault. You can write personal notes alongside them in separate vault files and link between your notes and the official docs.

---

## Dotfiles Documentation

**Scenario:** Your dotfiles repo has a `docs/` or `notes/` folder where you keep setup guides, cheatsheets, and configuration notes. You want these in Obsidian.

**Setup:**

| Field | Value |
|---|---|
| Name | `Dotfiles Notes` |
| Local repo path | `/Users/you/.dotfiles` |
| Source subfolder | `notes` |
| Vault destination | `System/Dotfiles` |
| Branch | `main` |
| Auto sync | ✅ |

---

## Linking Bridged Content

Once a bridge is set up, files inside it behave like regular vault files. You can:

**Link to a bridged file:**
```markdown
See also: [[Projects/Backend API/Docs/adr/001-use-postgresql]]
```

**Embed a bridged file:**
```markdown
![[Projects/Backend API/Docs/runbooks/deploy]]
```

**Search bridged content:**
Obsidian's full-text search (Cmd+Shift+F) indexes bridged files. You can search across your notes and external repo docs in one place.

**Backlinks:**
Backlinks work from bridged files into your notes. If a doc in your repo links to a filename that also exists in your vault, Obsidian will track it.

---

## Editing Bridged Files

Because bridged files are real copies in your vault, you can edit them directly in Obsidian. To send your edits back to the repo:

1. Edit the file in Obsidian as normal
2. Click the **Push** button (⬆) for the bridge in Settings → Vault Bridges, or use **Cmd+P → Push All Bridges**
3. Vault Bridges copies your vault files back to the repo, commits the changes, and pushes to the remote

**Overwrite protection:** If you try to Pull with unsaved vault edits, the plugin detects this and shows a warning modal with three choices: **Push then Pull** (safe), **Pull anyway** (discards edits), or **Cancel**. On startup auto-pull, dirty bridges are skipped with a notice rather than silently overwriting your work.

---

## What Vault Bridges Is NOT For

- **Syncing your vault to Git** — use [Obsidian Git](https://github.com/Vinzent03/obsidian-git) for that
- **Cloning repos from a URL** — clone the repo yourself first; Vault Bridges connects to an existing local clone
- **Mobile** — file copying and git operations require desktop filesystem access
