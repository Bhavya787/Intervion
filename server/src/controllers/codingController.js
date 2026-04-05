import CodingQuestion from "../models/CodingQuestion.js";
import { generateAIResponse } from "../utils/ai.js";
import { sampleCodingQuestions } from "../data/sampleQuestions.js";
import { mkdtemp, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { spawn } from "child_process";

const EXECUTION_TIMEOUT_MS = 5000;

const createResult = ({
  stdout = "",
  stderr = "",
  compileOutput = "",
  code = 1,
  description = "Runtime Error",
}) => ({
  stdout,
  stderr,
  output: [stdout, stderr].filter(Boolean).join("\n"),
  status: {
    id: code === 0 ? 3 : 4,
    description,
  },
  compile_output: compileOutput,
});

const runCommand = (command, args, { cwd, input = "" } = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "pipe",
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, EXECUTION_TIMEOUT_MS);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    child.on("close", (code) => {
      clearTimeout(timeout);
      resolve({
        code: code ?? 1,
        stdout,
        stderr,
        timedOut,
      });
    });

    if (input) {
      child.stdin.write(input);
    }
    child.stdin.end();
  });

const getJavaClassName = (sourceCode) => {
  const publicClassMatch = sourceCode.match(/public\s+class\s+([A-Za-z_]\w*)/);
  if (publicClassMatch) return publicClassMatch[1];

  const classMatch = sourceCode.match(/class\s+([A-Za-z_]\w*)/);
  return classMatch ? classMatch[1] : "Main";
};

const executeLocally = async (sourceCode, language, stdin = "") => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "intervion-code-"));

  try {
    switch (language) {
      case "javascript": {
        const filePath = path.join(tempDir, "main.js");
        await writeFile(filePath, sourceCode, "utf8");
        const result = await runCommand("node", [filePath], {
          cwd: tempDir,
          input: stdin,
        });

        if (result.timedOut) {
          return createResult({
            stdout: result.stdout,
            stderr: result.stderr,
            code: 1,
            description: "Time Limit Exceeded",
          });
        }

        return createResult({
          stdout: result.stdout,
          stderr: result.stderr,
          code: result.code,
          description: result.code === 0 ? "Accepted" : "Runtime Error",
        });
      }

      case "python": {
        const filePath = path.join(tempDir, "main.py");
        await writeFile(filePath, sourceCode, "utf8");
        const result = await runCommand("python", [filePath], {
          cwd: tempDir,
          input: stdin,
        });

        if (result.timedOut) {
          return createResult({
            stdout: result.stdout,
            stderr: result.stderr,
            code: 1,
            description: "Time Limit Exceeded",
          });
        }

        return createResult({
          stdout: result.stdout,
          stderr: result.stderr,
          code: result.code,
          description: result.code === 0 ? "Accepted" : "Runtime Error",
        });
      }

      case "java": {
        const className = getJavaClassName(sourceCode);
        const filePath = path.join(tempDir, `${className}.java`);
        await writeFile(filePath, sourceCode, "utf8");

        const compileResult = await runCommand("javac", [filePath], {
          cwd: tempDir,
        });

        if (compileResult.code !== 0) {
          return createResult({
            stdout: compileResult.stdout,
            stderr: compileResult.stderr,
            compileOutput: compileResult.stderr,
            code: compileResult.code,
            description: "Compilation Error",
          });
        }

        const runResult = await runCommand("java", ["-cp", tempDir, className], {
          cwd: tempDir,
          input: stdin,
        });

        if (runResult.timedOut) {
          return createResult({
            stdout: runResult.stdout,
            stderr: runResult.stderr,
            code: 1,
            description: "Time Limit Exceeded",
          });
        }

        return createResult({
          stdout: runResult.stdout,
          stderr: runResult.stderr,
          code: runResult.code,
          description: runResult.code === 0 ? "Accepted" : "Runtime Error",
        });
      }

      case "cpp":
        return createResult({
          stderr:
            "C++ execution is not available on this server yet. Install g++ or switch to JavaScript, Python, or Java.",
          code: 1,
          description: "Runtime Unavailable",
        });

      default:
        return createResult({
          stderr: `Unsupported language: ${language}`,
          code: 1,
          description: "Unsupported Language",
        });
    }
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
};

const executeCode = async (source_code, language, stdin) =>
  executeLocally(source_code, language, stdin);

const withSampleIds = (questions) =>
  questions.map((question, index) => ({
    ...question,
    _id: question._id || `sample-${index}`,
  }));

