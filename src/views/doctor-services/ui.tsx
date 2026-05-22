"use client";

import { FC, useCallback, useState } from "react";

import { useRouter } from "next/navigation";

import { DoctorSidebar } from "@/widgets/doctor-sidebar";

import {
  DoctorService,
  MOCK_DOCTOR_PROFILE,
  MOCK_SERVICES,
} from "@/entities/doctor-profile";

import { useScrollLock } from "@/shared/lib/useScrollLock";

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

const DURATION = 200;

type AddServiceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (service: Omit<DoctorService, "id">) => void;
};

const AddServiceModal: FC<AddServiceModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");

  useScrollLock(isOpen);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, DURATION);
  }, [onClose]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({ name, description, isPrimary: false });
    setName("");
    setDescription("");
    setPrice("");
    setDuration("");
    handleClose();
  };

  if (!isOpen && !isClosing) return null;
  const state = isClosing ? "closed" : "open";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="modal-overlay absolute inset-0 bg-black/50"
        data-state={state}
        onClick={handleClose}
      />
      <div
        className="modal-panel relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md overflow-hidden"
        data-state={state}
      >
        <div className="flex items-center justify-between p-5 border-b border-[#E5E6E8]">
          <h2 className="text-lg font-semibold text-[#191A1B]">
            Добавить услугу
          </h2>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F8F9FA] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5"
                stroke="#686F72"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[#838A8D] text-sm mb-1.5">
              Название услуги
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите название"
              className="w-full px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#191A1B] placeholder:text-[#C4C8CA] focus:outline-none focus:border-[#F5653E] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[#838A8D] text-sm mb-1.5">
              Описание услуги
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Введите описание"
              className="w-full px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#191A1B] placeholder:text-[#C4C8CA] focus:outline-none focus:border-[#F5653E] transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#838A8D] text-sm mb-1.5">
                Стоимость, сом
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#191A1B] placeholder:text-[#C4C8CA] focus:outline-none focus:border-[#F5653E] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[#838A8D] text-sm mb-1.5">
                Длительность, мин
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#191A1B] placeholder:text-[#C4C8CA] focus:outline-none focus:border-[#F5653E] transition-colors"
              />
            </div>
          </div>
          <button
            onClick={handleSubmit}
            className="w-full py-3.5 rounded-full bg-[#F5653E] text-white font-medium hover:bg-[#E5542D] transition-colors active:scale-95"
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  );
};

export const DoctorServicesPage: FC = () => {
  const router = useRouter();
  const d = MOCK_DOCTOR_PROFILE;
  const [services, setServices] = useState<DoctorService[]>(MOCK_SERVICES);
  const [modalOpen, setModalOpen] = useState(false);

  const handleAdd = (s: Omit<DoctorService, "id">) => {
    setServices((prev) => [...prev, { ...s, id: String(Date.now()) }]);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA]">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-[#E5E6E8]">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F8F9FA] transition-colors"
        >
          <BackIcon />
        </button>
        <h1 className="text-lg font-semibold text-[#191A1B]">Услуги</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="w-10 h-10 rounded-full bg-[#F5653E] flex items-center justify-center hover:bg-[#E5542D] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 4V16M4 10H16"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="max-w-360 mx-auto px-4 lg:px-10 py-4 lg:py-8">
        <h1 className="text-[40px] font-semibold text-[#191A1B] mb-8 hidden lg:block">
          Мой профиль
        </h1>
        <div className="flex gap-6">
          <div className="hidden lg:block">
            <DoctorSidebar
              fullName={d.fullName}
              photo={d.photo}
              specialty={d.specialty}
              rating={d.rating}
            />
          </div>

          <main className="flex-1 min-w-0">
            <div className="hidden lg:flex items-center justify-between mb-6">
              <h2 className="text-[28px] font-semibold text-[#191A1B]">
                Услуги
              </h2>
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F5653E] text-white font-medium hover:bg-[#E5542D] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 3V13M3 8H13"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Добавить услугу
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-[#E5E6E8] overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-3 px-5 py-3 border-b border-[#E5E6E8]">
                <span className="text-[#838A8D] text-sm font-medium">
                  Название услуги
                </span>
                <span className="text-[#838A8D] text-sm font-medium">
                  Описание
                </span>
                <span className="text-[#838A8D] text-sm font-medium">
                  Первичный приём
                </span>
              </div>

              {services.map((s, i) => (
                <div
                  key={s.id}
                  className={`grid grid-cols-3 px-5 py-4 items-center ${i !== services.length - 1 ? "border-b border-[#E5E6E8]" : ""}`}
                >
                  <span className="text-[#191A1B] text-sm font-medium pr-3">
                    {s.name}
                  </span>
                  <span className="text-[#838A8D] text-sm pr-3 truncate">
                    {s.description}
                  </span>
                  <span className="text-[#838A8D] text-sm">
                    {s.isPrimary ? "Да" : "Нет"}
                  </span>
                </div>
              ))}
            </div>

            {/* Mobile add button */}
            <button
              onClick={() => setModalOpen(true)}
              className="lg:hidden mt-4 w-full py-3.5 rounded-full bg-[#F5653E] text-white font-medium hover:bg-[#E5542D] transition-colors"
            >
              Добавить услугу
            </button>
          </main>
        </div>
      </div>

      <AddServiceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAdd}
      />
    </div>
  );
};
