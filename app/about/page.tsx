import type { Metadata } from "next";
import About from "./about";

export const metadata: Metadata = {
  title: "About Us | TownHallUS.com",
  description:
    "Learn about TownHallUS.com, its mission, upcoming features, and volunteer opportunities.",
};

export default function Page() {
  return <About />;
}
