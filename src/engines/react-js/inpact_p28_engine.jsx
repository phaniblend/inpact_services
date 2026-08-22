import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #28", title: "Star Rating Component", body: `Build a clickable 5-star rating component. State holds the current rating (1–5). Clicking a star sets the rating to that star's index. Show filled vs empty stars.`, usecase: "Star ratings are used in reviews, products, and feedback UIs." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Use useState for rating (number 0–5 or 1–5)", "Render 5 clickable elements (stars or buttons)", "Filled for index <= rating, empty otherwise", "onClick sets rating to that star's value"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create state: const [rating, setRating] = useState(0). Render 5 buttons or spans. Clicking the i-th one should call setRating(i + 1) (or i if 0-based).", hint: "Array.from({ length: 5 }, (_, i) => <button key={i} onClick={() => setRating(i + 1)}>★</button>)", answer_keywords: ["usestate", "rating", "setrating", "button", "onclick", "5"], seed_code: `import { useState } from 'react'

export default function StarRating() {
  const [rating, setRating] = useState(0)
  // Step 1: 5 clickable stars that set rating
}`, feedback_correct: "✅ Clickable stars set rating.", feedback_partial: "Five elements, onClick sets rating.", feedback_wrong: "Five buttons, onClick={() => setRating(i + 1)}", expected: "5 stars, click sets rating." },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Show filled vs empty: use ★ when index < rating (or <=), ☆ otherwise. Or use color: index < rating ? 'gold' : 'gray'.", hint: "star = index < rating ? '★' : '☆' or style color by index < rating", answer_keywords: ["index", "rating", "?", "color"], seed_code: `import { useState } from 'react'

export default function StarRating() {
  const [rating, setRating] = useState(0)
  return (
    <div>
      {[1,2,3,4,5].map(i => (
        <button key={i} onClick={() => setRating(i)}>
          {/* Step 2: show ★ or ☆ based on i <= rating */}
        </button>
      ))}
    </div>
  )
}`, feedback_correct: "✅ Filled/empty by rating.", feedback_partial: "Conditional star or color by rating.", feedback_wrong: "i <= rating ? '★' : '☆'", expected: "Filled for i <= rating, empty otherwise." },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Display the current rating (e.g. 'Rating: 3'). Export the component. Optionally allow 0 to mean 'no rating' and clicking the same star again clears it.", hint: "setRating(rating === i ? 0 : i) to toggle off.", answer_keywords: ["export", "rating"], seed_code: `import { useState } from 'react'

export default function StarRating() {
  const [rating, setRating] = useState(0)
  return (
    <div>
      {[1,2,3,4,5].map(i => (
        <button key={i} onClick={() => setRating(rating === i ? 0 : i)} style={{ fontSize: 24, background: 'none', border: 'none', cursor: 'pointer', color: i <= rating ? 'gold' : '#ccc' }}>
          ★
        </button>
      ))}
      <span>Rating: {rating}</span>
    </div>
  )
}`, feedback_correct: "✅ Star rating component complete.", feedback_partial: "Show rating value and export.", feedback_wrong: "Display rating and export.", expected: "Show rating value and export the star rating component." },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];

export default createINPACTEngine({ NODES, sideItems, lessonNum: 28, title: "Star Rating Component", shortName: "STAR RATING" });
