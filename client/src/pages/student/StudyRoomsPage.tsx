import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "@/utils/axiosInstance";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  LayoutGrid,
  ArrowUpRight,
  MessageSquare,
  PencilLine,
  Code2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MotionTableRow = motion(TableRow);

type Room = {
  _id: string;
  name: string;
  description?: string;
  topic: string;
  createdBy: { fullName?: string; email?: string };
  members: { _id: string; fullName?: string }[];
  maxMembers: number;
  messages?: unknown[];
  createdAt?: string;
};

const TOPICS = [
  "DSA",
  "System Design",
  "React",
  "JavaScript",
  "Backend",
  "Behavioral",
  "Other",
] as const;

type SortKey = "newest" | "name" | "members";

/** UI-only capacity tone — light + dark classes. */
function capacityTone(
  n: number,
  max: number
): { label: string; className: string } {
  const r = max > 0 ? n / max : 0;
  if (r >= 0.85)
    return {
      label: "Nearly full",
      className:
        "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-200",
    };
  if (r >= 0.45)
    return {
      label: "Active",
      className:
        "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-500/25 dark:bg-sky-500/15 dark:text-sky-200",
    };
  return {
    label: "Open",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-200",
  };
}

const StudyRoomsPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [topicFilter, setTopicFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
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
      setRooms(Array.isArray(res.data) ? res.data : []);
    } catch (err: unknown) {
      console.error("Error fetching rooms", err);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [topicFilter]);

  const filteredSorted = useMemo(() => {
    let list = [...rooms];
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.description || "").toLowerCase().includes(q) ||
          r.topic.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "members")
        return (b.members?.length ?? 0) - (a.members?.length ?? 0);
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
    return list;
  }, [rooms, searchQuery, sortBy]);

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
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : undefined;
      alert(msg || "Failed to create room");
    } finally {
      setCreating(false);
    }
  };

  const railBtn = (active: boolean) =>
    cn(
      "shrink-0 rounded-lg px-3 py-2.5 text-left text-sm transition-colors md:mx-2 md:px-3",
      active
        ? "bg-sky-600/15 text-sky-900 ring-1 ring-sky-500/40 dark:bg-sky-600/25 dark:text-white dark:ring-sky-500/40"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200"
    );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0c0a08] dark:text-slate-100">
      <Navigation />
      <div className="mx-auto flex max-w-[1600px] flex-col md:flex-row">
        <aside
          className="shrink-0 border-b border-slate-200 bg-white dark:border-white/[0.06] dark:bg-[#141210] md:w-56 md:border-b-0 md:border-r md:border-slate-200 dark:md:border-white/[0.06] lg:w-60"
        >
          <div className="flex items-center gap-2 px-4 py-4 md:px-5">
            <LayoutGrid className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-500">
                Study hub
              </p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Browse by focus
              </p>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto px-3 pb-3 md:flex-col md:gap-0 md:px-2 md:pb-6">
            <button
              type="button"
              onClick={() => setTopicFilter("")}
              className={railBtn(topicFilter === "")}
            >
              All sessions
            </button>
            {TOPICS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTopicFilter(t)}
                className={railBtn(topicFilter === t)}
              >
                {t}
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent dark:from-blue-300 dark:via-indigo-300 dark:to-cyan-300">
                  Collaborative study rooms
                </span>
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                Join a session, chat, sketch on the board, and code together —
                pick a focus area or search by name.
              </p>
            </div>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="shrink-0 gap-2 bg-sky-600 text-white hover:bg-sky-500">
                  <Plus className="h-4 w-4" />
                  New room
                </Button>
              </DialogTrigger>
              <DialogContent className="border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-[#12121a] dark:text-slate-100">
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
                      placeholder="e.g. Weekend DSA grind"
                      className="mt-1 border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="desc">Description (optional)</Label>
                    <Input
                      id="desc"
                      value={createDesc}
                      onChange={(e) => setCreateDesc(e.target.value)}
                      placeholder="Goals, schedule, resources…"
                      className="mt-1 border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="topic">Focus</Label>
                    <select
                      id="topic"
                      value={createTopic}
                      onChange={(e) => setCreateTopic(e.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
                    >
                      {TOPICS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    type="submit"
                    disabled={creating}
                    className="w-full bg-sky-600 hover:bg-sky-500"
                  >
                    {creating ? "Creating…" : "Create room"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <Input
                placeholder="Search rooms by name or description…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-slate-200 bg-white pl-10 text-slate-900 placeholder:text-slate-400 dark:border-white/10 dark:bg-[#141210] dark:text-slate-100 dark:placeholder:text-slate-600"
              />
            </div>
            <Select
              value={sortBy}
              onValueChange={(v) => setSortBy(v as SortKey)}
            >
              <SelectTrigger className="w-full border-slate-200 bg-white text-slate-900 sm:w-[200px] dark:border-white/10 dark:bg-[#141210] dark:text-slate-200">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-[#12121a] dark:text-slate-100">
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="name">Name (A–Z)</SelectItem>
                <SelectItem value="members">Most members</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-500 border-t-transparent dark:border-sky-500" />
            </div>
          ) : filteredSorted.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center dark:border-white/10 dark:bg-white/[0.02]">
              <Sparkles className="mx-auto mb-3 h-10 w-10 text-sky-500/80 dark:text-sky-400/60" />
              <p className="text-slate-600 dark:text-slate-400">
                No rooms match your filters. Try another focus or create a new
                room.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-[#141210]/80 dark:shadow-xl dark:shadow-black/40">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 hover:bg-transparent dark:border-white/[0.06] dark:hover:bg-transparent">
                    <TableHead className="w-12 text-slate-500 dark:text-slate-500">
                      #
                    </TableHead>
                    <TableHead className="text-slate-600 dark:text-slate-400">
                      Room
                    </TableHead>
                    <TableHead className="hidden text-slate-600 md:table-cell dark:text-slate-400">
                      Focus
                    </TableHead>
                    <TableHead className="hidden text-slate-600 lg:table-cell dark:text-slate-400">
                      Capacity
                    </TableHead>
                    <TableHead className="hidden text-slate-600 xl:table-cell dark:text-slate-400">
                      In session
                    </TableHead>
                    <TableHead className="text-right text-slate-600 dark:text-slate-400">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence initial={false}>
                    {filteredSorted.map((room, index) => {
                      const cap = capacityTone(
                        room.members?.length ?? 0,
                        room.maxMembers
                      );
                      const msgCount = Array.isArray(room.messages)
                        ? room.messages.length
                        : 0;
                      return (
                        <MotionTableRow
                          key={room._id}
                          layout
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className={cn(
                            "group cursor-pointer border-slate-100 bg-transparent transition-colors hover:bg-slate-50 dark:border-white/[0.04] dark:hover:bg-white/[0.04]"
                          )}
                          onClick={() =>
                            navigate(`/student/rooms/${room._id}`)
                          }
                        >
                          <TableCell className="text-slate-500 dark:text-slate-500">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-blue-600 group-hover:text-blue-700 group-hover:underline dark:text-blue-400 dark:group-hover:text-blue-300">
                              {room.name}
                            </div>
                            {room.description && (
                              <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-500">
                                {room.description}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-1.5 md:hidden">
                              <Badge
                                variant="outline"
                                className="border-slate-200 text-[10px] text-slate-700 dark:border-white/10 dark:text-slate-300"
                              >
                                {room.topic}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge
                              variant="outline"
                              className="border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200"
                            >
                              {room.topic}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge
                              variant="outline"
                              className={cn("text-xs", cap.className)}
                            >
                              {cap.label}
                            </Badge>
                            <span className="ml-2 text-xs text-slate-500 dark:text-slate-500">
                              {room.members?.length ?? 0}/{room.maxMembers}{" "}
                              members
                            </span>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            <div className="flex flex-wrap gap-1">
                              <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                                <MessageSquare className="h-3 w-3" />
                                {msgCount} msgs
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                                <PencilLine className="h-3 w-3" />
                                Board
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                                <Code2 className="h-3 w-3" />
                                Code
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="gap-1 text-blue-600 hover:bg-slate-100 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-white/10 dark:hover:text-blue-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/student/rooms/${room._id}`);
                              }}
                            >
                              Open
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </MotionTableRow>
                      );
                    })}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-600">
            Tip: use the left rail to filter by topic; search works on the
            current list.
          </p>
        </main>
      </div>
    </div>
  );
};

export default StudyRoomsPage;
