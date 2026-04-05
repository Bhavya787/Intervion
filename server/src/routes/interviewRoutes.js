import express from "express";
import {
  startInterview,
  respondToInterview,
  formatResume,
  concludeInterview,
  getUserInterviews,
  getInterviewById,
  rescheduleInterview,
  scheduleInterview,
} from "../controllers/interviewController.js";
import { generateAIResponse } from "../utils/ai.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { createRoleSummaryFallback } from "../utils/aiFallbacks.js";

const router = express.Router();

router.post("/start", startInterview);
router.post("/respond", respondToInterview);
router.post("/summarize-role", async (req, res) => {
  const { prompt } = req.body;

  try {
    const summary = await generateAIResponse(prompt);
    res.json({ summary });
  } catch (err) {
    res.json({ summary: createRoleSummaryFallback(prompt), fallback: true });
  }
});
router.post("/format-resume", formatResume);
router.post("/conclude", authMiddleware(), concludeInterview);
// ✅ Fetch all interviews of logged-in user
router.get("/mine", authMiddleware(), getUserInterviews);
// ✅ Fetch one interview by ID (for detailed results page)
router.get("/:id", authMiddleware(), getInterviewById);
// ✅ Reschedule an interview
router.patch("/:id/reschedule", authMiddleware(), rescheduleInterview);
// ✅ Schedule a real interview (Company -> Student)
router.post("/schedule", authMiddleware(), scheduleInterview);

export default router;
