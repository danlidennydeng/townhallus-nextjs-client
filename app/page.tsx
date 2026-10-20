import { HomeLayoutDesign } from "@/components/home-layout-candidates";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Home() {
  return <HomeLayoutDesign variant="action" />;
}