export const getQuestions = async (req, res) => {
  try {
    const { topic, difficulty } = req.query;
    const filter = {};
    if (topic) filter.topic = { $regex: new RegExp(`^${topic}$`, "i") }; // Case-insensitive exact match
    if (difficulty) filter.difficulty = difficulty;
    
    const questions = await CodingQuestion.find(filter).sort({ createdAt: -1 });
    if (questions.length > 0) {
      return res.json(questions);
    }

    const fallbackQuestions = withSampleIds(
      sampleCodingQuestions
      .filter((question) => {
        const topicMatch = topic
          ? question.topic.toLowerCase().includes(String(topic).toLowerCase())
          : true;
        const difficultyMatch = difficulty
          ? question.difficulty === difficulty
          : true;
        return topicMatch && difficultyMatch;
      })
      .slice(0, 3)
    );

    if (fallbackQuestions.length > 0) {
      return res.json(fallbackQuestions);
    }

    return res.json(withSampleIds(sampleCodingQuestions.slice(0, 3)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const generateCodingQuestion = async (req, res) => {
  try {
    const { topic, difficulty, count = 3 } = req.body;
    
    // Try configured AI providers first
    try {
      const prompt = `Generate ${count} distinct coding problems about "${topic}" with difficulty level "${difficulty || 'Medium'}". 
      Return the response ONLY as a JSON array of objects. Each object must have:
      - title: string
      - description: string (Markdown supported)
      - constraints: string array
      - sampleInput: string
      - sampleOutput: string
      - testCases: array of objects { input: string, output: string, isPublic: boolean } (at least 3)
      - starterCode: object { javascript: string, python: string, java: string, cpp: string }
      
      Ensure the JSON is a valid array and contains no other text.`;

      const response = await generateAIResponse(prompt);
      const cleanedResponse = response.replace(/```json|```/g, "").trim();
      
      let questionsData;
      try {
        questionsData = JSON.parse(cleanedResponse);
      } catch (e) {
        const match = cleanedResponse.match(/\[.*\]/s);
        if (match) questionsData = JSON.parse(match[0]);
        else throw new Error("Failed to parse AI response");
      }

      if (!Array.isArray(questionsData)) {
        questionsData = [questionsData];
      }
      
      const savedQuestions = await Promise.all(
        questionsData.map(q => {
          const newQuestion = new CodingQuestion({
            ...q,
            difficulty,
            topic,
            isAIGenerated: true
          });
          return newQuestion.save();
        })
      );
      
      return res.json(savedQuestions);
    } catch (aiError) {
      console.warn("AI provider failed, using local sample questions:", aiError.message);
      
      // Fallback to local sample questions filtered by topic and difficulty
      const filteredQuestions = sampleCodingQuestions
        .filter(q => 
          q.topic.toLowerCase().includes(topic.toLowerCase()) &&
          q.difficulty === difficulty
        )
        .slice(0, count);
      
      if (filteredQuestions.length > 0) {
        // Save filtered questions to database
        const savedQuestions = await Promise.all(
          filteredQuestions.map(q => {
            const newQuestion = new CodingQuestion({
              ...q,
              isAIGenerated: false
            });
            return newQuestion.save();
          })
        );
        return res.json(savedQuestions);
      }
      
      // If no filtered questions found, return random questions
      const randomQuestions = sampleCodingQuestions
        .sort(() => Math.random() - 0.5)
        .slice(0, count);
      
      const savedQuestions = await Promise.all(
        randomQuestions.map(q => {
          const newQuestion = new CodingQuestion({
            ...q,
            isAIGenerated: false
          });
          return newQuestion.save();
        })
      );
      
      return res.json(savedQuestions);
    }
  } catch (err) {
    console.error("Coding Question generation error:", err);
    
    // Ultimate fallback - return sample questions without saving to DB
      const fallbackQuestions = withSampleIds(sampleCodingQuestions.slice(0, 3));
      res.json(fallbackQuestions);
  }
};

export const runCode = async (req, res) => {
  try {
    const { source_code, language, stdin } = req.body;
    const result = await executeCode(source_code, language, stdin);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const submitCode = async (req, res) => {
  try {
    const { questionId, source_code, language } = req.body;
    let question = null;
    if (!String(questionId).startsWith("sample-")) {
      question = await CodingQuestion.findById(questionId);
    }

    if (!question && String(questionId).startsWith("sample-")) {
      const sampleIndex = Number(String(questionId).replace("sample-", ""));
      question = sampleCodingQuestions[sampleIndex] || null;
    }
    
    if (!question) return res.status(404).json({ message: "Question not found" });
    
    const results = [];
    let allPassed = true;

    for (const testCase of question.testCases) {
      const result = await executeCode(source_code, language, testCase.input);
      const passed = result.stdout?.trim() === testCase.output?.trim();
      
      results.push({
        input: testCase.isPublic ? testCase.input : "Hidden",
        expectedOutput: testCase.isPublic ? testCase.output : "Hidden",
        actualOutput: result.stdout,
        passed,
        status: result.status,
        compile_output: result.compile_output,
        message: result.message
      });
      
      if (!passed) allPassed = false;
    }
    
    res.json({ allPassed, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
