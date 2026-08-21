"use client";

export type TownHallUser = {
  _id: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  city?: string;
  county?: string;
  state?: string;
  introduction?: string;
  isPoster?: boolean;
  isCommenter?: boolean;
  isAdmin?: boolean;
  isVoter?: boolean;
  isCitizen?: boolean;
  numbersOfUploaded?: number;
  isAgreed?: boolean;
  zipcode?: string;
  updatedAt?: string;
  createdAt?: string;
};

const userStorageKey = "townhallus.currentUser";
const authChangeEventName = "townhallus-auth-change";

function notifyAuthChange() {
  window.dispatchEvent(new Event(authChangeEventName));
}

export function getStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawUser = getStoredUserSnapshot();
  if (!rawUser) {
    return null;
  }

  const parsedUser = parseStoredUserSnapshot(rawUser);

  if (!parsedUser) {
    window.localStorage.removeItem(userStorageKey);
  }

  return parsedUser;
}

export function getStoredUserSnapshot() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(userStorageKey);
}

export function parseStoredUserSnapshot(rawUser: string | null) {
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as TownHallUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: TownHallUser) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(userStorageKey, JSON.stringify(user));
  notifyAuthChange();
}

export function mergeStoredUser(user: TownHallUser) {
  const currentUser = getStoredUser();
  const mergedUser = { ...currentUser, ...user };
  setStoredUser(mergedUser);
  return mergedUser;
}

export function clearStoredUser() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(userStorageKey);
  notifyAuthChange();
}

export function subscribeToAuthChanges(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(authChangeEventName, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(authChangeEventName, callback);
    window.removeEventListener("storage", callback);
  };
}
