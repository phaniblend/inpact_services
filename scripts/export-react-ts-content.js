/**
 * Export React-TS cache to content/react-ts/ (001_Counter_App_lesson.json, etc.).
 * Run after warming: npm run export-react-ts-content
 */
process.env.TRACK = "react-ts";
await import("./export-cache-to-content.js");
