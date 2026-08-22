# Prompt to paste when starting a new chat

## 1. Speed: create `.cursorignore` (once)

In the project root, create a file named `.cursorignore` with:

```
node_modules
cache
dist
dist-ssr
*.log
```

This reduces indexing so Cursor and the AI stay faster.

---

## 2. Context for new chats

Copy the block below into your first message in a new Cursor chat so the AI keeps context without a long conversation history.

---

**INPACT lesson project – context for this session**

- **Lesson steps:** One micro-step per step. No compounded instructions (e.g. don’t combine “Create API with createApi” and “Define baseQuery and endpoints” in one step).
- **Imports:** One package per step. E.g. Step 1: import from `'react'`, Step 2: from `'@reduxjs/toolkit/query/react'`, Step 3: from `'@reduxjs/toolkit'`. Never ask for “Import React, createApi, fetchBaseQuery, and configureStore” in a single step.
- **Where this is enforced:** `src/ai-lessons/prompt-templates/stepBlueprint.js`, `stepDetail.js`, and `systemInstruction.js`. Static lessons live in `content/<track>/` (e.g. `content/react-js/119_RTK_Query_..._lesson.json`); the React JS RTK Query lesson is already split into 15 steps (3 import steps + 2 API micro-steps + rest).
- **Cache:** Lesson/intro/objectives cache is under `cache/`. Regenerating content = clear cache and re-run warm script for the relevant track.

What do you want to do in this session? (e.g. apply the same micro-step/one-package-per-import structure to the React TS RTK lesson, or fix/add X.)

---
