# Study Rooms + Improvements – All Changes

## Summary

- **New feature:** Study Rooms – students can create/join rooms by topic, chat with peers, and see members.
- **Other additions:** Protected routes (redirect to login when not authenticated), API base URL from env for local dev, .env examples, and a small backend fix for room membership check.

---

## 1. Backend (server)

### New files

| File | Purpose |
|------|--------|
| `server/src/models/Room.js` | Mongoose model: `name`, `description`, `topic`, `createdBy`, `members[]`, `messages[]` (embedded: `user`, `userName`, `text`, `createdAt`), `maxMembers` (default 20). |
| `server/src/controllers/roomController.js` | `createRoom`, `getRooms`, `getRoomById`, `joinRoom`, `leaveRoom`, `postMessage`. |
| `server/src/routes/roomRoutes.js` | All routes require auth; only role `student` can access. |
| `server/.env.example` | Template for `PORT`, `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, Firebase vars. |

### API routes (mounted at `/api/rooms`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/rooms` | Create room (body: `name`, `description?`, `topic`, `maxMembers?`). |
| GET | `/api/rooms` | List rooms (query: `topic` optional). |
| GET | `/api/rooms/:id` | Get room by id. |
| POST | `/api/rooms/:id/join` | Join room. |
| POST | `/api/rooms/:id/leave` | Leave room (room deleted if no members left). |
| POST | `/api/rooms/:id/messages` | Post message (body: `text`). |

### Modified files

| File | Change |
|------|--------|
| `server/src/index.js` | `import roomRoutes`, `app.use("/api/rooms", roomRoutes)`. |
| `server/src/controllers/roomController.js` | `joinRoom`: membership check uses `room.members.some(id => id.toString() === req.user.id)` so ObjectId vs string comparison is correct. |
| `server/package.json` | `"dev": "nodemon src/index.js"`, added `"engines": { "node": ">=18.0.0" }`. |

---

## 2. Frontend (client)

### New files

| File | Purpose |
|------|--------|
| `client/src/pages/student/StudyRoomsPage.tsx` | List rooms, filter by topic, “Create room” dialog; navigates to room detail on card click. |
| `client/src/pages/student/RoomDetailPage.tsx` | Room header, members list, chat (messages + send), Join/Leave. Only members can send messages. |
| `client/src/components/ProtectedRoute.tsx` | Redirects to `/login` if no token; optional `allowedRoles` redirects wrong-role users to their dashboard. |
| `client/.env.example` | `VITE_API_URL=http://localhost:5000/api` for local dev. |

### Modified files

| File | Change |
|------|--------|
| `client/src/App.tsx` | Import `StudyRoomsPage`, `RoomDetailPage`, `ProtectedRoute`. Routes for `/student/rooms` and `/student/rooms/:id`. All `/student/*` and `/company/*` routes wrapped in `<ProtectedRoute allowedRoles={["student"]}>` or `allowedRoles={["company"]}`. |
| `client/src/components/Navigation.tsx` | Import `Users` icon; added “Study Rooms” link (`/student/rooms`) for students. |
| `client/src/utils/axiosInstance.ts` | `baseURL` = `import.meta.env.VITE_API_URL` or fallback to deployed API URL. |

---

## 3. What you need to do

1. **Server env**  
   Copy `server/.env.example` to `server/.env` and set real values (`MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, etc.).

2. **Client env (local dev)**  
   Copy `client/.env.example` to `client/.env` so the app uses `http://localhost:5000/api` when running locally.

3. **Run**  
   - Server: `cd server && npm install && npm run dev`  
   - Client: `cd client && npm install && npm run dev`  
   Use Node 18+ (e.g. Node 20).

## 4. Real-time Collaboration Tools

| File | Change |
|------|--------|
| `server/src/socket.js` | Updated CORS origin and enabled `credentials: true` for Socket.io. Added `transports: ["websocket", "polling"]`. |
| `server/src/index.js` | Integrated Socket.io with the HTTP server and optimized CORS for dynamic origins. |
| `client/src/components/study/` | New folder containing `Whiteboard.tsx` and `CollaborativeEditor.tsx` (Shared Notes and Screen Share removed to reduce system load). |
| `client/src/pages/student/RoomDetailPage.tsx` | Explicitly added `transports: ["websocket", "polling"]` and `withCredentials: true` to the socket client for reliable connection. |
| `client/.env` | Updated `VITE_API_URL` to `http://127.0.0.1:5000/api` to bypass common `localhost` resolution issues. |

---

## 5. Important Next Steps

1. **Clean Up Processes**: Run `taskkill /F /IM node.exe` to ensure no stray servers are blocking ports.
2. **Restart Servers**:
   - Backend: `cd server && npm run dev`
   - Frontend: `cd client && npm run dev`
3. **Collaboration**: Open the same study room in two different browser windows/tabs to test the real-time syncing of the whiteboard and code editor.

---

## 6. Optional next steps (not in this diff)

- Real-time chat (e.g. Socket.io or polling) so new messages appear without refresh.
- “Start practice together” from a room (everyone starts an AI practice interview).
- Peer mock matching from a room.
