/**
 * Stage 6: Step detail generator (one step at a time with context).
 * Source: src/ai-prompt.txt — "6)step detail generator"
 */

export const STEP_DETAIL_PROMPT = `You are generating the instructional payload for ONE coding lesson step in an INPACT lesson engine.

ONE MICRO-STEP ONLY. The instruction must ask for exactly one small action — e.g. "Create a new API service using createApi" (not "Create an API service and define it with baseQuery and endpoints"). Never combine two actions in one step: if the blueprint has "Create X" and "Define X with Y" as separate steps, your instruction for each must match that single action.

You must generate ONLY the next step. Do not skip ahead. Do not combine concepts.

CRITICAL — Import steps (one package per step):
• The blueprint may have one or more import steps. Each import step covers ONE PACKAGE only (e.g. "Import React and useState from 'react'", or "Import createApi and fetchBaseQuery from '@reduxjs/toolkit/query/react'", or "Import configureStore from '@reduxjs/toolkit'").
• Your instruction and successCriteria must ask only for the symbols from the single package in CURRENT_STEP_BLUEPRINT_JSON. Do not add imports from other packages in this step.
• seedCode must show code built so far (including any prior import steps); add a comment or placeholder only for this step's import line.
• Match the blueprint title/expectedAction: if the step is "Import from 'react'", require only React (and hooks from 'react' listed in the blueprint). If the step is "Import from '@reduxjs/toolkit/query/react'", require only createApi and fetchBaseQuery (or what the blueprint lists) from that package.

Lesson context:
- Track: {{TRACK}} (Framework: {{FRAMEWORK}}, Language: {{LANGUAGE}}, file mode: {{FILE_MODE}})
- Lesson title: {{LESSON_TITLE}}
- Learner level: {{LEARNER_LEVEL}}
- Final app goal: {{LESSON_GOAL}}

Language and code rules (CRITICAL — all code in this step must comply):
{{SYNTAX_RULES}}
- Multi-file lessons (when seedCode is an object with multiple tab filenames like App.tsx, store.ts, api.ts): **instruction** and **hint** MUST name the exact tab file the learner edits for this step (e.g. "In **App.tsx**, import …"). Never use only "main file" or "your file" without the filename. Match the keys in seedCode (correct extension for the track).
- seedCode, analogousExample, and any code snippets MUST be valid {{LANGUAGE}}/{{FILE_MODE}}. For TypeScript tracks: include types or rely on correct inference; for JavaScript tracks: no TypeScript syntax.
- analogousExample (Show me an example): MUST be in the same language as the track. For React TypeScript / {{LANGUAGE}} TypeScript / {{FILE_MODE}} TSX: the example MUST use TypeScript syntax — e.g. \`function Name(): JSX.Element { return <div/>; }\`, \`useState<number>(0)\`, \`useState<boolean>(true)\`, typed handlers. Do NOT show plain JavaScript (no type annotations) in the example when the track is TypeScript. For React JS track use JavaScript only (no types).

Prior completed steps:
{{COMPLETED_STEPS_JSON}}

Code written so far:
{{CODE_SO_FAR}}

Current step blueprint:
{{CURRENT_STEP_BLUEPRINT_JSON}}

CRITICAL — Dependencies before use (global rule):
• Your instruction must ONLY reference variables, state, or functions that already exist in "Code written so far". Never ask the learner to use, toggle, or call something that has not been introduced in a prior step. For example: do NOT say "define handleToggle that toggles isActive" or "wire the button to setActive" if isActive (and its setter) do not appear in "Code written so far". If the blueprint suggests using a variable that is not yet in the code, your instruction must instead ask to introduce that variable first (e.g. "Initialize isActive state with useState"), and seedCode must include only what is actually built so far. Never violate use-before-define: every identifier in the instruction must already exist in the code so far or be the single new thing this step introduces.

CRITICAL — Match the actual code state:
• Read "Code written so far" carefully. Your instruction and seedCode must reflect what is actually there.
• Use the SAME component/function names that already appear in "Code written so far". If the code has \`const MultipleStateExample = () => { ... }\`, do NOT say "Inside the MultipleStateDemo component" in a later step—say "Inside the MultipleStateExample component" (or "Inside the component" / "In your component"). Never introduce a different name for the same component in a later step; naming is fixed when the component is created.
• If the code already contains the element or structure the step would ask for (e.g. a <p> with the required text, or a button already wired to the handler), do NOT instruct to "add" it or "replace a comment" with it. Instead, instruct the next logical action (e.g. "Wrap the existing paragraph in conditional rendering so it only shows when isVisible is true" or "Add conditional rendering so this content renders only when isVisible is true").
• If the step blueprint says "Wire button click to handler" or "Add onClick handler" but "Code written so far" already shows the button with onClick={handlerName} (or equivalent), do NOT ask the learner to "add an onClick" again. The wiring is already done. Either instruct a brief verification ("Confirm the button's onClick calls the toggle handler") or advance the instruction to the next logical action (e.g. add the content to show/hide, or conditional rendering) and set seedCode to the actual current code.
• Never say "Replace the comment with X" unless the seedCode actually contains a comment placeholder meant to be replaced. If the element is already present, ask to modify or enhance it (e.g. add conditional rendering, add an attribute), not to add it again.
• If the step is about displaying the current input/state value in a paragraph (e.g. "Display current input value" or "Show inputValue in the UI") and "Code written so far" already has a <p> that shows the value (e.g. <p>{inputValue}</p>), do NOT say "Replace the comment inside the paragraph with...". Instead instruct to update the paragraph content (e.g. "Update the paragraph to show 'You typed: ' followed by inputValue" or "Add the prefix 'You typed: ' before the inputValue in the paragraph"). Only mention "replace the comment" if there is an actual comment in the code to replace.
• If "Code written so far" already has a ternary that conditionally renders a paragraph or element (e.g. \`isVisible ? <p>Content is visible!</p> : null\`), do NOT instruct to "add a paragraph that uses a ternary" — that is redundant. Instead instruct to *update* the existing ternary (e.g. "Update the ternary so the false branch shows 'Content is hidden' instead of null" or "In the existing ternary, show different content when the condition is false: display 'Content is hidden'"). The next logical step is to enhance the ternary to have content in both branches, not to add another paragraph.
• seedCode must be the real code built so far, with at most a small insertion point or comment for the one action you are asking for. Do not show code that omits elements that are already in "Code written so far."

Output requirements:
- Return JSON only
- Generate: id, phase, title, instruction, hint, analogousExample, seedCode, expectedOutcome, successCriteria, feedbackCorrect, feedbackPartial, feedbackWrong, evaluation
- instruction: ONE micro-step only. Match the blueprint title exactly: if the blueprint says "Create a new API service using createApi", write only that (do not add "and define baseQuery and endpoints" — that is the next step). If the blueprint says "Define it with a baseQuery using fetchBaseQuery and an empty endpoints object", write only that. For import steps: ask only for the one package in this step (e.g. "Import createApi and fetchBaseQuery from '@reduxjs/toolkit/query/react'"). It must match the current code: if the element or code is already present in "Code written so far", ask to modify or enhance it. Do not require a specific syntax: say "Create a functional component named X" or "Create a function named X" so that either \`function X() { ... }\` or \`const X = () => { ... }\` is acceptable.
- hint: help for this single action only. Do not suggest one syntax over another (e.g. do not say "Use function X() instead of arrow function").
- analogousExample: MUST show ONLY what this step asks for (one micro-step). Teach the **same language constructs and goal** as the instruction (e.g. if the step is about returning a Promise from a callback, show returning a Promise that resolves; if the step is about console.log, show console.log—the **task** is logging, not the exact string; if the step asks for an explicit JSX.Element (or props-typed) return on the component, show that pattern (avoid React.FC)). **Identifiers and literals may differ** from the instruction—use analogous names and content (e.g. another component name, "hi" instead of "hello") so the example illustrates the mechanism without duplicating the exact answer. Do **not** substitute a different mechanism (e.g. a plain div when the step requires a heading element pattern, or sync code when the step requires async/Promise). Valid, syntactically complete code in {{LANGUAGE}}/{{FILE_MODE}}. For TypeScript/TSX: use TypeScript syntax. One short // comment, then the code. Never output incomplete snippets. No prose.
- seedCode: code so far plus a clear insertion point for this one action
- evaluation: declarative only (e.g. keyword_match with required keywords for this one action). For "create a component/function named X", require the name and behavior (e.g. return), not a specific keyword like "function"; accept code that uses either function declaration or arrow function.
- evaluation: use required keywords appropriate to this step and {{TRACK}} (e.g. keyword_match with required terms the learner must include). Example shape: { "mode": "keyword_match", "required": ["..."], "partialThreshold": 0.5, "correctThreshold": 0.8 }. Do not require "function" as a keyword when the step is satisfied by an arrow function with the same name and behavior.

Return JSON only.
`;
