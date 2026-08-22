import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #15", title: "Children Prop", body: `Build a Container component that wraps any children with a styled div (e.g. maxWidth, padding, border). Usage: <Container><h1>Hi</h1><p>Content</p></Container>.`, usecase: "Children prop is the standard way to create layout and wrapper components." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Accept children as a prop", "Return a div that wraps {children}", "Apply inline styles (maxWidth, padding, etc.)"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "A Container component is started below. Inside the function, return a div that wraps the children: return <div>{children}</div>", hint: "function Container({ children }) { return <div>{children}</div> }", answer_keywords: ["container", "children", "div"], starter_code: `function Container({ children }) {

}`, seed_code: `export default function Container({ children }) {
  return <div>{children}</div>
}`, feedback_correct: "✅ Children rendered inside div.", feedback_partial: "Return <div>{children}</div>.", feedback_wrong: "return <div>{children}</div>", expected: "function Container({ children }) { return <div>{children}</div> }" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add styles to the div: maxWidth (e.g. 600px), padding (e.g. 24px), and a border or background so the container is visible.", hint: "style={{ maxWidth: '600px', padding: 24, border: '1px solid #333' }}", answer_keywords: ["style", "maxwidth", "padding", "border"], seed_code: `export default function Container({ children }) {
  return (
    <div>
      {children}
    </div>
  )
}`, feedback_correct: "✅ Styled container.", feedback_partial: "Add style with maxWidth and padding.", feedback_wrong: "style={{ maxWidth: '600px', padding: 24 }}", expected: "div with style object including maxWidth, padding." },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Export Container. It should work when used as <Container><h1>Title</h1><p>Body</p></Container>.", hint: "children can be one or many elements. No change if step 2 is correct.", answer_keywords: ["export", "default"], seed_code: `export default function Container({ children }) {
  return (
    <div style={{ maxWidth: '600px', padding: 24, border: '1px solid #333', borderRadius: 8 }}>
      {children}
    </div>
  )
}`, feedback_correct: "✅ Container with children prop complete.", feedback_partial: "Ensure export default.", feedback_wrong: "Export default function Container.", expected: "Export default function Container that accepts and renders children (e.g. {children})." },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];

export default createINPACTEngine({ NODES, sideItems, lessonNum: 15, title: "Children Prop", shortName: "CHILDREN PROP" });
