import { redirect } from "next/navigation";

// Вкладки «Моих данных» больше не отдельные страницы — оставляем редирект,
// чтобы старые ссылки и закладки продолжали открывать нужную вкладку.
export default function Page() {
  redirect("/doctor-profile/my-data?tab=education");
}
