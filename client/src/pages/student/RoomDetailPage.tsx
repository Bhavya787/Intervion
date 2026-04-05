import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Send,
  LogOut,
  ArrowLeft,
  MessageSquare,
  PenTool,
  Code,
  UserPlus,
  RefreshCw,
  Radio,
  Sparkles,
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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

type CodingQuestion = {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  topic: string;
  constraints: string[];
  sampleInput: string;
  sampleOutput: string;
  starterCode?: {
    javascript?: string;
    python?: string;
    java?: string;
    cpp?: string;
  };
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
  whiteboardSnapshot?: unknown;
  codeSnapshot?: {
    code: string;
    language: string;
    questions?: CodingQuestion[];
    currentQuestionIndex?: number;
    questionTopic?: string;
    questionDifficulty?: "Easy" | "Medium" | "Hard" | "Expert";
  };
  whiteboardLastSaved?: string;
  codeLastSaved?: string;
};

function sameCalendarDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatChatDayLabel(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (sameCalendarDay(d, now)) return "Today";
  if (sameCalendarDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    ...(d.getFullYear() !== now.getFullYear() ? { year: "numeric" as const } : {}),
  });
}

function formatChatTime(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function chatAvatarInitial(name: string) {
  return (name?.trim()?.charAt(0) || "?").toUpperCase();
}

function sameMessageGroup(
  a: Message | undefined,
  b: Message | undefined
): boolean {
  if (!a || !b || String(a.user) !== String(b.user)) return false;
  if (!a.createdAt || !b.createdAt) return !a.createdAt && !b.createdAt;
  return sameCalendarDay(new Date(a.createdAt), new Date(b.createdAt));
}

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
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

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
        axiosInstance
          .get("/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch(() => ({ data: {} })),
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

    const currentHost = window.location.hostname;
    const serverUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace("/api", "")
      : `http://${currentHost}:5000`;

    const newSocket = io(serverUrl, {
      transports: ["polling", "websocket"],
      withCredentials: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setSocketConnected(true);
      newSocket.emit("join-room", {
        roomId: id,
        userId: currentUserId,
        userName: currentUserName,
      });
    });

    newSocket.on("connect_error", () => {
      setSocketConnected(false);
    });

    newSocket.on("disconnect", () => {
      setSocketConnected(false);
    });

    newSocket.on("user-invited", ({ roomId, invitedUserId, invitedUserName }) => {
      if (roomId === id) {
        fetchRoom();
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
  }, [id, currentUserId, isMember, currentUserName, fetchRoom, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [room?.messages]);

  const adjustChatInputHeight = useCallback(() => {
    const el = chatInputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, []);

  useEffect(() => {
    adjustChatInputHeight();
  }, [messageText, adjustChatInputHeight]);

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
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      alert(msg || "Failed to join");
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
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : undefined;
      alert(msg || "Failed to leave");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !messageText.trim() || !isMember) return;
    const text = messageText.trim();
    setSending(true);
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.post(
        `/rooms/${id}/messages`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessageText("");
      fetchRoom();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      alert(msg || "Failed to send");
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

      socket?.emit("invite-user", {
        roomId: id,
        invitedUserId: addedUser.id,
        invitedUserName: addedUser.fullName || addedUser.email,
      });

      setInviteEmail("");
      toast({
        title: "Member Added",
        description: `${addedUser.fullName || addedUser.email} has been added to the room.`,
      });
      fetchRoom();
    } catch (err: unknown) {
      toast({
        title: "Failed to Add Member",
        description:
          err && typeof err === "object" && "response" in err
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setInviting(false);
    }
  };

  const saveCurrentState = async () => {
    if (!id || !isMember) return;

    let stateToSave: Record<string, unknown> = {};

    if (activeTab === "whiteboard") {
      if ((window as unknown as { getWhiteboardSnapshot?: () => unknown }).getWhiteboardSnapshot) {
        stateToSave.whiteboardSnapshot = (
          window as unknown as { getWhiteboardSnapshot: () => unknown }
        ).getWhiteboardSnapshot();
      } else {
        toast({
          title: "Save Failed",
          description: "Whiteboard editor is not ready.",
          variant: "destructive",
        });
        return;
      }
    } else if (activeTab === "code") {
      if ((window as unknown as { getCurrentCodeState?: () => unknown }).getCurrentCodeState) {
        stateToSave.codeSnapshot = (
          window as unknown as { getCurrentCodeState: () => unknown }
        ).getCurrentCodeState();
      } else {
        toast({
          title: "Save Failed",
          description: "Code editor is not ready.",
          variant: "destructive",
        });
        return;
      }
    }

    if (Object.keys(stateToSave).length === 0) return;

    try {
      const token = localStorage.getItem("token");
      await axiosInstance.patch(`/rooms/${id}/state`, stateToSave, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHasUnsavedChanges(false);
      toast({
        title: "Progress Saved",
        description: `Your ${activeTab} changes have been saved to the room.`,
      });
      fetchRoom();
    } catch {
      toast({
        title: "Save Failed",
        description: "Could not save your progress to the server.",
        variant: "destructive",
      });
    }
  };

  const handleTabChange = (value: string) => {
    if (
      hasUnsavedChanges &&
      (activeTab === "whiteboard" || activeTab === "code")
    ) {
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
    if (activeTab === "code") {
      const w = window as unknown as { clearCodeEditor?: () => void };
      if (w.clearCodeEditor) w.clearCodeEditor();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0c0a08]">
        <Navigation />
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0c0a08]">
        <Navigation />
        <main className="mx-auto max-w-4xl px-4 py-16 text-center">
          <p className="text-slate-600 dark:text-slate-400">Room not found.</p>
          <Button
            variant="link"
            className="text-sky-600 dark:text-sky-400"
            onClick={() => navigate("/student/rooms")}
          >
            Back to rooms
          </Button>
        </main>
      </div>
    );
  }

  const fillRatio =
    room.maxMembers > 0 ? (room.members?.length ?? 0) / room.maxMembers : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0c0a08] dark:text-slate-100">
      <Navigation />

      {/* Sticky session header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-white/[0.08] dark:bg-[#0a0a0f]/90">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-start gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
              onClick={() => navigate("/student/rooms")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent dark:from-blue-300 dark:via-indigo-300 dark:to-cyan-300">
                    {room.name}
                  </span>
                </h1>
                <Badge
                  variant="outline"
                  className="border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-200"
                >
                  {room.topic}
                </Badge>
              </div>
              {room.description ? (
                <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                  {room.description}
                </p>
              ) : (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">
                  Collaborative session — chat, sketch, and code together.
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-sky-500" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {room.members?.length ?? 0} / {room.maxMembers}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                      fillRatio >= 0.85
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200"
                        : fillRatio >= 0.45
                          ? "bg-sky-100 text-sky-900 dark:bg-sky-500/20 dark:text-sky-200"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200"
                    )}
                  >
                    {fillRatio >= 0.85
                      ? "Nearly full"
                      : fillRatio >= 0.45
                        ? "Active"
                        : "Open"}
                  </span>
                </span>
                <Separator
                  orientation="vertical"
                  className="hidden h-4 sm:block"
                />
                <span className="inline-flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex h-2 w-2 rounded-full",
                      socketConnected
                        ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                        : "animate-pulse bg-sky-500"
                    )}
                  />
                  <Radio className="h-3 w-3 opacity-70" />
                  <span className="font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                    {socketConnected ? "Live" : "Connecting…"}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {isMember ? (
              <Button
                variant="outline"
                onClick={handleLeave}
                className="gap-2 border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" />
                Leave
              </Button>
            ) : (
              <Button
                onClick={handleJoin}
                className="gap-2 bg-sky-600 text-white hover:bg-sky-500"
              >
                <Sparkles className="h-4 w-4" />
                Join room
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-xl border border-slate-200 bg-slate-100/80 p-1 dark:border-white/10 dark:bg-white/[0.06] lg:w-auto lg:min-w-[420px]">
              <TabsTrigger
                value="chat"
                className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-sky-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-sky-600/25 dark:data-[state=active]:text-white"
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Chat</span>
              </TabsTrigger>
              <TabsTrigger
                value="whiteboard"
                className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-sky-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-sky-600/25 dark:data-[state=active]:text-white"
              >
                <PenTool className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Whiteboard</span>
              </TabsTrigger>
              <TabsTrigger
                value="code"
                className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-sky-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-sky-600/25 dark:data-[state=active]:text-white"
              >
                <Code className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Code</span>
              </TabsTrigger>
            </TabsList>

            {(activeTab === "whiteboard" || activeTab === "code") && isMember && (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <div className="mr-auto text-left lg:mr-0 lg:text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {activeTab === "whiteboard" ? "Whiteboard" : "Code"} sync
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {activeTab === "whiteboard"
                      ? room.whiteboardLastSaved
                        ? `Saved ${new Date(room.whiteboardLastSaved).toLocaleString()}`
                        : "Not saved yet"
                      : room.codeLastSaved
                        ? `Saved ${new Date(room.codeLastSaved).toLocaleString()}`
                        : "Not saved yet"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fetchRoom()}
                  className="h-9 w-9 border-slate-200 dark:border-white/15"
                  title="Refresh from server"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                {activeTab === "code" && (
                  <Button
                    variant="outline"
                    onClick={handleClear}
                    size="sm"
                    className="h-9 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    Clear
                  </Button>
                )}
                <Button
                  onClick={saveCurrentState}
                  size="sm"
                  className="h-9 gap-2 bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50"
                  disabled={!hasUnsavedChanges}
                >
                  <Send className="h-4 w-4" />
                  Save progress
                  {hasUnsavedChanges && (
                    <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                  )}
                </Button>
              </div>
            )}
          </div>

          <TabsContent value="chat" className="mt-0 outline-none">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="flex min-h-[460px] flex-col overflow-hidden border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 shadow-md ring-1 ring-slate-900/5 dark:border-white/[0.08] dark:from-[#141210] dark:to-[#08080c] dark:ring-white/5 lg:col-span-2">
                <CardHeader className="border-b border-slate-100/90 bg-white/60 py-3.5 backdrop-blur-sm dark:border-white/[0.06] dark:bg-white/[0.02]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-200/80 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300">
                          <MessageSquare className="h-4 w-4" />
                        </span>
                        Conversation
                      </CardTitle>
                      <p className="mt-1 pl-10 text-xs text-slate-500 dark:text-slate-400">
                        {room.members?.length ?? 0} in this room · max{" "}
                        {room.maxMembers}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col p-0">
                  <div className="custom-scrollbar relative max-h-[min(440px,52vh)] flex-1 overflow-y-auto bg-gradient-to-b from-slate-100/50 via-slate-50/30 to-transparent px-3 py-4 dark:from-sky-950/15 dark:via-black/30 dark:to-transparent sm:px-4">
                    {(room.messages || []).length === 0 ? (
                      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/90 bg-white/60 py-14 text-center dark:border-white/10 dark:bg-white/[0.03]">
                        <Sparkles className="mb-3 h-11 w-11 text-slate-400/70 dark:text-slate-500" />
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          No messages yet
                        </p>
                        <p className="mt-1 max-w-[240px] text-xs text-slate-500 dark:text-slate-400">
                          Say hello and kick off the study session—everyone sees
                          messages here in real time.
                        </p>
                      </div>
                    ) : (
                      (room.messages || []).map((msg, i) => {
                        const list = room.messages || [];
                        const own =
                          currentUserId &&
                          String(msg.user) === String(currentUserId);
                        const prev = list[i - 1];
                        const next = list[i + 1];
                        const sameAsPrev = sameMessageGroup(prev, msg);
                        const sameAsNext = sameMessageGroup(msg, next);
                        const showMeta = !sameAsPrev;
                        const showPeerAvatar = !own && !sameAsPrev;
                        const dayLabel =
                          msg.createdAt &&
                          (!prev?.createdAt ||
                            formatChatDayLabel(prev.createdAt) !==
                              formatChatDayLabel(msg.createdAt))
                            ? formatChatDayLabel(msg.createdAt)
                            : null;
                        const initial = chatAvatarInitial(msg.userName);
                        return (
                          <div
                            key={msg._id || i}
                            className={cn(
                              dayLabel ? "mt-4" : sameAsPrev ? "mt-1" : "mt-4"
                            )}
                          >
                            {dayLabel && (
                              <div className="mb-3 flex justify-center">
                                <span className="rounded-full bg-slate-200/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600 shadow-sm dark:bg-white/10 dark:text-slate-400">
                                  {dayLabel}
                                </span>
                              </div>
                            )}
                            <motion.div
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.16 }}
                              className={cn(
                                "flex gap-2.5",
                                own ? "justify-end" : "justify-start"
                              )}
                            >
                              {!own && (
                                <div className="w-9 shrink-0 pt-0.5">
                                  {showPeerAvatar ? (
                                    <div
                                      className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-slate-700 text-xs font-bold text-white shadow-md ring-2 ring-white/10 dark:from-slate-600 dark:to-slate-800"
                                      title={msg.userName}
                                    >
                                      {initial}
                                    </div>
                                  ) : (
                                    <span className="block h-9 w-9" aria-hidden />
                                  )}
                                </div>
                              )}
                              <div
                                className={cn(
                                  "flex min-w-0 max-w-[min(100%,20rem)] flex-col gap-0.5 sm:max-w-[24rem]",
                                  own ? "items-end" : "items-start"
                                )}
                              >
                                {showMeta && (
                                  <div
                                    className={cn(
                                      "flex items-baseline gap-2 px-0.5",
                                      own && "flex-row-reverse"
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        "text-[11px] font-semibold tracking-wide",
                                        own
                                          ? "text-slate-500 dark:text-slate-400"
                                          : "text-slate-600 dark:text-slate-300"
                                      )}
                                    >
                                      {own ? "You" : msg.userName}
                                    </span>
                                    {msg.createdAt && (
                                      <span className="text-[10px] tabular-nums text-slate-400 dark:text-slate-500">
                                        {formatChatTime(msg.createdAt)}
                                      </span>
                                    )}
                                  </div>
                                )}
                                <div
                                  className={cn(
                                    "px-3.5 py-2 text-[15px] leading-snug shadow-md",
                                    own
                                      ? cn(
                                          "border border-blue-200/90 bg-blue-50/95 text-slate-800 shadow-sm dark:border-slate-600/50 dark:bg-slate-700/75 dark:text-slate-100 dark:ring-1 dark:ring-white/[0.06]",
                                          !sameAsPrev && !sameAsNext &&
                                            "rounded-2xl",
                                          !sameAsPrev &&
                                            sameAsNext &&
                                            "rounded-2xl rounded-br-md",
                                          sameAsPrev &&
                                            !sameAsNext &&
                                            "rounded-2xl rounded-tr-md",
                                          sameAsPrev &&
                                            sameAsNext &&
                                            "rounded-md rounded-r-2xl"
                                        )
                                      : cn(
                                          "border border-slate-200/90 bg-white text-slate-900 ring-1 ring-black/[0.03] dark:border-white/10 dark:bg-slate-800/95 dark:text-slate-100 dark:ring-white/[0.04]",
                                          !sameAsPrev && !sameAsNext &&
                                            "rounded-2xl",
                                          !sameAsPrev &&
                                            sameAsNext &&
                                            "rounded-2xl rounded-bl-md",
                                          sameAsPrev &&
                                            !sameAsNext &&
                                            "rounded-2xl rounded-tl-md",
                                          sameAsPrev &&
                                            sameAsNext &&
                                            "rounded-md rounded-l-2xl"
                                        )
                                  )}
                                >
                                  <p className="whitespace-pre-wrap break-words">
                                    {msg.text}
                                  </p>
                                </div>
                                {!showMeta && msg.createdAt && (
                                  <span className="px-1 text-[9px] tabular-nums text-slate-400 dark:text-slate-600">
                                    {formatChatTime(msg.createdAt)}
                                  </span>
                                )}
                              </div>
                            </motion.div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  {isMember ? (
                    <form
                      onSubmit={handleSendMessage}
                      className="border-t border-slate-100/90 bg-white/95 p-3 dark:border-white/[0.06] dark:bg-[#07070a]/95"
                    >
                      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-1.5 shadow-inner dark:border-white/[0.08] dark:bg-white/[0.04]">
                        <div className="flex items-end gap-2">
                          <Textarea
                            ref={chatInputRef}
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                if (
                                  messageText.trim() &&
                                  !sending &&
                                  e.currentTarget.form
                                ) {
                                  e.currentTarget.form.requestSubmit();
                                }
                              }
                            }}
                            placeholder="Message the room"
                            disabled={sending}
                            rows={1}
                            className="!min-h-[44px] max-h-[140px] resize-none border-0 bg-transparent px-3 py-2.5 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 dark:text-slate-100 dark:placeholder:text-slate-500"
                          />
                          <Button
                            type="submit"
                            size="icon"
                            disabled={sending || !messageText.trim()}
                            className="mb-0.5 h-10 w-10 shrink-0 rounded-full border border-slate-300/90 bg-slate-600 text-white shadow-sm transition hover:bg-slate-500 dark:border-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 disabled:opacity-40"
                            title="Send"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="mt-2 text-center text-[10px] text-slate-400 dark:text-slate-500">
                        <kbd className="rounded-md border border-slate-200/90 bg-white px-1.5 py-0.5 font-mono text-[9px] text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                          Enter
                        </kbd>{" "}
                        send ·{" "}
                        <kbd className="rounded-md border border-slate-200/90 bg-white px-1.5 py-0.5 font-mono text-[9px] text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                          Shift+Enter
                        </kbd>{" "}
                        new line
                      </p>
                    </form>
                  ) : (
                    <p className="border-t border-slate-100 bg-slate-50/50 p-4 text-sm text-slate-500 dark:border-white/[0.06] dark:bg-slate-900/40 dark:text-slate-400">
                      Join the room to send messages.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="h-fit border-slate-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#141210]">
                <CardHeader className="border-b border-slate-100 py-3 dark:border-white/[0.06]">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    Members ({room.members?.length ?? 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  {isMember && (
                    <form onSubmit={handleInviteMember} className="space-y-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Invite by email (must be registered).
                      </p>
                      <div className="flex gap-2">
                        <Input
                          type="email"
                          placeholder="colleague@email.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="h-9 border-slate-200 text-sm dark:border-white/10 dark:bg-white/5"
                          disabled={inviting}
                        />
                        <Button
                          type="submit"
                          size="sm"
                          className="h-9 shrink-0 gap-1 bg-slate-600 px-3 hover:bg-slate-500 dark:bg-slate-600 dark:hover:bg-slate-500"
                          disabled={inviting}
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          Add
                        </Button>
                      </div>
                    </form>
                  )}
                  <ul className="space-y-3">
                    {room.members?.map((m) => {
                      const initial = (m.fullName || m.email || "?")
                        .charAt(0)
                        .toUpperCase();
                      return (
                        <li
                          key={m._id}
                          className="flex items-center gap-3 rounded-lg border border-transparent px-1 py-0.5 transition-colors hover:border-slate-200 hover:bg-slate-50 dark:hover:border-white/10 dark:hover:bg-white/[0.04]"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-500 text-xs font-bold text-white dark:bg-slate-600">
                            {initial}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                              {m.fullName || "Member"}
                            </p>
                            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                              {m.email}
                            </p>
                          </div>
                          <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="whiteboard" className="mt-0 outline-none">
            {isMember ? (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#141210]">
                <Whiteboard
                  roomId={id!}
                  socket={socket}
                  initialSnapshot={room.whiteboardSnapshot}
                  onStateChange={handleStateChange}
                />
              </div>
            ) : (
              <Card className="border-dashed border-slate-200 py-16 text-center text-slate-600 dark:border-white/15 dark:text-slate-400">
                Join the room to use the whiteboard.
              </Card>
            )}
          </TabsContent>

          <TabsContent value="code" className="mt-0 outline-none">
            {isMember ? (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#141210]">
                <CollaborativeEditor
                  roomId={id!}
                  socket={socket}
                  initialCode={room.codeSnapshot?.code}
                  initialLanguage={
                    (room.codeSnapshot?.language as
                      | "javascript"
                      | "python"
                      | "java"
                      | "cpp"
                      | undefined) || "javascript"
                  }
                  initialQuestions={room.codeSnapshot?.questions || []}
                  initialCurrentQuestionIndex={
                    room.codeSnapshot?.currentQuestionIndex || 0
                  }
                  initialQuestionTopic={room.codeSnapshot?.questionTopic}
                  initialQuestionDifficulty={
                    room.codeSnapshot?.questionDifficulty || "Medium"
                  }
                  defaultTopic={room.topic}
                  onStateChange={handleStateChange}
                />
              </div>
            ) : (
              <Card className="border-dashed border-slate-200 py-16 text-center text-slate-600 dark:border-white/15 dark:text-slate-400">
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
