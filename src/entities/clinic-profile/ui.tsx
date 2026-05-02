"use client";

import { FC, useState } from "react";

import Image from "next/image";

type Props = {
  name: string;
  logo?: string;
  description: string;
  photos: string[];
  phone: string;
  email: string;
  address: string;
  schedule: string;
};

export const ClinicProfileForm: FC<Props> = ({
  name,
  logo,
  description,
  photos,
  phone,
  email,
  address,
  schedule,
}) => {
  const [logoFile, setLogoFile] = useState<string | undefined>(logo);

  return (
    <div className="bg-white rounded-3xl p-8 border border-[#E5E6E8]">
      {/* Название */}
      <div className="mb-6">
        <label className="block text-[#686F72] text-sm mb-2">Название</label>
        <input
          type="text"
          defaultValue={name}
          className="w-full px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#191A1B] focus:outline-none focus:border-[#F5653E] transition-colors"
        />
      </div>

      {/* Логотип */}
      <div className="mb-6">
        <label className="block text-[#686F72] text-sm mb-2">Логотип</label>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-[#F5653E] to-[#FF8A6B] flex items-center justify-center">
            {logoFile ? (
              <Image
                src={logoFile}
                alt="Logo"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-4xl font-bold">
                {name.charAt(0)}
              </span>
            )}
          </div>
          <button className="px-4 py-2 rounded-full border border-[#E5E6E8] text-[#686F72] text-sm hover:bg-[#F8F9FA] transition-colors flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 11L2 14L5 14M14 5L14 2L11 2M5 2L2 2L2 5M11 14L14 14L14 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Новый логотип
          </button>
        </div>
      </div>

      {/* Описание */}
      <div className="mb-6">
        <label className="block text-[#686F72] text-sm mb-2">Описание</label>
        <textarea
          defaultValue={description}
          rows={5}
          className="w-full px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#191A1B] resize-none focus:outline-none focus:border-[#F5653E] transition-colors"
        />
      </div>

      {/* Фотографии */}
      <div className="mb-6">
        <label className="block text-[#686F72] text-sm mb-2">Фотографии</label>
        <div className="flex items-center gap-4 overflow-x-auto pb-2">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="w-24 h-24 rounded-2xl overflow-hidden bg-[#F8F9FA] flex-shrink-0"
            >
              <Image
                src={photo}
                alt={`Photo ${index + 1}`}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          <button className="w-24 h-24 rounded-2xl border-2 border-dashed border-[#E5E6E8] flex items-center justify-center hover:border-[#F5653E] transition-colors flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5V19M5 12H19"
                stroke="#C4C8CA"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Контакты в 2 колонки */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[#686F72] text-sm mb-2">
            Номер телефона
          </label>
          <input
            type="tel"
            defaultValue={phone}
            className="w-full px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#191A1B] focus:outline-none focus:border-[#F5653E] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[#686F72] text-sm mb-2">
            Электронная почта
          </label>
          <input
            type="email"
            defaultValue={email}
            className="w-full px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#191A1B] focus:outline-none focus:border-[#F5653E] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[#686F72] text-sm mb-2">Адрес</label>
          <input
            type="text"
            defaultValue={address}
            className="w-full px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#191A1B] focus:outline-none focus:border-[#F5653E] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[#686F72] text-sm mb-2">
            График работы
          </label>
          <input
            type="text"
            defaultValue={schedule}
            className="w-full px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#191A1B] focus:outline-none focus:border-[#F5653E] transition-colors"
          />
        </div>
      </div>
    </div>
  );
};
