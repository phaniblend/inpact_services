import createINPACTEngine from "../inpact_engine_shared";

const NODES = [
  { id: "intro", type: "reveal", phase: "Lesson", content: { tag: "LESSON #18", title: "PropTypes (JavaScript)", body: `In JavaScript we use PropTypes to document and validate component props — the runtime equivalent of TypeScript interfaces. Build a UserCard that accepts name (string), age (number), and optional avatar (string), using PropTypes only (no TS syntax).`, usecase: "PropTypes catch bad props at runtime and document the component API; in JS you cannot use interface syntax." } },
  { id: "objectives", type: "objectives", phase: "Objectives", items: ["Import PropTypes and set UserCard.propTypes for name and age", "Add optional avatar: PropTypes.string and conditionally render img", "Export UserCard with full PropTypes"] },
  { id: "step1", type: "question", phase: "Step 1 of 3", paal: "Create a UserCard component that accepts name (string) and age (number). Use PropTypes (JS): import PropTypes and set UserCard.propTypes so name is string and age is number.", hint: "In JS you must use PropTypes — TS interface syntax won't run. Import: import PropTypes from 'prop-types'. After the function: UserCard.propTypes = { name: PropTypes.string.isRequired, age: PropTypes.number.isRequired };", answer_keywords: ["interface", "proptypes", "name", "age", "string", "number"], seed_code: `// Step 1: define props with PropTypes (JS) and UserCard
import PropTypes from 'prop-types';

function UserCard({ name, age }) {
  return <div>{name}, {age}</div>
}
UserCard.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.number.isRequired,
};
export default UserCard;`, feedback_correct: "✅ Props typed with PropTypes.", feedback_partial: "Add PropTypes for name and age (PropTypes.string, PropTypes.number).", feedback_wrong: "Use PropTypes — see hint for the exact pattern.", expected: `import PropTypes from 'prop-types';

function UserCard({ name, age }) {
  return <div>{name}, {age}</div>
}
UserCard.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.number.isRequired,
};
export default UserCard;` },
  { id: "step2", type: "question", phase: "Step 2 of 3", paal: "Add an optional avatar prop (string). In PropTypes add avatar: PropTypes.string (no .isRequired). Destructure avatar in the function and conditionally render an img when avatar is provided. Keep rendering name and age.", hint: "1) Destructure avatar: function UserCard({ name, age, avatar }). 2) PropTypes: avatar: PropTypes.string (no isRequired). 3) Render name/age and the img: {avatar && <img src={avatar} alt={name} />}", answer_keywords: ["avatar", "proptypes", "string", "img", "name", "age"], seed_code: `import PropTypes from 'prop-types';

function UserCard({ name, age, avatar }) {
  // Step 2: render avatar img if provided
  return <div>{name}, {age}</div>
}
UserCard.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.number.isRequired,
  avatar: PropTypes.string,
};
export default UserCard;`, feedback_correct: "✅ Optional avatar in PropTypes and conditional render.", feedback_partial: "Add avatar: PropTypes.string and conditionally render img.", feedback_wrong: "Add avatar to the function params ({ name, age, avatar }), add avatar: PropTypes.string, render {avatar && <img />}, and keep showing name and age.", expected: `function UserCard({ name, age, avatar }) {
  return (
    <div>
      {avatar && <img src={avatar} alt={name} />}
      <span>{name}, {age}</span>
    </div>
  );
}
UserCard.propTypes = { name: ..., age: ..., avatar: PropTypes.string };` },
  { id: "step3", type: "question", phase: "Step 3 of 3", paal: "Export UserCard. Usage: <UserCard name=\"Jane\" age={25} /> or <UserCard name=\"Jane\" age={25} avatar=\"/me.jpg\" />. PropTypes should match.", hint: "export default UserCard; ensure propTypes has name, age, and optional avatar.", answer_keywords: ["export", "default"], seed_code: `import PropTypes from 'prop-types';

function UserCard({ name, age, avatar }) {
  return (
    <div>
      {avatar && <img src={avatar} alt={name} />}
      <span>{name}, {age}</span>
    </div>
  )
}
UserCard.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.number.isRequired,
  avatar: PropTypes.string,
};
export default UserCard;`, feedback_correct: "✅ UserCard with PropTypes complete.", feedback_partial: "Export default and PropTypes for all props.", feedback_wrong: "export default UserCard; propTypes for name, age, avatar.", expected: `Full component with PropTypes and export default UserCard.` },
];

const sideItems = [{ label: "Lesson", id: "intro" }, { label: "Objectives", id: "objectives" }, { label: "Step 1", id: "step1" }, { label: "Step 2", id: "step2" }, { label: "Step 3", id: "step3" }];

export default createINPACTEngine({ NODES, sideItems, lessonNum: 18, title: "PropTypes (JavaScript)", shortName: "PROPTYPES (JS)" });
