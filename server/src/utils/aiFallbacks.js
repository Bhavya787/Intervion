export function createInterviewStartFallback({
  role,
  roundType,
  topic,
  difficulty,
}) {
  return [
    `Hello, I'm Ashta and I'll guide this ${roundType || "interview"} round for the ${role || "role"} position.`,
    topic ? `We'll focus on ${topic}.` : null,
    difficulty ? `I'll keep the difficulty around ${difficulty}.` : null,
    "To begin, please introduce yourself and walk me through the experience most relevant to this role.",
  ]
    .filter(Boolean)
    .join(" ");
}

export function createInterviewResponseFallback({
  answer,
  role,
  topic,
  roundType,
}) {
  const answerLength = answer?.trim().length || 0;

  if (answerLength < 30) {
    return `Thanks. Please go a bit deeper and explain your reasoning, tradeoffs, and the concrete outcome from that example${topic ? ` related to ${topic}` : ""}.`;
  }

  return `Thanks for that explanation. For this ${roundType || "interview"} round${role ? ` for ${role}` : ""}, can you describe another example where you handled a difficult problem${topic ? ` involving ${topic}` : ""} and what you would improve if you did it again?`;
}

export function createInterviewConclusionFallback({ history = [], roleSummary }) {
  const answers = history.filter((entry) => entry.type === "answer");
  const detailedAnswers = answers.filter(
    (entry) => (entry.content || "").trim().length >= 40
  ).length;
  const result = detailedAnswers >= Math.max(2, Math.floor(answers.length / 2))
    ? "Success"
    : "Failure";

  return `Overall, the candidate showed reasonable communication and role awareness for ${roleSummary || "the role"}. The evaluation was generated from fallback logic because an AI provider was unavailable.\nResult: ${result}`;
}

export function createResumeFormatFallback(resumeText = "") {
  const lines = resumeText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const takeSection = (keywords) =>
    lines.filter((line) =>
      keywords.some((keyword) => line.toLowerCase().includes(keyword))
    );

  const skills = takeSection(["skill", "javascript", "python", "java", "react"]);
  const education = takeSection(["education", "b.tech", "b.e", "college", "university"]);
  const projects = takeSection(["project", "built", "developed", "created"]);

  const fallbackList = (items) =>
    items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : "- Not clearly identified";

  return `# Resume Summary

## Professional Summary
- Resume formatted using local fallback because an AI provider was unavailable.

## Skills
${fallbackList(skills)}

## Projects
${fallbackList(projects)}

## Education
${fallbackList(education)}

## Raw Resume Notes
${lines.slice(0, 20).map((line) => `- ${line}`).join("\n") || "- No resume text provided"}
`;
}

export function createRoleSummaryFallback(prompt = "") {
  return prompt.trim().slice(0, 500) || "Role summary is unavailable.";
}

export function createMCQFallback({ topic = "General Aptitude", difficulty = "Medium", count = 5 }) {
  const baseQuestions = [
    {
      question: `Which statement best describes ${topic}?`,
      options: [
        `${topic} focuses on solving structured problems with clear tradeoffs.`,
        `${topic} is unrelated to software engineering.`,
        `${topic} has no practical interview use.`,
        `${topic} can only be learned theoretically.`,
      ],
      correctAnswer: 0,
      explanation: `${topic} is commonly evaluated through structured reasoning and practical examples.`,
    },
    {
      question: `What is usually most important when answering a ${difficulty} interview question on ${topic}?`,
      options: [
        "Memorizing definitions only",
        "Explaining reasoning and tradeoffs clearly",
        "Avoiding concrete examples",
        "Giving the shortest possible answer",
      ],
      correctAnswer: 1,
      explanation: "Interviewers usually value reasoning, tradeoffs, and clarity over memorized phrases.",
    },
    {
      question: `A strong response about ${topic} should include:`,
      options: [
        "Only theory",
        "Only code",
        "Problem understanding, approach, and justification",
        "A guess without explanation",
      ],
      correctAnswer: 2,
      explanation: "A strong answer should explain how the problem is understood and why the approach makes sense.",
    },
  ];

  return Array.from({ length: count }, (_, index) => ({
    ...baseQuestions[index % baseQuestions.length],
    question:
      index < baseQuestions.length
        ? baseQuestions[index].question
        : `${baseQuestions[index % baseQuestions.length].question} (Set ${index + 1})`,
  }));
}
