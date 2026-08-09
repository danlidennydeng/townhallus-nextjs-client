import Image from "next/image";
import Link from "next/link";
import { ChevronDownIcon, MenuIcon } from "lucide-react";

import {
  HeaderAuthControl,
  HeaderPrimaryActionControl,
} from "@/components/header-auth-control";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const footerLinks = [
  { href: "/Game Rules", label: "Game Rules" },
  { href: "/privacy", label: "Privacy & Cookie" },
  { href: "/terms", label: "Term" },
  { href: "/userrules", label: "User Rules" },
  { href: "/faqpage", label: "FAQ" },
  { href: "/helppage", label: "Help" },
  { href: "/about", label: "About Us" },
];

export const siteLinkClassName =
  "text-[#000000] underline decoration-[#808080] decoration-2 underline-offset-4 transition-colors hover:text-[#4d4d4d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#000000]";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#c4c4c4] bg-[#eeeeee]/95 shadow-[0_1px_2px_rgba(0,0,0,0.18)] backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap sm:px-6 lg:px-8">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="lg"
                className="h-11 gap-2 rounded-lg border-[#9333EA] bg-[#f7f7f7] px-3 text-base text-[#000000] shadow-[0_1px_1px_rgba(0,0,0,0.14)] hover:bg-[#d6d6d6]"
              />
            }
          >
            <MenuIcon className="size-5" aria-hidden="true" />
            <span>Menu</span>
            <Image
              src="/logo.svg"
              alt=""
              width={18}
              height={18}
              aria-hidden="true"
              className="size-5 opacity-80"
            />
            <ChevronDownIcon className="size-4" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={8}
            className="w-56 border-[#b3b3b3] bg-[#f7f7f7] text-[#000000]"
          >
            <DropdownMenuGroup>
              <DropdownMenuItem
                render={<Link href="/" />}
                className="cursor-pointer px-3 py-2 text-[#9333EA] focus:bg-[#d6d6d6] focus:text-[#7E22CE]"
              >
                TownHallUS.com
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-[#c4c4c4]" />
            <DropdownMenuGroup>
              {footerLinks.map((link) => (
                <DropdownMenuItem
                  key={link.href}
                  render={<Link href={link.href} />}
                  className="cursor-pointer px-3 py-2 text-[#000000] focus:bg-[#d6d6d6] focus:text-[#000000]"
                >
                  {link.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <nav
          aria-label="Primary navigation"
          className="w-full max-w-[22rem] min-w-0 sm:ml-auto sm:w-auto sm:max-w-none"
        >
          <ul className="flex flex-wrap items-center gap-2 text-sm font-medium sm:flex-nowrap">
            <li>
              <HeaderPrimaryActionControl />
            </li>
            <li>
              <HeaderAuthControl />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[#c4c4c4] bg-[#eeeeee]">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap gap-1 text-sm">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-lg px-3 py-2 text-[#9333EA] no-underline transition-colors hover:bg-[#d6d6d6] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#000000]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-2 text-sm text-[#333333] lg:items-end">
          <span>&copy; {new Date().getFullYear()}</span>
          <a
            href="https://www.non-partisan.online/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#9333EA] underline decoration-[#808080] decoration-2 underline-offset-4 transition-colors hover:text-[#7E22CE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#000000]"
          >
            Non-Partisan Alliance, Inc.
          </a>
        </div>
      </div>
    </footer>
  );
}
