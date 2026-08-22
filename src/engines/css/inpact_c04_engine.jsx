import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  {
    id: "intro",
    type: "reveal",
    phase: "Module 1 — Foundations",
    content: {
      tag: "CSS C04",
      title: "Display Values",
      body: `display controls how an element participates in layout:
  block — full width, stack vertically; can set width/height.
  inline — flows with text; width/height ignored; padding/margin only horizontal.
  inline-block — flows like inline but respects width/height and vertical margin.

Classic use: a nav bar with a flex container, inline (or inline-block) links, and an inline-block badge.`,
      usecase: "Nav bars, tags/chips, and mixed text-and-block UIs all rely on choosing the right display.",
    },
  },
  {
    id: "objectives",
    type: "objectives",
    phase: "Objectives",
    items: [
      "Build a nav bar with flex container and links",
      "Use inline or inline-block for links and a badge",
      "Compare block vs inline vs inline-block in a table or list",
      "Apply the tag/chip pattern (inline-block) in a real example",
    ],
  },
  {
    id: "step1",
    type: "question",
    phase: "Step 1 of 6",
    paal: "Create a .nav bar: a flex container (display: flex) that will hold links and a badge. Set align-items: center and gap: 1rem so items align and have space between.",
    hint: ".nav { display: flex; align-items: center; gap: 1rem; }",
    answer_keywords: ["display", "flex", "align-items", "gap", "nav"],
    seed_code: `/* Step 1: nav flex container */
.nav {
}`,
    feedback_correct: "✅ Nav is a flex container.",
    feedback_partial: "display: flex and alignment/gap.",
    feedback_wrong: ".nav { display: flex; align-items: center; gap: 1rem; }",
    expected: `.nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}`,
  },
  {
    id: "step2",
    type: "question",
    phase: "Step 2 of 6",
    paal: "Add .nav a (links inside nav). Make them display: inline or leave default — they should flow in a row. Style text (color, text-decoration) so they look like links.",
    hint: ".nav a { display: inline; color: #3b82f6; text-decoration: none; } or display: inline-block if you want padding to act like a block.",
    answer_keywords: ["inline", "nav", "a", "link"],
    seed_code: `/* Step 2: inline links */
.nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.nav a {
}`,
    feedback_correct: "✅ Links are inline (or inline-block) and styled.",
    feedback_partial: "Nav links with display inline/inline-block.",
    feedback_wrong: ".nav a { display: inline; ... }",
    expected: `.nav a {
  display: inline;
  color: #3b82f6;
  text-decoration: none;
}`,
  },
  {
    id: "step3",
    type: "question",
    phase: "Step 3 of 6",
    paal: "Add a .badge inside the nav (e.g. 'New'). Use display: inline-block so you can set padding and border-radius; it stays in the flow but behaves like a small block.",
    hint: ".badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 4px; background: #10b981; color: white; }",
    answer_keywords: ["inline-block", "badge", "padding"],
    seed_code: `/* Step 3: inline-block badge */
.badge {
}`,
    feedback_correct: "✅ Badge is inline-block with padding and style.",
    feedback_partial: "display: inline-block for badge.",
    feedback_wrong: ".badge { display: inline-block; padding: ... }",
    expected: `.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: #10b981;
  color: white;
}`,
  },
  {
    id: "step4",
    type: "question",
    phase: "Step 4 of 6",
    paal: "Add a comparison: in a comment or a small table, list block vs inline vs inline-block — width/height, vertical margin, stacks vs flows.",
    hint: "Comment: block = full width, stacks; inline = flows, no width/height; inline-block = flows but respects width/height and vertical margin.",
    answer_keywords: ["block", "inline", "inline-block", "comparison", "table"],
    seed_code: `/* Step 4: comparison
   block: full width, stacks, width/height ok
   inline: flows, width/height ignored
   inline-block: flows, width/height and vertical margin ok */`,
    feedback_correct: "✅ Comparison of display values documented.",
    feedback_partial: "Block vs inline vs inline-block comparison.",
    feedback_wrong: "Comment or list comparing the three.",
    expected: `/* block: full width, stacks; inline: flows, no w/h; inline-block: flows + w/h + vertical margin */`,
  },
  {
    id: "step5",
    type: "question",
    phase: "Step 5 of 6",
    paal: "Build a .tag or .chip: display: inline-block, padding, border-radius, background. Use it as the real-world pattern for labels (e.g. 'CSS', 'React'). Multiple tags sit in a row and wrap like inline content.",
    hint: ".tag { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 9999px; background: #e5e7eb; }",
    answer_keywords: ["tag", "chip", "inline-block"],
    seed_code: `/* Step 5: tag/chip pattern */
.tag {
}`,
    feedback_correct: "✅ Tag/chip pattern with inline-block.",
    feedback_partial: "inline-block tag with padding and radius.",
    feedback_wrong: ".tag { display: inline-block; padding: ...; border-radius: ...; }",
    expected: `.tag {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  background: #e5e7eb;
}`,
  },
  {
    id: "step6",
    type: "question",
    phase: "Step 6 of 6",
    paal: "Combine: a .nav with flex, .nav a as inline or inline-block, and a .badge. Optional: a .tag-list containing several .tag elements. Export-ready CSS.",
    hint: "Full nav + badge + optional tag list; all display values applied.",
    answer_keywords: ["nav", "flex", "inline", "inline-block", "badge", "tag"],
    seed_code: `/* Step 6: full nav + tag pattern */
.nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.nav a { }
.badge { }
.tag { }
.tag-list { }`,
    feedback_correct: "✅ Display values module complete.",
    feedback_partial: "Nav (flex), links, badge, tag pattern.",
    feedback_wrong: "Complete CSS with nav, links, badge, and tags.",
    expected: `Full CSS: .nav (flex), .nav a (inline/inline-block), .badge (inline-block), .tag (inline-block).`,
  },
];

const sideItems = [
  { id: "intro", label: "Lesson" },
  { id: "objectives", label: "Objectives" },
  { id: "step1", label: "Nav flex" },
  { id: "step2", label: "Inline links" },
  { id: "step3", label: "Inline-block badge" },
  { id: "step4", label: "Comparison" },
  { id: "step5", label: "Tag/chip" },
  { id: "step6", label: "Full example" },
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
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${html || "<nav class=\"nav\"><a href=\"#\">Home</a><a href=\"#\">About</a><span class=\"badge\">New</span></nav>"}</body></html>`;
}

export default createINPACTEngine({
  NODES,
  sideItems,
  lessonNum: 4,
  title: "Display Values",
  shortName: "DISPLAY",
  language: "css",
  answerShape: "css-tabs",
  defaultHtml: "<nav class=\"nav\"><a href=\"#\">Home</a><a href=\"#\">About</a><span class=\"badge\">New</span></nav>",
  getOutputPreview,
});
