"use client";

import { FC } from "react";

import { EmailIcon, PhoneIcon } from "@/shared/assets/icons";
import { Modal } from "@/shared/ui/modal";

type Props = {
  email?: null | string;
  isOpen: boolean;
  onClose: () => void;
  phone?: null | string;
  title?: string;
};

export const ContactInfoModal: FC<Props> = ({
  isOpen,
  onClose,
  title = "Офлайн-запись",
  phone,
  email,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title}>
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        Для записи на офлайн-приём свяжитесь по контактам ниже
      </p>
      <div className="flex items-center gap-3">
        <span className="text-primary shrink-0">
          <PhoneIcon className="size-5" />
        </span>
        {phone ? (
          <a
            href={`tel:${phone}`}
            className="text-foreground text-sm md:text-base hover:text-primary hover:underline transition-colors"
          >
            {phone}
          </a>
        ) : (
          <span className="text-foreground text-sm md:text-base">-</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-primary shrink-0">
          <EmailIcon className="size-5" />
        </span>
        {email ? (
          <a
            href={`mailto:${email}`}
            className="text-foreground text-sm md:text-base hover:text-primary hover:underline transition-colors"
          >
            {email}
          </a>
        ) : (
          <span className="text-foreground text-sm md:text-base">-</span>
        )}
      </div>
    </div>
  </Modal>
);
