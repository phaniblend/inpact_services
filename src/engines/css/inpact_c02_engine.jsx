import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Module 1 — Foundations",
    content: {
      tag: "CSS C02",
      title: "box-sizing: Why Layouts Break (and One Fix)",
      body: `You just learned: width and height apply to the *content* box. Padding and border add on top. So when you write "two columns, 50% each" and add padding, each column is 50% + padding — more than 50%. They don't fit; the second one wraps or overflows. That's the "broken" layout everyone hits.

box-sizing: border-box changes the rule: width and height become the *total* size of the box (content + padding + border). The browser shrinks the content area to fit. So 50% really means 50% of the parent — predictable. Most design systems set this globally so you don't have to think about it.`,
      usecase: "Real moment: 'I set width: 100% and added padding and now there's a horizontal scrollbar.' With border-box, 100% includes the padding; the content area is 100% minus padding. One property, one mental model.",
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "What You'll Take Away",
    items: [
      "See the broken layout (two 50% columns that overflow) and connect it to content-box",
      "Fix it with box-sizing: border-box and see columns sit side by side",
      "Use the global reset so every element behaves the same way",
      "Reason about 'width as budget': content area = width minus padding and border",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 5 — Reproduce the break",
    paal: `Why we do this first: If you've never seen the bug, the fix feels arbitrary. So we create it on purpose. Two cards, each width: 50%, plus padding and border. With the default (content-box), 50% is only the content; padding and border add on top, so each card is wider than half. They won't sit side by side — one wraps or the row overflows.

What you'll see: Two .card elements that don't fit in one row (or the container overflows). That's the "broken" layout. The numbers explain it: 50% + 40px padding + 4px border per card.

Your turn: Create .card with width: 50%, padding: 20px, border: 2px solid. Don't set box-sizing. You're reproducing the classic layout bug.`,
    hint: ".card { width: 50%; padding: 20px; border: 2px solid #333; } — no box-sizing. Total width per card > 50%.",
    answer_keywords: ["width", "padding", "border", "card"],
    seed_code: `/* Step 1: the classic bug — 50% + padding + border = overflow */
.card {
}`,
    feedback_correct: "✅ You've got the broken layout. Key idea: the browser is doing exactly what the spec says — width is the content box. The 'bug' is our expectation that 50% means 'half the row.' With content-box it doesn't; border-box fixes that expectation.",
    feedback_partial: "Cards with width 50%, padding, and border. They should overflow or wrap.",
    feedback_wrong: ".card { width: 50%; padding: 20px; border: 2px solid #333; } — don't add box-sizing yet.",
    expected: `.card {
  width: 50%;
  padding: 20px;
  border: 2px solid #333;
}`,
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 5 — The fix: border-box",
    paal: `Why border-box fixes it: With box-sizing: border-box, the browser interprets width as the *total* width of the box. So 50% means 'my whole box is half the container.' The content area is then 50% minus padding minus border — the browser does that math. No overflow.

What you'll see: The same two .card elements now sit side by side. Each takes exactly 50% of the row; the padding and border are *inside* that 50%. The visual is predictable.

Your turn: Add box-sizing: border-box to .card. Don't change width, padding, or border. Just add the one property and see the layout fix.`,
    hint: ".card { box-sizing: border-box; width: 50%; padding: 20px; border: 2px solid #333; }",
    answer_keywords: ["box-sizing", "border-box"],
    seed_code: `/* Step 2: one property — width now means "total box" */
.card {
  width: 50%;
  padding: 20px;
  border: 2px solid #333;
}`,
    feedback_correct: "✅ border-box applied. Mental model: width = total budget. The content area is whatever's left after padding and border. So 100% width + 20px padding = a box that fits, with content area = 100% - 40px. That's why global resets use border-box.",
    feedback_partial: "Add box-sizing: border-box to .card. Columns should fit in one row.",
    feedback_wrong: "Add box-sizing: border-box; to .card.",
    expected: `box-sizing: border-box;`,
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 5 — Global reset",
    paal: `Why a global reset: You don't want to remember to set box-sizing on every component. One rule at the top makes every element use border-box by default. *, *::before, *::after covers elements and their pseudo-elements so nothing slips through.

What you'll see: No visual change if .card already had border-box — but now *any* new element you add will behave the same way without you setting it per class.

Your turn: At the top of your CSS, add: *, *::before, *::after { box-sizing: border-box; }. This is the reset you'll see in almost every design system.`,
    hint: "*, *::before, *::after { box-sizing: border-box; } — put this first in the file.",
    answer_keywords: ["*", "box-sizing", "border-box", "before", "after"],
    seed_code: `/* Step 3: one rule for the whole page */
.card {
  width: 50%;
  padding: 20px;
  border: 2px solid #333;
  box-sizing: border-box;
}`,
    feedback_correct: "✅ Global reset in place. From now on, width and height mean 'total box' everywhere. You won't have to think 'did I set border-box on this?' — it's the default. That's why this pattern is universal.",
    feedback_partial: "*, *::before, *::after { box-sizing: border-box; } at the top.",
    feedback_wrong: "Add: *, *::before, *::after { box-sizing: border-box; } before .card.",
    expected: `*, *::before, *::after {
  box-sizing: border-box;
}`,
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 5 — Budget analogy",
    paal: `Why we name the analogy: 'Width is the total budget; padding and border are taken out first; the rest is content' — that sentence predicts behavior. When someone says 'why is my content area so narrow?' you can say: with border-box, you gave the box a total width; padding and border ate into it; content got what was left.

What you'll see: No new visuals. You're writing down the mental model so it sticks.

Your turn: Add a comment above .card: "Total width = budget; content area = budget minus padding minus border." That's the rule that explains every border-box layout.`,
    hint: "Comment: Total width = budget; content area = budget - padding - border.",
    answer_keywords: ["content", "padding", "border", "budget"],
    seed_code: `/* Step 4: the mental model */
.card {
  width: 50%;
  padding: 20px;
  border: 2px solid #333;
  box-sizing: border-box;
}`,
    feedback_correct: "✅ Budget analogy captured. Whenever you see overflow or 'my width isn't working,' you can ask: is this content-box (width = content only) or border-box (width = total)? Most modern CSS is border-box; the analogy explains why.",
    feedback_partial: "Comment that width is the budget and content = budget - padding - border.",
    feedback_wrong: "Comment above .card describing border-box as 'width = total budget.'",
    expected: `/* Total width = budget; content area = budget - padding - border */`,
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 5 — Clean final",
    paal: `Why this step: With the global reset, .card doesn't need to repeat box-sizing — it inherits the same behavior. So your final CSS is minimal: just dimensions and padding/border. That's how you'll write CSS in real projects.

What you'll see: Same layout; fewer lines. The reset does the work.

Your turn: Keep the global reset and .card. You can remove box-sizing from .card if you want (the universal selector already set it). Clean, production-style CSS.`,
    hint: "Global *, *::before, *::after { box-sizing: border-box; } plus .card with width, padding, border. .card doesn't need box-sizing if the reset is there.",
    answer_keywords: ["box-sizing", "card", "padding", "width"],
    seed_code: `/* Step 5: reset + cards — minimal */
.card {
  width: 50%;
  padding: 20px;
  border: 2px solid #333;
}`,
    feedback_correct: "✅ Module complete. You now know *why* layouts break (content-box), *why* border-box fixes it (width = total), and *why* we set it globally (so every element behaves the same). Next: margin collapse — another 'why is my spacing wrong?' moment.",
    feedback_partial: "Reset at top, .card with width, padding, border. No duplicate box-sizing needed.",
    feedback_wrong: "Full CSS: universal box-sizing reset + .card with width, padding, border.",
    expected: `Full CSS with reset and .card.`,
  },
];

const sideItems = [
  { id: "intro", label: "Lesson" },
  { id: "objectives", label: "Objectives" },
  { id: "step1", label: "Broken layout" },
  { id: "step2", label: "Fix" },
  { id: "step3", label: "Global reset" },
  { id: "step4", label: "Budget" },
  { id: "step5", label: "Final" },
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
  const body = (html && html.trim()) ? html : "<div style=\"display:flex;flex-wrap:wrap;\"><div class=\"card\">Card 1</div><div class=\"card\">Card 2</div></div>";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${body}</body></html>`;
}

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: 2,
  title: "box-sizing: border-box",
  shortName: "BOX-SIZING",
  language: "css",
  answerShape: "css-tabs",
  defaultHtml: "<div class=\"card\">Card 1</div><div class=\"card\">Card 2</div>",
  getOutputPreview,
});
