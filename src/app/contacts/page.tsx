import { Footer, Header } from "@/widgets";

import { ROUTES } from "@/shared/config/routes";

const ContactCard = ({
  icon,
  title,
  lines,
}: {
  icon: string;
  title: string;
  lines: string[];
}) => (
  <div className="bg-white rounded-3xl p-6 flex flex-col gap-3 border border-[#E5E6E8]">
    <div className="size-12 rounded-2xl bg-[#FEF3F0] flex items-center justify-center text-2xl">
      {icon}
    </div>
    <p className="text-xs font-medium text-[#838A8D] uppercase tracking-wide">
      {title}
    </p>
    <div className="flex flex-col gap-1">
      {lines.map((l) => (
        <p key={l} className="text-[#191A1B] font-medium text-sm">
          {l}
        </p>
      ))}
    </div>
  </div>
);

export default function ContactsPage() {
  return (
    <main className="min-h-screen bg-[#F2F3F5] flex flex-col">
      <Header title="Контакты" backTo={ROUTES.HOME} />

      <div className="flex-1 w-full max-w-360 mx-auto px-4 md:px-10 py-10">
        {/* Hero */}
        <div className="bg-[#F5653E] rounded-3xl p-8 md:p-12 mb-6 text-white overflow-hidden relative">
          <div className="relative z-10 max-w-md">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Свяжитесь с нами
            </h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              Мы всегда на связи — по любым вопросам о записи, услугах или
              партнёрстве пишите или звоните нам.
            </p>
          </div>
          <div className="absolute -right-8 -bottom-8 size-48 rounded-full bg-white/10" />
          <div className="absolute -right-4 -bottom-16 size-32 rounded-full bg-white/10" />
        </div>

        {/* Contacts grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <ContactCard
            icon="📞"
            title="Телефон"
            lines={["+996 (312) 55-00-11", "+996 (700) 55-00-11"]}
          />
          <ContactCard
            icon="✉️"
            title="Email"
            lines={["info@imbir.kg", "support@imbir.kg"]}
          />
          <ContactCard
            icon="📍"
            title="Адрес"
            lines={["г. Бишкек", "ул. Тыныстанова, 56"]}
          />
          <ContactCard
            icon="🕐"
            title="Режим работы"
            lines={["Пн–Пт: 09:00–18:00", "Сб–Вс: выходной"]}
          />
        </div>

        {/* Map placeholder */}
        <div className="bg-white rounded-3xl overflow-hidden border border-[#E5E6E8] mb-6">
          <div className="h-64 md:h-80 bg-[#E9EBEE] flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-3">🗺️</div>
              <p className="text-[#838A8D] text-sm font-medium">
                ул. Тыныстанова, 56, г. Бишкек
              </p>
            </div>
          </div>
          <div className="p-6">
            <h2 className="text-[#191A1B] font-semibold text-lg mb-1">
              Как нас найти
            </h2>
            <p className="text-[#686F72] text-sm">
              Офис находится в центре Бишкека. Ближайшая остановка — «ЦУМ». Есть
              парковка для клиентов.
            </p>
          </div>
        </div>

        {/* Support + Social */}
        <div className="grid md:grid-cols-2 gap-3">
          <div className="bg-white rounded-3xl p-6 border border-[#E5E6E8]">
            <h2 className="text-[#191A1B] font-semibold text-lg mb-4">
              Техподдержка
            </h2>
            <div className="flex flex-col gap-3 text-sm text-[#686F72]">
              <div className="flex items-center gap-3">
                <span className="size-8 rounded-xl bg-[#FEF3F0] flex items-center justify-center text-base">
                  📞
                </span>
                <span>+996 (700) 55-00-99</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="size-8 rounded-xl bg-[#FEF3F0] flex items-center justify-center text-base">
                  ✉️
                </span>
                <span>help@imbir.kg</span>
              </div>
              <p className="text-xs text-[#838A8D] mt-1">
                Техподдержка работает: Пн–Пт с 09:00 до 20:00
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#E5E6E8]">
            <h2 className="text-[#191A1B] font-semibold text-lg mb-4">
              Мы в социальных сетях
            </h2>
            <div className="flex flex-col gap-3 text-sm text-[#686F72]">
              {[
                { icon: "📷", label: "Instagram", handle: "@imbir.kg" },
                { icon: "✈️", label: "Telegram", handle: "@imbir_kg" },
                { icon: "▶️", label: "YouTube", handle: "IMBIR Health" },
              ].map(({ icon, label, handle }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="size-8 rounded-xl bg-[#FEF3F0] flex items-center justify-center text-base">
                    {icon}
                  </span>
                  <div>
                    <p className="text-[#191A1B] font-medium text-xs">
                      {label}
                    </p>
                    <p className="text-[#F5653E] text-xs">{handle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block mt-auto">
        <Footer />
      </div>
    </main>
  );
}
