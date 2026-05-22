"use client";

import { FC, useRef, useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { DoctorSidebar } from "@/widgets/doctor-sidebar";

import { MOCK_DOCTOR_PROFILE } from "@/entities/doctor-profile";

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M15 18L9 12L15 6"
      stroke="#191A1B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const PencilIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M13 2a1.886 1.886 0 012.667 2.667L6.001 14.167 2.334 15.167l1-3.667L13 2z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const CheckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path
      d="M4 11L9 16L18 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FileIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill="#F8F9FA" />
    <path
      d="M20 6H11C10.4696 6 9.96086 6.21071 9.58579 6.58579C9.21071 6.96086 9 7.46957 9 8V24C9 24.5304 9.21071 25.0391 9.58579 25.4142C9.96086 25.7893 10.4696 26 11 26H21C21.5304 26 22.0391 25.7893 22.4142 25.4142C22.7893 25.0391 23 24.5304 23 24V9L20 6Z"
      stroke="#838A8D"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 6V9H23M13 16H19M13 20H19"
      stroke="#838A8D"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const inp =
  "w-full px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#191A1B] placeholder:text-[#C4C8CA] focus:outline-none focus:border-[#F5653E] transition-colors bg-white";
const lbl = "block text-[#838A8D] text-sm mb-1.5";

const MOCK_CERT_NAMES = ["No-name.pdf", "No-name.pdf", "No-name.doc"];

export const DoctorDocumentsPage: FC = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState(
    MOCK_DOCTOR_PROFILE.licenseNumber,
  );
  const [certs, setCerts] = useState<string[]>(
    MOCK_DOCTOR_PROFILE.certificates,
  );
  const certRef = useRef<HTMLInputElement>(null);
  const doc = MOCK_DOCTOR_PROFILE;

  const handleCertUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setCerts((prev) => [...prev, reader.result as string]);
    reader.readAsDataURL(file);
  };

  const title = isEditing ? "Редактировать" : "Сертификаты и документы";

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA]">
      <div className="lg:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-[#E5E6E8]">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F8F9FA] transition-colors"
        >
          <BackIcon />
        </button>
        <h1 className="text-base font-semibold text-[#191A1B] truncate mx-2">
          {title}
        </h1>
        <button
          onClick={() => setIsEditing((v) => !v)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isEditing ? "text-[#F5653E]" : "text-[#838A8D] hover:bg-[#F8F9FA]"}`}
        >
          {isEditing ? <CheckIcon /> : <PencilIcon />}
        </button>
      </div>

      <div className="max-w-360 mx-auto px-4 lg:px-10 py-4 lg:py-8">
        <h1 className="text-[40px] font-semibold text-[#191A1B] mb-8 hidden lg:block">
          Мой профиль
        </h1>
        <div className="flex gap-6">
          <div className="hidden lg:block">
            <DoctorSidebar
              fullName={doc.fullName}
              photo={doc.photo}
              specialty={doc.specialty}
              rating={doc.rating}
            />
          </div>
          <main className="flex-1 min-w-0">
            <div className="hidden lg:flex items-center justify-between mb-6">
              <h2 className="text-[28px] font-semibold text-[#191A1B]">
                {title}
              </h2>
              <button
                onClick={() => setIsEditing((v) => !v)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-colors ${isEditing ? "bg-[#F5653E] text-white hover:bg-[#E5542D]" : "border border-[#E5E6E8] text-[#686F72] hover:bg-[#F8F9FA]"}`}
              >
                {isEditing ? (
                  <>
                    <CheckIcon /> Сохранить
                  </>
                ) : (
                  <>
                    <PencilIcon /> Редактировать
                  </>
                )}
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-[#E5E6E8] p-5 lg:p-8 space-y-6">
              {/* Certificates */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[#838A8D] text-sm">Сертификаты</p>
                  {isEditing && (
                    <>
                      <input
                        ref={certRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleCertUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => certRef.current?.click()}
                        className="text-[#F5653E] text-sm font-medium flex items-center gap-1"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                        >
                          <path
                            d="M7 2V12M2 7H12"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                        Добавить документ
                      </button>
                    </>
                  )}
                </div>

                {/* Mock file icons (view) or real uploads */}
                <div className="flex flex-wrap gap-3">
                  {certs.length === 0
                    ? MOCK_CERT_NAMES.map((name, i) => (
                        <div
                          key={i}
                          className="flex flex-col items-center gap-1"
                        >
                          <FileIcon />
                          <span className="text-[#838A8D] text-xs">{name}</span>
                        </div>
                      ))
                    : certs.map((cert, i) => (
                        <div key={i} className="relative">
                          <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#E5E6E8] bg-[#F8F9FA]">
                            <Image
                              src={cert}
                              alt={`cert-${i}`}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {isEditing && (
                            <button
                              onClick={() =>
                                setCerts((prev) =>
                                  prev.filter((_, j) => j !== i),
                                )
                              }
                              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#F5653E] flex items-center justify-center"
                            >
                              <svg
                                width="8"
                                height="8"
                                viewBox="0 0 8 8"
                                fill="none"
                              >
                                <path
                                  d="M6.5 1.5L1.5 6.5M1.5 1.5L6.5 6.5"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                  {isEditing && certs.length === 0 && (
                    <button
                      onClick={() => certRef.current?.click()}
                      className="w-16 h-16 rounded-xl border-2 border-dashed border-[#E5E6E8] flex items-center justify-center text-[#C4C8CA] hover:border-[#F5653E] hover:text-[#F5653E] transition-colors"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M10 4V16M4 10H16"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* License */}
              <div>
                <p className="text-[#838A8D] text-sm mb-1.5">Номер лицензии</p>
                {isEditing ? (
                  <input
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="ЛИЦ-XXXXXX"
                    className={inp}
                  />
                ) : (
                  <p className="text-[#191A1B] font-medium text-base">
                    {licenseNumber || "—"}
                  </p>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
