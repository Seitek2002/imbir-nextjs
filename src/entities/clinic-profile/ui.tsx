"use client";

import { FC, SVGProps, useState } from "react";

import Image from "next/image";

import { Button, Input, Textarea } from "@/shared";

const UploadIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
    <path
      d="M2 11L2 14L5 14M14 5L14 2L11 2M5 2L2 2L2 5M11 14L14 14L14 11"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
  const [logoFile] = useState<string | undefined>(logo);

  return (
    <div className="bg-white rounded-3xl p-8 border border-[#E5E6E8]">
      {/* Название */}
      <div className="mb-6">
        <Input label="Название" defaultValue={name} />
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
          <Button variant="outline" size="sm" IconLeft={UploadIcon}>
            Новый логотип
          </Button>
        </div>
      </div>

      {/* Описание */}
      <div className="mb-6">
        <Textarea label="Описание" defaultValue={description} rows={5} />
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
        <Input label="Номер телефона" type="tel" defaultValue={phone} />
        <Input label="Электронная почта" type="email" defaultValue={email} />
        <Input label="Адрес" defaultValue={address} />
        <Input label="График работы" defaultValue={schedule} />
      </div>
    </div>
  );
};
