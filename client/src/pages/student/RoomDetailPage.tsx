import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Send, LogOut, ArrowLeft, MessageSquare, PenTool, Code, UserPlus, RefreshCw } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { useToast } from "@/components/ui/use-toast";

// Collaboration Tools
import Whiteboard from "@/components/study/Whiteboard";
import CollaborativeEditor from "@/components/study/CollaborativeEditor";

type Member = { _id: string; fullName?: string; email?: string };

type Message = {
  _id?: string;
  user: string;
  userName: string;
  text: string;
  createdAt?: string;
};

type Room = {
  _id: string;
  name: string;
  description?: string;
  topic: string;
  createdBy: Member;
  members: Member[];
  messages: Message[];
  maxMembers: number;
  whiteboardSnapshot?: any;
  codeSnapshot?: {
    code: string;
    language: string;
  };
  whiteboardLastSaved?: string;
  codeLastSaved?: string;
};

const RoomDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isMember = room?.members?.some(
    (m) => String(m._id) === String(currentUserId)
  );

  const fetchRoom = useCallback(async () => {
    if (!id) return;
    try {
      const token = localStorage.getItem("token");
      const [roomRes, meRes] = await Promise.all([
        axiosInstance.get(`/rooms/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axiosInstance.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: {} })),
      ]);
      setRoom(roomRes.data);
      const user = meRes.data?.user;
      setCurrentUserId(user?._id ?? null);
      setCurrentUserName(user?.fullName ?? user?.email ?? "Anonymous");
    } catch (err) {
      console.error("Error fetching room", err);
      setRoom(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  const handleStateChange = useCallback((hasChanges: boolean) => {
    setHasUnsavedChanges(hasChanges);
  }, []);

  useEffect(() => {
    if (!id || !currentUserId || !isMember) return;

    // Use the current window hostname to avoid mismatches between localhost and 127.0.0.1
    const currentHost = window.location.hostname;
    const currentPort = window.location.port;
    const serverUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace("/api", "")
      : `http://${currentHost}:5000`;
      
    console.log(`[Socket] Attempting connection to: ${serverUrl}`);
    const newSocket = io(serverUrl, {
      transports: ["polling", "websocket"], // Try polling first for better compatibility
      withCredentials: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log(`[Socket] Connected successfully with ID: ${newSocket.id}`);
      setSocketConnected(true);
      
      newSocket.emit("join-room", {
        roomId: id,
        userId: currentUserId,
        userName: currentUserName,
      });
    });

    newSocket.on("connect_error", (err) => {
      console.error("[Socket] Connection error details:", {
        message: err.message,
        description: (err as any).description,
        context: (err as any).context,
        url: serverUrl
      });
      setSocketConnected(false);
    });

    newSocket.on("disconnect", (reason) => {
      console.log(`[Socket] Disconnected. Reason: ${reason}`);
      setSocketConnected(false);
    });

    newSocket.on("user-invited", ({ roomId, invitedUserId, invitedUserName }) => {
      if (roomId === id) {
        fetchRoom(); // Refresh room data for everyone when someone is added
        if (invitedUserId === currentUserId) {
          toast({
            title: "Added to Room",
            description: `You have been added to this room by a member.`,
          });
        } else {
          toast({
            title: "New Member",
            description: `${invitedUserName} was added to the room.`,
          });
        }
      }
    });

    return () => {
      newSocket.off("user-invited");
      newSocket.disconnect();
    };
  }, [id, currentUserId, isMember]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [room?.messages]);

  const handleJoin = async () => {
    if (!id) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.post(
        `/rooms/${id}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRoom(res.data);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to join");
    }
  };

  const handleLeave = async () => {
    if (!id) return;
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.post(
        `/rooms/${id}/leave`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/student/rooms");
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to leave");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !messageText.trim() || !isMember) return;
    setSending(true);
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.post(
        `/rooms/${id}/messages`,
        { text: messageText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessageText("");
      fetchRoom();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !inviteEmail.trim() || !isMember) return;
    setInviting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.post(
        `/rooms/${id}/members`,
        { email: inviteEmail.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const { addedUser } = res.data;
      
      // Notify via socket
      socket?.emit("invite-user", {
        roomId: id,
        invitedUserId: addedUser.id,
        invitedUserName: addedUser.fullName || addedUser.email
      });

      setInviteEmail("");
      toast({
        title: "Member Added",
        description: `${addedUser.fullName || addedUser.email} has been added to the room.`,
      });
      fetchRoom();
    } catch (err: any) {
      toast({
        title: "Failed to Add Member",
        description: err?.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setInviting(false);
    }
  };

  const saveCurrentState = async () => {
    if (!id || !isMember) return;
    
    console.log(`[RoomDetail] Saving state for tab: ${activeTab}`);
    let stateToSave: any = {};
    
    if (activeTab === "whiteboard") {
      if ((window as any).getWhiteboardSnapshot) {
        stateToSave.whiteboardSnapshot = (window as any).getWhiteboardSnapshot();
        console.log("[RoomDetail] Obtained whiteboard snapshot:", stateToSave.whiteboardSnapshot);
      } else {
        console.error("[RoomDetail] getWhiteboardSnapshot method not found on window");
        toast({ title: "Save Failed", description: "Whiteboard editor is not ready.", variant: "destructive" });
        return;
      }
    } else if (activeTab === "code") {
      if ((window as any).getCurrentCodeState) {
        const codeState = (window as any).getCurrentCodeState();
        stateToSave.codeSnapshot = codeState;
        console.log("[RoomDetail] Obtained code state:", codeState);
      } else {
        console.error("[RoomDetail] getCurrentCodeState method not found on window");
        toast({ title: "Save Failed", description: "Code editor is not ready.", variant: "destructive" });
        return;
      }
    }

    if (Object.keys(stateToSave).length === 0) {
      console.warn("[RoomDetail] Nothing to save");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.patch(`/rooms/${id}/state`, stateToSave, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("[RoomDetail] Save response:", res.data);
      setHasUnsavedChanges(false);
      toast({
        title: "Progress Saved",
        description: `Your ${activeTab} changes have been saved to the room.`,
      });
      fetchRoom();
    } catch (err) {
      console.error("[RoomDetail] Error saving room state", err);
      toast({
        title: "Save Failed",
        description: "Could not save your progress to the server.",
        variant: "destructive",
      });
    }
  };

  const handleTabChange = (value: string) => {
    console.log(`[RoomDetail] Tab changing from ${activeTab} to ${value}`);
    // Only prompt if leaving a collaboration tab with changes
    if (hasUnsavedChanges && (activeTab === "whiteboard" || activeTab === "code")) {
      const confirmLeave = window.confirm(
        "You have unsaved changes in this tab. Do you want to save them before switching?"
      );
      if (confirmLeave) {
        saveCurrentState();
      } else {
        const discard = window.confirm("Discard changes and switch tabs?");
        if (!discard) return;
        setHasUnsavedChanges(false);
      }
    }
    setActiveTab(value);
  };

  const handleClear = () => {
    console.log(`[RoomDetail] Clearing state for tab: ${activeTab}`);
    if (activeTab === "code") {
      if ((window as any).clearCodeEditor) {
        (window as any).clearCodeEditor();
      } else {
        console.error("[RoomDetail] clearCodeEditor method not found on window");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a]">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-gray-500">Loading room…</p>
        </main>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a]">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-gray-500">Room not found.</p>
          <Button variant="link" onClick={() => navigate("/student/rooms")}>
            Back to rooms
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a]">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/student/rooms")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {room.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">{room.topic}</Badge>
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Users className="h-4 w-4" />
                {room.members?.length ?? 0} / {room.maxMembers}
              </span>
              <div className="flex items-center gap-1.5 ml-2">
                <div className={`w-2 h-2 rounded-full ${socketConnected ? "bg-green-500" : "bg-red-500 animate-pulse"}`}></div>
                <span className="text-[10px] uppercase font-bold text-gray-400">
                  {socketConnected ? "Live" : "Connecting..."}
                </span>
              </div>
            </div>
          </div>
          {isMember ? (
            <Button variant="outline" onClick={handleLeave} className="gap-2">
              <LogOut className="h-4 w-4" />
              Leave room
            </Button>
          ) : (
            <Button onClick={handleJoin}>Join room</Button>
          )}
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange} 
          className="w-full"
        >
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid grid-cols-3 w-[400px]">
              <TabsTrigger value="chat" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Chat</span>
              </TabsTrigger>
              <TabsTrigger value="whiteboard" className="gap-2">
                <PenTool className="h-4 w-4" />
                <span className="hidden sm:inline">Whiteboard</span>
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-2">
                <Code className="h-4 w-4" />
                <span className="hidden sm:inline">Code Editor</span>
              </TabsTrigger>
            </TabsList>
            
            {(activeTab === "whiteboard" || activeTab === "code") && isMember && (
              <div className="flex items-center gap-3">
                <div className="text-right mr-2">
                  <p className="text-[10px] text-gray-400 uppercase font-bold leading-none">
                    {activeTab === "whiteboard" ? "Whiteboard" : "Code" } Status
                  </p>
                  <p className="text-xs text-gray-500">
                    {activeTab === "whiteboard" 
                      ? (room.whiteboardLastSaved ? `Saved ${new Date(room.whiteboardLastSaved).toLocaleTimeString()}` : "Not saved yet")
                      : (room.codeLastSaved ? `Saved ${new Date(room.codeLastSaved).toLocaleTimeString()}` : "Not saved yet")
                    }
                  </p>
                </div>
                
                <Button 
                  variant="outline"
                  onClick={fetchRoom} 
                  size="icon" 
                  className="h-9 w-9 text-gray-500 border-gray-200"
                  title="Refresh from server"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>

                {activeTab === "code" && (
                  <Button 
                    variant="outline"
                    onClick={handleClear} 
                    size="sm" 
                    className="h-9 px-3 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    Clear
                  </Button>
                )}

                <Button 
                  onClick={saveCurrentState} 
                  size="sm" 
                  className="h-9 gap-2 bg-green-600 hover:bg-green-700 shadow-sm"
                  disabled={!hasUnsavedChanges}
                >
                  <Send className="h-4 w-4" />
                  Save Progress
                  {hasUnsavedChanges && (
                    <span className="flex h-2 w-2 rounded-full bg-white animate-pulse" />
                  )}
                </Button>
              </div>
            )}
          </div>

          <TabsContent value="chat">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 flex flex-col">
                <CardHeader className="py-3">
                  <CardTitle className="text-base">Chat</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col min-h-[300px] p-0">
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px]">
                    {(room.messages || []).length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No messages yet. Say hi!
                      </p>
                    ) : (
                      room.messages.map((msg, i) => (
                        <div key={msg._id || i} className="flex flex-col text-sm">
                          <span className="font-medium text-indigo-600 dark:text-indigo-400">
                            {msg.userName}
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {msg.text}
                          </span>
                          {msg.createdAt && (
                            <span className="text-xs text-gray-400 mt-0.5">
                              {new Date(msg.createdAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  {isMember ? (
                    <form
                      onSubmit={handleSendMessage}
                      className="flex gap-2 p-4 border-t"
                    >
                      <Input
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type a message..."
                        disabled={sending}
                      />
                      <Button type="submit" size="icon" disabled={sending}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  ) : (
                    <p className="p-4 border-t text-sm text-gray-500">
                      Join the room to send messages.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">Members</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isMember && (
                    <form onSubmit={handleInviteMember} className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          type="email"
                          placeholder="User email..."
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="h-8 text-xs"
                          disabled={inviting}
                        />
                        <Button type="submit" size="sm" className="h-8 gap-1 px-2" disabled={inviting}>
                          <UserPlus className="h-3 w-3" />
                          <span className="text-xs">Add</span>
                        </Button>
                      </div>
                    </form>
                  )}
                  <ul className="space-y-2">
                    {room.members?.map((m) => (
                      <li key={m._id} className="text-sm flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <div className="flex flex-col">
                          <span className="font-medium">{m.fullName || "Anonymous"}</span>
                          <span className="text-xs text-gray-500">{m.email}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="whiteboard">
            {isMember ? (
              <Whiteboard 
                roomId={id!} 
                socket={socket} 
                initialSnapshot={room.whiteboardSnapshot}
                onStateChange={handleStateChange}
              />
            ) : (
              <Card className="p-12 text-center text-gray-500">
                Join the room to use the whiteboard.
              </Card>
            )}
          </TabsContent>

          <TabsContent value="code">
            {isMember ? (
              <CollaborativeEditor 
                roomId={id!} 
                socket={socket} 
                userName={currentUserName} 
                initialCode={room.codeSnapshot?.code}
                initialLanguage={room.codeSnapshot?.language}
                onStateChange={handleStateChange}
              />
            ) : (
              <Card className="p-12 text-center text-gray-500">
                Join the room to use the collaborative code editor.
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default RoomDetailPage;
