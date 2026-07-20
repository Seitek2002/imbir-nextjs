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

// --- Вспомогательные микро-компоненты для чистоты кода ---

const SocialLink: FC<{ href: string; Icon: FC<{ className?: string }> }> = ({
  href,
  Icon,
}) => (
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

export const Footer: FC = () => {
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
              <SocialLink href="#" Icon={FacebookIcon} />
              <SocialLink href="#" Icon={InstagramIcon} />
              <SocialLink href="#" Icon={TwitterIcon} />
              <SocialLink href="#" Icon={LinkedinIcon} />
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
              <FooterText>info@preste.com</FooterText>
              <FooterText>996 (702) 555-0122</FooterText>
              <FooterText>г. Бишкек, ул. Тыныстанова, 56</FooterText>
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
