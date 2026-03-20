import { Tldraw, Editor } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { useEffect, useState, useRef } from "react";
import { Socket } from "socket.io-client";

interface WhiteboardProps {
  roomId: string;
  socket: Socket | null;
  initialSnapshot?: any;
  onStateChange?: (hasChanges: boolean) => void;
}

const Whiteboard = ({ roomId, socket, initialSnapshot, onStateChange }: WhiteboardProps) => {
  const [editor, setEditor] = useState<Editor | null>(null);
  
  // Use a ref to hold the editor instance so we can access it from stable window methods
  const editorRef = useRef<Editor | null>(null);

  useEffect(() => {
    if (editor) {
      editorRef.current = editor;
    }
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    if (initialSnapshot) {
      console.log("[Whiteboard] Loading initial snapshot from DB");
      try {
        editor.store.loadSnapshot(initialSnapshot);
      } catch (err) {
        console.error("[Whiteboard] Error loading snapshot:", err);
      }
    }
  }, [editor, initialSnapshot]);

  useEffect(() => {
    if (!socket || !editor) return;

    // Handle incoming updates from other users
    const handleDrawingUpdate = (data: any) => {
      if (!editor || !data || !data.changes) return;
      console.log("[Whiteboard] Receiving update:", data);

      // mergeRemoteChanges ensures that we don't trigger local events for remote updates
      editor.store.mergeRemoteChanges(() => {
        const { added, updated, removed } = data.changes;
        
        // added are just the records
        if (added && Object.keys(added).length > 0) {
          console.log("[Whiteboard] Adding records:", Object.keys(added).length);
          editor.store.put(Object.values(added));
        }
        
        // updated values are [from, to] (the second element is the new version)
        if (updated && Object.keys(updated).length > 0) {
          console.log("[Whiteboard] Updating records:", Object.keys(updated).length);
          const updatedRecords = Object.values(updated).map((change: any) => change[1]);
          editor.store.put(updatedRecords);
        }
        
        // removed is just the IDs
        if (removed && (Array.isArray(removed) ? removed.length > 0 : Object.keys(removed).length > 0)) {
          const idsToRemove = Array.isArray(removed) ? removed : Object.keys(removed);
          console.log("[Whiteboard] Removing records:", idsToRemove.length);
          editor.store.remove(idsToRemove as any);
        }
      });
    };

    const handleSnapshotRequest = ({ requesterId }: { requesterId: string }) => {
      if (!editor) return;
      console.log("[Whiteboard] Providing snapshot to:", requesterId);
      const snapshot = editor.store.getSnapshot();
      socket.emit("provide-snapshot", { roomId, snapshot, requesterId });
    };

    const handleReceiveSnapshot = ({ snapshot }: { snapshot: any }) => {
      if (!editor) return;
      console.log("[Whiteboard] Received snapshot from peer");
      try {
        editor.store.loadSnapshot(snapshot);
      } catch (err) {
        console.error("[Whiteboard] Error loading snapshot from peer:", err);
      }
    };

    socket.on("drawing-update", handleDrawingUpdate);
    socket.on("request-snapshot", handleSnapshotRequest);
    socket.on("whiteboard-snapshot", handleReceiveSnapshot);

    // If the socket is already connected, request snapshot immediately
    if (socket.connected) {
      console.log("[Whiteboard] Socket already connected, requesting snapshot...", socket.id);
      socket.emit("request-snapshot", { roomId, requesterId: socket.id });
    }

    // Also handle future connects (like on reconnection)
    const onConnect = () => {
      console.log("[Whiteboard] Socket connected, requesting snapshot...", socket.id);
      socket.emit("request-snapshot", { roomId, requesterId: socket.id });
    };
    socket.on("connect", onConnect);

    // Emit local changes to others
    const cleanup = editor.store.listen((event: any) => {
      if (event.source !== "user") return;
      console.log("[Whiteboard] Emitting local change");
      socket.emit("drawing-update", { roomId, data: event });
      onStateChange?.(true);
    });

    return () => {
      socket.off("drawing-update", handleDrawingUpdate);
      socket.off("request-snapshot", handleSnapshotRequest);
      socket.off("whiteboard-snapshot", handleReceiveSnapshot);
      socket.off("connect", onConnect);
      cleanup();
    };
  }, [socket, editor, roomId, onStateChange]);

  // Expose methods for the parent using window object - made stable
  useEffect(() => {
    console.log("[Whiteboard] Registering stable window methods");
    
    (window as any).getWhiteboardSnapshot = () => {
      console.log("[Whiteboard] getWhiteboardSnapshot called");
      if (!editorRef.current) {
        console.error("[Whiteboard] Editor not ready");
        return null;
      }
      return editorRef.current.store.getSnapshot();
    };
    
    return () => {
      console.log("[Whiteboard] Unregistering stable window methods");
      delete (window as any).getWhiteboardSnapshot;
    };
  }, [socket, roomId, onStateChange]); // Only depend on things that rarely change

  return (
    <div className="w-full h-[600px] border rounded-lg overflow-hidden bg-white">
      <Tldraw onMount={setEditor} />
    </div>
  );
};

export default Whiteboard;
