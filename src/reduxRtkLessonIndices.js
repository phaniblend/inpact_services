/**
 * Redux ∪ RTK: curriculum indices (0-based, same order as LESSON_LIST / ENGINES_TS)
 * for lessons that appear in the Redux ∪ RTK landing subsection instead of the main “deep” grid.
 *
 * Aligned with blueprint reorder (Mini Redux → RTK Query listener as one contiguous block).
 */
export const REDUX_RTK_LESSON_INDICES = new Set([
  58, 59, 60, 61, 62, 63, 64, 65, 66, 67, // Mini Redux … RTK Query — WebSocket Listener
]);

export function isReduxRtkLessonIndex(i) {
  return REDUX_RTK_LESSON_INDICES.has(i);
}

/**
 * Landing-page subsections under “Redux (Toolkit & RTK)” — each group lists curriculum indices in display order.
 */
export const REDUX_LANDING_SUBSECTIONS = [
  { key: "redux-pattern-mini", title: "Reducer pattern (before Toolkit)", indices: [58] },
  {
    key: "redux-toolkit-core",
    title: "Redux Toolkit — slices, store, async, entities",
    indices: [59, 60, 61, 62, 63, 64],
  },
  { key: "redux-rtk-query", title: "RTK Query — API layer", indices: [65, 66, 67] },
];
