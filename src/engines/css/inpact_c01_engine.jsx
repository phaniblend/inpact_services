import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Module 1 — Foundations",
    content: {
      tag: "CSS C01",
      title: "Box Model: Why It Exists",
      body: `Picture every element on the page as a set of nested rectangles, like an onion or a shipping box.

  INNERMOST: The content — your text or image. This is the only part that has a default "size" in the classic sense.
  AROUND IT: Padding — breathing room *inside* the box. The background color fills this too, so padding feels like "more box."
  NEXT: Border — the visible edge. It sits between "my box" and "the world."
  OUTERMOST: Margin — invisible space that pushes other elements away. The background stops at the border; margin is empty.

Why the order matters: when a designer says "16px padding," they mean "space between the content and the edge of the box." When they say "margin below," they mean "gap before the next thing." If you don't see the layers in your head, layout will feel random.`,
      usecase: "Real moment: 'I set width: 200px but my div is way wider.' That's because you're only setting the *content* width — padding and border add on top. This module gives you the mental picture so that sentence makes sense.",
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "What You'll Take Away",
    items: [
      "See content, padding, border, margin as four distinct layers (and know which one background fills)",
      "Understand why 'width' in CSS means 'content width' by default — and why that causes layout surprises",
      "Predict total on-screen size from the four layers",
      "Use the box model to fix real layout bugs (overflow, misalignment)",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5 — The content rectangle",
    paal: `Why we start here: In the box model, width and height (by default) apply only to the innermost rectangle — the content. Nothing else exists yet.

What you'll see: A single blue rectangle. That rectangle is the *content area*. In DevTools you'd see it labeled as the content box; padding/border/margin would be drawn outside it later.

Your turn: Create a .box with width 200px, height 100px, and a background color. You're defining only the content box; we'll add the other layers next.`,
    hint: "The content box is the only layer so far. .box { width: 200px; height: 100px; background-color: #3b82f6; }",
    answer_keywords: ["width", "height", "background", "box"],
    seed_code: `/* Step 1: the content rectangle — the innermost layer */
.box {
}`,
    feedback_correct: "✅ You defined the content box. Key idea: in CSS, 'width' and 'height' (by default) mean the size of this inner rectangle only. Everything we add next (padding, border, margin) will sit *around* it.",
    feedback_partial: "You need width, height, and a background so the content area is visible as one rectangle.",
    feedback_wrong: "Add width: 200px; height: 100px; background-color: #3b82f6; to .box. This is the content layer only.",
    expected: `.box {
  width: 200px;
  height: 100px;
  background-color: #3b82f6;
}`,
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5 — Padding: 'more box'",
    paal: `Why padding exists: Designers want space between the content and the edge of the box — e.g. text not touching the border. Padding is *inside* the box: the background extends into it, so visually it's still "the same box," just bigger.

What you'll see: The blue rectangle gets a thicker blue frame. That frame is padding. The content area is still 200×100; the *visible* filled area is now larger.

Your turn: Add padding: 20px to .box. Watch how the colored area grows — that's padding. The content size didn't change; we added a layer around it.`,
    hint: "padding: 20px; makes the background extend 20px on all sides. Content stays 200×100; total filled area grows.",
    answer_keywords: ["padding"],
    seed_code: `/* Step 2: padding — background extends here, so the "box" looks bigger */
.box {
  width: 200px;
  height: 100px;
  background-color: #3b82f6;
}`,
    feedback_correct: "✅ Padding added. Takeaway: padding is part of 'the box' (background fills it). When you need space *inside* the box, use padding; when you need space *between* boxes, use margin.",
    feedback_partial: "Add padding so you see the blue area grow — that's the padding layer.",
    feedback_wrong: "Add padding: 20px; to .box. The background will extend into the padding.",
    expected: `padding: 20px;`,
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5 — Border: the edge",
    paal: `Why border is separate: Border is the visible edge of the box. It sits *between* padding (inside) and margin (outside). It has thickness, so it adds to the total size of the element on the page.

What you'll see: A visible line around the padded blue area. That line is the border. The total space the box takes now = content + padding + border (we haven't added margin yet).

Your turn: Add a 4px solid border (any color) to .box. You're drawing the boundary between "my box" and the space outside it.`,
    hint: "border: 4px solid #1e40af; — border sits between padding and margin and adds to total size.",
    answer_keywords: ["border"],
    seed_code: `/* Step 3: border — the visible edge; adds to total size */
.box {
  width: 200px;
  height: 100px;
  background-color: #3b82f6;
  padding: 20px;
}`,
    feedback_correct: "✅ Border added. Idea: border has *thickness*. So when you say width: 200px, the browser uses 200px for content; the actual on-screen width is 200 + padding left/right + border left/right. That's why layouts sometimes 'break' — the box is wider than you thought.",
    feedback_partial: "Add a visible border (e.g. 4px solid) around the padded area.",
    feedback_wrong: "Add border: 4px solid #1e40af; (or any color). Border is the edge between padding and margin.",
    expected: `border: 4px solid #1e40af;`,
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5 — Margin: invisible push",
    paal: `Why margin is different: Margin is *outside* the border. The background doesn't extend here — it's transparent. Its only job is to push other elements away. So: padding = space inside the box; margin = space between this box and the next.

What you'll see: Space around the bordered box. That space is margin. No color — it's just "air" that keeps other content from sitting right against the border.

Your turn: Add margin: 16px to .box. The box doesn't get a thicker fill; it gets clear space around it.`,
    hint: "margin: 16px; — transparent space outside the border; pushes siblings away.",
    answer_keywords: ["margin"],
    seed_code: `/* Step 4: margin — invisible; pushes other elements away */
.box {
  width: 200px;
  height: 100px;
  background-color: #3b82f6;
  padding: 20px;
  border: 4px solid #1e40af;
}`,
    feedback_correct: "✅ Margin added. Rule of thumb: want space *inside* the box (e.g. text from the edge)? Padding. Want space *between* this and the next block? Margin. That mental split fixes most spacing confusion.",
    feedback_partial: "Add margin so there's clear space outside the border.",
    feedback_wrong: "Add margin: 16px; — margin is outside the border and has no background.",
    expected: `margin: 16px;`,
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5 — Total width: the math that explains overflow",
    paal: `Why we do the math: People set width: 200px and wonder why the element is 280px wide. Because by default, width is *content only*. Total width = content + padding (both sides) + border (both sides) + margin (both sides). Doing this once by hand locks in the mental model.

What you'll see: No new visual — we're naming what's already there. Total width = 200 + 20+20 + 4+4 + 16+16 = 280px. So the box occupies 280px of horizontal space even though you said 200.

Your turn: Write a comment above .box with the formula and the numeric total (e.g. 200 + 40 + 8 + 32 = 280px). This is the calculation that explains "why is my layout wider than I thought?"`,
    hint: "Comment: total width = content + padding×2 + border×2 + margin×2. With our values: 200 + 40 + 8 + 32 = 280px.",
    answer_keywords: ["total", "width", "comment", "200", "padding", "border", "margin"],
    seed_code: `/* Step 5: total width = content + padding(both) + border(both) + margin(both)
   Our box: 200 + 40 + 8 + 32 = ? */
.box {
  width: 200px;
  height: 100px;
  padding: 20px;
  border: 4px solid #1e40af;
  margin: 16px;
  background-color: #3b82f6;
}`,
    feedback_correct: "✅ You've got the full picture. When someone says 'my width: 100% div is overflowing,' they usually mean: 100% is the content; padding and border add on top. The fix (box-sizing) is next. You now know *why* that fix exists.",
    feedback_partial: "Comment with the formula and the number (e.g. 200 + 40 + 8 + 32 = 280px).",
    feedback_wrong: "Comment above .box: total width = 200 + 20*2 + 4*2 + 16*2 = 280px (or equivalent).",
    expected: `/* total width = 200 + 40 + 8 + 32 = 280px */`,
  },
];

const sideItems = [
  { id: "intro", label: "Lesson" },
  { id: "objectives", label: "Objectives" },
  { id: "step1", label: "Content" },
  { id: "step2", label: "Padding" },
  { id: "step3", label: "Border" },
  { id: "step4", label: "Margin" },
  { id: "step5", label: "Total width" },
];

function getOutputPreview(answer) {
  let html = "";
  let css = "";
  try {
    const p = JSON.parse(answer || "{}");
    html = p.html ?? "";
    css = p.css ?? "";
  } catch (_) {
    css = answer || "";
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${html || "<div class=\"box\">Content</div>"}</body></html>`;
}

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: 1,
  title: "Box Model",
  shortName: "BOX MODEL",
  language: "css",
  answerShape: "css-tabs",
  defaultHtml: "<div class=\"box\">Content</div>",
  getOutputPreview,
});
