import createINPACTEngine from "../inpact_engine_shared";
import { aiLessonToEngineConfig } from "../../ai-lessons/adapters/normalizeToEngineConfig.js";
import raw from "../../../content/react-js/024_Simple_Todo_List_lesson.json";

const lesson = raw.config;
const engineConfig = aiLessonToEngineConfig(lesson, { track: "react-js", language: "javascript" });

const INPACTEngineP24 = createINPACTEngine(engineConfig);
export default INPACTEngineP24;
