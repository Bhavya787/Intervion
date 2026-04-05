import mongoose from "mongoose";

const codingQuestionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard", "Expert"], default: "Medium" },
  topic: { type: String, required: true },
  constraints: [String],
  sampleInput: String,
  sampleOutput: String,
  testCases: [
    {
      input: String,
      output: String,
      isPublic: { type: Boolean, default: false }
    }
  ],
  starterCode: {
    javascript: String,
    python: String,
    java: String,
    cpp: String
  },
  solution: {
    javascript: String,
    python: String,
    java: String,
    cpp: String
  },
  isAIGenerated: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const CodingQuestion = mongoose.model("CodingQuestion", codingQuestionSchema);
export default CodingQuestion;
