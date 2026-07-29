import { HomePage } from "@/pages/home";

// Блок «Блог» на главной рендерится на сервере из данных бэка — без ISR он
// застыл бы на том, что было в момент сборки.
export const revalidate = 300;

export default function Page() {
  return <HomePage />;
}
