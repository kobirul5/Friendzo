"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Circle,
  MessageCircleMore,
  Phone,
  Search,
  Send,
  Video,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  messages: MessageItem[];
};

const conversations: ConversationItem[] = [
  {
    id: "ariana",
    name: "Ariana Sen",
    handle: "@ariana.sen",
    role: "Photo curator",
    active: true,
    lastSeen: "Active 1m ago",
    preview: "Golden hour e meet korle lighting best hobe.",
    unreadCount: 2,
    accent: "from-amber-300 via-orange-200 to-yellow-100",
    messages: [
      { id: "a1", text: "Golden hour e meet korle lighting best hobe.", time: "8:12 PM", sender: "them" },
      { id: "a2", text: "Nice, ami location final kore dei.", time: "8:16 PM", sender: "me" },
    ],
  },
  {
    id: "nabil",
    name: "Nabil Khan",
    handle: "@nabil.khan",
    role: "Event volunteer",
    active: true,
    lastSeen: "Active 5m ago",
    preview: "Volunteer badge print hoye geche.",
    unreadCount: 1,
    accent: "from-emerald-300 via-teal-200 to-cyan-100",
    messages: [
      { id: "n1", text: "Volunteer badge print hoye geche.", time: "6:30 PM", sender: "them" },
      { id: "n2", text: "Awesome, kalke desk e niye esho.", time: "6:33 PM", sender: "me" },
    ],
  },
  {
    id: "maya",
    name: "Maya Noor",
    handle: "@maya.noor",
    role: "Travel storyteller",
    active: true,
    lastSeen: "Active now",
    preview: "Ami kalke event venue ta final korte chai.",
    unreadCount: 2,
    accent: "from-rose-300 via-orange-200 to-amber-100",
    messages: [
      { id: "m1", text: "Hi! tomar memory post ta khub sundor lagse.", time: "9:12 PM", sender: "them" },
      { id: "m2", text: "Thank you! tumi ki event e ashba?", time: "9:14 PM", sender: "me" },
      { id: "m3", text: "Ami kalke event venue ta final korte chai.", time: "9:16 PM", sender: "them" },
      { id: "m4", text: "Perfect, tumi location pathao. ami map check kore nei.", time: "9:18 PM", sender: "me" },
    ],
  },
  {
    id: "rafi",
    name: "Rafi Ahmed",
    handle: "@rafi.ahmed",
    role: "Weekend planner",
    active: true,
    lastSeen: "Active 3m ago",
    preview: "Sunday ride er jonno sobai ready.",
    unreadCount: 0,
    accent: "from-sky-300 via-cyan-200 to-blue-100",
    messages: [
      { id: "r1", text: "Sunday ride er jonno sobai ready.", time: "7:42 PM", sender: "them" },
      { id: "r2", text: "Nice, start point ta group e diye dio.", time: "7:45 PM", sender: "me" },
      { id: "r3", text: "Dhanmondi 8 number er pashe meetup.", time: "7:47 PM", sender: "them" },
    ],
  },
  {
    id: "sadia",
    name: "Sadia Noor",
    handle: "@sadia.noor",
    role: "Food meetup host",
    active: true,
    lastSeen: "Active 2m ago",
    preview: "Cafe shortlist ta ami pathacchi.",
    unreadCount: 1,
    accent: "from-pink-300 via-rose-200 to-orange-100",
    messages: [
      { id: "s1", text: "Cafe shortlist ta ami pathacchi.", time: "5:10 PM", sender: "them" },
      { id: "s2", text: "Perfect, amra ekhanei final korte pari.", time: "5:13 PM", sender: "me" },
    ],
  },
  {
    id: "fahim",
    name: "Fahim Rahman",
    handle: "@fahim.r",
    role: "Ride coordinator",
    active: true,
    lastSeen: "Active now",
    preview: "Helmet niye aste bhulo na.",
    unreadCount: 0,
    accent: "from-indigo-300 via-blue-200 to-cyan-100",
    messages: [
      { id: "f1", text: "Helmet niye aste bhulo na.", time: "3:48 PM", sender: "them" },
      { id: "f2", text: "Sure, sobai ke remind kore dibo.", time: "3:50 PM", sender: "me" },
    ],
  },
  {
    id: "lamia",
    name: "Lamia Tasnim",
    handle: "@lamia.t",
    role: "Memory collector",
    active: false,
    lastSeen: "Last seen 28m ago",
    preview: "Photo album ta share korbo rato rate.",
    unreadCount: 1,
    accent: "from-emerald-300 via-lime-200 to-green-100",
    messages: [
      { id: "l1", text: "Photo album ta share korbo rato rate.", time: "6:08 PM", sender: "them" },
      { id: "l2", text: "Share korle ami caption likhe dibo.", time: "6:10 PM", sender: "me" },
    ],
  },
  {
    id: "tanvir",
    name: "Tanvir Joy",
    handle: "@tanvir.joy",
    role: "Community host",
    active: false,
    lastSeen: "Last seen 1h ago",
    preview: "Volunteer list almost done.",
    unreadCount: 0,
    accent: "from-violet-300 via-fuchsia-200 to-pink-100",
    messages: [
      { id: "t1", text: "Volunteer list almost done.", time: "4:21 PM", sender: "them" },
      { id: "t2", text: "Great, final names gula amake dio.", time: "4:26 PM", sender: "me" },
    ],
  },
];

