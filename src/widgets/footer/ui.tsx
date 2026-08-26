"use client";

import { FC, ReactNode } from "react";

import Link from "next/link";

import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  Logo,
  TwitterIcon,
} from "@/shared/assets/icons";
import { ROUTES } from "@/shared/config";
import { useSiteSettings } from "@/shared/lib/siteSettingsContext";

// --- Вспомогательные микро-компоненты для чистоты кода ---

// href может не быть: в настройках сайта соцсеть просто не заполнена. Раньше
// тут стояла заглушка "#", и иконка вела в никуда — теперь её не рисуем.
const SocialLink: FC<{
  href?: string;
  Icon: FC<{ className?: string }>;
}> = ({ href, Icon }) =>
  !href ? null : (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="size-11 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary-dark transition-colors shrink-0"
    >
      {/* Добавил fill-white на случай, если svg экспортировались с другим цветом */}
      <Icon className="[&_path]:fill-white" />
    </a>
  );

const ColumnHeading: FC<{ children: ReactNode }> = ({ children }) => (
  <h3 className="text-foreground font-semibold text-base mb-4 md:mb-6">
    {children}
  </h3>
);

const FooterLink: FC<{ href: string; children: ReactNode }> = ({
  href,
  children,
}) => (
  <Link
    href={href}
    className="text-secondary text-sm md:text-base hover:text-primary transition-colors inline-block py-1.5 md:py-2 min-w-11"
  >
    {children}
  </Link>
);

const FooterText: FC<{ children: ReactNode }> = ({ children }) => (
  <p className="text-secondary text-sm md:text-base mb-3 md:mb-4">{children}</p>
);

// --- Основной компонент Footer ---

// Контакты и соцсети приходят из настроек сайта (синглтон в админке), чтобы
// их правили без деплоя. Значения читает корневой layout на сервере и кладёт
// в контекст — сам футер запрос не делает: он стоит и внутри клиентских
// страниц, где async-компонент не отрендерить.
//
// FALLBACK не декоративный: в админке поля пока пустые, и без него блок
// «Свяжитесь с нами» оказался бы пустым.
const FALLBACK = {
  email: "info@imbir.kg",
  phone: "+996 (312) 55-00-11",
  address: "г. Бишкек, ул. Мидина Алыбаева, 10",
};

export const Footer: FC = () => {
  const settings = useSiteSettings();
  const email = settings?.contact_email || FALLBACK.email;
  const phone = settings?.contact_phone || FALLBACK.phone;
  const address = settings?.address || FALLBACK.address;

  return (
    <footer className="w-full max-w-360 mx-auto px-4 md:px-10 pb-6 pt-8 md:pt-10">
      {/* Контейнер со светло-бежевым фоном */}
      <div className="bg-[#FCF9F7] rounded-4xl p-6 sm:p-10 md:p-12 flex flex-col gap-10">
        {/* Верхняя часть: Сетка с контентом */}
        <div className="flex flex-col lg:flex-row justify-between gap-10 lg:gap-8">
          {/* Логотип и социальные сети */}
          <div className="flex flex-col gap-6 lg:w-1/4 shrink-0">
            <Link href={ROUTES.HOME}>
              <Logo className="w-35 h-auto" />
            </Link>
            <div className="flex items-center gap-3">
              <SocialLink href={settings?.facebook_url} Icon={FacebookIcon} />
              <SocialLink href={settings?.instagram_url} Icon={InstagramIcon} />
              <SocialLink href={settings?.twitter_url} Icon={TwitterIcon} />
              <SocialLink href={settings?.linkedin_url} Icon={LinkedinIcon} />
            </div>
          </div>

          {/* Ссылки и контакты (Сетка: 1 колонка на моб, 2 на планшете, 3 на ПК) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 lg:gap-10 lg:w-3/4 lg:ml-auto">
            {/* Блок 1 */}
            <div className="flex flex-col items-start">
              <ColumnHeading>Быстрые ссылки</ColumnHeading>
              <FooterLink href={ROUTES.CLINICS}>Клиники</FooterLink>
              <FooterLink href={ROUTES.SPECIALISTS}>Специалисты</FooterLink>
              <FooterLink href={ROUTES.SERVICES}>Услуги</FooterLink>
            </div>

            {/* Блок 2 */}
            <div className="flex flex-col items-start">
              <ColumnHeading>Помощь и поддержка</ColumnHeading>
              <FooterLink href={ROUTES.CONTACTS}>Контакты</FooterLink>
              <FooterLink href={ROUTES.TERMS}>Условия и положения</FooterLink>
              <FooterLink href={ROUTES.PRIVACY}>
                Политика конфиденциальности
              </FooterLink>
            </div>

            {/* Блок 3 */}
            <div className="flex flex-col items-start">
              <ColumnHeading>Свяжитесь с нами</ColumnHeading>
              <FooterText>{email}</FooterText>
              <FooterText>{phone}</FooterText>
              <FooterText>{address}</FooterText>
            </div>
          </div>
        </div>

        {/* Нижняя часть: Копирайт */}
        <div className="flex justify-center items-center md:mt-10 pt-6 md:pt-0 border-t border-border-soft/50 md:border-none">
          <p className="text-foreground text-sm text-center">
            © 2026 Imbir. Все права защищены
          </p>
        </div>
      </div>
    </footer>
  );
};
