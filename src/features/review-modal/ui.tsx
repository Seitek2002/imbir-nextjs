"use client";

import { FC, useCallback, useState } from "react";

import Image from "next/image";

import { Button } from "@/shared";

import { StarBoldIcon, StarOutlineIcon } from "@/shared/assets";
import { useScrollLock } from "@/shared/lib/useScrollLock";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorClinic: string;
  doctorImage?: string;
  onSubmit: (rating: number, comment: string) => void;
};

const DURATION = 200;

export const ReviewModal: FC<Props> = ({
  isOpen,
  onClose,
  title = "Оставить свой отзыв",
  doctorName,
  doctorSpecialty,
  doctorClinic,
  doctorImage,
  onSubmit,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isClosing, setIsClosing] = useState(false);

  useScrollLock(isOpen);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, DURATION);
  }, [onClose]);

  if (!isOpen && !isClosing) return null;

  const state = isClosing ? "closed" : "open";

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit(rating, comment);
    setRating(0);
    setComment("");
    handleClose();
  };

  const body = (
    <div className="p-5 space-y-4">
      {/* Doctor Info */}
      <div className="flex items-center gap-3 p-4 bg-surface rounded-2xl">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-white shrink-0">
          {doctorImage ? (
            <Image
              src={doctorImage}
              alt={doctorName}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-dim text-lg font-semibold">
              {doctorName.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-foreground font-semibold text-base leading-tight">
            {doctorName}
          </h3>
          {(doctorSpecialty || doctorClinic) && (
            <p className="text-muted text-sm mt-0.5">
              {doctorSpecialty}{" "}
              {doctorClinic && (
                <span className="text-primary">• {doctorClinic}</span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Rating */}
      <div>
        <label className="block text-foreground font-medium text-base mb-3">
          Оцените специалиста
        </label>
        <div className="flex items-center gap-2 p-4 bg-surface rounded-2xl justify-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              {star <= rating ? (
                <StarBoldIcon className="w-10 h-10 text-primary" />
              ) : (
                <StarOutlineIcon className="w-10 h-10 text-border" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-foreground font-medium text-base mb-3">
          Поделитесь своим мнением о специалисте
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Введите текст"
          rows={5}
          className="w-full p-4 rounded-2xl border border-border text-foreground placeholder:text-dim focus:outline-none focus:border-primary resize-none transition-colors"
        />
      </div>

      <Button
        size="lg"
        className="w-full"
        onClick={handleSubmit}
        disabled={rating === 0}
      >
        Отправить
      </Button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="modal-overlay absolute inset-0 bg-black/50"
        data-state={state}
        onClick={handleClose}
      />

      {/* Mobile bottom-sheet */}
      <div
        className="modal-sheet sm:hidden relative bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto"
        data-state={state}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-0">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5"
                stroke={colors.secondary}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        {body}
      </div>

      {/* Desktop centered */}
      <div
        className="modal-panel hidden sm:block relative bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl"
        data-state={state}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-0">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke={colors.secondary}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        {body}
      </div>
    </div>
  );
};
