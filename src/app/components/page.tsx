"use client";

import { useState } from "react";

import { Button, Checkbox, Dropdown, IconBtn, Input, Radio } from "@/shared";
import { Header } from "@/widgets";

import { ArrowIcon, PersonIcon } from "@/shared/assets";
// Импортируем наш новый компонент.
// Если ты экспортировал его из "@/shared", можешь перенести импорт выше.
import { SegmentedControl } from "@/shared/ui/segmented-control/ui";

const dropdownOptions = [
  { label: "Акушер-гинеколог", value: "1" },
  { label: "Аллерголог", value: "2" },
  { label: "Анестезиолог", value: "3" },
];

const segmentOptions = [
  { label: "Врачи", value: "doctors" },
  { label: "Клиники", value: "clinics" },
  { label: "Услуги", value: "services" },
];

const Components = () => {
  const [selectedMulti, setSelectedMulti] = useState<string[]>([]);
  const [singleDefault, setSingleDefault] = useState<string>();
  const [singleRadio, setSingleRadio] = useState<string>();

  // Стейт для нашего SegmentedControl
  const [activeSegment, setActiveSegment] = useState<string>("doctors");

  return (
    <div className="pb-20 space-y-6 px-4">
      <Header title="Компоненты" backTo="/" />
      <p className="text-sm text-gray-500">
        Если хочешь навешать Event (события) на компоненты, то надо в начале
        файла где есть кнопка написать &apos;use client&apos;
      </p>

      {/* --- SEGMENTED CONTROL --- */}
      <div className="flex flex-col gap-2">
        <h3 className="font-medium text-[#191A1B]">Segmented Control</h3>
        <SegmentedControl
          options={segmentOptions}
          value={activeSegment}
          onChange={setActiveSegment}
        />
        <span className="text-sm text-[#838A8D]">
          Текущее значение стейта: {activeSegment}
        </span>
      </div>

      <hr className="border-[#E5E6E8]" />

      {/* --- BUTTONS --- */}
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="outline" size="lg">
          outline btn
        </Button>
        <Button IconLeft={ArrowIcon} IconRight={ArrowIcon}>
          Button
        </Button>
        <Button variant="text">text btn</Button>
        <IconBtn size="lg">
          <ArrowIcon className="rotate-180 size-5" />
        </IconBtn>
      </div>

      <hr className="border-[#E5E6E8]" />

      {/* --- INPUTS --- */}
      <div className="flex flex-col gap-4 max-w-sm">
        <Input IconLeft={PersonIcon} type="password" placeholder="Пароль" />
        <Input
          label="Имя"
          IconRight={PersonIcon}
          error="Буран добавь деталей"
          disabled
        />
      </div>

      <hr className="border-[#E5E6E8]" />

      {/* --- RADIO & CHECKBOX --- */}
      <div className="flex gap-10">
        <div className="flex flex-col gap-4">
          <Radio
            name="group1"
            size="small"
            label="Small option"
            defaultChecked
          />
          <Radio name="group1" size="large" label="Large option" />
        </div>

        <div className="flex flex-col gap-4">
          <Checkbox size="small" label="Option 1" defaultChecked disabled />
          <Checkbox size="large" label="Partial Selection" indeterminate />
          <Checkbox size="large" label="Option 2" />
        </div>
      </div>

      <hr className="border-[#E5E6E8]" />

      {/* --- DROPDOWNS --- */}
      <div className="flex flex-col gap-6 max-w-sm">
        <Dropdown
          label="Специализация с поиском (Default)"
          options={dropdownOptions}
          type="default"
          value={singleDefault}
          onChange={setSingleDefault}
        />

        <Dropdown
          label="Специализация с поиском (Multi Checkbox)"
          options={dropdownOptions}
          type="checkbox"
          isMulti
          searchable
          value={selectedMulti}
          onChange={setSelectedMulti}
        />

        <Dropdown
          label="Специализация (Multi Checkbox)"
          options={dropdownOptions}
          type="checkbox"
          isMulti
          value={selectedMulti}
          onChange={setSelectedMulti}
        />

        <Dropdown
          label="Выбор одного (Radio)"
          options={dropdownOptions}
          type="radio"
          value={singleRadio}
          onChange={setSingleRadio}
        />
      </div>
    </div>
  );
};

export default Components;
