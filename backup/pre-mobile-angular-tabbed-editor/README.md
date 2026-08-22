# Backup: before Mobile Angular used `angular-tabs`

**Created:** 2025-03-19 (session: tabbed editor for Mobile Angular track)

## Revert

From repo root:

```powershell
Copy-Item backup\pre-mobile-angular-tabbed-editor\normalizeToEngineConfig.js src\ai-lessons\adapters\
Copy-Item backup\pre-mobile-angular-tabbed-editor\inpact_engine_shared.jsx src\engines\
Copy-Item backup\pre-mobile-angular-tabbed-editor\DynamicLessonPage.jsx src\ai-lessons\
```

Or use git to restore if you committed this backup on a branch.

## What changed after this snapshot

- `mobile-angular` lessons use the same three-tab editor as core Angular (TypeScript / HTML / CSS).
- Optional: inline `template:\`...\`` seeds split into TS + HTML tabs; validation language for mobile-angular forced to TypeScript in `DynamicLessonPage.jsx`.
