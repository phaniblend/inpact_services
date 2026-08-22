/**
 * One-off / repeatable: replace React.FC component typing with explicit JSX.Element
 * in React-TS engines + generated JSON. Run: node scripts/replace-react-fc-with-jsx-element.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const DIRS = [
  path.join(root, "src", "engines", "react-ts"),
  path.join(root, "content", "generated", "react-ts"),
];

function walkJsonJsx(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    if (name.endsWith(".jsx") || name.endsWith(".json")) out.push(path.join(dir, name));
  }
  return out;
}

function transform(s) {
  let t = s;
  // Code: const Name: React.FC = () =>  →  const Name = (): JSX.Element =>
  t = t.replace(/const\s+([A-Za-z_$][\w$]*)\s*:\s*React\.FC\s*=\s*\(\)\s*=>/g, "const $1 = (): JSX.Element =>");
  // HOC / generic return type (less common in strings)
  t = t.replace(/:\s*React\.FC<([^>]+)>\s*with/g, ": React.ComponentType<$1> with");
  t = t.replace(/React\.FC<\{\s*node:\s*TreeNode\s*\}>/g, "({ node }: { node: TreeNode }): JSX.Element");
  t = t.replace(/withAuth<P>\(Component:\s*React\.ComponentType<P>\):\s*React\.FC<P>/g,
    "withAuth<P>(Component: React.ComponentType<P>): React.ComponentType<P>");

  // Phrases (order matters — longer first)
  const phrasePairs = [
    ["Either JSX.Element or React.FC are valid", "JSX.Element (explicit return type on the function)"],
    ["React.FC (FunctionComponent)", "React.FC (legacy — avoid in new code)"],
    ["Using React.FC type for function components", "Using an explicit JSX.Element return type on the function"],
    ["const MyComponent: React.FC = () => { ... }", "const MyComponent = (): JSX.Element => { ... }"],
    ["const ToggleButton: React.FC = () => { }", "const ToggleButton = (): JSX.Element => { }"],
    ["const Counter: React.FC = () => { return <div>Hello</div>; };", "const Counter = (): JSX.Element => { return <div>Hello</div>; };"],
    ["React.FC (optional but provides type checking)", "An explicit JSX.Element return type"],
    ["Use the React.FC type annotation for the component.", "Give the function an explicit `: JSX.Element` return type."],
    ["Use const with React.FC type and arrow function syntax.", "Use const, arrow function, and an explicit `: JSX.Element` return type."],
    ["Use const with React.FC type annotation and arrow function syntax.", "Use const, arrow syntax, and an explicit `: JSX.Element` return type."],
    ["Use React.FC type annotation and return <> </> as initial JSX.", "Use an explicit `: JSX.Element` return type and return <> </> as initial JSX."],
    ["Use the React.FC type or function declaration with return type.", "Use an explicit JSX.Element return type (or a function declaration with return type)."],
    ["Define a function component named Counter with React.FC type annotation.", "Define a function component named Counter with an explicit JSX.Element return type."],
    ["Use const with arrow function syntax and add : React.FC before the equals sign.", "Use const with arrow function syntax and add `: JSX.Element` after the parameter list as the return type."],
    ["Declare a functional component named ControlledInput with explicit React.FC type.", "Declare a functional component named ControlledInput with an explicit JSX.Element return type."],
    ["Start with 'const ControlledInput: React.FC = () => { }'.", "Start with `const ControlledInput = (): JSX.Element => { }`."],
    ["Define a functional component named CounterDashboard that returns an empty div for now. Use React.FC type annotation.", "Define a functional component named CounterDashboard that returns an empty div for now, with an explicit JSX.Element return type."],
    ["Start with 'const CounterDashboard: React.FC = () => { return <div></div>; };'", "Start with `const CounterDashboard = (): JSX.Element => { return <div></div>; };`"],
    ["React.FC is the TypeScript type for functional components, ensuring proper typing.", "An explicit JSX.Element return type documents what the component renders."],
    ["React.FC (Function Component) is the standard TypeScript type for React components, providing better type checking and IntelliSense.", "Modern React + TypeScript favors an explicit JSX.Element return type on the function instead of React.FC."],
    ["Right! React.FC is the TypeScript type for function components, and empty parentheses indicate no props.", "Right! The `: JSX.Element` return type describes what the component renders; `()` means there are no props."],
    ["Using React.FC type annotation ensures TypeScript knows this component returns JSX.", "An explicit JSX.Element return type tells TypeScript this function returns JSX."],
    ["Use React.FC for explicit typing in TypeScript.", "Use an explicit JSX.Element return type for the component function."],
    ["Correct! React.FC<CardProps> or (props: CardProps) both work, but we'll use the explicit parameter typing for clarity.", "Correct! Prefer `const Card = (props: CardProps): JSX.Element =>` (or destructure props) with an explicit JSX.Element return type."],
    ["TypeScript accepts both explicit JSX.Element return type or React.FC interface for components.", "Prefer an explicit JSX.Element return type on the function; avoid React.FC in new code."],
    ["Component uses React.FC type", "Component uses an explicit JSX.Element return type"],
    ["Uses React.FC type", "Uses explicit JSX.Element return type"],
    ["Uses React.FC type annotation", "Uses explicit JSX.Element return type"],
    ["Has React.FC type annotation", "Has explicit JSX.Element return type"],
    ["uses React.FC", "uses JSX.Element return type"],
    ["Component uses React.FC type annotation", "Component uses explicit JSX.Element return type"],
    ["Has an explicit TypeScript return type (for example JSX.Element or React.FC)", "Has an explicit TypeScript return type (JSX.Element)"],
  ];
  for (const [a, b] of phrasePairs) {
    t = t.split(a).join(b);
  }

  // Remaining standalone React.FC in keywords / short options
  t = t.replace(/\bReact\.FC\b/g, "JSX.Element");
  // Fix double "JSX.Element<Element" if any bad merge
  t = t.replace(/JSX\.Element<CardProps>/g, "(props: CardProps) => JSX.Element");

  return t;
}

let n = 0;
for (const dir of DIRS) {
  for (const file of walkJsonJsx(dir)) {
    const raw = fs.readFileSync(file, "utf8");
    const next = transform(raw);
    if (next !== raw) {
      fs.writeFileSync(file, next, "utf8");
      n++;
      console.log("updated", path.relative(root, file));
    }
  }
}
console.log(`Done. files=${n}`);
