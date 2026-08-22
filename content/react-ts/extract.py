import json
import os
import re

def extract_core_concept(lesson_config):
    """Extracts the core React/TypeScript concept from lesson config."""
    intro_body = lesson_config["intro"]["body"]
    objectives = " ".join(lesson_config["objectives"])
    text = f"{intro_body} {objectives}"

    # List of common React/TypeScript concepts to search for
    concepts = [
        "useState", "useEffect", "useContext", "useReducer", "useRef", "useMemo", "useCallback",
        "props", "state", "JSX", "event handlers", "TypeScript", "hooks", "context", "components",
        "lifecycle", "custom hooks", "controlled components", "forms", "routing", "HOC", "render props",
        "useFetch", "useDebounce", "useLocalStorage", "useToggle", "useWindowSize", "usePrevious",
        "useClickOutside", "useKeyPress", "useOnlineStatus", "useMediaQuery", "Theme Context",
        "Auth Context", "Cart Context", "Notification Context", "useReducer", "Compound Component",
        "React.memo", "List Virtualization", "Lazy Loading", "Error Boundary", "Recursive TreeView",
        "Pagination", "Infinite Scroll", "HOC", "Render Props", "Portal", "useImperativeHandle",
        "useSyncExternalStore", "useTransition", "useDeferredValue", "useLayoutEffect", "Mini Redux",
        "Optimistic UI", "Polling Hook", "WebSocket Hook", "Feature Flag Hook", "Undo Redo",
        "AbortController", "React Router", "TanStack Query", "Zustand", "Next.js", "Server Components",
        "SSR", "SSG", "Accessibility", "JWT", "OAuth2", "RBAC", "RTK Query", "Redux Toolkit",
        "Zod", "React Hook Form", "createSlice", "createAsyncThunk", "Race Condition", "Memoization",
        "Concurrent Mode", "Memory Leak", "forwardRef", "useId", "TanStack Query Basics"
    ]

    for concept in concepts:
        if re.search(rf"\b{concept}\b", text, re.IGNORECASE):
            return concept

    # Fallback: Extract the main topic from the title (e.g., "Counter" from "Counter_App")
    title_parts = lesson_config["title"].split()
    return title_parts[0] if title_parts else "Unknown"

def extract_lessons_from_root(root_folder, max_lessons=29):
    """Extracts core concepts from lesson files in the root folder."""
    concepts = []
    lesson_files = [
        f for f in os.listdir(root_folder)
        if f.endswith("_lesson.json") and f.split("_")[0].isdigit()
    ]
    lesson_files.sort()  # Sort by lesson number
    lesson_files = lesson_files[:max_lessons]  # Limit to first 29 lessons

    for filename in lesson_files:
        filepath = os.path.join(root_folder, filename)
        with open(filepath, "r", encoding="utf-8") as file:
            lesson = json.load(file)
            core_concept = extract_core_concept(lesson["config"])

            concepts.append({
                "lesson_id": lesson["config"]["lessonId"],
                "title": lesson["config"]["title"],
                "core_concept": core_concept,
                "intro": lesson["config"]["intro"]["body"],
                "objectives": lesson["config"]["objectives"]
            })

    # Optional utility output (deep-dive copy lives in 000_deep_dives.json)
    output_file = "extracted_lesson_summaries.json"
    with open(output_file, "w", encoding="utf-8") as outfile:
        json.dump(concepts, outfile, indent=2)

    print(f"✅ Extracted {len(concepts)} lessons. Data saved to {output_file}")
    return output_file

# --- RUN THIS ---
root_folder = r"E:\projects\inpact\PALL-INPACT\content\react-ts"
extract_lessons_from_root(root_folder, max_lessons=29)