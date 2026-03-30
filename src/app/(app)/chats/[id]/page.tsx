"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import AdBanner from "@/components/AdBanner";

const LISTING = {
  title: "Vintage Mechanical Keyboard",
  otherUser: "RetroTech",
};

const MOCK_MESSAGES = [
  { id: "1", text: "Hi! Is this item still available?", sender: "other", time: "2:30 PM" },
  { id: "2", text: "Yes it is! Are you interested?", sender: "me", time: "2:31 PM" },
  { id: "3", text: "Definitely! What condition is it in?", sender: "other", time: "2:33 PM" },
  { id: "4", text: "It's in excellent condition, barely used. I can send more photos if you'd like.", sender: "me", time: "2:35 PM" },
  { id: "5", text: "That would be great, thanks!", sender: "other", time: "2:36 PM" },
];

export default function ChatPage() {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState("");
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
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium line-clamp-1">{LISTING.title}</p>
              <p className="text-xs text-gray-400">{LISTING.otherUser}</p>
            </div>
          </div>
        </div>

        {/* Listing context bar */}
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 shrink-0" />
            <p className="text-xs text-gray-600 font-medium line-clamp-1 flex-1">
              {LISTING.title}
            </p>
            <Link
              href="/listings/1"
              className="text-xs text-indigo-600 font-medium whitespace-nowrap"
            >
              View Listing
            </Link>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "me" ? "items-end" : "items-start"}`}
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

      {/* Ad banner above input */}
      <div className="px-4 py-1">
        <AdBanner className="py-2 text-[10px]" />
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
