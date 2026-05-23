import { Footer, Header } from "@/widgets";

import { ROUTES } from "@/shared/config/routes";

export default function ContactsPage() {
  return (
    <main className="min-h-screen bg-[#F2F3F5] flex flex-col">
      <Header title="Контакты" backTo={ROUTES.HOME} />
      <div className="flex-1 max-w-360 mx-auto px-4 md:px-10 py-10 w-full">
        <div className="bg-white rounded-3xl p-8 md:p-12">
          <h1 className="text-3xl font-bold text-[#191A1B] mb-6">Контакты</h1>
          <div className="flex flex-col gap-4 text-[#686F72]">
            <p>
              <span className="font-medium text-[#191A1B]">Email:</span>{" "}
              info@preste.com
            </p>
            <p>
              <span className="font-medium text-[#191A1B]">Телефон:</span> 996
              (702) 555-0122
            </p>
            <p>
              <span className="font-medium text-[#191A1B]">Адрес:</span> г.
              Бишкек, ул. Тыныстанова, 56
            </p>
          </div>
        </div>
      </div>
      <div className="hidden md:block mt-auto">
        <Footer />
      </div>
    </main>
  );
}
