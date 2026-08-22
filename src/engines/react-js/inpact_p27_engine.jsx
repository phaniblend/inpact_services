import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #27", title: "Simple Todo List", body: `Add, complete, delete todos — full CRUD with useState. State is an array of objects { id, text, done }. Add new todo, toggle done, delete by id.`, usecase: "Todo list is the classic example of list state and CRUD in React." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["State: array of { id, text, done }", "Add: setTodos([...todos, { id: Date.now(), text, done: false }])", "Toggle: map and flip done for matching id", "Delete: filter out by id"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create state: const [todos, setTodos] = useState([]). Add an input and button to add a todo. When the user submits, add { id: Date.now(), text: inputValue, done: false } to the array.", hint: "setTodos([...todos, { id: Date.now(), text, done: false }]); clear input after.", answer_keywords: ["usestate", "todos", "settodos", "id", "text", "done", "add"], seed_code: `import { useState } from 'react'

export default function TodoList() {
  const [todos, setTodos] = useState([])
  const [text, setText] = useState('')
  // Step 1: add todo on submit
}`, feedback_correct: "✅ Add todo works.", feedback_partial: "Append new item to todos with id, text, done.", feedback_wrong: "setTodos([...todos, { id: Date.now(), text, done: false }])", expected: "Add handler that pushes new todo." },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Render the list. Each item: show text, a checkbox for done (checked={todo.done} onChange to toggle), and a delete button. Toggle: setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t)). Delete: setTodos(todos.filter(t => t.id !== id)).", hint: "map for toggle, filter for delete.", answer_keywords: ["map", "filter", "toggle", "delete", "checkbox", "onchange"], seed_code: `import { useState } from 'react'

export default function TodoList() {
  const [todos, setTodos] = useState([])
  const [text, setText] = useState('')
  const add = () => { if (!text.trim()) return; setTodos([...todos, { id: Date.now(), text, done: false }]); setText('') }
  // Step 2: render list with toggle and delete
}`, feedback_correct: "✅ Toggle and delete work.", feedback_partial: "Checkbox toggles done, button deletes.", feedback_wrong: "map for toggle, filter for delete.", expected: "List with toggle and delete per item." },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Wire the add form (input + button or Enter). Style completed items (e.g. textDecoration: 'line-through'). Export the component.", hint: "todo.done && style={{ textDecoration: 'line-through' }}", answer_keywords: ["input", "button", "linethrough", "export"], seed_code: `import { useState } from 'react'

export default function TodoList() {
  const [todos, setTodos] = useState([])
  const [text, setText] = useState('')
  const add = () => { if (!text.trim()) return; setTodos([...todos, { id: Date.now(), text, done: false }]); setText('') }
  const toggle = (id) => setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t))
  const del = (id) => setTodos(todos.filter(t => t.id !== id))
  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
      <button onClick={add}>Add</button>
      <ul>
        {todos.map(t => (
          <li key={t.id} style={{ textDecoration: t.done ? 'line-through' : 'none' }}>
            <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
            {t.text}
            <button onClick={() => del(t.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}`, feedback_correct: "✅ Simple Todo List CRUD complete.", feedback_partial: "Add, toggle, delete and styling.", feedback_wrong: "Full CRUD and completed style.", expected: "Add, toggle (map), delete (filter), style completed (line-through). Export." },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];

export default createINPACTEngine({ NODES, sideItems, lessonNum: 27, title: "Simple Todo List", shortName: "SIMPLE TODO LIST" });
