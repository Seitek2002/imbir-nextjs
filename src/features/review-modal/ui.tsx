"use client";

import { FC, useCallback, useState } from "react";

import Image from "next/image";

import { Button } from "@/shared";

import { StarBoldIcon, StarOutlineIcon } from "@/shared/assets";

type Props = {
  isOpen: boolean;
  onClose: () => void;
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
  doctorName,
  doctorSpecialty,
  doctorClinic,
  doctorImage,
  onSubmit,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isClosing, setIsClosing] = useState(false);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="modal-overlay absolute inset-0 bg-black/50"
        data-state={state}
        onClick={handleClose}
      />
      <div
        className="modal-panel relative bg-white rounded-3xl w-full max-w-md overflow-hidden"
        data-state={state}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E5E6E8]">
          <h2 className="text-xl font-semibold text-[#191A1B]">
            Оставить свой отзыв
          </h2>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F8F9FA] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="#686F72"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Doctor Info */}
          <div className="flex items-center gap-3 p-4 bg-[#F8F9FA] rounded-2xl mb-6">
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
                <div className="w-full h-full flex items-center justify-center text-[#C4C8CA] text-lg font-semibold">
                  {doctorName.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[#191A1B] font-semibold text-base leading-tight">
                {doctorName}
              </h3>
              <p className="text-[#838A8D] text-sm mt-0.5">
                {doctorSpecialty}{" "}
                <span className="text-[#F5653E]">• {doctorClinic}</span>
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className="mb-6">
            <label className="block text-[#191A1B] font-medium text-base mb-3">
              Оцените специалиста
            </label>
            <div className="flex items-center gap-2 p-4 bg-[#F8F9FA] rounded-2xl justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  {star <= rating ? (
                    <StarBoldIcon className="w-10 h-10 text-[#F5653E]" />
                  ) : (
                    <StarOutlineIcon className="w-10 h-10 text-[#E5E6E8]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-[#191A1B] font-medium text-base mb-3">
              Поделитесь своим мнением о специалисте
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Введите текст"
              rows={5}
              className="w-full p-4 rounded-2xl border border-[#E5E6E8] text-[#191A1B] placeholder:text-[#C4C8CA] focus:outline-none focus:border-[#F5653E] resize-none transition-colors"
            />
          </div>

          {/* Submit */}
          <Button
            size="lg"
            className="w-full"
            onClick={handleSubmit}
            disabled={rating === 0}
          >
            Отправить
          </Button>
        </div>
      </div>
    </div>
  );
};
