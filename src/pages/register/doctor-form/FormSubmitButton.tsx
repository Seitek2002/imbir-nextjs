import { Button } from "@/shared/ui";

type Props = {
  label: string;
  disabled?: boolean;
  loading?: boolean;
};

// Обе кнопки — type="submit" и без onClick: действие задаёт onSubmit формы,
// поэтому оно одинаково срабатывает и по клику, и по Enter из любого поля.
// Кнопок две (закреплённая снизу на мобильном и обычная на десктопе), но
// одновременно видна ровно одна, а disabled у них общий — какая бы из них ни
// стала для браузера кнопкой по умолчанию, поведение Enter не изменится.
export const FormSubmitButton = ({ label, disabled, loading }: Props) => (
  <>
    <div className="h-24 md:hidden" />
    <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-white border-t border-border">
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
    <div className="hidden md:block mt-auto pt-10">
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
