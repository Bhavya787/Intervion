import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getQuestions,
  generateCodingQuestion,
  runCode,
  submitCode
} from "../controllers/codingController.js";

const router = express.Router();

router.use(authMiddleware(["student"])); // Coding practice for students

router.get("/questions", getQuestions);
router.post("/generate", generateCodingQuestion);
router.post("/run", runCode);
router.post("/submit", submitCode);

export default router;
