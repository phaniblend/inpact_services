/**
 * INPACT-style Algorithms (LeetCode) curriculum for AI-generated lessons.
 * Each lesson supports: Lesson → Example → Flowchart → Reasoning → Dry run → Code.
 * User picks a lesson + language (algo-js, algo-ts, algo-python, algo-java) → engine generates flowchart + code.
 */

/** Curriculum by tier (for display/grouping). */
export const ALGO_CURRICULUM = [
  {
    category: "Foundations",
    lessons: [
      "Linear Search Explorer",
      "Maximum Number Finder",
      "Duplicate Detector",
      "Running Sum Builder",
      "Array Rotation Simulator",
    ],
  },
  {
    category: "Two Pointer Pattern",
    lessons: [
      "Two Sum Flowchart",
      "Sorted Two Sum",
      "Remove Duplicates (Sorted Array)",
      "Container With Most Water",
      "Move Zeroes",
    ],
  },
  {
    category: "Sliding Window",
    lessons: [
      "Maximum Subarray Sum (Window)",
      "Longest Unique Substring",
      "Minimum Window Substring",
      "Anagram Finder",
    ],
  },
  {
    category: "Hash Map Lessons",
    lessons: [
      "Majority Element Detector",
      "Group Anagrams",
      "Longest Consecutive Sequence",
    ],
  },
  {
    category: "Stack Lessons",
    lessons: [
      "Valid Parentheses Checker",
      "Min Stack Builder",
      "Next Greater Element",
    ],
  },
  {
    category: "Queue Lessons",
    lessons: [
      "Circular Queue Simulator",
      "Task Scheduler",
    ],
  },
  {
    category: "Binary Search",
    lessons: [
      "Classic Binary Search",
      "First Bad Version",
      "Search Insert Position",
    ],
  },
  {
    category: "Recursion",
    lessons: [
      "Factorial Explorer",
      "Fibonacci Tree",
      "Generate Subsets",
    ],
  },
  {
    category: "Trees",
    lessons: [
      "Binary Tree Traversal Visualizer",
      "Maximum Depth of Tree",
      "Validate Binary Search Tree",
      "Lowest Common Ancestor",
    ],
  },
  {
    category: "Graph Algorithms",
    lessons: [
      "Graph Traversal Explorer",
      "Number of Islands",
      "Course Schedule",
    ],
  },
  {
    category: "Dynamic Programming",
    lessons: [
      "Climbing Stairs",
      "House Robber",
      "Longest Increasing Subsequence",
      "Coin Change",
    ],
  },
  {
    category: "Greedy Algorithms",
    lessons: [
      "Activity Scheduler",
      "Jump Game",
    ],
  },
  {
    category: "Backtracking",
    lessons: [
      "Permutation Generator",
      "N-Queens Visualizer",
      "Word Search",
    ],
  },
  {
    category: "Advanced Interview Patterns",
    lessons: [
      "LRU Cache Designer",
      "Median of Two Sorted Arrays",
      "Kth Largest Element",
    ],
  },
  {
    category: "Capstone Interview Simulations",
    lessons: [
      "LeetCode Interview Round Simulator",
    ],
  },
];

/** Flat list of all algorithm lesson titles (order matches curriculum). Used for grid and counts. */
export const ALGO_AI_NAMES = ALGO_CURRICULUM.flatMap((tier) => tier.lessons);
