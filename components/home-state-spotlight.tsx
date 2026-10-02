"use client";

import { useEffect, useState } from "react";

const stateHighlights = [
  { name: "New Hampshire", className: "text-[#9333EA]" },
  { name: "California", className: "text-[#1D4ED8]" },
  { name: "Pennsylvania", className: "text-[#047857]" },
  { name: "Georgia", className: "text-[#B91C1C]" },
  { name: "Arizona", className: "text-[#A16207]" },
  { name: "Michigan", className: "text-[#4338CA]" },
];

export function RotatingStateName({
  className = "",
}: Readonly<{
  className?: string;
}>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeState = stateHighlights[activeIndex];

  useEffect(() => {
    const rotation = window.setInterval(() => {
      setActiveIndex((currentIndex) => {
        return (currentIndex + 1) % stateHighlights.length;
      });
    }, 3000);

    return () => window.clearInterval(rotation);
  }, []);

  return (
    <span
      className={`inline-block min-w-[14ch] transition-colors duration-500 ${activeState.className} ${className}`}
    >
      {activeState.name}
    </span>
  );
}
