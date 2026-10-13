import type { Metadata } from "next";

import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

import { ROUTES } from "@/shared/config";

export const metadata: Metadata = {
  title: "Согласие на обработку персональных данных — образец | Imbir",
};

// Исходник образца лежит в public/documents — его же отдаём на скачивание,
// а страница показывает текст, чтобы документ открывался прямо во вкладке
// (.docx браузер сам не покажет, а только скачает).
const DOCX_URL = "/documents/soglasie-na-obrabotku-pd-obrazec.docx";

// Поле для заполнения от руки: линия с подписью под ней.
const Blank = ({ hint, wide }: { hint?: string; wide?: boolean }) => (
  <span className="inline-flex flex-col align-top mx-1">
    <span
      className={`inline-block border-b border-foreground/60 h-5 ${wide ? "min-w-64" : "min-w-24"}`}
    />
    {hint && (
      <span className="text-[11px] text-muted leading-tight">{hint}</span>
    )}
  </span>
);

export default function PersonalDataConsentPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header title="Образец согласия" backTo={ROUTES.HOME} />

      <div className="flex-1 w-full max-w-360 mx-auto px-4 md:px-10 py-6 md:py-10">
        <div className="bg-white rounded-3xl p-6 md:p-12 max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
            <p className="text-muted text-sm">
              Образец документа. Заполняется и подписывается в клинике.
            </p>
            <a
              href={DOCX_URL}
              download
              className="inline-flex items-center justify-center rounded-xl bg-primary text-white text-sm font-medium px-4 py-2.5 shrink-0"
            >
              Скачать .docx
            </a>
          </div>

          <div className="text-right text-sm text-secondary mb-6 leading-relaxed">
            Приложение № 3
            <br />к Договору на оказание платных медицинских услуг №
            <Blank />
            <br />
            от «<Blank />» <Blank /> 20__ года.
          </div>

          <h1 className="text-center text-xl md:text-2xl font-bold text-foreground mb-1">
            СОГЛАСИЕ
          </h1>
          <p className="text-center text-sm text-secondary mb-8">
            субъекта персональных данных на предоставление и обработку его
            персональных данных
          </p>

          <div className="flex flex-col gap-4 text-sm text-foreground leading-relaxed">
            <p>
              Я, нижеподписавшийся <Blank wide hint="(Ф.И.О. полностью)" />,
              проживающий по адресу <Blank wide />, по месту регистрации{" "}
              <Blank wide />, паспорт серия <Blank /> номер <Blank />, выдан{" "}
              <Blank wide hint="(название выдавшего органа)" /> дата <Blank />,
              в соответствии с требованиями статьи 79 Цифрового кодекса
              Кыргызской Республики подтверждаю свое добровольное согласие на
              обработку{" "}
              <Blank
                wide
                hint="(наименование, адрес собственника или владельца информационной системы, ФИО обработчика)"
              />{" "}
              (далее — Оператор), моих персональных данных, включающих: фамилию,
              имя, отчество, адрес проживания, контактный телефон, адрес
              электронной почты, а также данных, составляющих врачебную тайну.
            </p>
            <p>
              Предоставляю Оператору право осуществлять все действия (операции)
              с моими персональными данными, включая сбор, систематизацию,
              накопление, хранение, обновление, изменение, использование,
              обезличивание, блокирование, уничтожение. Оператор вправе
              обрабатывать мои персональные данные посредством внесения их в
              электронную базу данных, включения в списки (реестры) и отчетные
              формы.
            </p>
            <p>
              Передача моих персональных данных иным лицам или иное их
              разглашение может осуществляться только с моего письменного
              согласия.
            </p>
            <p>
              Настоящее добровольное согласие дано мной <Blank hint="(дата)" />{" "}
              и действует бессрочно.
            </p>
            <p>
              Я оставляю за собой право отозвать свое согласие посредством
              составления соответствующего письменного документа, который может
              быть направлен мной в адрес Оператора по почте заказным письмом с
              уведомлением о вручении, либо вручением его лично под расписку
              представителю Оператора.
            </p>
            <p>
              В случае получения моего письменного заявления об отзыве
              настоящего согласия на обработку персональных данных, Оператор
              обязан прекратить их обработку в течение периода времени,
              необходимого для завершения взаиморасчетов по оплате оказанной мне
              до этого медицинской помощи.
            </p>
            <p>
              Я подтверждаю, что ознакомлен(а) с положениями Цифрового кодекса
              Кыргызской Республики. Права и обязанности в области защиты
              персональных данных мне разъяснены.
            </p>
            <p>
              Контактный телефон(ы) <Blank wide /> и почтовый адрес{" "}
              <Blank wide />
            </p>
            <p className="pt-4">
              Подпись субъекта персональных данных <Blank wide />
              <Blank hint="дата (число, месяц, год)" />
              <Blank hint="ФИО" />
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
