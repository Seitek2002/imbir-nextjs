import { Footer, Header } from "@/widgets";

import { ROUTES } from "@/shared/config/routes";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#F2F3F5] flex flex-col">
      <Header title="Условия и положения" backTo={ROUTES.HOME} />
      <div className="flex-1 max-w-360 mx-auto px-4 md:px-10 py-10 w-full">
        <div className="bg-white rounded-3xl p-8 md:p-12">
          <h1 className="text-3xl font-bold text-[#191A1B] mb-6">
            Условия и положения
          </h1>
          <p className="text-[#686F72] text-lg">
            Страница находится в разработке. Документ будет опубликован перед
            запуском платформы.
          </p>
        </div>
      </div>
      <div className="hidden md:block mt-auto">
        <Footer />
      </div>
    </main>
  );
}
