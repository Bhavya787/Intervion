import Room from "../models/Room.js";
import User from "../models/User.js";
import { generateAIResponse } from "../utils/ai.js";
import { createMCQFallback } from "../utils/aiFallbacks.js";

export const generateMCQ = async (req, res) => {
  try {
    const { topic, difficulty, count } = req.body;
    
    const prompt = `Generate ${count || 5} multiple-choice questions (MCQs) about "${topic}" with difficulty level "${difficulty || 'Medium'}". 
    Return the response ONLY as a JSON array of objects. Each object should have:
    - question: string
    - options: string array (4 options)
    - correctAnswer: number (0-3 index of the correct option)
    - explanation: string
    
    Ensure the JSON is valid and contains no other text.`;

    const response = await generateAIResponse(prompt);
    
    // Clean the response in case Gemini adds markdown code blocks
    const cleanedResponse = response.replace(/```json|```/g, "").trim();
    let mcqs;
    try {
      mcqs = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("JSON Parse Error on MCQ generation:", cleanedResponse);
      // Fallback: try to find the array in the string if Gemini added text around it
      const jsonMatch = cleanedResponse.match(/\[.*\]/s);
      if (jsonMatch) {
        mcqs = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse MCQ JSON response");
      }
    }
    
    res.json(mcqs);
  } catch (err) {
    console.error("MCQ Generation error:", err);
    res.json(createMCQFallback({ topic, difficulty, count: count || 5 }));
  }
};

export const createRoom = async (req, res) => {
  try {
    const { name, description, topic, maxMembers } = req.body;
    const userId = req.user.id;

    // Check for duplicate room name
    const existingRoom = await Room.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (existingRoom) {
      return res.status(400).json({ error: "A room with this name already exists. Please choose a unique name." });
    }

    const room = new Room({
      name,
      description: description || "",
      topic,
      createdBy: userId,
      members: [userId],
      maxMembers: 5, // Set max room capacity to 5
    });
    await room.save();
    const populated = await Room.findById(room._id)
      .populate("createdBy", "fullName email")
      .populate("members", "fullName email");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getRooms = async (req, res) => {
  try {
    const { topic } = req.query;
    const filter = {};
    if (topic) filter.topic = new RegExp(topic, "i");
    const rooms = await Room.find(filter)
      .populate("createdBy", "fullName email")
      .populate("members", "fullName email")
      .sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate("createdBy", "fullName email")
      .populate("members", "fullName email");
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (room.members.some((id) => id.toString() === req.user.id)) {
      const populated = await Room.findById(room._id)
        .populate("createdBy", "fullName email")
        .populate("members", "fullName email");
      return res.json(populated);
    }
    if (room.members.length >= room.maxMembers)
      return res.status(400).json({ message: "Room is full" });
    room.members.push(req.user.id);
    await room.save();
    const populated = await Room.findById(room._id)
      .populate("createdBy", "fullName email")
      .populate("members", "fullName email");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const leaveRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    room.members = room.members.filter(
      (id) => id.toString() !== req.user.id
    );
    await room.save();
    if (room.members.length === 0) await Room.findByIdAndDelete(req.params.id);
    res.json({ message: "Left room" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const postMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (!room.members.some((id) => id.toString() === req.user.id))
      return res.status(403).json({ message: "Not a member" });

    const user = await User.findById(req.user.id).select("fullName");
    room.messages.push({
      user: req.user.id,
      userName: user?.fullName || "Anonymous",
      text,
    });
    await room.save();
    const msg = room.messages[room.messages.length - 1];
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addMemberByEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const { id } = req.params;

    const room = await Room.findById(id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return res.status(404).json({ message: "User not found" });

    if (room.members.some((mId) => mId.toString() === userToAdd._id.toString())) {
      return res.status(400).json({ message: "User is already a member" });
    }

    if (room.members.length >= room.maxMembers) {
      return res.status(400).json({ message: "Room is full" });
    }

    room.members.push(userToAdd._id);
    await room.save();

    const populated = await Room.findById(id)
      .populate("createdBy", "fullName email")
      .populate("members", "fullName email");

    res.json({
      message: "Member added successfully",
      room: populated,
      addedUser: {
        id: userToAdd._id,
        fullName: userToAdd.fullName,
        email: userToAdd.email
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateRoomState = async (req, res) => {
  try {
    const { id } = req.params;
    const { whiteboardSnapshot, codeSnapshot } = req.body;

    const room = await Room.findById(id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // Check if requester is a member
    if (!room.members.some((mId) => mId.toString() === req.user.id)) {
      return res.status(403).json({ message: "Only members can update room state" });
    }

    if (whiteboardSnapshot !== undefined) {
      room.whiteboardSnapshot = whiteboardSnapshot;
      room.whiteboardLastSaved = new Date();
    }
    if (codeSnapshot !== undefined) {
      room.codeSnapshot = codeSnapshot;
      room.codeLastSaved = new Date();
    }

    await room.save();
    res.json({ message: "Room state updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
