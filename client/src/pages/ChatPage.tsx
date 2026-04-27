
import { useState, useRef, useEffect } from "react";
import { LogOut, Paperclip as PaperclipIcon, Send as SendIcon, User as UserIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { ChatSidebar } from "@/components/ChatSidebar";
import { useChatManager } from "@/hooks/useChatManager";
import {
  apiSendWithCode,
  apiSubmitAndPollResult,
  apiGetOrCreateDefaultProject,
  apiUploadFile,
} from "@/lib/api";
import { Link } from "wouter";

const PROJECT_STORAGE_KEY = "default_project_id";

export default function ChatPage() {
  const { logout, user } = useAuth();
  const [, navigate] = useLocation();
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const projectIdRef = useRef<number | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    chats,
    activeChatId,
    createNewChat,
    setActiveChat,
    addMessageToChat,
    deleteChat,
    activeChat,
    isLoadingChats,
    getOrAssignChatId,
  } = useChatManager();

  const resolveProjectId = async (): Promise<number> => {
    if (projectIdRef.current) return projectIdRef.current;

    const cached = localStorage.getItem(PROJECT_STORAGE_KEY);
    const parsedCached = cached ? Number(cached) : NaN;
    if (Number.isFinite(parsedCached) && parsedCached > 0) {
      projectIdRef.current = parsedCached;
      return parsedCached;
    }

    const projectId = await apiGetOrCreateDefaultProject();
    projectIdRef.current = projectId;
    localStorage.setItem(PROJECT_STORAGE_KEY, String(projectId));
    return projectId;
  };

  const getCachedProjectId = (): number | null => {
    if (projectIdRef.current && projectIdRef.current > 0) {
      return projectIdRef.current;
    }
    const cached = localStorage.getItem(PROJECT_STORAGE_KEY);
    const parsed = cached ? Number(cached) : NaN;
    if (Number.isFinite(parsed) && parsed > 0) {
      projectIdRef.current = parsed;
      return parsed;
    }
    return null;
  };

useEffect(() => {
  if (activeChat && activeChat.messages.length > 0) {
    const lastUserMsg = [...activeChat.messages]
      .reverse()
      .find((m) => m.role === "user");
    
    setCode(lastUserMsg?.content ?? "");
  } else if (activeChatId && activeChat?.messages.length === 0) {
    // Messages not loaded yet — you can add a loading state here if you want
    setCode("");
  } else {
    setCode("");
  }
}, [activeChat]);



  useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [activeChat?.messages, isAnalyzing]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  useEffect(() => {
  if (textareaRef.current) {
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
  }
}, [code]);

  const handleFileAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    setError(null);
    try {
      const projectId = await resolveProjectId();
      await apiUploadFile(projectId, file);
      const text = await file.text();
      setCode((prev) => prev ? prev + "\n\n" + text : text);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "File upload failed.";
      setError(msg);
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleNewChat = async () => {
    await createNewChat();
    setCode("");
    setError(null);
  };

  function formatAnalysis(a: {
    efficiency_score?: number;
    raw_output?: string;
    optimized_code?: string;
    suggestions?: unknown;
  }): string {
    const lines: string[] = [];
    if (a.efficiency_score !== undefined) {
      lines.push(`Efficiency Score: ${a.efficiency_score}/100`);
    }
    if (a.raw_output) lines.push(a.raw_output);
    if (a.optimized_code) lines.push(`\nOptimized Code:\n${a.optimized_code}`);
    if (Array.isArray(a.suggestions)) {
      lines.push(`\nSuggestions:\n${(a.suggestions as string[]).map((s) => `- ${s}`).join("\n")}`);
    } else if (a.suggestions && typeof a.suggestions === "object") {
      lines.push(`\nSuggestions:\n${JSON.stringify(a.suggestions, null, 2)}`);
    }
    return lines.join("\n");
  }

  const handleAnalyze = async () => {
    if (!code.trim()) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const currentChatId = await getOrAssignChatId();

      addMessageToChat(currentChatId, { role: "user", content: code });
      setCode("");
      let analysisText = "";

      // Always attempt the chat message request first.
      // Even if it fails, continue with submit/poll analysis.
      try {
        await apiSendWithCode(currentChatId, code, language, getCachedProjectId() ?? undefined);
      } catch (sendError) {
        console.error("Failed to send conversation message", sendError);
      }

      // Always submit + poll analysis request after sending chat message.
      const projectId = await resolveProjectId();
      const pollResult = await apiSubmitAndPollResult(code, language, projectId);
      analysisText = formatAnalysis(pollResult);

      if (!analysisText) {
        analysisText = "Analysis complete. No specific suggestions returned.";
      }

      addMessageToChat(currentChatId, { role: "assistant", content: analysisText });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Analysis failed. Please try again.";
      setError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#002a63] flex flex-col">
      {/* Top Header */}
      <header className="bg-white h-[100px] flex items-center px-6 lg:px-10 shadow-sm shrink-0">
        <div className="flex items-center justify-between w-full max-w-[1440px] mx-auto">
          <img
            src="/figmaAssets/pink-purple-gradient-modern-technology-logo--1--2.png"
            alt="Logo"
            className="w-[80px] h-[80px] object-contain"
          />
          {/* <nav className="hidden md:flex items-center gap-8">
            <Link href="/chat" className="font-semibold text-[#002a63] text-base border-b-2 border-[#df33a8]">
              Analyze
            </Link>
            <Link href="/submissions" className="font-medium text-black text-base hover:text-[#002a63] transition-colors">
              History
            </Link>
            <Link href="/projects" className="font-medium text-black text-base hover:text-[#002a63] transition-colors">
              Projects
            </Link>
          </nav> */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 rounded-full pl-1 pr-4 py-1 border border-[#e0e0e0] bg-white hover:bg-gray-50 transition-colors shadow-sm focus:outline-none">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-200"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#002a63] to-[#df33a8] flex items-center justify-center shrink-0">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-[#002a63] leading-tight truncate max-w-[120px]">
                    {user?.name ?? "Account"}
                  </p>
                  <p className="text-xs text-gray-400 truncate max-w-[120px]">
                    {user?.email ?? ""}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="pb-1">
                <p className="font-semibold text-[#002a63]">{user?.name ?? "Account"}</p>
                <p className="text-xs text-gray-400 font-normal truncate">{user?.email ?? ""}</p>
              </DropdownMenuLabel>
              {/* <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/submissions">Submission History</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/projects">My Projects</Link>
              </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-500 focus:text-red-500 cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Body: Sidebar + Main */}
      <div className="flex flex-1 overflow-hidden">
        <ChatSidebar
          chats={chats}
          activeChatId={activeChatId}
          onNewChat={handleNewChat}
          onSelectChat={setActiveChat}
          onDeleteChat={deleteChat}
        />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 lg:px-10 overflow-y-auto">
        {/* Section Title */}
        <h1
          className="font-bold text-white text-center leading-tight mb-12"
          style={{ fontSize: "34px" }}
        >
          Analyze &amp; Optimize Your Code Instantly
        </h1>

        {/* Main Card */}
        <div className="w-full max-w-[1500px] bg-white rounded-[30px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col md:flex-row min-h-[669px]">
          {/* Left: Chatbot Illustration */}
          <div className="hidden md:flex w-[328px] shrink-0 items-stretch">
            <img
              src="/figmaAssets/chat-bot-pana-1.svg"
              alt="Chat bot illustration"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Right: Form Panel */}
          <div className="flex-1 flex flex-col  px-8 md:px-10 py-10 gap-5">
            {/* Heading */}
            <div>
              <h2 className="font-semibold text-black text-2xl leading-[1.592] mb-1">
                Ready to optimize your code
              </h2>
              <p className="font-medium text-[#263238] text-base leading-[1.592]">
                Paste your code below and click Analyze
              </p>
            </div>

            {/* Language Selector */}
            <div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[155px] h-[49px] bg-[#ebebeb] rounded-[20px] shadow-[4px_4px_4px_rgba(0,0,0,0.25)] font-medium text-black text-base border-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="rust">Rust</SelectItem>
                </SelectContent>
              </Select>
            </div>

                        {/* Result output */}
{/* {activeChat && (
  <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
    {activeChat.messages.map((msg, index) => (
      <div
        key={index}
        className={`p-3 rounded-[16px] text-sm whitespace-pre-line font-medium max-w-[80%] ${
          msg.role === "user"
            ? "self-end bg-[#002a63] text-white"
            : "self-start bg-[#f0f4ff] text-[#002a63]"
        }`}
      >
        {msg.content}
      </div>
    ))}

    {isAnalyzing && (
      <div className="self-start bg-[#f0f4ff] text-[#002a63] p-3 rounded-[16px] text-sm font-medium">
        Analyzing...
      </div>
    )}
  </div>
)} */}

{activeChat && (
  <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-2 scroll-smooth">
    {activeChat.messages.map((msg, index) => {
      const isUser = msg.role === "user";
      
      return (
        <div
          key={index}
          className={`flex ${isUser ? "justify-end" : "justify-start"}`}
        >
          
          <div
            className={`
              px-4 py-3 rounded-2xl text-sm whitespace-pre-line font-medium
              max-w-[75%] leading-relaxed shadow-sm
              transition-all duration-300 ease-in-out
              ${isUser
                ? "bg-gradient-to-r from-[#002a63] to-[#df33a8] text-white rounded-br-md"
                : "bg-[#f0f4ff] text-[#002a63] rounded-bl-md border border-[#002a63]/10"}
            `}
          >
            {msg.content}
          </div>
        </div>
      );
    })}

    {/* Loading bubble */}
    {isAnalyzing && (
      <div className="flex justify-start">
        <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-[#f0f4ff] text-[#002a63] text-sm font-medium shadow-sm border border-[#002a63]/10 animate-pulse">
          Analyzing...
        </div>
      </div>
    )}

    {/* scroll target */}
    <div ref={messagesEndRef} />
  </div>
)}


            {/* Textarea Container */}
            <div className="relative w-full bg-[#ebebeb] rounded-[20px] shadow-[4px_4px_4px_rgba(0,0,0,0.25)]" style={{ minHeight: "224px" }}>
              <textarea
                ref={textareaRef}
                className="w-full bg-transparent rounded-[20px] p-4 pb-14 resize-none outline-none font-semibold text-black text-base"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAnalyze();
    }
  }}
                placeholder="Paste your code here for analysis . . ."
              />
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".js,.ts,.py,.java,.cpp,.c,.cs,.go,.rs,.php,.rb,.swift,.kt,.txt"
                onChange={handleFileAttach}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile}
                className="absolute bottom-3 left-3 flex items-center gap-2 bg-[#002a63] text-white font-medium text-base rounded-[20px] shadow-[4px_4px_4px_rgba(0,0,0,0.25)] px-4 h-[44px] disabled:opacity-60"
              >
                <PaperclipIcon className="w-[15px] h-[15px]" />
                {uploadingFile ? "Uploading…" : "Attach"}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-[16px] p-4 text-red-600 text-sm font-medium">
                {error}
              </div>
            )}


            {/* Analyze Code Button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || isLoadingChats || !code.trim()}
              className="w-full h-[62px] rounded-[10px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] bg-gradient-to-r from-[#002a63] to-[#df33a8] font-semibold text-white text-base flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-90 transition-opacity"
            >
              <SendIcon className="w-5 h-5" />
              {isLoadingChats
                ? "Loading chats…"
                : isAnalyzing
                ? "Analyzing… this may take a moment"
                : "Analyze Code"}
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* Footer */}
      <div className="bg-white h-[100px] flex items-center px-6 lg:px-10 shadow-sm">
        <div className="flex items-center justify-between w-full max-w-[1440px] mx-auto">
          <img
            src="/figmaAssets/pink-purple-gradient-modern-technology-logo--1--2.png"
            alt="Logo"
            className="w-[80px] h-[80px] object-contain"
          />
          <nav className="flex items-center gap-6 md:gap-10 flex-wrap justify-center">
            {["Home", "Features", "About Us", "Blog"].map((item) => (
              <a
                key={item}
                href="#"
                className="font-medium text-black text-sm md:text-base hover:text-[#002a63] transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>
          <p className="text-sm text-gray-400 hidden md:block">
            © 2025 All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}

