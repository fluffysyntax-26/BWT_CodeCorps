import React, { useState, useRef, useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useApi } from "../services/api";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
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
    }, 15); // Adjust typing speed here (lower is faster)

    return () => clearInterval(intervalId);
  }, [content]);

  return (
    <div className="prose prose-invert prose-sm max-w-none font-mono text-white">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ node, ...props }) => (
            <p className="mb-2 last:mb-0 animate-fade-in" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc ml-4 mb-2 animate-fade-in" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal ml-4 mb-2 animate-fade-in" {...props} />
          ),
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-blue-300" {...props} />
          ),
        }}
      >
        {displayedContent}
      </ReactMarkdown>
    </div>
  );
};

const Chat = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const api = useApi(getToken);

  // Initial welcome message
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content: `Hello ${user?.firstName || "there"}! I'm your FinGuard assistant. I can help analyze your spending, explain financial risks, or provide tips based on your profile. How can I help you today?`,
      isTyping: false, // Initial message is already "typed"
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

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await api.sendMessage(input);
      const aiReply = res.data.reply;

      setMessages((prev) => [
        ...prev,
        { role: "ai", content: aiReply, isTyping: true },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "I'm having trouble connecting to my financial engine right now. Please try again in a moment.",
          isTyping: true,
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

  return (
    <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-100px)] flex flex-col">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center gap-3">
          <Sparkles className="w-6 h-6 text-purple-400" />
          AI Financial Assistant
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Powered by Gemini 2.5 • Context-Aware Financial Guidance
        </p>
      </header>

      <div className="flex-1 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "ai" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-blue-500/20">
                  <Bot size={16} className="text-white" />
                </div>
              )}

              <div
                className={`max-w-[85%] p-4 rounded-2xl shadow-md ${
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700"
                }`}
              >
                {m.role === "user" ? (
                  <p>{m.content}</p>
                ) : m.isTyping ? (
                  <TypingMessage
                    content={m.content}
                    onComplete={() => handleTypingComplete(i)}
                  />
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none font-mono">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ node, ...props }) => (
                          <p className="mb-2 last:mb-0" {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul className="list-disc ml-4 mb-2" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol className="list-decimal ml-4 mb-2" {...props} />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="mb-1" {...props} />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong
                            className="font-bold text-blue-300"
                            {...props}
                          />
                        ),
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {m.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
                  <User size={16} className="text-slate-300" />
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
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-blue-500/20">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-700 flex items-center gap-2">
                <div
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </motion.div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-950/80 backdrop-blur border-t border-slate-800">
          <div className="flex gap-3 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !isLoading && onSend()}
              placeholder="Ask about your financial safety..."
              disabled={isLoading}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl pl-5 pr-12 py-4 text-white placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
            />
            <button
              onClick={onSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-2 p-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600 text-white shadow-lg shadow-blue-600/20"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
          <p className="text-center text-xs text-slate-600 mt-3">
            FinGuard AI can make mistakes. Please double-check important
            financial information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
