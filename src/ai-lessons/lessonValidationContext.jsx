import { createContext } from "react";

/**
 * Supplied by App when rendering static curriculum engines so createINPACTEngine can POST /api/lessons/validate.
 * @type {React.Context<{ track: string, lessonIndex: number, lessonTitle?: string, lessonKey?: string } | null>}
 */
export const LessonValidationContext = createContext(null);
