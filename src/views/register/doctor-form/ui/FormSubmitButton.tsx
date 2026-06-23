import { Button } from "@/shared/ui";

type Props = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export const FormSubmitButton = ({
  label,
  onClick,
  disabled,
  loading,
}: Props) => (
  <>
    <div className="h-24 md:hidden" />
    <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-white border-t border-border">
      <Button
        className="w-full justify-center h-14 text-base"
        size="lg"
        onClick={onClick}
        disabled={disabled}
        loading={loading}
      >
        {label}
      </Button>
    </div>
    <div className="hidden md:block mt-auto pt-10">
      <Button
        className="w-full justify-center md:h-14 md:text-lg"
        size="lg"
        onClick={onClick}
        disabled={disabled}
        loading={loading}
      >
        {label}
      </Button>
    </div>
  </>
);
