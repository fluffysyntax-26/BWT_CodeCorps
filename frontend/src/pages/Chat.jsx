import React, { useState, useRef, useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useApi } from "../services/api";
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  ShieldCheck, 
  HelpCircle, 
  Share2, 
  Paperclip, 
  ArrowUp,
  AlertTriangle,
  Shield
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";

// Component to handle the typing effect for AI messages
const TypingMessage = ({ content, onComplete }) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    // Reset if content changes
    setDisplayedContent("");
    indexRef.current = 0;

    const intervalId = setInterval(() => {
      if (indexRef.current < content.length) {
        setDisplayedContent((prev) => prev + content.charAt(indexRef.current));
        indexRef.current++;
      } else {
        clearInterval(intervalId);
        if (onComplete) onComplete();
      }
    }, 10); // Faster typing speed

    return () => clearInterval(intervalId);
  }, [content]);

  return (
    <div className="prose prose-invert prose-sm max-w-none font-sans text-slate-300 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ node, ...props }) => (
            <p className="mb-2 last:mb-0" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc ml-4 mb-2 space-y-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal ml-4 mb-2 space-y-1" {...props} />
          ),
          li: ({ node, ...props }) => <li className="" {...props} />,
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-white" {...props} />
          ),
        }}
      >
        {displayedContent}
      </ReactMarkdown>
    </div>
  );
};

// Mock Suspicious Activity Card for visual demo
const SuspiciousActivityCard = () => (
  <div className="mt-4 mb-2 bg-red-950/30 border border-red-900/50 rounded-xl p-4 relative overflow-hidden">
    <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
    <div className="flex justify-between items-start mb-2">
      <span className="text-[10px] font-bold tracking-widest text-red-500 uppercase">SUSPICIOUS ACTIVITY</span>
      <span className="text-white font-bold">$124.99</span>
    </div>
    <h4 className="text-lg font-bold text-white mb-1">CLOUD-SRV-992</h4>
    <div className="flex items-center gap-2 text-red-400 text-xs">
      <AlertTriangle size={12} />
      <span>Flagged: First time merchant for this account.</span>
    </div>
  </div>
);

const Chat = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const api = useApi(getToken);

  // Initial welcome message
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content: `Hello ${user?.firstName || "there"}! I've analyzed your recent transactions. How can I help you ensure your financial safety today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isTyping: false,
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle sending a message
  const onSend = async () => {
    if (!input.trim()) return;

    const userMsg = { 
      role: "user", 
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await api.sendMessage(input);
      const aiReply = res.data.reply;

      setMessages((prev) => [
        ...prev,
        { 
          role: "ai", 
          content: aiReply, 
          isTyping: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "I'm having trouble connecting to my financial engine right now. Please try again in a moment.",
          isTyping: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypingComplete = (index) => {
    setMessages((prev) =>
      prev.map((msg, i) => (i === index ? { ...msg, isTyping: false } : msg)),
    );
  };

  // Helper to detect if we should show the suspicious activity mock
  const isSuspiciousContext = (text) => {
    return text.toLowerCase().includes("suspicious") || text.toLowerCase().includes("unusual activity");
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-80px)] flex flex-col font-sans">
      {/* Header */}
      <header className="flex items-center justify-between py-4 px-6 border-b border-slate-800 bg-slate-950">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">Financial Safety Assistant</h1>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-500">Verified Secure</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-slate-400 hover:text-white transition-colors">
            <HelpCircle size={20} />
          </button>
          <button className="text-slate-400 hover:text-white transition-colors">
            <Share2 size={20} />
          </button>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2">
            <ArrowUp size={16} className="rotate-45" />
            Evaluate
          </button>
        </div>
      </header>

      {/* Trust Banner */}
      <div className="bg-slate-900 border-b border-slate-800 py-2 px-6 flex items-center justify-center gap-2">
        <Shield size={14} className="text-indigo-400" />
        <p className="text-xs font-medium text-slate-400">
          Grounded in your real-time financial data for maximum accuracy.
        </p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-950 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "ai" && (
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-900/20">
                <Bot size={20} className="text-white" />
              </div>
            )}

            <div className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"} max-w-[80%]`}>
              <div className="flex items-center gap-2 mb-1.5 px-1">
                <span className="text-sm font-bold text-white">
                  {m.role === "ai" ? "FinGuard Assistant" : "You"}
                </span>
                <span className="text-xs text-slate-500">{m.timestamp}</span>
              </div>

              <div
                className={`p-5 rounded-2xl shadow-sm ${
                  m.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-sm"
                    : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm"
                }`}
              >
                {m.role === "user" ? (
                  <p className="leading-relaxed">{m.content}</p>
                ) : (
                  <>
                    {m.isTyping ? (
                      <TypingMessage
                        content={m.content}
                        onComplete={() => handleTypingComplete(i)}
                      />
                    ) : (
                      <div className="prose prose-invert prose-sm max-w-none font-sans text-slate-300 leading-relaxed">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                            strong: ({ node, ...props }) => <strong className="text-white font-bold" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-3 space-y-1" {...props} />,
                            li: ({ node, ...props }) => <li {...props} />,
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    )}

                    {/* Conditional Mock for Suspicious Activity */}
                    {!m.isTyping && isSuspiciousContext(m.content) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ delay: 0.2 }}
                      >
                        <SuspiciousActivityCard />
                        <div className="flex gap-3 mt-4">
                          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg border border-slate-700 transition-colors">
                            Yes, I recognize this
                          </button>
                          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-lg shadow-red-900/20 transition-colors">
                            No, block transaction
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            </div>

            {m.role === "user" && (
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
                <User size={20} className="text-slate-400" />
              </div>
            )}
          </motion.div>
        ))}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4 justify-start"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-900/20">
              <Bot size={20} className="text-white" />
            </div>
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 mb-1.5 px-1">
                <span className="text-sm font-bold text-white">FinGuard Assistant</span>
                <span className="text-xs text-slate-500">Typing...</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-slate-950">
        <div className="max-w-4xl mx-auto relative">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex items-center p-2 pl-4 shadow-xl focus-within:border-indigo-500/50 transition-colors">
            <button className="text-slate-500 hover:text-white transition-colors mr-3">
              <Paperclip size={20} />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !isLoading && onSend()}
              placeholder="Type your financial question..."
              disabled={isLoading}
              className="flex-1 bg-transparent text-white placeholder:text-slate-500 outline-none py-3"
            />
            <button
              onClick={onSend}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:hover:bg-indigo-600 text-white ml-2"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
          <div className="flex justify-center items-center gap-2 mt-4 text-slate-500">
            <ShieldCheck size={12} className="text-slate-600" />
            <p className="text-[10px] font-medium tracking-wide">
              <span className="font-bold text-slate-400">SAFETY FIRST:</span> Assistant will never ask for your full password or PIN. Conversations are encrypted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
