"use client";

import { useRef, useState } from "react";

import { EyeIcon, EyeOffIcon } from "@/shared/assets";
import { cn } from "@/shared/lib/utils";
import {
  Button,
  Checkbox,
  Dropdown,
  Input,
  PhoneInput,
  Textarea,
} from "@/shared/ui";

export type DoctorStep = 1 | 2 | 3 | 4;

export type DoctorFormData = {
  fullName: string;
  gender: "male" | "female" | "";
  birthDate: string;
  city: string;
  languages: string[];
  phone: string;
  email: string;
  photo: File | null;

  specialization: string;
  additionalSpecialization: string;
  experience: string;
  position: string;
  workplace: string;
  category: string;
  academicDegree: string;

  university: string;
  graduationYear: string;
  internship: string;
  residency: string;
  diplomaSpecialization: string;
  additionalEducation: string;

  certificates: File[];
  licenseNumber: string;

  password: string;
  confirmPassword: string;
  agree: boolean;
};

const CITIES = [
  { label: "Бишкек", value: "bishkek" },
  { label: "Ош", value: "osh" },
  { label: "Джалал-Абад", value: "jalal-abad" },
  { label: "Каракол", value: "karakol" },
  { label: "Токмок", value: "tokmok" },
  { label: "Нарын", value: "naryn" },
];

const LANGUAGES = [
  { label: "Кыргызский", value: "kyrgyz" },
  { label: "Русский", value: "russian" },
  { label: "Английский", value: "english" },
];

const SPECIALIZATIONS = [
  { label: "Терапевт", value: "therapist" },
  { label: "Хирург", value: "surgeon" },
  { label: "Кардиолог", value: "cardiologist" },
  { label: "Невролог", value: "neurologist" },
  { label: "Стоматолог", value: "dentist" },
  { label: "Педиатр", value: "pediatrician" },
  { label: "Гинеколог", value: "gynecologist" },
  { label: "Офтальмолог", value: "ophthalmologist" },
  { label: "Лор", value: "ent" },
  { label: "Дерматолог", value: "dermatologist" },
];

const STEP_TITLES: Record<DoctorStep, string> = {
  1: "Основная информация",
  2: "Профессиональные данные",
  3: "Образование",
  4: "Сертификаты и документы",
};

const UploadIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path
      d="M22 18v3a1 1 0 01-1 1H7a1 1 0 01-1-1v-3"
      stroke="#F5653E"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M14 6v12M10 10l4-4 4 4"
      stroke="#F5653E"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const InfoIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    className="shrink-0 mt-0.5"
  >
    <circle cx="9" cy="9" r="8" stroke="#838A8D" strokeWidth="1.5" />
    <path
      d="M9 8v5M9 6h.01"
      stroke="#838A8D"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const PdfIcon = () => (
  <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
    <rect
      x="1"
      y="1"
      width="26"
      height="30"
      rx="3"
      stroke="#E3E4E5"
      strokeWidth="1.5"
    />
    <text x="4" y="21" fontSize="8" fill="#F5653E" fontWeight="bold">
      PDF
    </text>
  </svg>
);

const DocIcon = () => (
  <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
    <rect
      x="1"
      y="1"
      width="26"
      height="30"
      rx="3"
      stroke="#E3E4E5"
      strokeWidth="1.5"
    />
    <text x="3" y="21" fontSize="7.5" fill="#4B89DC" fontWeight="bold">
      DOC
    </text>
  </svg>
);

