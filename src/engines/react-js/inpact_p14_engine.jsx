import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #14", title: "Default Props", body: `Build an Avatar component with default props for size (e.g. 40) and placeholder image URL. When the consumer doesn't pass image, show the placeholder.`, usecase: "Default props make components flexible and easy to use without configuring everything." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Define default values for size and image (placeholder URL)", "Use Avatar.defaultProps or default parameters", "Render an img with size as width/height"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create Avatar that accepts image and size. Use default parameters: function Avatar({ image = 'https://via.placeholder.com/40', size = 40 }).", hint: "Default params: ({ image = '...', size = 40 }) =>", answer_keywords: ["avatar", "image", "size", "default", "40"], seed_code: `export default function Avatar({ image, size }) {
  // Step 1: add default values for image and size
}`, feedback_correct: "✅ Default values set.", feedback_partial: "Use default parameters: image = '...', size = 40.", feedback_wrong: "Avatar({ image = 'https://via.placeholder.com/40', size = 40 })", expected: "Default params or defaultProps for image and size." },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Return an <img> with src={image}, alt='Avatar', and style so width and height are the size prop (e.g. width: size, height: size, borderRadius: '50%').", hint: "style={{ width: size, height: size, borderRadius: '50%' }}", answer_keywords: ["img", "src", "width", "height", "borderradius"], seed_code: `export default function Avatar({ image = 'https://via.placeholder.com/40', size = 40 }) {
  // Step 2: img with size and rounded style
}`, feedback_correct: "✅ Avatar renders with size and placeholder when image not provided.", feedback_partial: "img with src={image} and dimensions from size.", feedback_wrong: "<img src={image} style={{ width: size, height: size, borderRadius: '50%' }} />", expected: "img with src, width/height from size, borderRadius 50%." },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Export Avatar. When called as <Avatar /> with no props, it should show the placeholder at 40x40. When called as <Avatar image={url} size={64} /> it should use those values.", hint: "Default params handle missing props. No change needed if step 2 is correct.", answer_keywords: ["export", "default"], seed_code: `export default function Avatar({ image = 'https://via.placeholder.com/40', size = 40 }) {
  return <img src={image} alt="Avatar" style={{ width: size, height: size, borderRadius: '50%' }} />
}`, feedback_correct: "✅ Avatar with default props complete.", feedback_partial: "Ensure export default and default params.", feedback_wrong: "Export default function Avatar with defaults.", expected: "Export default function Avatar with default params." },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];

export default createINPACTEngine({ NODES, sideItems, lessonNum: 14, title: "Default Props", shortName: "DEFAULT PROPS" });
