import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Module 1 — Foundations",
    content: {
      tag: "CSS C03",
      title: "Margin Collapse: Why Space Doesn't Add Up",
      body: `You set margin: 20px on two stacked blocks and expect 40px of space between them. You get 20px. That's margin collapse: adjacent vertical margins don't add — they *collapse* to the larger one. It comes from the early web (typography: space between paragraphs shouldn't double when you add a margin to both). So the spec says: when two vertical margins touch, they become one (the bigger wins).

Three places it happens: (1) Two siblings — the bottom margin of the first and the top margin of the second touch and collapse. (2) Parent and first/last child — the parent's margin can touch the child's and collapse. (3) An empty block — its top and bottom margins touch (there's no content between them), so they collapse to one. Once you see it, you stop fighting it and use fixes: a thin padding (or overflow) on the parent to "separate" margins, or flexbox with gap (gap doesn't collapse).`,
      usecase: "Real moment: 'I gave the section 32px margin-bottom and the next section 24px margin-top but there's only 32px between them.' That's collapse. This module teaches the rule and two reliable fixes.",
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "What You'll Take Away",
    items: [
      "See all three collapse scenarios and predict 'the larger margin wins'",
      "Understand why padding or overflow on the parent stops parent–child collapse",
      "Use flexbox + gap when you want consistent spacing without collapse",
      "State the rule so you can debug 'why isn't my margin adding?'",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 6 — Siblings: two blocks, one gap",
    paal: `Why this happens: Two block elements stacked vertically. Each has margin: 20px. Where do they touch? The bottom edge of the first block's margin touches the top edge of the second block's margin. The spec says: those two margins collapse into one. So the space between the two blocks is 20px, not 40px. Visually: one "shared" margin.

What you'll see: Two blocks with a single 20px gap between them. If you expected 40px, you're seeing collapse. The browser is following the rule: adjacent vertical margins collapse to the larger.

Your turn: Create .block1 and .block2, each with margin: 20px (and a background so you see the boxes). Put them one after the other in the HTML. The gap between them will be 20px — that's the collapsed margin.`,
    hint: ".block1, .block2 { margin: 20px; background: #e5e7eb; } (or any background). Space between = 20px.",
    answer_keywords: ["margin", "block1", "block2"],
    seed_code: `/* Step 1: sibling collapse — two margins touch, one gap */
.block1 {
}
.block2 {
}`,
    feedback_correct: "✅ You're seeing sibling collapse. Idea: the bottom margin of .block1 and the top margin of .block2 are *adjacent* (nothing between them). So they collapse to one. That's why spacing often feels 'half' of what you set — the spec is doing this on purpose.",
    feedback_partial: "Two blocks with margin; the space between them is one margin, not two.",
    feedback_wrong: ".block1, .block2 { margin: 20px; } (and optionally a background to see the boxes).",
    expected: `.block1, .block2 { margin: 20px; }`,
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 6 — Parent and child: margins that touch",
    paal: `Why this happens: A .parent with margin: 20px and a .child inside it with margin: 30px. The parent's top margin and the child's top margin can touch (there's no padding/border/content between them). So they collapse — the gap above the parent might be 30px (the child's margin "wins" or they combine in a way that looks like one). Same at the bottom. So the parent doesn't get "its" margin; it shares with the child.

What you'll see: The space above/below the parent can look like the child's margin (or the larger of the two), not parent + child. That's parent–child collapse.

Your turn: .parent { margin: 20px; } and .child { margin: 30px; } (add backgrounds so you see the boxes). Put one .child inside .parent. Observe: the outer gap is 30px, not 50px.`,
    hint: ".parent { margin: 20px; } .child { margin: 30px; } — outer space collapses to 30px.",
    answer_keywords: ["parent", "child", "margin"],
    seed_code: `/* Step 2: parent-child collapse — margins touch across the boundary */
.parent {
}
.child {
}`,
    feedback_correct: "✅ Parent–child collapse. Idea: the parent's margin and the child's margin are adjacent (no padding or border between them). So they collapse. To get both margins to 'show,' we need something between them — that's the next step (padding barrier).",
    feedback_partial: "Parent and child each with margin; the visible outer gap is the larger margin.",
    feedback_wrong: ".parent { margin: 20px; } .child { margin: 30px; } — put .child inside .parent in HTML.",
    expected: `Parent and child with margins; collapse occurs.`,
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 6 — Empty block: top and bottom fold into one",
    paal: `Why this happens: An element with no content (or only padding/border that doesn't separate the margins). It has margin-top: 40px and margin-bottom: 40px. Where are those two margins? They're on either side of an empty box — so they're *adjacent* (nothing between them). They collapse into one 40px margin. So the empty block doesn't create 80px of space; it creates 40px.

What you'll see: A single 40px gap where the empty block sits. No visible box (no content, no background) — just the collapsed margin. That's why "empty" divs sometimes add less space than you expect.

Your turn: Create .empty-block with margin: 40px. Don't add content, padding, or border (or the collapse still happens but is harder to see). The element takes up 40px of vertical space total, not 80px — the top and bottom margins collapsed.`,
    hint: ".empty-block { margin: 40px; } — no content. Top and bottom margins touch and collapse to 40px total.",
    answer_keywords: ["empty", "margin"],
    seed_code: `/* Step 3: empty block — top and bottom margins touch, so they collapse to one */
.empty-block {
}`,
    feedback_correct: "✅ Empty-block collapse. Idea: with no content (and no padding/border that create a barrier), the block's top margin and bottom margin are adjacent. So they fold into one. Visual takeaway: if you want a fixed spacer, use padding or height on the element, or a flex gap — margins on empty elements collapse.",
    feedback_partial: "An empty element with margin: 40px; total vertical space = 40px, not 80px.",
    feedback_wrong: ".empty-block { margin: 40px; } — no content inside; the two margins collapse to one.",
    expected: `.empty-block { margin: 40px; }`,
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 6 — Fix: padding barrier",
    paal: `Why this fixes it: Collapse happens when two margins are *adjacent* — nothing between them. If we put even 1px of padding (or a border, or trigger a scroll container with overflow: auto) on the parent, the parent's margin and the child's margin are no longer adjacent. There's something in between. So they don't collapse.

What you'll see: With .parent { padding-top: 1px; } (or overflow: auto), the space above the parent is the parent's margin, and the space between parent and child is the child's margin — both visible. No collapse.

Your turn: Add padding-top: 1px (or overflow: auto) to .parent so the parent's margin and the child's margin no longer touch. Now both margins "show."`,
    hint: ".parent { padding-top: 1px; } or overflow: auto; — creates a barrier so margins don't touch.",
    answer_keywords: ["padding-top", "parent", "1px"],
    seed_code: `/* Step 4: one pixel of padding breaks the adjacency — no collapse */
.parent {
  margin: 20px;
}
.child {
  margin: 30px;
}`,
    feedback_correct: "✅ Padding barrier works. Idea: collapse only happens when two margins touch. Padding (or border, or overflow that creates a containing block) sits *between* the parent's margin and the child's margin, so they're no longer adjacent. That's the fix you'll use when you need both margins to count.",
    feedback_partial: "padding-top: 1px or overflow: auto on .parent so both margins are visible.",
    feedback_wrong: ".parent { padding-top: 1px; } or .parent { overflow: auto; }",
    expected: `.parent { padding-top: 1px; }`,
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 6 — Fix: flexbox and gap",
    paal: `Why gap doesn't collapse: Flexbox (and grid) use gap to add space between items. Gap is *not* margin — it's space reserved by the layout. So there's no "two margins touching" — there's just one gap. That's why modern layouts often use display: flex; flex-direction: column; gap: 24px; instead of margin on each child. Predictable spacing, no collapse.

What you'll see: A column of items with exactly 24px between each. No collapse, because we're not using margins between the items — we're using gap.

Your turn: Create .flex-container with display: flex; flex-direction: column; gap: 24px;. Put two or more children inside. The space between them is always 24px — gap doesn't collapse.`,
    hint: ".flex-container { display: flex; flex-direction: column; gap: 24px; }",
    answer_keywords: ["flex", "gap", "column"],
    seed_code: `/* Step 5: gap is not margin — so it never collapses */
.flex-container {
}`,
    feedback_correct: "✅ Flex + gap. Idea: when you want consistent vertical spacing without thinking about collapse, use a flex (or grid) container with gap. No margins between items = no collapse. This is the pattern in most design systems for stacked content.",
    feedback_partial: "Flex column container with gap: 24px.",
    feedback_wrong: ".flex-container { display: flex; flex-direction: column; gap: 24px; }",
    expected: `.flex-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}`,
  },
  {
    id: "step6",
    type: "question",
    phase: "Step 6 of 6 — The rule in your own words",
    paal: `Why we write it down: When you hit 'why is there less space than I set?', you want the rule in your head: vertical adjacent margins collapse to the larger; padding or gap avoids collapse. Writing it once cements it.

What you'll see: No new visuals — you're stating the rule so you can debug layout later.

Your turn: Add a comment at the top of your file: "Vertical adjacent margins collapse to the larger; padding or gap avoids collapse." That's the sentence that explains every margin-collapse bug.`,
    hint: "Comment: Vertical adjacent margins collapse to the larger; padding or gap avoids collapse.",
    answer_keywords: ["vertical", "margin", "collapse", "comment"],
    seed_code: `/* Step 6: the rule you'll use when spacing looks wrong */
/* Your one-line rule here */`,
    feedback_correct: "✅ Rule captured. Next time you see 'I set margin-top and margin-bottom but only one of them shows,' you'll think: collapse. And you'll know the fixes: padding barrier or flex/grid with gap. That's the takeaway.",
    feedback_partial: "Comment stating that vertical adjacent margins collapse and padding/gap avoid it.",
    feedback_wrong: "Comment: Vertical adjacent margins collapse to the larger; padding or gap avoids collapse.",
    expected: `/* Vertical adjacent margins collapse to the larger; padding or gap avoids collapse. */`,
  },
];

const sideItems = [
  { id: "intro", label: "Lesson" },
  { id: "objectives", label: "Objectives" },
  { id: "step1", label: "Siblings" },
  { id: "step2", label: "Parent-child" },
  { id: "step3", label: "Empty block" },
  { id: "step4", label: "Padding barrier" },
  { id: "step5", label: "Flex gap" },
  { id: "step6", label: "Rule" },
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
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${html || "<div class=\"block1\">Block 1</div><div class=\"block2\">Block 2</div>"}</body></html>`;
}

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: 3,
  title: "Margin Collapse",
  shortName: "MARGIN COLLAPSE",
  language: "css",
  answerShape: "css-tabs",
  defaultHtml: "<div class=\"block1\">Block 1</div><div class=\"block2\">Block 2</div>",
  getOutputPreview,
});