const CertificateThumb = ({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) => {
  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf";

  return (
    <div className="relative flex flex-col items-center gap-1">
      <div className="relative size-16 rounded-lg overflow-hidden border border-[#E5E6E8] bg-[#F2F3F5] flex items-center justify-center">
        {isImage ? (
          <img
            src={URL.createObjectURL(file)}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        ) : isPdf ? (
          <PdfIcon />
        ) : (
          <DocIcon />
        )}
        <button
          onClick={onRemove}
          className="absolute top-0 right-0 w-1/2 aspect-square bg-black/60 flex items-center justify-center text-white leading-none"
        >
          ×
        </button>
      </div>
      <span className="text-[10px] text-[#838A8D] max-w-[64px] truncate">
        {file.name}
      </span>
    </div>
  );
};

export type InviteClinic = {
  clinicId: string;
  clinicName: string;
  branchId: string | null;
  branchAddress: string;
};

type Props = {
  step: DoctorStep;
  onContinue: () => void;
  onSubmit: (data: DoctorFormData) => void;
  isSubmitting?: boolean;
  inviteClinic?: InviteClinic;
};

export const DoctorRegistrationForm = ({
  step,
  onContinue,
  onSubmit,
  isSubmitting = false,
  inviteClinic,
}: Props) => {
  const [data, setData] = useState<DoctorFormData>({
    fullName: "",
    gender: "",
    birthDate: "",
    city: "",
    languages: [],
    phone: "",
    email: "",
    photo: null,
    specialization: "",
    additionalSpecialization: "",
    experience: "0",
    position: "",
    workplace: inviteClinic?.clinicName ?? "",
    category: "",
    academicDegree: "",
    university: "",
    graduationYear: "",
    internship: "",
    residency: "",
    diplomaSpecialization: "",
    additionalEducation: "",
    certificates: [],
    licenseNumber: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const photoInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const set = <K extends keyof DoctorFormData>(
    key: K,
    value: DoctorFormData[K],
  ) => setData((prev) => ({ ...prev, [key]: value }));

  const isStep1Valid = !!(
    data.fullName &&
    data.gender &&
    data.birthDate &&
    data.city &&
    data.phone.length > 0 &&
    data.email
  );

  const passwordError =
    data.confirmPassword && data.password !== data.confirmPassword
      ? "Пароли не совпадают"
      : "";

  const isStep4Valid =
    data.password.length >= 8 &&
    data.password === data.confirmPassword &&
    data.agree;

  const isValid = step === 1 ? isStep1Valid : step === 4 ? isStep4Valid : true;

  const handleContinue = () => {
    if (step < 4) onContinue();
    else onSubmit(data);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Progress bar */}
      <div className="flex gap-1.5 mb-6 md:mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 h-1 rounded-full transition-colors",
              i < step ? "bg-[#F5653E]" : "bg-[#E3E4E5]",
            )}
          />
        ))}
      </div>

      <h2 className="text-2xl font-semibold text-[#191A1B] mb-6">
        {STEP_TITLES[step]}
      </h2>

      {/* Step 1: Basic info */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <Input
            label="ФИО"
            placeholder="Введите ваше полное имя"
            value={data.fullName}
            onChange={(e) => set("fullName", e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[#0D0D12]">Пол</span>
            <div className="flex gap-3">
              {(
                [
                  { value: "male", label: "Мужской" },
                  { value: "female", label: "Женский" },
                ] as const
              ).map(({ value, label }) => (
                <label
                  key={value}
                  className={cn(
                    "flex-1 flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all",
                    data.gender === value
                      ? "border-[#F5653E]"
                      : "border-[#E5E6E8]",
                  )}
                >
                  <input
                    type="radio"
                    name="doctor-gender"
                    value={value}
                    checked={data.gender === value}
                    onChange={() => set("gender", value)}
                    className="sr-only"
                  />
                  <div
                    className={cn(
                      "size-5 rounded-full border-4 flex items-center justify-center shrink-0 transition-all",
                      data.gender === value
                        ? "border-[#F5653E]"
                        : "border-[#E3E4E5]",
                    )}
                  >
                    {data.gender === value && (
                      <div className="size-2.5 rounded-full bg-[#F5653E]" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-[#0D0D12]">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <Input
            label="Дата рождения"
            placeholder="ДД.ММ.ГГГГ"
            value={data.birthDate}
            onChange={(e) => set("birthDate", e.target.value)}
          />

          <Dropdown
            label="Город"
            placeholder="Выберите из списка"
            options={CITIES}
            value={data.city}
            onChange={(v) => set("city", v)}
          />

          <Dropdown
            label="Языки общения"
            placeholder="Выберите из списка"
            options={LANGUAGES}
            isMulti
            value={data.languages}
            onChange={(v) => set("languages", v)}
          />

          <PhoneInput
            label="Телефон"
            value={data.phone}
            onChange={(v) => set("phone", v)}
          />

          <Input
            label="Почта"
            type="email"
            placeholder="Введите вашу почту"
            value={data.email}
            onChange={(e) => set("email", e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[#0D0D12]">Фото</span>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) set("photo", file);
              }}
            />
            {data.photo ? (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-[#E5E6E8]">
                <div className="relative size-14 rounded-lg overflow-hidden shrink-0">
                  <img
                    src={URL.createObjectURL(data.photo)}
                    alt="фото"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => set("photo", null)}
                    className="absolute top-0 right-0 w-1/2 aspect-square bg-black/60 flex items-center justify-center text-white leading-none"
                  >
                    ×
                  </button>
                </div>
                <span className="text-sm text-[#838A8D] truncate flex-1">
                  {data.photo.name}
                </span>
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-full border border-[#E5E6E8] text-[#686F72] text-sm hover:bg-[#F8F9FA] transition-colors shrink-0"
                >
                  Заменить
                </button>
              </div>
            ) : (
              <button
                onClick={() => photoInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-[#E5E6E8] hover:border-[#F5653E]/40 transition-colors w-full"
              >
                <UploadIcon />
                <span className="text-sm font-medium text-[#0D0D12]">
                  Загрузить фото
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Professional data */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <Dropdown
            label="Специализация"
            placeholder="Выберите из списка"
            options={SPECIALIZATIONS}
            value={data.specialization}
            onChange={(v) => set("specialization", v)}
          />
          <Dropdown
            label="Дополнительная специализация"
            placeholder="Выберите из списка"
            options={SPECIALIZATIONS}
            value={data.additionalSpecialization}
            onChange={(v) => set("additionalSpecialization", v)}
          />
          <Input
            label="Стаж работы (лет)"
            type="number"
            placeholder="0"
            value={data.experience}
            onChange={(e) => set("experience", e.target.value)}
          />
          <Input
            label="Текущая должность"
            placeholder="Введите должность"
            value={data.position}
            onChange={(e) => set("position", e.target.value)}
          />
          {inviteClinic ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[#0D0D12]">
                Место работы (клиника)
              </span>
              <div className="h-11 px-3 rounded-lg border border-[#E3E4E5] bg-[#F7F8F9] flex items-center justify-between gap-2">
                <span className="text-sm text-[#191A1B] flex-1 truncate">
                  {inviteClinic.clinicName}
                  {inviteClinic.branchId && (
                    <span className="text-[#838A8D] ml-1">
                      — {inviteClinic.branchAddress}
                    </span>
                  )}
                </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="shrink-0 text-[#838A8D]"
                >
                  <path d="M11 6H3M5 3L2 6l3 3M9 3l3 3-3 3" stroke="none" />
                  <rect
                    x="4"
                    y="1"
                    width="6"
                    height="8"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M2 9v3a1 1 0 001 1h8a1 1 0 001-1V9"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M5 5h4M5 7h2"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p className="text-xs text-[#838A8D]">
                Заполнено клиникой при приглашении
              </p>
            </div>
          ) : (
            <Input
              label="Место работы (клиника)"
              placeholder="Введите название клиники"
              value={data.workplace}
              onChange={(e) => set("workplace", e.target.value)}
            />
          )}
          <Input
            label="Категория/Квалификация"
            placeholder="Введите категорию/квалификацию"
            value={data.category}
            onChange={(e) => set("category", e.target.value)}
          />
          <Input
            label="Научная степень"
            placeholder="Введите научную степень"
            value={data.academicDegree}
            onChange={(e) => set("academicDegree", e.target.value)}
          />
        </div>
      )}

      {/* Step 3: Education */}
      {step === 3 && (
        <div className="flex flex-col gap-4">
          <Input
            label="ВУЗ"
            placeholder="Введите название"
            value={data.university}
            onChange={(e) => set("university", e.target.value)}
          />
          <Input
            label="Год окончания"
            placeholder="ГГГГ"
            value={data.graduationYear}
            onChange={(e) => set("graduationYear", e.target.value)}
          />
          <Input
            label="Интернатура"
            placeholder="Введите интернатуру"
            value={data.internship}
            onChange={(e) => set("internship", e.target.value)}
          />
          <Input
            label="Ординатура"
            placeholder="Введите ординатуру"
            value={data.residency}
            onChange={(e) => set("residency", e.target.value)}
          />
          <Input
            label="Специализация по диплому"
            placeholder="Введите специализацию по диплому"
            value={data.diplomaSpecialization}
            onChange={(e) => set("diplomaSpecialization", e.target.value)}
          />
          <Textarea
            label="Дополнительное образование"
            placeholder="Курсы повышения квалификации, сертификаты..."
            value={data.additionalEducation}
            onChange={(e) => set("additionalEducation", e.target.value)}
          />
        </div>
      )}

      {/* Step 4: Certificates */}
      {step === 4 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[#0D0D12]">
              Сертификаты
            </span>
            <input
              ref={certInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,image/*"
              className="sr-only"
              onChange={(e) => {
                if (!e.target.files) return;
                set("certificates", [
                  ...data.certificates,
                  ...Array.from(e.target.files),
                ]);
                e.target.value = "";
              }}
            />
            <div className="p-4 rounded-xl border-2 border-dashed border-[#E5E6E8] min-h-[112px]">
              {data.certificates.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {data.certificates.map((file, i) => (
                    <CertificateThumb
                      key={i}
                      file={file}
                      onRemove={() =>
                        set(
                          "certificates",
                          data.certificates.filter((_, idx) => idx !== i),
                        )
                      }
                    />
                  ))}
                  <button
                    onClick={() => certInputRef.current?.click()}
                    className="size-16 rounded-lg border-2 border-dashed border-[#E5E6E8] flex items-center justify-center text-[#F5653E] text-2xl hover:border-[#F5653E]/40 transition-colors"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => certInputRef.current?.click()}
                  className="w-full min-h-[80px] flex items-center justify-center gap-2"
                >
                  <UploadIcon />
                  <span className="text-sm font-medium text-[#0D0D12]">
                    Загрузить документы
                  </span>
                </button>
              )}
            </div>
          </div>

          <Input
            label="Лицензия"
            placeholder="Введите номер лицензии"
            value={data.licenseNumber}
            onChange={(e) => set("licenseNumber", e.target.value)}
          />

          <Input
            label="Пароль"
            type={showPassword ? "text" : "password"}
            placeholder="Минимум 8 символов"
            IconRight={showPassword ? EyeIcon : EyeOffIcon}
            onIconRightClick={() => setShowPassword(!showPassword)}
            value={data.password}
            onChange={(e) => set("password", e.target.value)}
          />

          <Input
            label="Подтвердите пароль"
            type={showConfirm ? "text" : "password"}
            placeholder="Введите пароль повторно"
            IconRight={showConfirm ? EyeIcon : EyeOffIcon}
            onIconRightClick={() => setShowConfirm(!showConfirm)}
            value={data.confirmPassword}
            onChange={(e) => set("confirmPassword", e.target.value)}
            error={passwordError}
          />

          <Checkbox
            checked={data.agree}
            onChange={(e) => set("agree", e.target.checked)}
            label="Принимаю условия использования и политику конфиденциальности"
          />

          <div className="flex gap-3 p-4 rounded-xl bg-[#F2F3F5] mt-2">
            <InfoIcon />
            <p className="text-sm text-[#838A8D]">
              После регистрации вы получите доступ к личному кабинету врача, где
              сможете управлять расписанием, просматривать записи пациентов и
              вести историю приёмов
            </p>
          </div>
        </div>
      )}

      {/* Spacer for mobile fixed button */}
      <div className="h-24 md:hidden" />

      {/* Mobile: fixed bottom button */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-white border-t border-[#E5E6E8]">
        <Button
          className="w-full justify-center h-14 text-base"
          size="lg"
          onClick={handleContinue}
          disabled={!isValid || isSubmitting}
          loading={step === 4 && isSubmitting}
        >
          {step === 4 ? "Завершить регистрацию" : "Продолжить"}
        </Button>
      </div>

      {/* Desktop: inline button */}
      <div className="hidden md:block mt-auto pt-10">
        <Button
          className="w-full justify-center md:h-14 md:text-lg"
          size="lg"
          onClick={handleContinue}
          disabled={!isValid || isSubmitting}
          loading={step === 4 && isSubmitting}
        >
          {step === 4 ? "Завершить регистрацию" : "Продолжить"}
        </Button>
      </div>
    </div>
  );
};
