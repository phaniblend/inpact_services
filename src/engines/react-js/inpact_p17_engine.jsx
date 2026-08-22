import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #17", title: "List Rendering", body: `Render a list of products with proper key props. Use an array of objects (e.g. id, name, price) and map over it to render a div or li for each. Keys help React track list items across updates.`, usecase: "Lists are everywhere; keys prevent bugs and keep updates efficient." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Define an array of items (e.g. products with id, name, price)", "Use .map() to render one element per item", "Add key={item.id} (or stable unique key) to the mapped element"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create an array of products (e.g. objects with id, name, price). Use .map() to render one div per product, and put key on each div (e.g. key from the item's id).", hint: "products.map(p => <div key={p.id}>{p.name} - ${p.price}</div>)", answer_keywords: ["map", "key", "products", "div"], starter_code: `const products = [{ id: 1, name: 'Apple', price: 1 }, { id: 2, name: 'Bread', price: 2 }]

export default function ProductList() {

}`,
  seed_code: `const products = [{ id: 1, name: 'Apple', price: 1 }, { id: 2, name: 'Bread', price: 2 }]

export default function ProductList() {
  return <div>{products.map(p => <div key={p.id}>{p.name} - {p.price}</div>)}</div>
}`, feedback_correct: "✅ List rendered with keys.", feedback_partial: "Use .map() and add key={item.id} to the root element.", feedback_wrong: "return <div>{products.map(p => <div key={p.id}>{p.name} - {p.price}</div>)}</div>", expected: "products.map(p => <div key={p.id}>... (see hint)" },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Wrap the mapped list in a parent element (a single div or ul). Keep key on the element you return from map (e.g. key={product.id}).", hint: "return ( <div>{ products.map(p => <div key={p.id}>...</div>) }</div> )", answer_keywords: ["key", "map", "div"], seed_code: `const products = [{ id: 1, name: 'Apple', price: 1 }, { id: 2, name: 'Bread', price: 2 }]

export default function ProductList() {
  return (
    <div>
      {/* Step 2: map with key on each item */}
    </div>
  )
}`, feedback_correct: "✅ Keys on list items.", feedback_partial: "Key on the element returned from map.", feedback_wrong: "Each mapped element must have key={uniqueId}.", expected: "Parent div or ul wrapping products.map(...); key on each mapped element." },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Export the component. Your list should have a parent wrapper and key on each mapped item. You're done when the list renders and the component is exported.", hint: "export default function ProductList", answer_keywords: ["export", "default", "map", "key"], seed_code: `const products = [{ id: 1, name: 'Apple', price: 1 }, { id: 2, name: 'Bread', price: 2 }]

export default function ProductList() {
  return (
    <div>
      {products.map(p => <div key={p.id}>{p.name} - {p.price}</div>)}
    </div>
  )
}`, feedback_correct: "✅ List rendering with keys complete.", feedback_partial: "Ensure export default and list with keys.", feedback_wrong: "Export the component; list items need key.", expected: "export default and list with key on each item." },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];

export default createINPACTEngine({ NODES, sideItems, lessonNum: 17, title: "List Rendering", shortName: "LIST RENDERING" });
