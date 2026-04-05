import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    topic: { type: String, required: true }, // e.g. "React", "DSA", "System Design"
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    messages: [messageSchema],
    maxMembers: { type: Number, default: 5 },
    whiteboardSnapshot: { type: Object, default: null },
    codeSnapshot: {
      code: { type: String, default: "// Start coding together..." },
      language: { type: String, default: "javascript" },
      questions: { type: [Object], default: [] },
      currentQuestionIndex: { type: Number, default: 0 },
      questionTopic: { type: String, default: "" },
      questionDifficulty: { type: String, default: "Medium" },
    },
    whiteboardLastSaved: { type: Date, default: null },
    codeLastSaved: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);
