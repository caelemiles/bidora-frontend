"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Send, MoreVertical, Archive, Trash2, CheckCircle2 } from "lucide-react";

export default function ChatPage() {
  const params = useParams();
  const chatId = params.id as string;
  const [messages, setMessages] = useState<
    { id: string; text: string; sender: string; time: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [dealCompleted, setDealCompleted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        text: trimmed,
        sender: "me",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-5rem)]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/chats" className="text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium line-clamp-1">
                Deal Chat #{chatId}
              </p>
              <span className="text-[10px] text-gray-400">
                {dealCompleted ? "Deal Complete" : "Active Deal"}
              </span>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <MoreVertical size={18} className="text-gray-500" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white shadow-lg border border-gray-100 py-1 z-20">
                {!dealCompleted && (
                  <button
                    onClick={() => {
                      setDealCompleted(true);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-emerald-600 hover:bg-gray-50"
                  >
                    <CheckCircle2 size={16} />
                    Deal Complete
                  </button>
                )}
                <button
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                >
                  <Archive size={16} />
                  Archive Chat
                </button>
                <button
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-gray-50"
                >
                  <Trash2 size={16} />
                  Delete Chat
                </button>
              </div>
            )}
          </div>
        </div>

        {dealCompleted && (
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
              <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
              <p className="text-xs text-emerald-700 font-medium">
                You marked this deal as complete. Waiting for the other party to
                confirm.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-gray-400 text-sm">No messages yet</p>
            <p className="text-gray-300 text-xs mt-1">
              Start the conversation about this deal
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === "me" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-[75%] px-4 py-2.5 text-sm ${
                msg.sender === "me"
                  ? "bg-indigo-600 text-white rounded-2xl rounded-br-md"
                  : "bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md"
              }`}
            >
              {msg.text}
            </div>
            <span className="text-xs text-gray-400 mt-1">{msg.time}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 rounded-full bg-gray-100 px-4 py-2.5 text-sm outline-none placeholder:text-gray-400"
        />
        <button
          onClick={handleSend}
          className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 active:bg-indigo-700 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
