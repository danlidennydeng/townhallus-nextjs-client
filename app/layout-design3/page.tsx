import type { Metadata } from "next";

import {
  HomeLayoutDesign,
  homeLayoutMetadata,
} from "@/components/home-layout-candidates";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  ...homeLayoutMetadata,
  title: "Home Layout Design 3 | TownHallUS.com",
};

export default function LayoutDesignThreePage() {
  return <HomeLayoutDesign variant="state" />;
}
