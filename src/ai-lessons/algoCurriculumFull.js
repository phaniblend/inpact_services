/**
 * Full algorithm curriculum (110 lessons) for the Algorithms tab.
 * Ordered by phase: A Arrays/HashMap → B Two Pointers → C Sliding Window → … → J DP.
 * Each item: { title, family }. Family is used for family-aware lesson generation.
 */

const A_ARRAY_HASHMAP = [
  "Two Sum", "Contains Duplicate", "Valid Anagram", "Intersection of Two Arrays",
  "First Unique Character", "Majority Element", "Missing Number", "Move Zeroes",
  "Find All Numbers Disappeared", "Subarray Sum Equals K", "Longest Consecutive Sequence",
  "Top K Frequent Elements", "Product of Array Except Self", "Maximum Subarray (Kadane)",
  "Best Time to Buy and Sell Stock", "Best Time to Buy and Sell Stock II", "Merge Sorted Arrays",
  "Rotate Array", "Find Peak Element", "Container With Most Water",
];

const B_TWO_POINTERS = [
  "Two Sum II (Sorted)", "Valid Palindrome", "Remove Duplicates from Sorted Array",
  "Move Zeroes (2-pointer version)", "Container With Most Water", "3Sum", "4Sum",
  "Trapping Rain Water", "Squares of Sorted Array", "Backspace String Compare",
];

const C_SLIDING_WINDOW = [
  "Longest Substring Without Repeating Characters", "Minimum Window Substring",
  "Longest Repeating Character Replacement", "Permutation in String", "Find All Anagrams in a String",
  "Maximum Sum Subarray of Size K", "Sliding Window Maximum", "Subarrays with K Distinct",
  "Fruit Into Baskets", "Longest Ones with K Flips",
];

const D_STACK_QUEUE = [
  "Valid Parentheses", "Min Stack", "Daily Temperatures", "Next Greater Element",
  "Largest Rectangle in Histogram", "Implement Queue using Stacks", "Implement Stack using Queues",
  "Sliding Window Maximum (Deque)", "Evaluate Reverse Polish Notation", "Remove K Digits",
];

const E_BINARY_SEARCH = [
  "Binary Search", "Search Insert Position", "Search in Rotated Sorted Array",
  "Find Minimum in Rotated Sorted Array", "Find Peak Element", "First Bad Version",
  "Search 2D Matrix", "Median of Two Sorted Arrays", "Koko Eating Bananas", "Capacity to Ship Packages",
];

const F_LINKED_LIST = [
  "Reverse Linked List", "Detect Cycle (Floyd's Algorithm)", "Merge Two Sorted Lists",
  "Remove Nth Node from End", "Middle of Linked List", "Intersection of Two Linked Lists",
  "Palindrome Linked List", "Copy List with Random Pointer", "Add Two Numbers", "LRU Cache",
];

const G_TREES = [
  "Maximum Depth of Binary Tree", "Same Tree", "Invert Binary Tree", "Binary Tree Level Order Traversal",
  "Validate Binary Search Tree", "Lowest Common Ancestor", "Diameter of Binary Tree", "Path Sum",
  "Serialize & Deserialize Binary Tree", "Construct Binary Tree from Traversals",
];

const H_GRAPHS = [
  "Number of Islands", "Clone Graph", "Course Schedule (Topological Sort)", "Pacific Atlantic Water Flow",
  "Rotting Oranges", "Word Ladder", "Graph Valid Tree", "Number of Connected Components",
  "Reconstruct Itinerary", "Network Delay Time",
];

const I_RECURSION_BACKTRACKING = [
  "Fibonacci", "Generate Parentheses", "Subsets", "Permutations", "Combination Sum",
  "N-Queens", "Word Search", "Letter Combinations of Phone Number", "Palindrome Partitioning", "Sudoku Solver",
];

const J_DYNAMIC_PROGRAMMING = [
  "Climbing Stairs", "House Robber", "House Robber II", "Coin Change", "Longest Increasing Subsequence",
  "Longest Common Subsequence", "Edit Distance", "Partition Equal Subset Sum", "Decode Ways", "Unique Paths",
];

/** Map category prefix to algorithmFamily for getAlgorithmFamilyFromTitle / generation. */
const CATEGORY_TO_FAMILY = {
  "A": "array-hashmap",
  "B": "two-pointers",
  "C": "sliding-window",
  "D": "stack-queue",
  "E": "binary-search",
  "F": "linked-list",
  "G": "tree",
  "H": "graph",
  "I": "recursion",
  "J": "dynamic-programming",
};

function buildFullList() {
  const out = [];
  const sections = [
    [A_ARRAY_HASHMAP, "array-hashmap"],
    [B_TWO_POINTERS, "two-pointers"],
    [C_SLIDING_WINDOW, "sliding-window"],
    [D_STACK_QUEUE, "stack-queue"],
    [E_BINARY_SEARCH, "binary-search"],
    [F_LINKED_LIST, "linked-list"],
    [G_TREES, "tree"],
    [H_GRAPHS, "graph"],
    [I_RECURSION_BACKTRACKING, "recursion"],
    [J_DYNAMIC_PROGRAMMING, "dynamic-programming"],
  ];
  for (const [titles, family] of sections) {
    for (const title of titles) {
      out.push({ title, family });
    }
  }
  return out;
}

/** Full list of 110 algo lessons: { title, family }[]. Order = A → B → … → J. */
export const ALGO_FULL_LIST = buildFullList();

/** Titles only (for backward compat / counts). */
export const ALGO_FULL_TITLES = ALGO_FULL_LIST.map((item) => item.title);
