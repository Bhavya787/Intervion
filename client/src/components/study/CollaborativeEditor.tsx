import Editor from "@monaco-editor/react";
import { useEffect, useState, useRef } from "react";
import { Socket } from "socket.io-client";

interface CollaborativeEditorProps {
  roomId: string;
  socket: Socket | null;
  userName: string;
  initialCode?: string;
  initialLanguage?: string;
  onStateChange?: (hasChanges: boolean) => void;
}

const CollaborativeEditor = ({ 
  roomId, 
  socket, 
  userName, 
  initialCode, 
  initialLanguage,
  onStateChange 
}: CollaborativeEditorProps) => {
  const [code, setCode] = useState<string>(initialCode || "// Start coding together...");
  const [language, setLanguage] = useState<string>(initialLanguage || "javascript");
  
  // Use refs to keep track of current state for stable window methods
  const editorRef = useRef<any>(null);
  const codeRef = useRef(code);
  const langRef = useRef(language);

  useEffect(() => {
    codeRef.current = code;
    langRef.current = language;
  }, [code, language]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("code-update", (data: { code: string; language: string }) => {
      console.log("[Editor] Received code update");
      if (data.code !== undefined && data.code !== codeRef.current) {
        setCode(data.code);
      }
      if (data.language) setLanguage(data.language);
    });

    socket.on("clear-code-editor", (data: { defaultCode: string }) => {
      console.log("[Editor] Global reset received");
      const resetCode = data.defaultCode || "// Start coding together...";
      setCode(resetCode);
    });

    return () => {
      socket.off("code-update");
      socket.off("clear-code-editor");
    };
  }, [socket]);

  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined) return;
    setCode(value);
    console.log("[Editor] Emitting code update");
    socket?.emit("code-update", { roomId, code: value, language });
    onStateChange?.(true);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    socket?.emit("code-update", { roomId, code, language: newLang });
    onStateChange?.(true);
  };

  // Expose methods for the parent using window object - made stable
  useEffect(() => {
    console.log("[Editor] Registering stable window methods");
    
    (window as any).getCurrentCodeState = () => {
      console.log("[Editor] getCurrentCodeState called");
      return { code: codeRef.current, language: langRef.current };
    };
    
    (window as any).clearCodeEditor = () => {
      console.log("[Editor] clearCodeEditor called");
      if (window.confirm("Are you sure you want to reset the code editor for everyone?")) {
        const defaultCode = "// Start coding together...";
        setCode(defaultCode);
        socket?.emit("clear-code-editor", { roomId, defaultCode });
        onStateChange?.(true);
      }
    };
    
    return () => {
      console.log("[Editor] Unregistering stable window methods");
      delete (window as any).getCurrentCodeState;
      delete (window as any).clearCodeEditor;
    };
  }, [socket, roomId, onStateChange]);

  return (
    <div className="flex flex-col h-[600px] border rounded-lg overflow-hidden bg-[#1e1e1e]">
      <div className="bg-[#2d2d2d] px-4 py-2 flex justify-between items-center text-white text-sm">
        <div className="flex items-center gap-4">
          <span className="font-medium">Collaborative Editor</span>
          <select 
            value={language} 
            onChange={handleLanguageChange}
            className="bg-[#3c3c3c] border-none rounded px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs text-gray-400">Live Syncing</span>
        </div>
      </div>
      <Editor
        height="100%"
        theme="vs-dark"
        language={language}
        value={code}
        onMount={handleEditorDidMount}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          automaticLayout: true,
          cursorStyle: "block",
          lineNumbers: "on",
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
};

export default CollaborativeEditor;
