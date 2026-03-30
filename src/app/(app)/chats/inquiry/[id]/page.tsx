"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Send, MoreVertical, Archive, Trash2, XCircle } from "lucide-react";

export default function InquiryChatPage() {
  const params = useParams();
  const listingId = params.id as string;
  const [messages, setMessages] = useState<
    { id: string; text: string; sender: string; time: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [inquiryClosed, setInquiryClosed] = useState(false);
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
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium line-clamp-1">
                  Inquiry #{listingId}
                </p>
                <span className="shrink-0 rounded-full bg-indigo-100 text-indigo-700 px-2 py-0.5 text-[10px] font-semibold">
                  Inquiry
                </span>
              </div>
              <span className="text-[10px] text-gray-400">
                {inquiryClosed ? "Closed" : "Active"}
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
                {!inquiryClosed && (
                  <button
                    onClick={() => {
                      setInquiryClosed(true);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-amber-600 hover:bg-gray-50"
                  >
                    <XCircle size={16} />
                    Close Inquiry
                  </button>
                )}
                <button
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                >
                  <Archive size={16} />
                  Archive Inquiry
                </button>
                <button
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-gray-50"
                >
                  <Trash2 size={16} />
                  Delete Inquiry
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Listing context bar */}
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 shrink-0" />
            <p className="text-xs text-gray-600 font-medium line-clamp-1 flex-1">
              Listing #{listingId}
            </p>
            <Link
              href={`/listings/${listingId}`}
              className="text-xs text-indigo-600 font-medium whitespace-nowrap"
            >
              View Listing
            </Link>
          </div>
        </div>

        {inquiryClosed && (
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
              <XCircle size={14} className="text-amber-600 shrink-0" />
              <p className="text-xs text-amber-700 font-medium">
                You closed this inquiry. Waiting for the other party to close as
                well.
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
              Ask the seller about this listing
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
