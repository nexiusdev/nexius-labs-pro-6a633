"use client";

const KEY = "nexius-visitor-id";
const COOKIE = "nexius_vid";

function getCookie(name: string) {
  try {
    const prefix = `${name}=`;
    const parts = document.cookie.split(";").map((p) => p.trim());
    const found = parts.find((p) => p.startsWith(prefix));
    return found ? decodeURIComponent(found.substring(prefix.length)) : null;
  } catch {
    return null;
  }
}

export function getVisitorId() {
  try {
    const cookieId = getCookie(COOKIE);
    if (cookieId) {
      localStorage.setItem(KEY, cookieId);
      return cookieId;
    }

    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}
