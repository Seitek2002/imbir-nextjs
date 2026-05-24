"use client";

import { FC, SVGProps, useState } from "react";

import Image from "next/image";

import { Button, Input, PhoneInput, Textarea } from "@/shared/ui";

import type { ClinicProfile, WorkDaySchedule } from "./model";

// ─── Icons ─────────────────────────────────────────────────────────────────

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

const FileIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" {...props}>
    <rect width="32" height="32" rx="8" fill="#F2F4F7" />
    <path
      d="M11 10C11 9.44772 11.4477 9 12 9H19.5858C19.851 9 20.1054 9.10536 20.2929 9.29289L22.7071 11.7071C22.8946 11.8946 23 12.149 23 12.4142V22C23 22.5523 22.5523 23 22 23H12C11.4477 23 11 22.5523 11 22V10Z"
      stroke="#686F72"
      strokeWidth="1.5"
    />
    <path
      d="M19 9V12C19 12.5523 19.4477 13 20 13H23"
      stroke="#686F72"
      strokeWidth="1.5"
    />
  </svg>
);

// ─── Sub-components ─────────────────────────────────────────────────────────

const SectionCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-3xl p-8 border border-[#E5E6E8] mb-6">
    <h3 className="text-xl font-semibold text-[#191A1B] mb-6">{title}</h3>
    {children}
  </div>
);

const FieldView = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <div className="text-xs text-[#838A8D] mb-1">{label}</div>
    <div className="text-[#191A1B] text-sm">{children}</div>
  </div>
);

// ─── Schedule helpers ────────────────────────────────────────────────────────

const DAY_LABELS: {
  key: keyof Omit<ReturnType<typeof getDays>, never>;
  ru: string;
}[] = [
  { key: "mon", ru: "ПН" },
  { key: "tue", ru: "ВТ" },
  { key: "wed", ru: "СР" },
  { key: "thu", ru: "ЧТ" },
  { key: "fri", ru: "ПТ" },
  { key: "sat", ru: "СБ" },
  { key: "sun", ru: "ВС" },
];

function getDays(ws: ClinicProfile["workSchedule"]) {
  return {
    mon: ws.mon,
    tue: ws.tue,
    wed: ws.wed,
    thu: ws.thu,
    fri: ws.fri,
    sat: ws.sat,
    sun: ws.sun,
  };
}

// ─── Main Component ─────────────────────────────────────────────────────────

type Props = ClinicProfile & { isEditing?: boolean };

