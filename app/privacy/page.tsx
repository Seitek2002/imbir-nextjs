import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

import { getSiteSettings } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { Markdown } from "@/shared/ui";

const Section = ({
  num,
  title,
  children,
}: {
  num: number;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="mb-8">
    <h2 className="text-lg font-semibold text-foreground mb-3">
      {num}. {title}
    </h2>
    <div className="flex flex-col gap-3 text-secondary text-sm leading-relaxed">
      {children}
    </div>
  </div>
);

const DataItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start gap-2">
    <span className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />
    <span>
      <span className="font-medium text-foreground">{label}</span> — {value}
    </span>
  </div>
);

export default async function PrivacyPage() {
  // Текст берём из настроек сайта, чтобы его правили в админке без
  // деплоя. Пока поле там пустое — показываем вёрстку ниже: в ней
  // реальный текст, и терять его ради пустой страницы нельзя.
  const settings = await getSiteSettings();
  const text = settings?.privacy_policy_text?.trim();

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header title="Политика конфиденциальности" backTo={ROUTES.HOME} />

      <div className="flex-1 w-full max-w-360 mx-auto px-4 md:px-10 py-10">
        <div className="bg-white rounded-3xl p-6 md:p-12 max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Политика конфиденциальности
            </h1>
            <p className="text-muted text-sm">
              Последнее обновление: 1 января 2025 г.
            </p>
          </div>

          {text ? (
            // В админке текст хранится одной строкой в markdown — тем же
            // форматом, что и статьи блога, поэтому рендерим общим Markdown:
            // заголовки, списки и ссылки получаются оформленными, а не
            // сплошной простынёй.
            <Markdown className="flex flex-col gap-3">{text}</Markdown>
          ) : (
            <>
              <Section num={1} title="Общие положения">
                <p>
                  Настоящая Политика конфиденциальности (далее — «Политика»)
                  описывает, какие персональные данные собирает и обрабатывает
                  платформа IMBIR, в каких целях они используются и какие права
                  имеют пользователи в отношении своих данных.
                </p>
                <p>
                  Регистрируясь на Платформе или используя её сервисы, вы
                  соглашаетесь с условиями настоящей Политики. Если вы не
                  согласны с обработкой ваших данных, указанной в Политике,
                  просим воздержаться от использования Платформы.
                </p>
              </Section>

              <Section num={2} title="Какие данные мы собираем">
                <p>Мы собираем следующие категории персональных данных:</p>
                <div className="flex flex-col gap-2 pl-2">
                  <DataItem
                    label="Идентификационные данные"
                    value="имя, фамилия, дата рождения"
                  />
                  <DataItem
                    label="Контактные данные"
                    value="номер телефона, адрес электронной почты"
                  />
                  <DataItem
                    label="Данные о здоровье"
                    value="записи к врачам, история посещений, информация о заболеваниях (по вашему желанию)"
                  />
                  <DataItem
                    label="Технические данные"
                    value="IP-адрес, тип устройства, браузер, файлы cookie"
                  />
                  <DataItem
                    label="Платёжные данные"
                    value="информация о транзакциях (без хранения реквизитов карт)"
                  />
                </div>
              </Section>

              <Section num={3} title="Как мы используем данные">
                <p>Собранные данные используются в следующих целях:</p>
                <div className="flex flex-col gap-2 pl-2">
                  <DataItem
                    label="Запись на приём"
                    value="передача данных выбранной клинике или врачу"
                  />
                  <DataItem
                    label="Уведомления"
                    value="напоминания о записях, результаты анализов, специальные предложения"
                  />
                  <DataItem
                    label="Улучшение сервиса"
                    value="анализ поведения пользователей для оптимизации интерфейса"
                  />
                  <DataItem
                    label="Безопасность"
                    value="предотвращение мошенничества и защита учётных записей"
                  />
                </div>
              </Section>

              <Section num={4} title="Хранение и защита данных">
                <p>
                  Персональные данные хранятся на защищённых серверах,
                  расположенных в Кыргызской Республике и/или в странах
                  Евразийского экономического союза. Передача данных в третьи
                  страны осуществляется только при наличии надлежащих гарантий
                  защиты в соответствии с применимым законодательством.
                </p>
                <p>
                  Мы применяем современные технические и организационные меры
                  защиты: шифрование данных при передаче (TLS), контроль доступа
                  на основе ролей, регулярный аудит безопасности. Тем не менее
                  абсолютная защита данных в интернете не может быть
                  гарантирована.
                </p>
                <p>
                  Данные хранятся в течение срока действия учётной записи, а
                  также в течение 3 лет после её удаления — в целях выполнения
                  законодательных требований.
                </p>
              </Section>

              <Section num={5} title="Права пользователей">
                <p>
                  В соответствии с законодательством Кыргызской Республики вы
                  имеете право:
                </p>
                <div className="flex flex-col gap-2 pl-2">
                  <DataItem
                    label="Доступ"
                    value="получить копию своих персональных данных"
                  />
                  <DataItem
                    label="Исправление"
                    value="потребовать корректировки неточных данных"
                  />
                  <DataItem
                    label="Удаление"
                    value="запросить удаление данных («право на забвение»)"
                  />
                  <DataItem
                    label="Ограничение"
                    value="ограничить обработку данных в установленных законом случаях"
                  />
                  <DataItem
                    label="Переносимость"
                    value="получить данные в машиночитаемом формате"
                  />
                </div>
                <p>
                  Для реализации своих прав направьте запрос на:
                  privacy@imbir.kg
                </p>
              </Section>

              <Section num={6} title="Файлы cookie">
                <p>
                  Платформа использует файлы cookie для обеспечения
                  функциональности сервиса, аутентификации пользователей,
                  анализа трафика и персонализации контента. Вы можете управлять
                  настройками cookie в браузере, однако отключение некоторых
                  типов cookie может ограничить функциональность Платформы.
                </p>
              </Section>

              <Section num={7} title="Изменения в Политике">
                <p>
                  Мы вправе в одностороннем порядке обновлять настоящую
                  Политику. О существенных изменениях вы будете уведомлены по
                  электронной почте или через интерфейс Платформы не менее чем
                  за 7 дней до вступления изменений в силу.
                </p>
                <p>
                  По всем вопросам, связанным с обработкой персональных данных,
                  обращайтесь: privacy@imbir.kg
                </p>
              </Section>
            </>
          )}
        </div>
      </div>

      <div className="hidden md:block mt-auto">
        <Footer />
      </div>
    </main>
  );
}