export default function MessagesPageClient() {
  const [searchText, setSearchText] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState(conversations[0]?.id ?? "");
  const activeUsersScrollRef = useRef<HTMLDivElement | null>(null);
  const isDraggingActiveUsersRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);

  const filteredConversations = useMemo(() => {
    const value = searchText.trim().toLowerCase();

    if (!value) {
      return conversations;
    }

    return conversations.filter((conversation) =>
      [conversation.name, conversation.handle, conversation.role, conversation.preview]
        .join(" ")
        .toLowerCase()
        .includes(value)
    );
  }, [searchText]);

  const selectedConversation =
    filteredConversations.find((conversation) => conversation.id === selectedConversationId) ??
    filteredConversations[0] ??
    null;
  const activeConversations = filteredConversations.filter((conversation) => conversation.active);

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

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_left,#fff4e8_0%,#f6eadf_28%,#eadfd4_55%,#e0d5cb_100%)]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[1600px] flex-col px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid flex-1 gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/78 shadow-[0_30px_90px_-50px_rgba(88,70,52,0.42)] backdrop-blur-md">
            <div className="border-b border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(250,243,236,0.9))] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">
                    Messages
                  </p>
                  <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                    Conversations
                  </h1>
                </div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/80 px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  Home
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

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
                            <span
                              className={`relative flex h-[52px] w-[52px] items-center justify-center rounded-full bg-gradient-to-br ${conversation.accent} text-sm font-semibold text-slate-800 transition-all ${
                                isSelected
                                  ? "scale-[1.03] ring-4 ring-primary/25"
                                  : "ring-2 ring-transparent"
                              }`}
                            >
                              {conversation.name
                                .split(" ")
                                .filter(Boolean)
                                .slice(0, 2)
                                .map((part) => part[0]?.toUpperCase())
                                .join("")}
                              <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
                            </span>
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

            <div className="space-y-3 overflow-y-auto p-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
                      className={`w-full rounded-[1.6rem] border p-4 text-left transition-all ${
                        isSelected
                          ? "border-primary/25 bg-primary/8 shadow-[0_18px_40px_-30px_rgba(88,70,52,0.45)]"
                          : "border-transparent bg-white/70 hover:border-border/70 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${conversation.accent} text-sm font-semibold text-slate-800`}
                        >
                          {initials || "F"}
                          <span
                            className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                              conversation.active ? "bg-green-500" : "bg-slate-300"
                            }`}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {conversation.name}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {conversation.role}
                              </p>
                            </div>
                            {conversation.unreadCount ? (
                              <span className="rounded-full bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground">
                                {conversation.unreadCount}
                              </span>
                            ) : null}
                          </div>

                          <p className="mt-3 truncate text-sm text-muted-foreground">
                            {conversation.preview}
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground/80">
                            {conversation.lastSeen}
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

          <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/82 shadow-[0_30px_90px_-50px_rgba(88,70,52,0.42)] backdrop-blur-md">
            {selectedConversation ? (
              <div className="flex h-full flex-col">
                <div className="border-b border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,239,232,0.92))] px-5 py-5 sm:px-6">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${selectedConversation.accent} text-base font-semibold text-slate-800`}
                      >
                        {selectedConversation.name
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((part) => part[0]?.toUpperCase())
                          .join("")}
                        <span
                          className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white ${
                            selectedConversation.active ? "bg-green-500" : "bg-slate-300"
                          }`}
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-semibold text-foreground">
                            {selectedConversation.name}
                          </h2>
                          <Circle
                            className={`h-3 w-3 fill-current ${
                              selectedConversation.active ? "text-green-500" : "text-slate-300"
                            }`}
                          />
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {selectedConversation.handle} | {selectedConversation.role}
                        </p>
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

                <div className="flex-1 bg-[linear-gradient(180deg,rgba(250,246,241,0.96),rgba(244,236,229,0.92))] p-4 sm:p-6">
                  <div className="mx-auto flex h-full max-w-4xl flex-col">
                    <div className="mb-5 rounded-[1.5rem] border border-primary/10 bg-white/75 px-4 py-3 text-sm text-muted-foreground shadow-sm">
                      Active user stays on top, and clicking any conversation from the left side changes this chat instantly.
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                      {selectedConversation.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-[1.6rem] px-4 py-3 shadow-sm sm:max-w-[70%] ${
                              message.sender === "me"
                                ? "bg-primary text-primary-foreground"
                                : "border border-white/70 bg-white text-foreground"
                            }`}
                          >
                            <p className="text-sm leading-6">{message.text}</p>
                            <p
                              className={`mt-2 text-[11px] font-medium ${
                                message.sender === "me"
                                  ? "text-primary-foreground/80"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {message.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 rounded-[1.75rem] border border-white/70 bg-white/90 p-3 shadow-[0_20px_45px_-35px_rgba(88,70,52,0.45)]">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex-1 rounded-[1.2rem] border border-border/70 bg-muted/15 px-4 py-3">
                          <p className="text-sm text-muted-foreground">
                            Demo composer. Next step-e eta live socket/API diye wire kora jabe.
                          </p>
                        </div>
                        <Button type="button" className="h-12 rounded-full px-6 text-sm font-semibold">
                          <Send className="h-4 w-4" />
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
                    Left side theke jekono active user select korle ekhane full conversation dekhabe.
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
