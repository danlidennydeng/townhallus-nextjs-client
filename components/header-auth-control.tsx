"use client";

import Link from "next/link";
import { SearchIcon, UserRoundIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  getStoredUser,
  subscribeToAuthChanges,
  type TownHallUser,
} from "@/lib/auth-client";

function getDisplayName(user: TownHallUser) {
  return user.firstname || user.username || "User";
}

function getAvatarInitial(user: TownHallUser) {
  return getDisplayName(user).slice(0, 1).toUpperCase();
}

function useStoredHeaderUser() {
  const [currentUser, setCurrentUser] = useState<TownHallUser | null>(null);

  useEffect(() => {
    function syncUser() {
      setCurrentUser(getStoredUser());
    }

    syncUser();
    return subscribeToAuthChanges(syncUser);
  }, []);

  return currentUser;
}

export function HeaderPrimaryActionControl() {
  const currentUser = useStoredHeaderUser();

  if (currentUser?._id) {
    return (
      <Button
        nativeButton={false}
        render={<Link href="/search" />}
        variant="outline"
        size="lg"
        aria-label="Search"
        title="Search"
        className="size-10 rounded-full border-[#9333EA] bg-transparent p-0 text-[#000000] shadow-[0_1px_1px_rgba(0,0,0,0.14)] hover:bg-[#d6d6d6]"
      >
        <SearchIcon className="size-5" aria-hidden="true" />
      </Button>
    );
  }

  return (
    <Button
      nativeButton={false}
      render={<Link href="/create-account" />}
      variant="default"
      size="lg"
      className="h-10 bg-[#9333EA] px-4 text-[#ffffff] hover:bg-[#7E22CE]"
    >
      Create Account
    </Button>
  );
}

export function HeaderAuthControl() {
  const currentUser = useStoredHeaderUser();

  if (currentUser?._id) {
    const displayName = getDisplayName(currentUser);

    return (
      <Button
        nativeButton={false}
        render={<Link href="/dashprofile" />}
        variant="outline"
        size="lg"
        aria-label={`${displayName} profile`}
        title={`${displayName} profile`}
        className="size-10 rounded-full border-[#9333EA] bg-[#9333EA] p-0 text-base font-semibold text-[#ffffff] shadow-[0_1px_1px_rgba(0,0,0,0.14)] hover:bg-[#7E22CE]"
      >
        <span aria-hidden="true">{getAvatarInitial(currentUser)}</span>
      </Button>
    );
  }

  return (
    <Button
      nativeButton={false}
      render={<Link href="/log-in" />}
      variant="outline"
      size="lg"
      className="h-10 border-[#9333EA] bg-transparent px-4 text-[#000000] hover:bg-[#d6d6d6]"
    >
      <UserRoundIcon className="size-4" aria-hidden="true" />
      Log In
    </Button>
  );
}
