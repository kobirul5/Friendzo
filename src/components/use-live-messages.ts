"use client";

import { useEffect, useState } from "react";

export type LiveConversation = {
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
};

export type LiveMessage = {
  id: string;
  text: string;
  time: string;
  sender: "me" | "them";
};

type UseLiveMessagesParams = {
  accessToken: string | null;
  currentUserId: string | null;
  socketUrl: string;
};

const accents = [
  "from-rose-300 via-orange-200 to-amber-100",
  "from-sky-300 via-cyan-200 to-blue-100",
  "from-emerald-300 via-lime-200 to-green-100",
  "from-pink-300 via-rose-200 to-orange-100",
  "from-indigo-300 via-blue-200 to-cyan-100",
  "from-violet-300 via-fuchsia-200 to-pink-100",
];

const formatTime = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
};

const buildName = (user?: { firstName?: string | null; lastName?: string | null } | null) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || "Unknown user";

const accentFor = (id: string) =>
  accents[id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % accents.length];

export function useLiveMessages({
  accessToken,
  currentUserId,
  socketUrl,
}: UseLiveMessagesParams) {
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [conversations, setConversations] = useState<LiveConversation[]>([]);
  const [messagesById, setMessagesById] = useState<Record<string, LiveMessage[]>>({});
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!accessToken || !socketUrl) {
      setStatus("disconnected");
      return;
    }

    const ws = new WebSocket(socketUrl);
    setSocket(ws);
    setStatus("connecting");

    ws.onopen = () => {
      setStatus("connected");
      ws.send(JSON.stringify({ event: "authenticate", token: accessToken }));
      ws.send(JSON.stringify({ event: "messageList" }));
      ws.send(JSON.stringify({ event: "allFriends" })); // Get all friends with online status
    };

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);

      if (payload.event === "messageList") {
        const nextItems = (payload.data?.userWithLastMessages ?? []).map(
          (item: { user?: { id: string; firstName?: string; lastName?: string; profileImage?: string | null } | null; lastMessage?: { message?: string; createdAt?: string } | null }) => ({
            id: item.user?.id || "",
            name: buildName(item.user),
            handle: item.user?.id ? `@${item.user.id.slice(-6)}` : "@friendzo",
            role: "Friendzo chat",
            active: false,
            lastSeen: "Offline",
            preview: item.lastMessage?.message || "Start your conversation",
            unreadCount: 0,
            accent: accentFor(item.user?.id || "friendzo"),
            profileImage: item.user?.profileImage || null,
          })
        ).filter((item: LiveConversation) => item.id);

        if (nextItems.length) {
          setConversations((current) =>
            nextItems.map((item: LiveConversation) => ({
              ...item,
              active: current.find((c) => c.id === item.id)?.active ?? false,
              lastSeen: current.find((c) => c.id === item.id)?.lastSeen ?? "Offline",
            }))
          );
        }
      }

      //  Handle allFriends event - online users first
      if (payload.event === "allFriends") {
        const friends = payload.data?.friends ?? [];
        const sortedFriends = friends.map((f: { user: { id: string; firstName?: string | null; lastName?: string | null; profileImage?: string | null }; isOnline: boolean }) => ({
          id: f.user?.id || "",
          name: buildName(f.user),
          handle: f.user?.id ? `@${f.user.id.slice(-6)}` : "@friendzo",
          role: "Friend",
          active: f.isOnline,
          lastSeen: f.isOnline ? "Active now" : "Offline",
          preview: "Tap to start chatting",
          unreadCount: 0,
          accent: accentFor(f.user?.id || "friendzo"),
          profileImage: f.user?.profileImage || null,
        })).filter((item: LiveConversation) => item.id);

        if (sortedFriends.length) {
          setConversations((current) => {
            // Merge with existing conversations, keeping online status from allFriends
            const merged = sortedFriends.map((newItem: LiveConversation) => {
              const existing = current.find((c) => c.id === newItem.id);
              return {
                ...newItem,
                preview: existing?.preview || newItem.preview,
                unreadCount: existing?.unreadCount || 0,
              };
            });
            return merged;
          });
        }
      }

      if (payload.event === "fetchChats") {
        const receiver = payload.data?.receiver;
        const chats = Array.isArray(payload.data?.chats) ? payload.data.chats : [];
        if (receiver?.id) {
          setMessagesById((current) => ({
            ...current,
            [receiver.id]: chats.map((chat: { id: string; message: string; senderId: string; createdAt: string }) => ({
              id: chat.id,
              text: chat.message,
              time: formatTime(chat.createdAt),
              sender: chat.senderId === currentUserId ? "me" : "them",
            })),
          }));
        }
      }

      if (payload.event === "message") {
        const chat = payload.data;
        const otherUserId = chat.senderId === currentUserId ? chat.receiverId : chat.senderId;
        setMessagesById((current) => ({
          ...current,
          [otherUserId]: [
            ...(current[otherUserId] || []),
            {
              id: chat.id,
              text: chat.message,
              time: formatTime(chat.createdAt),
              sender: chat.senderId === currentUserId ? "me" : "them",
            },
          ],
        }));
        ws.send(JSON.stringify({ event: "messageList" }));
      }

      if (payload.event === "userStatus") {
        const userId = payload.data?.userId;
        const isOnline = Boolean(payload.data?.isOnline);
        if (userId) {
          setConversations((current) =>
            current.map((item) =>
              item.id === userId
                ? { ...item, active: isOnline, lastSeen: isOnline ? "Active now" : "Offline" }
                : item
            )
          );
        }
      }
    };

    ws.onclose = () => setStatus("disconnected");
    ws.onerror = () => setStatus("disconnected");

    return () => ws.close();
  }, [accessToken, currentUserId, socketUrl]);

  return {
    status,
    socket,
    conversations,
    messagesById,
  };
}
