import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

import { LocationMap } from "@/entities/clinic-profile";

import { getSiteSettings } from "@/shared/api";
import { COMPANY, ROUTES } from "@/shared/config";

// Пин на карте — офис ОсОО «МедиПроф», ул. Абдумомунова, 244 (координаты
// дома из OpenStreetMap). Без координат keyless-embed показывает только район
// по текстовому запросу, без метки (см. LocationMap). Если адрес в настройках
// сайта поменяют на другой, пин по этим координатам будет неверным — тогда
// карта строится по тексту адреса.
const OFFICE_ADDRESS = "г. Бишкек, ул. Абдумомунова, 244";
const OFFICE_LAT = "42.8798875";
const OFFICE_LNG = "74.5941185";

// Единый режим работы — и в карточке, и у техподдержки (раньше было 18:00 в
// одном блоке и 20:00 в соседнем).
const WORK_DAYS = "Пн–Пт";
const WORK_FROM = "09:00";
const WORK_TO = "18:00";

// Телефоны сравниваем по цифрам: «+996 550 222 777» и «+996550222777» — один
// и тот же номер.
const phoneDigits = (value: string) => value.replace(/\D/g, "");

const dedupePhones = (values: string[]) => {
  const seen = new Set<string>();
  return values.filter((value) => {
    const digits = phoneDigits(value);
    if (!digits || seen.has(digits)) return false;
    seen.add(digits);
    return true;
  });
};

// Подпись под соцсетью — адрес без схемы и www, чтобы было видно, куда ведёт.
const socialHandle = (url: string) =>
  url
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");

// Реквизиты юрлица: строки «название — значение», значение может быть
// многострочным (банк, телефоны).
const REQUISITES: { label: string; value: string }[] = [
  { label: "Наименование", value: COMPANY.fullName },
  { label: "ИНН", value: COMPANY.inn },
  { label: "ОКПО", value: COMPANY.okpo },
  { label: "Рег. № в Соцфонде", value: COMPANY.socialFundNumber },
  { label: "УГНС", value: COMPANY.taxOffice },
  {
    label: "Расчётный счёт",
    value: `${COMPANY.bank}\nБИК ${COMPANY.bik}\n№ ${COMPANY.account}`,
  },
  { label: "Юридический адрес", value: COMPANY.legalAddress },
  { label: "Телефоны", value: COMPANY.phones.join("\n") },
  { label: "Электронная почта", value: COMPANY.email },
  { label: "Генеральный директор", value: COMPANY.director },
];

const ContactCard = ({
  icon,
  title,
  lines,
}: {
  icon: string;
  lines: string[];
  title: string;
}) => (
  <div className="bg-white rounded-3xl p-6 flex flex-col gap-3 border border-border">
    <div className="size-12 rounded-2xl bg-[#FEF3F0] flex items-center justify-center text-2xl">
      {icon}
    </div>
    <p className="text-xs font-medium text-muted uppercase tracking-wide">
      {title}
    </p>
    <div className="flex flex-col gap-1">
      {lines.map((l) => (
        <p key={l} className="text-foreground font-medium text-sm">
          {l}
        </p>
      ))}
    </div>
  </div>
);

