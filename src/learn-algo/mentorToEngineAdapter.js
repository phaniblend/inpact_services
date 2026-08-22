/**
 * Converts a mentor lesson (flow with mentorSays, choices, example, next)
 * into INPACT engine NODES (reveal + choices) and sideItems.
 * Used so the same createINPACTEngine teaches algo lessons like React-JS.
 *
 * @param {{ flow: Array<{ stepId: string, mentorSays?: string, example?: string, next?: string, choices?: Array<{ label: string, next: string }> }>, title?: string, pattern?: string }} lesson - Full lesson JSON from GET /api/mentor/lesson/:id
 * @returns {{ NODES: object[], sideItems: { id: string, label: string }[] }}
 */
export function mentorFlowToEngineConfig(lesson) {
  const flow = lesson.flow || [];
  const stepIdToIndex = {};
  flow.forEach((s, i) => {
    stepIdToIndex[s.stepId] = i;
  });

  const NODES = flow.map((step) => {
    if (step.choices && step.choices.length > 0) {
      return {
        id: step.stepId,
        type: "choices",
        phase: step.stepId,
        content: {
          title: lesson.title,
          body: step.mentorSays || "",
          example: step.example,
        },
        choices: step.choices.map((c) => ({
          label: c.label,
          nextNodeIndex: stepIdToIndex[c.next] ?? flow.length,
        })),
      };
    }
    const nextIndex = step.next != null ? (stepIdToIndex[step.next] ?? flow.length) : flow.length;
    return {
      id: step.stepId,
      type: "reveal",
      phase: step.stepId,
      nextNodeIndex: nextIndex,
      content: {
        tag: lesson.pattern ? String(lesson.pattern) : "ALGORITHM",
        title: lesson.title,
        body: step.mentorSays || "",
        example: step.example,
      },
    };
  });

  const sideItems = flow.map((s) => ({
    id: s.stepId,
    label: s.stepId.length > 24 ? s.stepId.slice(0, 21) + "…" : s.stepId,
  }));

  return { NODES, sideItems };
}
