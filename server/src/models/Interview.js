import mongoose, { Schema } from "mongoose";

const InterviewSchema = new Schema(
  {
    chatHistory: [{ type: Object }], // stores { type, content, timestamp }
    finalFeedback: String,
    result: String,
    feedbacks: [String],
    type: String,
    difficulty: String,
    resumeText: String,
    roleSummary: String,
    roundType: String,
    customTopic: String,
    scheduledAt: Date,
    status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Candidate (Student)
    
    // Fields for real Company-Student interviews
    company: { type: Schema.Types.ObjectId, ref: "User" },
    job: { type: Schema.Types.ObjectId, ref: "JobOpening" },
    application: { type: Schema.Types.ObjectId, ref: "Application" },
    companyIcsUrl: String,
    studentIcsUrl: String,
    meetingLink: String,
  },
  { timestamps: true }
);

export default mongoose.model("Interview", InterviewSchema);
