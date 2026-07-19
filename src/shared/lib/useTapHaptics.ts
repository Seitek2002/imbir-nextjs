import { useEffect } from "react";

// Лёгкая вибрация при тапе по кнопке/ссылке — то самое ощущение "родного"
// приложения, которого не хватает голому вебвью/сайту. Работает только там,
// где есть Vibration API (Android Chrome и WebView) — в Safari/WKWebView на
// iOS его нет и не будет (осознанный выбор Apple, а не баг), так что там
// вызов просто ничего не делает.
export const useTapHaptics = () => {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!("vibrate" in navigator)) return;

      const target = (e.target as HTMLElement | null)?.closest?.(
        'button, a, [role="button"]',
      );
      if (!target) return;
      if (
        target.hasAttribute("disabled") ||
        target.getAttribute("aria-disabled") === "true"
      ) {
        return;
      }

      navigator.vibrate(10);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);
};
