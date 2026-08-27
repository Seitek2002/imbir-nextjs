"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import type { UpdateClinicProfileBody } from "@/shared/api";
import {
  Button,
  Checkbox,
  DateField,
  Dropdown,
  ImageWithFallback,
  Input,
  PhoneInput,
  PhotoLightbox,
  Textarea,
} from "@/shared/ui";
import type { DropdownOption } from "@/shared/ui/dropdown";

import type { ClinicProfile } from "./model";
import {
  DAY_API,
  DAY_LABELS,
  type DayKey,
  type DayState,
  FieldRow,
  FileIcon,
  LocationMap,
  SectionCard,
  TimeChip,
  UploadIcon,
  csv,
  fromApiDate,
  toApiDate,
  toDay,
} from "./shared-ui";

type FormState = {
  additionalServices: string;
  city: string;
  country: string;
  days: Record<DayKey, DayState>;
  description: string;
  emergency24: boolean;
  equipment: string;
  fullAddress: string;
  latitude: string;
  legalName: string;
  licenseAuthority: string;
  licenseDate: string;
  licenseNumber: string;
  longitude: string;
  lunchEnd: string;
  lunchStart: string;
  mainDirections: string[];
  name: string;
  narrowDirections: string[];
  patientConditions: string;
  paymentMethods: string;
  phone: string;
  registrationNumber: string;
  type: string;
  website: string;
};

const buildState = (p: ClinicProfile): FormState => ({
  name: p.name ?? "",
  type: p.type ?? "",
  description: p.description ?? "",
  country: p.country ?? "",
  city: p.city ?? "",
  fullAddress: p.fullAddress ?? "",
  phone: p.phone ?? "",
  website: p.website ?? "",
  latitude: p.latitude ?? "",
  longitude: p.longitude ?? "",
  legalName: p.legalName ?? "",
  registrationNumber: p.registrationNumber ?? "",
  licenseNumber: p.licenseNumber ?? "",
  licenseDate: fromApiDate(p.licenseDate),
  licenseAuthority: p.licenseAuthority ?? "",
  mainDirections: p.mainDirections,
  narrowDirections: p.narrowDirections,
  additionalServices: p.additionalServices.join(", "),
  equipment: p.equipment.join(", "),
  patientConditions: p.patientConditions.join(", "),
  paymentMethods: p.paymentMethods.join(", "),
  days: {
    mon: toDay(p.workSchedule.mon),
    tue: toDay(p.workSchedule.tue),
    wed: toDay(p.workSchedule.wed),
    thu: toDay(p.workSchedule.thu),
    fri: toDay(p.workSchedule.fri),
    sat: toDay(p.workSchedule.sat),
    sun: toDay(p.workSchedule.sun),
  },
  lunchStart: p.workSchedule.lunchStart ?? "",
  lunchEnd: p.workSchedule.lunchEnd ?? "",
  emergency24: p.workSchedule.emergency24 ?? false,
});

// ─── Main Component ─────────────────────────────────────────────────────────

export type ClinicProfileFormHandle = {
  // Без полей специализации: бэк принимает на запись только id справочника
  // (см. entities/specialization), а форма работает со свободным текстом
  // названий. Резолвинг названий в id — на странице, которая держит formRef
  // (entities/clinic-profile не должен зависеть от entities/specialization).
  getPayload: () => Omit<
    UpdateClinicProfileBody,
    "narrow_specialization_ids" | "primary_specialization_ids"
  >;
  getSpecializationNames: () => { narrow: string[]; primary: string[] };
};

type Props = ClinicProfile & {
  isEditing?: boolean;
  isSpecializationsLoading?: boolean;
  isUploadingDocument?: boolean;
  isUploadingPhoto?: boolean;
  onUploadDocument?: (file: File) => Promise<unknown>;
  onUploadPhoto?: (file: File) => Promise<unknown>;
  // Справочник специализаций — пропсом, а не хуком внутри: entities в
  // этом проекте не импортируют друг друга (та же причина, по которой резолвинг
  // названий в id живёт на странице, см. ClinicProfileFormHandle выше).
  specializationOptions?: DropdownOption[];
};

