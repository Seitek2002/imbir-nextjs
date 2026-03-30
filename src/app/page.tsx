import Link from "next/link";

import { HomePage } from "@/views";

export default function Home() {
  return (
    <>
      Если ты запустил проект Буран, то тебе надо зайти на страницу{" "}
      <Link href="/components" className="text-[blue] underline">
        /components
      </Link>
      <HomePage />
    </>
  );
}
