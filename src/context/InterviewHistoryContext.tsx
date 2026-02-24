"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  text: string;
  timestamp: number;
}

export interface InterviewSession {
  roleId: string;
  messages: ChatMessage[];
  startedAt: number;
  lastActiveAt: number;
}

interface InterviewHistoryContextType {
  sessions: Record<string, InterviewSession>;
  getSession: (roleId: string) => InterviewSession | undefined;
  saveMessage: (roleId: string, message: ChatMessage) => void;
  initSession: (roleId: string, systemMessage: string) => void;
  deleteSession: (roleId: string) => void;
  clearAll: () => void;
  interviewedRoleIds: string[];
  count: number;
}

const InterviewHistoryContext = createContext<InterviewHistoryContextType>({
  sessions: {},
  getSession: () => undefined,
  saveMessage: () => {},
  initSession: () => {},
  deleteSession: () => {},
  clearAll: () => {},
  interviewedRoleIds: [],
  count: 0,
});

const STORAGE_KEY = "nexius-interview-history";

export function InterviewHistoryProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<Record<string, InterviewSession>>({});
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSessions(JSON.parse(stored));
    } catch {}
    setLoaded(true);
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions, loaded]);

  const getSession = useCallback(
    (roleId: string) => sessions[roleId],
    [sessions]
  );

  const initSession = useCallback((roleId: string, systemMessage: string) => {
    setSessions((prev) => {
      // Don't re-initialize if session already exists with messages beyond the system message
      if (prev[roleId] && prev[roleId].messages.length > 1) return prev;
      const now = Date.now();
      return {
        ...prev,
        [roleId]: {
          roleId,
          messages: [{ role: "system", text: systemMessage, timestamp: now }],
          startedAt: now,
          lastActiveAt: now,
        },
      };
    });
  }, []);

  const saveMessage = useCallback((roleId: string, message: ChatMessage) => {
    setSessions((prev) => {
      const session = prev[roleId];
      if (!session) return prev;
      return {
        ...prev,
        [roleId]: {
          ...session,
          messages: [...session.messages, message],
          lastActiveAt: Date.now(),
        },
      };
    });
  }, []);

  const deleteSession = useCallback((roleId: string) => {
    setSessions((prev) => {
      const next = { ...prev };
      delete next[roleId];
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSessions({});
  }, []);

  const interviewedRoleIds = Object.keys(sessions).filter(
    (id) => sessions[id].messages.length > 1
  );

  return (
    <InterviewHistoryContext.Provider
      value={{
        sessions,
        getSession,
        saveMessage,
        initSession,
        deleteSession,
        clearAll,
        interviewedRoleIds,
        count: interviewedRoleIds.length,
      }}
    >
      {children}
    </InterviewHistoryContext.Provider>
  );
}

export function useInterviewHistory() {
  return useContext(InterviewHistoryContext);
}
