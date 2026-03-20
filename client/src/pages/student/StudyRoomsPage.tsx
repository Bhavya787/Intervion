import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, MessageSquare, Search } from "lucide-react";

type Room = {
  _id: string;
  name: string;
  description?: string;
  topic: string;
  createdBy: { fullName?: string; email?: string };
  members: { _id: string; fullName?: string }[];
  maxMembers: number;
  messages?: unknown[];
};

const TOPICS = [
  "DSA",
  "System Design",
  "React",
  "JavaScript",
  "Backend",
  "Behavioral",
  "Other",
];

const StudyRoomsPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [topicFilter, setTopicFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createTopic, setCreateTopic] = useState("DSA");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = topicFilter
        ? `/rooms?topic=${encodeURIComponent(topicFilter)}`
        : "/rooms";
      const res = await axiosInstance.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched rooms:", res.data); // Debug log
      setRooms(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error("Error fetching rooms", err);
      if (err.response?.status === 403) {
        console.error("Access denied to rooms. Check if user is a student.");
      }
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [topicFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) return;
    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      await axiosInstance.post(
        "/rooms",
        {
          name: createName.trim(),
          description: createDesc.trim(),
          topic: createTopic,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCreateName("");
      setCreateDesc("");
      setCreateTopic("DSA");
      setCreateOpen(false);
      fetchRooms();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to create room");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a]">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Study Rooms
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Join a room to study with peers, share tips, and stay motivated.
            </p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create study room</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label htmlFor="name">Room name</Label>
                  <Input
                    id="name"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="e.g. React interview prep"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="desc">Description (optional)</Label>
                  <Input
                    id="desc"
                    value={createDesc}
                    onChange={(e) => setCreateDesc(e.target.value)}
                    placeholder="What will you focus on?"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="topic">Topic</Label>
                  <select
                    id="topic"
                    value={createTopic}
                    onChange={(e) => setCreateTopic(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {TOPICS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit" disabled={creating}>
                  {creating ? "Creating…" : "Create room"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by topic..."
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All topics</option>
            {TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading rooms…</p>
        ) : rooms.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-gray-500 dark:text-gray-400">
              No rooms yet. Create one or try changing the topic filter.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {rooms.map((room) => (
              <Card
                key={room._id}
                className="cursor-pointer hover:border-indigo-500/50 transition-colors"
                onClick={() => navigate(`/student/rooms/${room._id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{room.name}</CardTitle>
                    <Badge variant="secondary">{room.topic}</Badge>
                  </div>
                  {room.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {room.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {room.members?.length ?? 0} / {room.maxMembers}
                  </span>
                  {Array.isArray(room.messages) && (
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {room.messages.length} messages
                    </span>
                  )}
                  <span>
                    By {room.createdBy?.fullName || room.createdBy?.email || "—"}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudyRoomsPage;
