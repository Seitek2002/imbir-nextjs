import { SuccessCheckIcon } from "@/shared/assets/icons";
import { Button } from "@/shared/ui";

export const SuccessModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-50 bg-overlay/40 backdrop-blur-[2px] flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl border border-border-soft p-8 max-w-sm w-full flex flex-col items-center text-center gap-5">
      <SuccessCheckIcon className="size-50" />
      <div>
        <p className="text-[20px] font-semibold text-foreground leading-[130%]">
          Ваша запись
          <br />
          успешно забронирована!
        </p>
        <p className="text-sm text-secondary mt-2">
          Ожидайте сообщение от вашего специалиста
        </p>
      </div>
      <Button className="w-full justify-center" onClick={onClose}>
        Спасибо
      </Button>
    </div>
  </div>
);
