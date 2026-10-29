"use client";

import { useSyncExternalStore } from "react";

// Preserve choices made by the original React app on the same origin.
const storageKey = "cookieConsent";
const changeEvent = "townhallus-cookie-consent-change";
let temporaryChoice: boolean | null = null;

function getSnapshot() {
  if (typeof window === "undefined") return "pending";
  if (temporaryChoice !== null) return `temporary:${temporaryChoice}`;

  try {
    const value = window.localStorage.getItem(storageKey);
    return value === "true" || value === "false" ? value : "unset";
  } catch {
    return "unavailable";
  }
}

function subscribe(callback: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === storageKey || event.key === null) {
      temporaryChoice = null;
      callback();
    }
  }

  window.addEventListener(changeEvent, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(changeEvent, callback);
    window.removeEventListener("storage", onStorage);
  };
}

function getServerSnapshot() {
  return "pending";
}

function parseChoice(snapshot: string) {
  if (snapshot === "true" || snapshot === "temporary:true") return true;
  if (snapshot === "false" || snapshot === "temporary:false") return false;
  return null;
}

export function useCookieConsent() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    choice: parseChoice(snapshot),
    ready: snapshot !== "pending",
    temporary: snapshot.startsWith("temporary:"),
    storageUnavailable: snapshot === "unavailable",
  };
}

export function saveCookieConsent(allowOptional: boolean) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(storageKey, String(allowOptional));
    temporaryChoice = null;
  } catch {
    // Still honor the choice during this visit when browser storage is blocked.
    temporaryChoice = allowOptional;
  }
  window.dispatchEvent(new Event(changeEvent));
}

// Optional analytics/advertising integrations must consult this before loading.
// A missing, invalid, or inaccessible preference never grants permission.
export function areOptionalCookiesAllowed() {
  return parseChoice(getSnapshot()) === true;
}
