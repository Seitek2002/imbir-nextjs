"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/profile/my-data");
    }, 1800);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#F2F3F5]">
      <div className="flex flex-col items-center gap-6 max-w-xs w-full text-center">
        <div className="relative size-20">
          <div className="absolute inset-0 rounded-full border-4 border-[#FFD9CC]" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#F5653E] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-8 rounded-full bg-[#F5653E]/10 flex items-center justify-center">
              <div className="size-3 rounded-full bg-[#F5653E]" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-[#191A1B]">
            Открываем ваш кабинет...
          </h2>
          <p className="text-sm text-[#838A8D] leading-relaxed">
            Подождите немного
          </p>
        </div>

        <div className="flex gap-1.5 mt-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="size-2 rounded-full bg-[#F5653E] animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
