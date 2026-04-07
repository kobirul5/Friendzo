"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  Circle,
  LoaderCircle,
  MessageCircleMore,
  Phone,
  Search,
  Send,
  Video,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLiveMessages } from "@/components/use-live-messages";

type MessageItem = {
  id: string;
  text: string;
  time: string;
  sender: "me" | "them";
};

type ConversationItem = {
  id: string;
  name: string;
  handle: string;
  role: string;
  active: boolean;
  lastSeen: string;
  preview: string;
  unreadCount: number;
  accent: string;
  profileImage?: string | null;
  messages: MessageItem[];
};

type MessagesPageClientProps = {
  accessToken: string | null;
  currentUserId: string | null;
  socketUrl: string;
};

export default function MessagesPageClient({
  accessToken,
  currentUserId,
  socketUrl,
}: MessagesPageClientProps) {
  const searchParams = useSearchParams();
  const [searchText, setSearchText] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [draftMessage, setDraftMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const activeUsersScrollRef = useRef<HTMLDivElement | null>(null);
  const isDraggingActiveUsersRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const { status: socketStatus, socket, conversations: liveConversations, messagesById } =
    useLiveMessages({
      accessToken,
      currentUserId,
      socketUrl,
    });
  const requestedConversationId = searchParams.get("friendId") || "";
  const requestedConversationName = searchParams.get("friendName") || "New friend";

  const filteredConversations = useMemo(() => {
    const value = searchText.trim().toLowerCase();

    if (!value) {
      return liveConversations;
    }

    return liveConversations.filter((conversation) =>
      [conversation.name, conversation.handle, conversation.role, conversation.preview]
        .join(" ")
        .toLowerCase()
        .includes(value)
    );
  }, [liveConversations, searchText]);

  const requestedConversation =
    requestedConversationId && selectedConversationId === requestedConversationId
      ? {
        id: requestedConversationId,
        name: requestedConversationName,
        handle: requestedConversationId ? `@${requestedConversationId.slice(-6)}` : "@friendzo",
        role: "Friendzo chat",
        active: false,
        lastSeen: "Start a new conversation",
        preview: "Send a message to start chatting",
        unreadCount: 0,
        accent: "from-sky-300 via-cyan-200 to-blue-100",
        profileImage: null,
      }
      : null;

  const selectedConversation =
    filteredConversations.find((conversation) => conversation.id === selectedConversationId) ??
    requestedConversation ??
    filteredConversations[0] ??
    null;
  const activeConversations = filteredConversations.filter((conversation) => conversation.active);
  const selectedMessages = (selectedConversationId ? messagesById[selectedConversationId] : null) ?? [];

  useEffect(() => {
    if (requestedConversationId) {
      setSelectedConversationId(requestedConversationId);
      return;
    }

    if (!selectedConversationId && filteredConversations[0]?.id) {
      setSelectedConversationId(filteredConversations[0].id);
    }
  }, [filteredConversations, requestedConversationId, selectedConversationId]);

  const handleActiveUsersWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const container = activeUsersScrollRef.current;

    if (!container) {
      return;
    }

    if (Math.abs(event.deltaY) >= Math.abs(event.deltaX)) {
      event.preventDefault();
      container.scrollLeft += event.deltaY;
    }
  };

  const handleActiveUsersPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const container = activeUsersScrollRef.current;

    if (!container) {
      return;
    }

    isDraggingActiveUsersRef.current = true;
    dragStartXRef.current = event.clientX;
    dragStartScrollLeftRef.current = container.scrollLeft;
    container.setPointerCapture(event.pointerId);
  };

  const handleActiveUsersPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const container = activeUsersScrollRef.current;

    if (!container || !isDraggingActiveUsersRef.current) {
      return;
    }

    const deltaX = event.clientX - dragStartXRef.current;
    container.scrollLeft = dragStartScrollLeftRef.current - deltaX;
  };

  const handleActiveUsersPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const container = activeUsersScrollRef.current;

    if (!container) {
      return;
    }

    isDraggingActiveUsersRef.current = false;

    if (container.hasPointerCapture(event.pointerId)) {
      container.releasePointerCapture(event.pointerId);
    }
  };

  const handleSendMessage = () => {
    if (!socket || socketStatus !== "connected" || !selectedConversationId || !draftMessage.trim()) {
      return;
    }

    setIsSendingMessage(true);
    socket.send(
      JSON.stringify({
        event: "message",
        receiverId: selectedConversationId,
        message: draftMessage.trim(),
        images: [],
      })
    );
    setDraftMessage("");
    setTimeout(() => setIsSendingMessage(false), 300);
  };

  useEffect(() => {
    if (!socket || socketStatus !== "connected" || !selectedConversationId) {
      return;
    }

    socket.send(
      JSON.stringify({
        event: "fetchChats",
        receiverId: selectedConversationId,
      })
    );
  }, [selectedConversationId, socket, socketStatus]);

  if (!accessToken) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_left,#fff4e8_0%,#f6eadf_28%,#eadfd4_55%,#e0d5cb_100%)]">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center justify-center px-4 py-10">
          <div className="w-full rounded-[2rem] border border-white/70 bg-white/85 p-8 text-center shadow-[0_30px_90px_-50px_rgba(88,70,52,0.42)] backdrop-blur-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MessageCircleMore className="h-8 w-8" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold text-foreground">Login required</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Please log in to use live messaging.
            </p>
            <Button asChild className="mt-6 rounded-full px-6">
              <Link href="/login">Go to login</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="h-[calc(100vh-4rem)] overflow-hidden bg-[radial-gradient(circle_at_top_left,#fff4e8_0%,#f6eadf_28%,#eadfd4_55%,#e0d5cb_100%)]">
      <div className="mx-auto flex h-full w-full max-w-[1600px] flex-col overflow-hidden px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid flex-1 gap-5 overflow-hidden lg:min-h-0 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/78 shadow-[0_30px_90px_-50px_rgba(88,70,52,0.42)] backdrop-blur-md lg:flex lg:min-h-0 lg:flex-col">
            <div className="border-b border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(250,243,236,0.9))] p-5">
            
              <div className="mt-5 rounded-[1.5rem] border border-border/70 bg-white/90 p-2 shadow-sm">
                <div className="flex items-center gap-3 rounded-[1rem] px-3 py-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder="Search active user or conversation"
                    className="h-auto border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between px-1 text-xs text-muted-foreground">
                <span>
                  {socketStatus === "connected"
                    ? "Live chat connected"
                    : socketStatus === "connecting"
                      ? "Connecting to socket..."
                      : "Socket disconnected"}
                </span>
                <span
                  className={`rounded-full px-2 py-1 font-semibold ${socketStatus === "connected"
                      ? "bg-green-100 text-green-700"
                      : socketStatus === "connecting"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                    }`}
                >
                  {socketStatus}
                </span>
              </div>

              <div className="mt-4">


                <div
                  ref={activeUsersScrollRef}
                  onWheel={handleActiveUsersWheel}
                  onPointerDown={handleActiveUsersPointerDown}
                  onPointerMove={handleActiveUsersPointerMove}
                  onPointerUp={handleActiveUsersPointerUp}
                  onPointerCancel={handleActiveUsersPointerUp}
                  className="-mx-1 overflow-x-auto py-2 select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing"
                >
                  {activeConversations.length ? (
                    <div className="flex min-w-max gap-3 px-1">
                      {activeConversations.map((conversation) => {
                        const isSelected = selectedConversation?.id === conversation.id;

                        return (
                          <button
                            key={conversation.id}
                            type="button"
                            onClick={() => setSelectedConversationId(conversation.id)}
                            className="flex w-[88px] shrink-0 flex-col items-center gap-2 text-center"
                          >
                            <div
                              className={`relative h-[52px] w-[52px] transition-all ${isSelected
                                  ? "scale-[1.03] ring-4 ring-primary/25"
                                  : "ring-2 ring-transparent"
                                }`}
                            >
                              {conversation.profileImage ? (
                                <img
                                  src={conversation.profileImage}
                                  alt={conversation.name}
                                  className="h-[52px] w-[52px] rounded-full object-cover"
                                />
                              ) : (
                                <div
                                  className={`flex h-[52px] w-[52px] items-center justify-center rounded-full bg-gradient-to-br ${conversation.accent} text-sm font-semibold text-slate-800`}
                                >
                                  {conversation.name
                                    .split(" ")
                                    .filter(Boolean)
                                    .slice(0, 2)
                                    .map((part) => part[0]?.toUpperCase())
                                    .join("")}
                                </div>
                              )}
                              <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
                            </div>
                            <span className="line-clamp-2 text-xs font-medium leading-4 text-foreground">
                              {conversation.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="px-1 text-xs text-muted-foreground">
                      No active user matched your search.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3 overflow-y-auto p-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden lg:min-h-0 lg:flex-1">
              {filteredConversations.length ? (
                filteredConversations.map((conversation) => {
                  const initials = conversation.name
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase())
                    .join("");
                  const isSelected = selectedConversation?.id === conversation.id;

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => setSelectedConversationId(conversation.id)}
                      className={`w-full rounded-[1.6rem] border p-4 text-left transition-all ${isSelected
                          ? "border-primary/25 bg-primary/8 shadow-[0_18px_40px_-30px_rgba(88,70,52,0.45)]"
                          : "border-transparent bg-white/70 hover:border-border/70 hover:bg-white"
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative h-14 w-14 shrink-0">
                          {conversation.profileImage ? (
                            <img
                              src={conversation.profileImage}
                              alt={conversation.name}
                              className="h-14 w-14 rounded-full object-cover"
                            />
                          ) : (
                            <div
                              className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${conversation.accent} text-sm font-semibold text-slate-800`}
                            >
                              {initials || "F"}
                            </div>
                          )}
                          <span
                            className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${conversation.active ? "bg-green-500" : "bg-slate-300"
                              }`}
                          />
                        </div>

                        <div className="min-w-0 flex-1 ">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {conversation.name}
                              </p>
                            </div>
                            {conversation.unreadCount ? (
                              <span className="rounded-full bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground">
                                {conversation.unreadCount}
                              </span>
                            ) : null}
                          </div>

                          <p className=" truncate text-sm text-muted-foreground">
                            {conversation.preview}
                          </p>
                          
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-[1.6rem] border border-dashed border-border bg-white/70 p-6 text-center">
                  <p className="text-sm font-semibold text-foreground">No conversation found</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Try another name, handle, or keyword.
                  </p>
                </div>
              )}
            </div>
          </aside>

          <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/82 shadow-[0_30px_90px_-50px_rgba(88,70,52,0.42)] backdrop-blur-md lg:flex lg:min-h-0 lg:flex-col">
            {selectedConversation ? (
              <div className="flex h-full min-h-0 flex-col lg:min-h-0">
                <div className="border-b border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,239,232,0.92))] px-5 py-5 sm:px-6">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 shrink-0">
                        {selectedConversation.profileImage ? (
                          <img
                            src={selectedConversation.profileImage}
                            alt={selectedConversation.name}
                            className="h-16 w-16 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${selectedConversation.accent} text-base font-semibold text-slate-800`}
                          >
                            {selectedConversation.name
                              .split(" ")
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((part) => part[0]?.toUpperCase())
                              .join("")}
                          </div>
                        )}
                        <span
                          className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white ${selectedConversation.active ? "bg-green-500" : "bg-slate-300"
                            }`}
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-semibold text-foreground">
                            {selectedConversation.name}
                          </h2>
                          <Circle
                            className={`h-3 w-3 fill-current ${selectedConversation.active ? "text-green-500" : "text-slate-300"
                              }`}
                          />
                        </div>
                       
                        <p className="mt-1 text-xs font-medium text-muted-foreground/90">
                          {selectedConversation.lastSeen}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" className="rounded-full bg-white/80">
                        <Phone className="h-4 w-4" />
                        Audio call
                      </Button>
                      <Button type="button" variant="outline" className="rounded-full bg-white/80">
                        <Video className="h-4 w-4" />
                        Video
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden bg-[linear-gradient(180deg,rgba(250,246,241,0.96),rgba(244,236,229,0.92))] p-4 sm:p-6 lg:min-h-0">
                  <div className="mx-auto flex h-full min-h-0 max-w-4xl flex-col lg:min-h-0">
                   
                    <div className="flex-1 space-y-4 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden lg:min-h-0">
                      {selectedMessages.length ? (
                        selectedMessages.map((message) => {
                          const isMe = message.sender === "me";
                          const otherUser = liveConversations.find(
                            (c) => c.id === selectedConversationId
                          );

                          return (
                            <div
                              key={message.id}
                              className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                            >
                              {!isMe && (
                                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full">
                                  {otherUser?.profileImage ? (
                                    <img
                                      src={otherUser.profileImage}
                                      alt={otherUser.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${otherUser?.accent || "from-sky-300 to-blue-100"} text-[10px] font-semibold text-slate-800`}>
                                      {otherUser?.name
                                        .split(" ")
                                        .filter(Boolean)
                                        .slice(0, 1)
                                        .map((p) => p[0]?.toUpperCase())
                                        .join("") || "?"}
                                    </div>
                                  )}
                                </div>
                              )}
                              <div
                                className={`max-w-[85%] rounded-[1.6rem] px-4 py-3 shadow-sm sm:max-w-[70%] ${isMe
                                    ? "bg-primary text-primary-foreground"
                                    : "border border-white/70 bg-white text-foreground"
                                  }`}
                              >
                                <p className="text-sm leading-6">{message.text}</p>
                                <p
                                  className={` text-[11px] font-medium ${isMe
                                      ? "text-primary-foreground/80"
                                      : "text-muted-foreground"
                                    }`}
                                >
                                  {message.time}
                                </p>
                              </div>
                              {isMe && (
                                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full">
                                  {/* Your profile image could go here if you have it */}
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/40 to-primary/20 text-[10px] font-semibold text-primary">
                                    You
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex h-full min-h-[220px] items-center justify-center rounded-[1.6rem] border border-dashed border-border/70 bg-white/70 p-6 text-center text-sm text-muted-foreground">
                          No messages yet. Send the first message to start this conversation.
                        </div>
                      )}
                    </div>

                    <div className="mt-5 rounded-[1.75rem] border border-white/70 bg-white/90 p-3 shadow-[0_20px_45px_-35px_rgba(88,70,52,0.45)]">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Input
                          value={draftMessage}
                          onChange={(event) => setDraftMessage(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          placeholder="Write a live message..."
                          className="h-12 flex-1 rounded-full border-border/70 bg-muted/15 px-5"
                        />
                        <Button
                          type="button"
                          onClick={handleSendMessage}
                          disabled={!draftMessage.trim() || socketStatus !== "connected" || isSendingMessage}
                          className="h-12 rounded-full px-6 text-sm font-semibold"
                        >
                          {isSendingMessage ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                          Send message
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[520px] items-center justify-center p-6">
                <div className="max-w-md rounded-[2rem] border border-dashed border-border/80 bg-white/80 p-8 text-center shadow-sm">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MessageCircleMore className="h-8 w-8" />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold text-foreground">
                    Pick a conversation
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Select any active user from the left to open the full conversation here.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
