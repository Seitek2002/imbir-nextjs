import { FC } from "react";

import { ROUTES } from "@/shared/config";
import { cn } from "@/shared/lib/utils";

// Строка под формой регистрации со ссылкой на образец согласия на обработку
// персональных данных. Открываем в новой вкладке — иначе человек терял бы
// уже заполненную анкету.
export const ConsentNotice: FC<{ className?: string }> = ({ className }) => (
  <p className={cn("text-xs text-muted leading-relaxed", className)}>
    Регистрируясь, вы даёте согласие на обработку персональных данных.{" "}
    <a
      href={ROUTES.PERSONAL_DATA_CONSENT}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-2"
    >
      Образец согласия
    </a>
  </p>
);
