import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  createRoom,
  getRooms,
  getRoomById,
  joinRoom,
  leaveRoom,
  postMessage,
  addMemberByEmail,
  updateRoomState,
  generateMCQ,
} from "../controllers/roomController.js";

const router = express.Router();

router.use(authMiddleware(["student"])); // study rooms for students only

router.post("/", createRoom);
router.get("/", getRooms);
router.post("/mcq", generateMCQ);
router.get("/:id", getRoomById);
router.post("/:id/join", joinRoom);
router.post("/:id/leave", leaveRoom);
router.post("/:id/messages", postMessage);
router.post("/:id/members", addMemberByEmail);
router.patch("/:id/state", updateRoomState);

export default router;