export const ClinicProfileForm = forwardRef<ClinicProfileFormHandle, Props>(
  (props, ref) => {
    const {
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
      latitude,
      longitude,
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
      onUploadPhoto,
      onUploadDocument,
      isUploadingPhoto = false,
      isUploadingDocument = false,
      specializationOptions = [],
      isSpecializationsLoading = false,
    } = props;

    const specializationPlaceholder = isSpecializationsLoading
      ? "Загружаем список..."
      : "Выберите из списка";

    const [d, setD] = useState<FormState>(() => buildState(props));
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | undefined>(logo);
    const [openPhoto, setOpenPhoto] = useState<null | string>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const documentInputRef = useRef<HTMLInputElement>(null);

    // При входе в режим редактирования подхватываем актуальные значения профиля
    useEffect(() => {
      if (isEditing) {
        setD(buildState(props));
        setLogoFile(null);
        setLogoPreview(logo);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditing]);

    useImperativeHandle(ref, () => ({
      getSpecializationNames: () => ({
        primary: d.mainDirections,
        narrow: d.narrowDirections,
      }),
      getPayload: () => ({
        name: d.name,
        clinic_type: d.type,
        description: d.description,
        phone: d.phone || undefined,
        website: d.website || undefined,
        country: d.country || undefined,
        city: d.city || undefined,
        address: d.fullAddress || undefined,
        latitude: d.latitude || undefined,
        longitude: d.longitude || undefined,
        legal_name: d.legalName || undefined,
        reg_number: d.registrationNumber || undefined,
        license_number: d.licenseNumber || undefined,
        license_date: toApiDate(d.licenseDate),
        license_authority: d.licenseAuthority || undefined,
        additional_services: d.additionalServices,
        equipment: csv(d.equipment),
        patient_conditions: csv(d.patientConditions),
        // Поля «Способы оплаты» в форме больше нет — оплата у всех только
        // онлайн. Но значение читаем из профиля и отправляем обратно как
        // есть: PUT затирает всё, чего нет в теле, и без этой строки первое
        // же сохранение стёрло бы данные у существующих клиник.
        payment_methods: csv(d.paymentMethods),
        emergency_24_7: d.emergency24,
        schedule: Object.fromEntries(
          DAY_LABELS.map(({ key }) => [
            DAY_API[key],
            {
              from: d.days[key].open,
              to: d.days[key].close,
              enabled: d.days[key].enabled,
            },
          ]),
        ),
        lunch_break: { from: d.lunchStart, to: d.lunchEnd },
        ...(logoFile ? { logo: logoFile } : {}),
      }),
    }));

    const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
      setD((prev) => ({ ...prev, [k]: v }));

    const setDay = (key: DayKey, patch: Partial<DayState>) =>
      setD((prev) => ({
        ...prev,
        days: { ...prev.days, [key]: { ...prev.days[key], ...patch } },
      }));

    const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    };

    const handleUpload = async (
      e: React.ChangeEvent<HTMLInputElement>,
      upload?: (file: File) => Promise<unknown>,
    ) => {
      const file = e.target.files?.[0];
      if (!file || !upload) return;
      try {
        await upload(file);
      } finally {
        e.target.value = "";
      }
    };

    const days = d.days;

    return (
      <>
        {/* ── 1. Основная информация ─────────────────────────────────────── */}
        <SectionCard title="Основная информация">
          {isEditing ? (
            <>
              <div className="mb-6">
                <Input
                  label="Название"
                  value={d.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="block text-secondary text-sm mb-2">
                  Логотип
                </label>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogo}
                />
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-linear-to-br from-primary to-[#FF8A6B] flex items-center justify-center">
                    <ImageWithFallback
                      src={logoPreview}
                      alt="Logo"
                      width={96}
                      height={96}
                      sizes="96px"
                      unoptimized={logoPreview?.startsWith("data:")}
                      className="w-full h-full object-cover"
                      fallback={
                        <span className="text-white text-4xl font-bold">
                          {d.name.charAt(0)}
                        </span>
                      }
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    IconLeft={UploadIcon}
                    onClick={() => logoInputRef.current?.click()}
                  >
                    Новый логотип
                  </Button>
                </div>
              </div>

              <div className="mb-6">
                <Input
                  label="Тип клиники"
                  value={d.type}
                  onChange={(e) => set("type", e.target.value)}
                />
              </div>

              <div className="mb-6">
                <Textarea
                  label="Описание"
                  value={d.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={5}
                />
              </div>

              <div>
                <label className="block text-secondary text-sm mb-2">
                  Фотографии
                </label>
                <div className="flex items-center gap-4 overflow-x-auto pb-2">
                  {photos.map((photo, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setOpenPhoto(photo)}
                      className="w-24 h-24 rounded-2xl overflow-hidden bg-surface shrink-0 cursor-pointer"
                    >
                      <ImageWithFallback
                        src={photo}
                        alt={`Photo ${i + 1}`}
                        width={96}
                        height={96}
                        sizes="96px"
                        className="w-full h-full object-cover"
                        fallback={null}
                      />
                    </button>
                  ))}
                </div>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUpload(e, onUploadPhoto)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  IconLeft={UploadIcon}
                  onClick={() => photoInputRef.current?.click()}
                  disabled={!onUploadPhoto || isUploadingPhoto}
                  className="mt-3"
                >
                  {isUploadingPhoto ? "Загрузка..." : "Добавить фото"}
                </Button>
              </div>
            </>
          ) : (
            <div>
              <FieldRow label="Название">{name}</FieldRow>

              <div className="py-3 border-b border-background">
                <div className="text-muted text-sm mb-2">Логотип</div>
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-linear-to-br from-primary to-[#FF8A6B] flex items-center justify-center">
                  <ImageWithFallback
                    src={logo}
                    alt="Logo"
                    width={96}
                    height={96}
                    sizes="96px"
                    className="w-full h-full object-cover"
                    fallback={
                      <span className="text-white text-4xl font-bold">
                        {name.charAt(0)}
                      </span>
                    }
                  />
                </div>
              </div>

              <FieldRow label="Тип">{type}</FieldRow>
              <FieldRow label="Описание">{description}</FieldRow>

              <div className="pt-3">
                <div className="text-muted text-sm mb-2">Фотографии</div>
                <div className="flex items-center gap-4 overflow-x-auto pb-2">
                  {photos.map((photo, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setOpenPhoto(photo)}
                      className="w-24 h-24 rounded-2xl overflow-hidden bg-surface shrink-0 cursor-pointer"
                    >
                      <ImageWithFallback
                        src={photo}
                        alt={`Photo ${i + 1}`}
                        width={96}
                        height={96}
                        sizes="96px"
                        className="w-full h-full object-cover"
                        fallback={null}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SectionCard>

        <PhotoLightbox src={openPhoto} onClose={() => setOpenPhoto(null)} />

        {/* ── 2. Локация и контакты ──────────────────────────────────────── */}
        <SectionCard title="Локация и контакты">
          {isEditing ? (
            <div className="flex flex-col gap-6">
              <Input
                label="Страна"
                value={d.country}
                onChange={(e) => set("country", e.target.value)}
              />
              <Input
                label="Город"
                value={d.city}
                onChange={(e) => set("city", e.target.value)}
              />
              <Input
                label="Полный адрес"
                value={d.fullAddress}
                onChange={(e) => set("fullAddress", e.target.value)}
              />
              <PhoneInput
                label="Телефон"
                value={d.phone}
                onChange={(v) => set("phone", v)}
              />
              <Input label="Почта" type="email" value={email} disabled />
              <Input
                label="Сайт"
                type="url"
                value={d.website}
                onChange={(e) => set("website", e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Широта"
                  value={d.latitude}
                  onChange={(e) => set("latitude", e.target.value)}
                  placeholder="42.8746"
                />
                <Input
                  label="Долгота"
                  value={d.longitude}
                  onChange={(e) => set("longitude", e.target.value)}
                  placeholder="74.5698"
                />
              </div>
              <LocationMap
                latitude={d.latitude}
                longitude={d.longitude}
                address={d.fullAddress}
              />
            </div>
          ) : (
            <div>
              <FieldRow label="Страна">{country}</FieldRow>
              <FieldRow label="Город">{city}</FieldRow>
              <FieldRow label="Полный адрес">{fullAddress}</FieldRow>
              <FieldRow label="Телефон">{phone}</FieldRow>
              <FieldRow label="Почта">{email}</FieldRow>
              <FieldRow label="Сайт">{website}</FieldRow>
              <div className="pt-3">
                <div className="text-muted text-sm mb-2">Геолокация</div>
                <LocationMap
                  latitude={latitude}
                  longitude={longitude}
                  address={fullAddress}
                />
              </div>
            </div>
          )}
        </SectionCard>

        {/* ── 3. Расписание ─────────────────────────────────────────────── */}
        <SectionCard title="Расписание">
          <div className="mb-6">
            <div className="text-sm font-medium text-foreground mb-4">
              График работы
            </div>

            {isEditing ? (
              <div className="flex flex-col gap-3">
                {DAY_LABELS.map(({ key, ru }) => {
                  const day = days[key];
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <span className="w-8 text-sm text-secondary shrink-0">
                        {ru}
                      </span>
                      <input
                        type="time"
                        value={day.open}
                        disabled={!day.enabled}
                        onChange={(e) => setDay(key, { open: e.target.value })}
                        className="border border-border-soft rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:opacity-40"
                      />
                      <span className="text-muted">–</span>
                      <input
                        type="time"
                        value={day.close}
                        disabled={!day.enabled}
                        onChange={(e) => setDay(key, { close: e.target.value })}
                        className="border border-border-soft rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:opacity-40"
                      />
                      <Checkbox
                        className="ml-2"
                        label="Рабочий"
                        checked={day.enabled}
                        onChange={(e) =>
                          setDay(key, { enabled: e.target.checked })
                        }
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {DAY_LABELS.filter(({ key }) => days[key].enabled).map(
                  ({ key, ru }) => {
                    const day = days[key];
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className="w-8 shrink-0 text-sm text-secondary">
                          {ru}
                        </span>
                        <TimeChip>{day.open}</TimeChip>
                        <span className="text-muted">–</span>
                        <TimeChip>{day.close}</TimeChip>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </div>

          <div className="mb-6">
            <div className="text-sm font-medium text-foreground mb-3">
              Обеденный перерыв
            </div>
            {isEditing ? (
              <div className="flex items-center gap-3">
                <input
                  type="time"
                  value={d.lunchStart}
                  onChange={(e) => set("lunchStart", e.target.value)}
                  className="border border-border-soft rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <span className="text-muted">–</span>
                <input
                  type="time"
                  value={d.lunchEnd}
                  onChange={(e) => set("lunchEnd", e.target.value)}
                  className="border border-border-soft rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <TimeChip>{workSchedule.lunchStart}</TimeChip>
                <span className="text-muted">–</span>
                <TimeChip>{workSchedule.lunchEnd}</TimeChip>
              </div>
            )}
          </div>

          {isEditing ? (
            <Checkbox
              size="large"
              label="Экстренный приём 24/7"
              checked={d.emergency24}
              onChange={(e) => set("emergency24", e.target.checked)}
            />
          ) : (
            workSchedule.emergency24 && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary shrink-0" />
                <span className="text-sm text-foreground">
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
                value={d.legalName}
                onChange={(e) => set("legalName", e.target.value)}
                className="md:col-span-2"
              />
              <Input
                label="Регистрационный номер"
                value={d.registrationNumber}
                onChange={(e) => set("registrationNumber", e.target.value)}
              />
              <Input
                label="Номер лицензии"
                value={d.licenseNumber}
                onChange={(e) => set("licenseNumber", e.target.value)}
              />
              <DateField
                label="Дата выдачи лицензии"
                value={d.licenseDate}
                onChange={(v) => set("licenseDate", v)}
                maxToday
              />
              <Input
                label="Орган, выдавший лицензию"
                value={d.licenseAuthority}
                onChange={(e) => set("licenseAuthority", e.target.value)}
              />
              <div className="md:col-span-2">
                <label className="block text-secondary text-sm mb-2">
                  Документы (лицензии, регистрационные документы)
                </label>
                <div className="flex flex-wrap gap-4">
                  {documents.map((doc, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <FileIcon />
                      <span className="text-xs text-secondary max-w-20 text-center truncate">
                        {doc.name}
                      </span>
                    </div>
                  ))}
                </div>
                <input
                  ref={documentInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => handleUpload(e, onUploadDocument)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  IconLeft={UploadIcon}
                  onClick={() => documentInputRef.current?.click()}
                  disabled={!onUploadDocument || isUploadingDocument}
                  className="mt-3"
                >
                  {isUploadingDocument ? "Загрузка..." : "Добавить документ"}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <FieldRow label="Юридическое название">{legalName}</FieldRow>
              <FieldRow label="Регистрационный номер">
                {registrationNumber}
              </FieldRow>
              <FieldRow label="Номер лицензии">{licenseNumber}</FieldRow>
              <FieldRow label="Дата выдачи лицензии">
                {fromApiDate(licenseDate)}
              </FieldRow>
              <FieldRow label="Орган, выдавший лицензию">
                {licenseAuthority}
              </FieldRow>
              <div className="pt-3">
                <div className="text-muted text-sm mb-2">
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
                      <span className="text-xs text-secondary max-w-20 text-center truncate">
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
              {/* Список, а не текст через запятую — как при регистрации клиники
                  (register/clinic-form/Step5Specialization). Бэк на запись принимает
                  только id справочника, и со свободным текстом любая опечатка
                  просто не находила id. Теперь ввести несуществующее нельзя. */}
              <Dropdown
                label="Основные направления"
                placeholder={specializationPlaceholder}
                options={specializationOptions}
                isMulti
                searchable
                showSelectAll
                selectAllMode="select"
                value={d.mainDirections}
                onChange={(v) => set("mainDirections", v)}
              />
              <Dropdown
                label="Узкие направления"
                placeholder={specializationPlaceholder}
                options={specializationOptions}
                isMulti
                searchable
                showSelectAll
                selectAllMode="select"
                value={d.narrowDirections}
                onChange={(v) => set("narrowDirections", v)}
              />
              <Textarea
                label="Дополнительные услуги"
                value={d.additionalServices}
                onChange={(e) => set("additionalServices", e.target.value)}
                rows={2}
                hint="Введите через запятую"
              />
            </div>
          ) : (
            <div>
              <FieldRow label="Основные направления">
                {mainDirections.join(", ")}
              </FieldRow>
              <FieldRow label="Узкие направления">
                {narrowDirections.join(", ")}
              </FieldRow>
              <FieldRow label="Дополнительные услуги">
                {additionalServices.join(", ")}
              </FieldRow>
            </div>
          )}
        </SectionCard>

        {/* ── 6. Оборудование и условия ─────────────────────────────────── */}
        <SectionCard title="Оборудование и условия">
          {isEditing ? (
            <div className="flex flex-col gap-6">
              <Textarea
                label="Оборудование"
                value={d.equipment}
                onChange={(e) => set("equipment", e.target.value)}
                rows={2}
                hint="Введите через запятую"
              />
              <Textarea
                label="Условия для пациентов"
                value={d.patientConditions}
                onChange={(e) => set("patientConditions", e.target.value)}
                rows={2}
                hint="Введите через запятую"
              />
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-background">
              <div className="pb-4">
                <div className="text-xs text-muted mb-2">Оборудование</div>
                <ul className="flex flex-col gap-1">
                  {equipment.map((item) => (
                    <li
                      key={item}
                      className="text-sm text-foreground flex items-center gap-2"
                    >
                      <span className="text-muted">–</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-4">
                <div className="text-xs text-muted mb-2">
                  Условия для пациентов
                </div>
                <ul className="flex flex-col gap-1">
                  {patientConditions.map((item) => (
                    <li
                      key={item}
                      className="text-sm text-foreground flex items-center gap-2"
                    >
                      <span className="text-muted">–</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </SectionCard>
      </>
    );
  },
);

ClinicProfileForm.displayName = "ClinicProfileForm";