// Телефон, почта, адрес и соцсети — из «Настроек сайта» в админке (как в
// футере), чтобы их меняли без деплоя; пустые поля закрывают реквизиты юрлица.
// Телефоны юрлица в карточке — только запасной вариант: если номер задан в
// настройках, показываем его одного (реквизиты ниже всё равно их содержат).
export default async function ContactsPage() {
  const settings = await getSiteSettings();
  const phones = dedupePhones(
    settings?.contact_phone ? [settings.contact_phone] : [...COMPANY.phones],
  );
  const phone = phones[0] ?? COMPANY.phones[0];
  const email = settings?.contact_email || COMPANY.email;
  const address = settings?.address || OFFICE_ADDRESS;
  const isOfficeAddress = address === OFFICE_ADDRESS;
  // Только заполненные в админке соцсети, кликабельными ссылками.
  const socials = [
    { icon: "📷", label: "Instagram", url: settings?.instagram_url },
    { icon: "📘", label: "Facebook", url: settings?.facebook_url },
    { icon: "✖️", label: "X (Twitter)", url: settings?.twitter_url },
    { icon: "💼", label: "LinkedIn", url: settings?.linkedin_url },
  ].filter((social): social is typeof social & { url: string } =>
    Boolean(social.url),
  );

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header title="Контакты" backTo={ROUTES.HOME} />

      <div className="flex-1 w-full max-w-360 mx-auto px-4 md:px-10 py-10">
        {/* Hero */}
        <div className="bg-primary rounded-3xl p-8 md:p-12 mb-6 text-white overflow-hidden relative">
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
          <ContactCard icon="📞" title="Телефон" lines={phones} />
          <ContactCard icon="✉️" title="Email" lines={[email]} />
          <ContactCard icon="📍" title="Адрес" lines={[address]} />
          <ContactCard
            icon="🕐"
            title="Режим работы"
            lines={[`${WORK_DAYS}: ${WORK_FROM}–${WORK_TO}`, "Сб–Вс: выходной"]}
          />
        </div>

        {/* Карта */}
        <div className="mb-4">
          <LocationMap
            latitude={isOfficeAddress ? OFFICE_LAT : undefined}
            longitude={isOfficeAddress ? OFFICE_LNG : undefined}
            address={address}
          />
        </div>

        <div className="bg-white rounded-3xl border border-border p-6 mb-6">
          <h2 className="text-foreground font-semibold text-lg mb-1">
            Как нас найти
          </h2>
          <p className="text-secondary text-sm">
            {isOfficeAddress
              ? `Офис ${COMPANY.shortName}: ${address}, Первомайский район.`
              : `Офис ${COMPANY.shortName}: ${address}.`}
          </p>
        </div>

        {/* Support + Social */}
        <div
          className={`grid gap-3 ${socials.length > 0 ? "md:grid-cols-2" : ""}`}
        >
          <div className="bg-white rounded-3xl p-6 border border-border">
            <h2 className="text-foreground font-semibold text-lg mb-4">
              Техподдержка
            </h2>
            <div className="flex flex-col gap-3 text-sm text-secondary">
              <div className="flex items-center gap-3">
                <span className="size-8 rounded-xl bg-[#FEF3F0] flex items-center justify-center text-base">
                  📞
                </span>
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="size-8 rounded-xl bg-[#FEF3F0] flex items-center justify-center text-base">
                  ✉️
                </span>
                <span>{email}</span>
              </div>
              <p className="text-xs text-muted mt-1">
                Техподдержка работает: {WORK_DAYS} с {WORK_FROM} до {WORK_TO}
              </p>
            </div>
          </div>

          {socials.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-border">
              <h2 className="text-foreground font-semibold text-lg mb-4">
                Мы в социальных сетях
              </h2>
              <div className="flex flex-col gap-3 text-sm text-secondary">
                {socials.map(({ icon, label, url }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <span className="size-8 rounded-xl bg-[#FEF3F0] flex items-center justify-center text-base">
                      {icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-foreground font-medium text-xs">
                        {label}
                      </p>
                      <p className="text-primary text-xs truncate">
                        {socialHandle(url)}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Реквизиты юрлица — нужны операторам для согласования имени
            отправителя SMS (см. shared/config/company). */}
        <div className="bg-white rounded-3xl p-6 border border-border mt-3">
          <h2 className="text-foreground font-semibold text-lg mb-4">
            Реквизиты
          </h2>
          <dl className="grid md:grid-cols-2 gap-x-8">
            {REQUISITES.map(({ label, value }) => (
              <div
                key={label}
                className="py-3 border-b border-background flex flex-col gap-0.5"
              >
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="text-sm text-foreground font-medium whitespace-pre-line wrap-break-word">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="hidden md:block mt-auto">
        <Footer />
      </div>
    </main>
  );
}
