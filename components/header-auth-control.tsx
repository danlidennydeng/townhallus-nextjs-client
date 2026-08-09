"use client";

import Image from "next/image";
import Link from "next/link";
import { SearchIcon, UserRoundIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  getStoredUser,
  subscribeToAuthChanges,
  type TownHallUser,
} from "@/lib/auth-client";
import { pixelAvatarPath } from "@/lib/avatar";

function getDisplayName(user: TownHallUser) {
  return user.firstname || user.username || "User";
}

function getServerSeedUser(serverUserId?: string | null) {
  return serverUserId ? ({ _id: serverUserId } satisfies TownHallUser) : null;
}

function useStoredHeaderUser(serverUserId?: string | null) {
  const [currentUser, setCurrentUser] = useState<TownHallUser | null>(() =>
    getServerSeedUser(serverUserId)
  );

  useEffect(() => {
    function syncUser() {
      setCurrentUser(getStoredUser() ?? getServerSeedUser(serverUserId));
    }

    syncUser();
    return subscribeToAuthChanges(syncUser);
  }, [serverUserId]);

  return currentUser;
}

type HeaderAuthProps = {
  serverUserId?: string | null;
};

type HeaderAuthControlProps = HeaderAuthProps & {
  serverAvatar?: ReactNode;
  serverAvatarSeed?: string | null;
};

export function HeaderPrimaryActionControl({
  serverUserId,
}: Readonly<HeaderAuthProps>) {
  const currentUser = useStoredHeaderUser(serverUserId);

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

export function HeaderAuthControl({
  serverAvatar,
  serverAvatarSeed,
}: Readonly<HeaderAuthControlProps>) {
  const currentUser = useStoredHeaderUser(serverAvatarSeed);

  if (currentUser?._id) {
    const displayName = getDisplayName(currentUser);
    const avatar =
      serverAvatarSeed === currentUser._id && serverAvatar ? (
        serverAvatar
      ) : (
        <Image
          src={pixelAvatarPath(currentUser._id)}
          alt=""
          width={40}
          height={40}
          unoptimized
          className="size-full object-cover [image-rendering:pixelated]"
        />
      );

    return (
      <Button
        nativeButton={false}
        render={<Link href="/dashprofile" />}
        variant="outline"
        size="lg"
        aria-label={`${displayName} profile`}
        title={`${displayName} profile`}
        className="size-10 overflow-hidden rounded-full border-[#9333EA] bg-[#eeeeee] p-0 text-base font-semibold text-[#ffffff] shadow-[0_1px_1px_rgba(0,0,0,0.14)] hover:bg-[#7E22CE]"
      >
        {avatar}
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
