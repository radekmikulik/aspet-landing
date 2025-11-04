// app/(site)/page.tsx
import HomeBaseline from "./_components/HomeBaseline";

export const dynamic = "force-static";
export const fetchCache = "force-cache";
// volitelné: export const revalidate = false;

export default function Page() {
  return <HomeBaseline />;
}
