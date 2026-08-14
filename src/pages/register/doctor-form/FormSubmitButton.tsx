import { Button } from "@/shared/ui";

type Props = {
  label: string;
  disabled?: boolean;
  loading?: boolean;
  // Шаг назад по мастеру — используется на всех шагах (на первом уводит к
  // выбору роли), это единственный способ вернуться назад на мобильном:
  // шапка регистрации теперь общая с /login и своей кнопки "назад" не имеет.
  onBack?: () => void;
};

// Кнопки — type="submit" и без onClick: действие задаёт onSubmit формы,
// поэтому оно одинаково срабатывает и по клику, и по Enter из любого поля.
// Каждая пара (закреплённая снизу на мобильном и обычная на десктопе)
// дублируется, но одновременно видна ровно одна, а disabled у submit-кнопок
// общий — какая бы из них ни стала для браузера кнопкой по умолчанию,
// поведение Enter не изменится ("Назад" — type="button", Enter её не задевает).
export const FormSubmitButton = ({
  label,
  disabled,
  loading,
  onBack,
}: Props) => (
  <>
    <div className={onBack ? "h-40 md:hidden" : "h-24 md:hidden"} />
    <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-white border-t border-border flex flex-col gap-3">
      {onBack && (
        <Button
          type="button"
          variant="outline"
          className="w-full justify-center h-14 text-base"
          size="lg"
          onClick={onBack}
        >
          Назад
        </Button>
      )}
      <Button
        type="submit"
        className="w-full justify-center h-14 text-base"
        size="lg"
        disabled={disabled}
        loading={loading}
      >
        {label}
      </Button>
    </div>
    <div className="hidden md:flex flex-col gap-3 mt-auto pt-10">
      {onBack && (
        <Button
          type="button"
          variant="outline"
          className="w-full justify-center md:h-14 md:text-lg"
          size="lg"
          onClick={onBack}
        >
          Назад
        </Button>
      )}
      <Button
        type="submit"
        className="w-full justify-center md:h-14 md:text-lg"
        size="lg"
        disabled={disabled}
        loading={loading}
      >
        {label}
      </Button>
    </div>
  </>
);
