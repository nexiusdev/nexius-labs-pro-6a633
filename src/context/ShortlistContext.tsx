"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { getVisitorId } from "@/lib/visitorId";

interface ShortlistContextType {
  ids: string[];
  add: (id: string) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  count: number;
}

const ShortlistContext = createContext<ShortlistContextType>({
  ids: [],
  add: () => {},
  remove: () => {},
  toggle: () => {},
  has: () => false,
  count: 0,
});

const STORAGE_KEY = "nexius-shortlist";

export function ShortlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const hydrate = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) setIds(JSON.parse(stored));
      } catch {}

      try {
        const visitorId = getVisitorId();
        const res = await fetch(`/api/shortlist?visitorId=${encodeURIComponent(visitorId)}`);
        const json = await res.json();
        if (Array.isArray(json?.roleIds)) setIds(json.roleIds);
      } catch {}

      setLoaded(true);
    };

    hydrate();
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));

    const visitorId = getVisitorId();
    fetch("/api/shortlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId, roleIds: ids }),
    }).catch(() => {});
  }, [ids, loaded]);

  const add = (id: string) => setIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  const remove = (id: string) => setIds((prev) => prev.filter((i) => i !== id));
  const toggle = (id: string) => setIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  const has = (id: string) => ids.includes(id);

  return (
    <ShortlistContext.Provider value={{ ids, add, remove, toggle, has, count: ids.length }}>
      {children}
    </ShortlistContext.Provider>
  );
}

export function useShortlist() {
  return useContext(ShortlistContext);
}