export const ClinicProfileForm: FC<Props> = ({
  isEditing = false,
  name,
  logo,
  type,
  description,
  photos,
  country,
  city,
  fullAddress,
  phone,
  email,
  website,
  workSchedule,
  legalName,
  registrationNumber,
  licenseNumber,
  licenseDate,
  licenseAuthority,
  documents,
  mainDirections,
  narrowDirections,
  additionalServices,
  equipment,
  patientConditions,
  paymentMethods,
}) => {
  const [logoSrc] = useState<string | undefined>(logo);
  const [phoneValue, setPhoneValue] = useState("");

  const days = getDays(workSchedule);

  return (
    <>
      {/* ── 1. Основная информация ─────────────────────────────────────── */}
      <SectionCard title="Основная информация">
        {isEditing ? (
          <>
            <div className="mb-6">
              <Input label="Название" defaultValue={name} />
            </div>

            <div className="mb-6">
              <label className="block text-[#686F72] text-sm mb-2">
                Логотип
              </label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-linear-to-br from-[#F5653E] to-[#FF8A6B] flex items-center justify-center">
                  {logoSrc ? (
                    <Image
                      src={logoSrc}
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

            <div className="mb-6">
              <Input label="Тип клиники" defaultValue={type} />
            </div>

            <div className="mb-6">
              <Textarea label="Описание" defaultValue={description} rows={5} />
            </div>

            <div>
              <label className="block text-[#686F72] text-sm mb-2">
                Фотографии
              </label>
              <div className="flex items-center gap-4 overflow-x-auto pb-2">
                {photos.map((photo, i) => (
                  <div
                    key={i}
                    className="w-24 h-24 rounded-2xl overflow-hidden bg-[#F8F9FA] shrink-0"
                  >
                    <Image
                      src={photo}
                      alt={`Photo ${i + 1}`}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                <button className="w-24 h-24 rounded-2xl border-2 border-dashed border-[#E5E6E8] flex items-center justify-center hover:border-[#F5653E] transition-colors shrink-0">
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
          </>
        ) : (
          <div className="flex flex-col gap-5">
            <FieldView label="Название">{name}</FieldView>

            <div>
              <div className="text-xs text-[#838A8D] mb-2">Логотип</div>
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-linear-to-br from-[#F5653E] to-[#FF8A6B] flex items-center justify-center">
                {logoSrc ? (
                  <Image
                    src={logoSrc}
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
            </div>

            <FieldView label="Тип">{type}</FieldView>
            <FieldView label="Описание">{description}</FieldView>

            <div>
              <div className="text-xs text-[#838A8D] mb-2">Фотографии</div>
              <div className="flex items-center gap-4 overflow-x-auto pb-2">
                {photos.map((photo, i) => (
                  <div
                    key={i}
                    className="w-24 h-24 rounded-2xl overflow-hidden bg-[#F8F9FA] shrink-0"
                  >
                    <Image
                      src={photo}
                      alt={`Photo ${i + 1}`}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      {/* ── 2. Локация и контакты ──────────────────────────────────────── */}
      <SectionCard title="Локация и контакты">
        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Страна" defaultValue={country} />
            <Input label="Город" defaultValue={city} />
            <Input
              label="Полный адрес"
              defaultValue={fullAddress}
              className="md:col-span-2"
            />
            <PhoneInput
              label="Телефон"
              value={phoneValue}
              onChange={setPhoneValue}
            />
            <Input label="Почта" type="email" defaultValue={email} />
            <Input
              label="Сайт"
              type="url"
              defaultValue={website}
              className="md:col-span-2"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FieldView label="Страна">{country}</FieldView>
            <FieldView label="Город">{city}</FieldView>
            <FieldView label="Полный адрес">{fullAddress}</FieldView>
            <FieldView label="Телефон">{phone}</FieldView>
            <FieldView label="Почта">{email}</FieldView>
            <FieldView label="Сайт">{website}</FieldView>
          </div>
        )}
      </SectionCard>

      {/* ── 3. Расписание ─────────────────────────────────────────────── */}
      <SectionCard title="Расписание">
        <div className="mb-6">
          <div className="text-sm font-medium text-[#191A1B] mb-4">
            График работы
          </div>

          {isEditing ? (
            <div className="flex flex-col gap-3">
              {DAY_LABELS.map(({ key, ru }) => {
                const day = days[key] as WorkDaySchedule;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="w-8 text-sm text-[#686F72] shrink-0">
                      {ru}
                    </span>
                    <input
                      type="time"
                      defaultValue={day.open}
                      disabled={!day.enabled}
                      className="border border-[#E3E4E5] rounded-lg px-3 py-2 text-sm focus:border-[#F5653E] focus:outline-none disabled:opacity-40"
                    />
                    <span className="text-[#838A8D]">–</span>
                    <input
                      type="time"
                      defaultValue={day.close}
                      disabled={!day.enabled}
                      className="border border-[#E3E4E5] rounded-lg px-3 py-2 text-sm focus:border-[#F5653E] focus:outline-none disabled:opacity-40"
                    />
                    <label className="flex items-center gap-2 ml-2 text-sm text-[#686F72] cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={day.enabled}
                        className="accent-[#F5653E]"
                      />
                      Рабочий
                    </label>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {DAY_LABELS.filter(
                ({ key }) => (days[key] as WorkDaySchedule).enabled,
              ).map(({ key, ru }) => {
                const day = days[key] as WorkDaySchedule;
                return (
                  <div key={key} className="flex items-center gap-6">
                    <span className="w-8 text-sm text-[#686F72]">{ru}</span>
                    <span className="text-sm text-[#191A1B]">
                      {day.open}
                      <span className="mx-2 text-[#838A8D]">–</span>
                      {day.close}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="text-sm font-medium text-[#191A1B] mb-3">
            Обеденный перерыв
          </div>
          {isEditing ? (
            <div className="flex items-center gap-3">
              <input
                type="time"
                defaultValue={workSchedule.lunchStart}
                className="border border-[#E3E4E5] rounded-lg px-3 py-2 text-sm focus:border-[#F5653E] focus:outline-none"
              />
              <span className="text-[#838A8D]">–</span>
              <input
                type="time"
                defaultValue={workSchedule.lunchEnd}
                className="border border-[#E3E4E5] rounded-lg px-3 py-2 text-sm focus:border-[#F5653E] focus:outline-none"
              />
            </div>
          ) : (
            <span className="text-sm text-[#191A1B]">
              {workSchedule.lunchStart}
              <span className="mx-2 text-[#838A8D]">–</span>
              {workSchedule.lunchEnd}
            </span>
          )}
        </div>

        {isEditing ? (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked={workSchedule.emergency24}
              className="accent-[#F5653E] w-4 h-4"
            />
            <span className="text-sm text-[#191A1B]">
              Экстренный приём 24/7
            </span>
          </label>
        ) : (
          workSchedule.emergency24 && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#F5653E] shrink-0" />
              <span className="text-sm text-[#191A1B]">
                Экстренный приём 24/7
              </span>
            </div>
          )
        )}
      </SectionCard>

      {/* ── 4. Юридическая информация ─────────────────────────────────── */}
      <SectionCard title="Юридическая информация">
        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Юридическое название"
              defaultValue={legalName}
              className="md:col-span-2"
            />
            <Input
              label="Регистрационный номер"
              defaultValue={registrationNumber}
            />
            <Input label="Номер лицензии" defaultValue={licenseNumber} />
            <Input label="Дата выдачи лицензии" defaultValue={licenseDate} />
            <Input
              label="Орган, выдавший лицензию"
              defaultValue={licenseAuthority}
            />
            <div className="md:col-span-2">
              <label className="block text-[#686F72] text-sm mb-2">
                Документы (лицензии, регистрационные документы)
              </label>
              <div className="flex flex-wrap gap-4">
                {documents.map((doc, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <FileIcon />
                    <span className="text-xs text-[#686F72] max-w-20 text-center truncate">
                      {doc.name}
                    </span>
                  </div>
                ))}
                <button className="w-16 h-16 rounded-xl border-2 border-dashed border-[#E5E6E8] flex items-center justify-center hover:border-[#F5653E] transition-colors">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M10 4V16M4 10H16"
                      stroke="#C4C8CA"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <FieldView label="Юридическое название">{legalName}</FieldView>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FieldView label="Регистрационный номер">
                {registrationNumber}
              </FieldView>
              <FieldView label="Номер лицензии">{licenseNumber}</FieldView>
              <FieldView label="Дата выдачи лицензии">{licenseDate}</FieldView>
              <FieldView label="Орган, выдавший лицензию">
                {licenseAuthority}
              </FieldView>
            </div>
            <div>
              <div className="text-xs text-[#838A8D] mb-2">
                Документы (лицензии, регистрационные документы)
              </div>
              <div className="flex flex-wrap gap-4">
                {documents.map((doc, i) => (
                  <a
                    key={i}
                    href={doc.url}
                    className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity"
                  >
                    <FileIcon />
                    <span className="text-xs text-[#686F72] max-w-20 text-center truncate">
                      {doc.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      {/* ── 5. Специализация и услуги ─────────────────────────────────── */}
      <SectionCard title="Специализация и услуги">
        {isEditing ? (
          <div className="flex flex-col gap-6">
            <Textarea
              label="Основные направления"
              defaultValue={mainDirections.join(", ")}
              rows={2}
              hint="Введите через запятую"
            />
            <Textarea
              label="Узкие направления"
              defaultValue={narrowDirections.join(", ")}
              rows={2}
              hint="Введите через запятую"
            />
            <Textarea
              label="Дополнительные услуги"
              defaultValue={additionalServices.join(", ")}
              rows={2}
              hint="Введите через запятую"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <FieldView label="Основные направления">
              {mainDirections.join(", ")}
            </FieldView>
            <FieldView label="Узкие направления">
              {narrowDirections.join(", ")}
            </FieldView>
            <FieldView label="Дополнительные услуги">
              {additionalServices.join(", ")}
            </FieldView>
          </div>
        )}
      </SectionCard>

      {/* ── 6. Оборудование и условия ─────────────────────────────────── */}
      <SectionCard title="Оборудование и условия">
        {isEditing ? (
          <div className="flex flex-col gap-6">
            <Textarea
              label="Оборудование"
              defaultValue={equipment.join(", ")}
              rows={2}
              hint="Введите через запятую"
            />
            <Textarea
              label="Условия для пациентов"
              defaultValue={patientConditions.join(", ")}
              rows={2}
              hint="Введите через запятую"
            />
            <Textarea
              label="Способы оплаты"
              defaultValue={paymentMethods.join(", ")}
              rows={2}
              hint="Введите через запятую"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div>
              <div className="text-xs text-[#838A8D] mb-2">Оборудование</div>
              <ul className="flex flex-col gap-1">
                {equipment.map((item) => (
                  <li
                    key={item}
                    className="text-sm text-[#191A1B] flex items-center gap-2"
                  >
                    <span className="text-[#838A8D]">–</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs text-[#838A8D] mb-2">
                Условия для пациентов
              </div>
              <ul className="flex flex-col gap-1">
                {patientConditions.map((item) => (
                  <li
                    key={item}
                    className="text-sm text-[#191A1B] flex items-center gap-2"
                  >
                    <span className="text-[#838A8D]">–</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs text-[#838A8D] mb-2">Способы оплаты</div>
              <ul className="flex flex-col gap-1">
                {paymentMethods.map((item) => (
                  <li
                    key={item}
                    className="text-sm text-[#191A1B] flex items-center gap-2"
                  >
                    <span className="text-[#838A8D]">–</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </SectionCard>
    </>
  );
};
