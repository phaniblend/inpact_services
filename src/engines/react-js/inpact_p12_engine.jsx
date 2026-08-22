import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #12", title: "Card Component", body: `Build a Card component with: title, description, image, and footer slot via props. Render a styled card that displays each.`, usecase: "Cards are the standard pattern for product lists, dashboards, and content blocks." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Accept title, description, image (URL), footer as props", "Render image with <img src={image} alt={title} />", "Use children or a footer prop for the bottom section"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a Card component that accepts title and description as props. Return a div containing an h2 for title and a p for description.", hint: "function Card({ title, description }) { return <div><h2>{title}</h2><p>{description}</p></div> }", answer_keywords: ["card", "title", "description", "h2", "p", "props"], seed_code: `export default function Card({ title, description }) {
  // Step 1: div with h2 and p
}`, feedback_correct: "✅ Title and description rendered.", feedback_partial: "Accept title and description, render them in h2 and p.", feedback_wrong: "return <div><h2>{title}</h2><p>{description}</p></div>", expected: "return <div><h2>{title}</h2><p>{description}</p></div>" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add an image prop (URL string). Render an <img src={image} alt={title} /> inside the card. Add basic styles (e.g. maxWidth) so the image fits.", hint: "<img src={image} alt={title} style={{ maxWidth: '100%' }} />", answer_keywords: ["img", "src", "alt", "image"], seed_code: `export default function Card({ title, description, image }) {
  return (
    <div>
      <h2>{title}</h2>{/* Step 2: img with image prop */}<p>{description}</p>
    </div>
  )
}`, feedback_correct: "✅ Image displayed from prop.", feedback_partial: "Add <img src={image} alt={...} />.", feedback_wrong: "<img src={image} alt={title} />", expected: "<img src={image} alt={title} style={{ maxWidth: '100%' }} />" },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Add a footer slot: accept footer as a prop (string or node) or use children. Render it at the bottom of the card. Export the component.", hint: "footer can be a prop: {footer}. Or use children for the whole card content.", answer_keywords: ["footer", "export"], seed_code: `export default function Card({ title, description, image, footer }) {
  return (
    <div style={{ border: '1px solid #333', borderRadius: 8, padding: 16 }}>
      <h2>{title}</h2>
      <img src={image} alt={title} style={{ maxWidth: '100%' }} />
      <p>{description}</p>
      {/* Step 3: render footer */}
    </div>
  )
}`, feedback_correct: "✅ Card with title, description, image, and footer complete.", feedback_partial: "Render the footer prop at the bottom.", feedback_wrong: "Add {footer} at the bottom of the card (or <div>{footer}</div> — either is valid).", expected: "{footer}" },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];

export default createINPACTEngine({ NODES, sideItems, lessonNum: 12, title: "Card Component", shortName: "CARD COMPONENT" });
