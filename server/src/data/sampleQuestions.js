export const sampleCodingQuestions = [
  {
    title: "Two Sum",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    difficulty: "Easy",
    topic: "Arrays",
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    sampleInput: "nums = [2,7,11,15], target = 9",
    sampleOutput: "[0,1]",
    testCases: [
      { input: "[2,7,11,15], 9", output: "[0,1]", isPublic: true },
      { input: "[3,2,4], 6", output: "[1,2]", isPublic: true },
      { input: "[3,3], 6", output: "[0,1]", isPublic: false }
    ],
    starterCode: {
      javascript: "function twoSum(nums, target) {\n  // Your code here\n}",
      python: "def two_sum(nums, target):\n    # Your code here\n    pass",
      java: "public class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your code here\n    }\n};"
    }
  },
  {
    title: "Reverse String",
    description: `Write a function that reverses a string. The input string is given as an array of characters s.

You must do this by modifying the input array in-place with O(1) extra memory.`,
    difficulty: "Easy",
    topic: "Strings",
    constraints: [
      "1 <= s.length <= 10^5",
      "s[i] is a printable ascii character."
    ],
    sampleInput: "s = [\"h\",\"e\",\"l\",\"l\",\"o\"]",
    sampleOutput: "[\"o\",\"l\",\"l\",\"e\",\"h\"]",
    testCases: [
      { input: "[\"h\",\"e\",\"l\",\"l\",\"o\"]", output: "[\"o\",\"l\",\"l\",\"e\",\"h\"]", isPublic: true },
      { input: "[\"H\",\"a\",\"n\",\"n\",\"a\",\"h\"]", output: "[\"h\",\"a\",\"n\",\"n\",\"a\",\"H\"]", isPublic: true }
    ],
    starterCode: {
      javascript: "function reverseString(s) {\n  // Your code here\n}",
      python: "def reverse_string(s):\n    # Your code here\n    pass",
      java: "class Solution {\n    public void reverseString(char[] s) {\n        // Your code here\n    }\n}",
      cpp: "class Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        // Your code here\n    }\n};"
    }
  },
  {
    title: "Valid Parentheses",
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
- Open brackets must be closed by the same type of brackets.
- Open brackets must be closed in the correct order.`,
    difficulty: "Easy",
    topic: "Stacks",
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'."
    ],
    sampleInput: "s = \"()\"",
    sampleOutput: "true",
    testCases: [
      { input: "\"()\"", output: "true", isPublic: true },
      { input: "\"()[]{}\"", output: "true", isPublic: true },
      { input: "\"(]\"", output: "false", isPublic: true },
      { input: "\"([)]\"", output: "false", isPublic: false }
    ],
    starterCode: {
      javascript: "function isValid(s) {\n  // Your code here\n}",
      python: "def is_valid(s):\n    # Your code here\n    pass",
      java: "class Solution {\n    public boolean isValid(String s) {\n        // Your code here\n    }\n}",
      cpp: "class Solution {\npublic:\n    bool isValid(string s) {\n        // Your code here\n    }\n};"
    }
  },
  {
    title: "Binary Tree Inorder Traversal",
    description: `Given the root of a binary tree, return the inorder traversal of its nodes' values.`,
    difficulty: "Medium",
    topic: "Trees",
    constraints: [
      "The number of nodes in the tree is in the range [0, 100].",
      "-100 <= Node.val <= 100"
    ],
    sampleInput: "root = [1,null,2,3]",
    sampleOutput: "[1,3,2]",
    testCases: [
      { input: "[1,null,2,3]", output: "[1,3,2]", isPublic: true },
      { input: "[]", output: "[]", isPublic: true },
      { input: "[1]", output: "[1]", isPublic: false }
    ],
    starterCode: {
      javascript: "function inorderTraversal(root) {\n  // Your code here\n}",
      python: "def inorder_traversal(root):\n    # Your code here\n    pass",
      java: "class Solution {\n    public List<Integer> inorderTraversal(TreeNode root) {\n        // Your code here\n    }\n}",
      cpp: "class Solution {\npublic:\n    vector<int> inorderTraversal(TreeNode* root) {\n        // Your code here\n    }\n};"
    }
  },
  {
    title: "Maximum Subarray",
    description: `Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.`,
    difficulty: "Medium",
    topic: "Dynamic Programming",
    constraints: [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4"
    ],
    sampleInput: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
    sampleOutput: "6",
    testCases: [
      { input: "[-2,1,-3,4,-1,2,1,-5,4]", output: "6", isPublic: true },
      { input: "[1]", output: "1", isPublic: true },
      { input: "[5,4,-1,7,8]", output: "23", isPublic: false }
    ],
    starterCode: {
      javascript: "function maxSubArray(nums) {\n  // Your code here\n}",
      python: "def max_sub_array(nums):\n    # Your code here\n    pass",
      java: "class Solution {\n    public int maxSubArray(int[] nums) {\n        // Your code here\n    }\n}",
      cpp: "class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Your code here\n    }\n};"
    }
  },
  {
    title: "LRU Cache",
    description: `Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.

Implement the LRUCache class:
- LRUCache(int capacity) Initialize the LRU cache with positive size capacity.
- int get(int key) Return the value of the key if the key exists, otherwise return -1.
- void put(int key, int value) Update the value of the key if the key exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the capacity from this operation, evict the least recently used key.`,
    difficulty: "Medium",
    topic: "Design",
    constraints: [
      "1 <= capacity <= 3000",
      "0 <= key <= 10^4",
      "0 <= value <= 10^5",
      "At most 2 * 10^5 calls will be made to get and put."
    ],
    sampleInput: `["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]`,
    sampleOutput: "[null, null, null, 1, null, -1, null, -1, 3, 4]",
    testCases: [
      { input: `[[2], [1,1], [2,2], [1], [3,3], [2], [4,4], [1], [3], [4]]`, output: "[null,null,null,1,null,-1,null,-1,3,4]", isPublic: true }
    ],
    starterCode: {
      javascript: "class LRUCache {\n  constructor(capacity) {\n    // Your code here\n  }\n  \n  get(key) {\n    // Your code here\n  }\n  \n  put(key, value) {\n    // Your code here\n  }\n}",
      python: "class LRUCache:\n    def __init__(self, capacity: int):\n        # Your code here\n    \n    def get(self, key: int) -> int:\n        # Your code here\n    \n    def put(self, key: int, value: int) -> None:\n        # Your code here",
      java: "class LRUCache {\n    public LRUCache(int capacity) {\n        // Your code here\n    }\n    \n    public int get(int key) {\n        // Your code here\n    }\n    \n    public void put(int key, int value) {\n        // Your code here\n    }\n}",
      cpp: "class LRUCache {\npublic:\n    LRUCache(int capacity) {\n        // Your code here\n    }\n    \n    int get(int key) {\n        // Your code here\n    }\n    \n    void put(int key, int value) {\n        // Your code here\n    }\n};"
    }
  }
];