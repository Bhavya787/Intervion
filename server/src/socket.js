import { Server } from "socket.io";

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: true, // Allow all origins during debugging
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    socket.on("join-room", ({ roomId, userId, userName }) => {
      socket.join(roomId);
      console.log(`[Socket] User ${userName} joined room: ${roomId}`);
      socket.to(roomId).emit("user-joined", { userId, userName });
    });

    socket.on("invite-user", ({ roomId, invitedUserId, invitedUserName }) => {
      console.log(`[Socket] Inviting ${invitedUserName} to room: ${roomId}`);
      io.emit("user-invited", { roomId, invitedUserId, invitedUserName });
    });

    // Whiteboard updates
    socket.on("drawing-update", ({ roomId, data }) => {
      // Log only the size/type of update for brevity
      const changeType = data.changes ? Object.keys(data.changes).join(",") : "unknown";
      console.log(`[Socket] Drawing update in ${roomId} from ${socket.id} (changes: ${changeType})`);
      socket.to(roomId).emit("drawing-update", data);
    });

    // Request/Provide Whiteboard Snapshot for new joiners
    socket.on("request-snapshot", ({ roomId, requesterId }) => {
      console.log(`[Socket] Snapshot requested in ${roomId} by ${requesterId}`);
      socket.to(roomId).emit("request-snapshot", { requesterId });
    });

    socket.on("provide-snapshot", ({ roomId, snapshot, requesterId }) => {
      console.log(`[Socket] Providing snapshot in ${roomId} to ${requesterId}`);
      io.to(requesterId).emit("whiteboard-snapshot", { snapshot });
    });

    // Code Editor updates
    socket.on("code-update", ({ roomId, code, language }) => {
      console.log(`[Socket] Code update in ${roomId} from ${socket.id}`);
      socket.to(roomId).emit("code-update", { code, language });
    });

    socket.on("code-session-update", ({ roomId, session }) => {
      console.log(`[Socket] Code session update in ${roomId} from ${socket.id}`);
      socket.to(roomId).emit("code-session-update", session);
    });

    // Cursor position updates
    socket.on("cursor-update", ({ roomId, userId, userName, position }) => {
      socket.to(roomId).emit("cursor-update", { userId, userName, position });
    });

    socket.on("clear-code-editor", ({ roomId, defaultCode }) => {
      console.log(`[Socket] Code editor reset in room: ${roomId}`);
      socket.to(roomId).emit("clear-code-editor", { defaultCode });
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });

  return io;
};
