"use client";

import { FC, useCallback, useState } from "react";

import { DoctorPageLayout } from "@/widgets/doctor-page-layout";

import { DoctorService, MOCK_SERVICES } from "@/entities/doctor-profile";

import { useScrollLock } from "@/shared/lib/useScrollLock";

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

  const inp =
    "w-full px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#191A1B] placeholder:text-[#C4C8CA] focus:outline-none focus:border-[#F5653E] transition-colors";
  const lbl = "block text-[#838A8D] text-sm mb-1.5";

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
            <label className={lbl}>Название услуги</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите название"
              className={inp}
            />
          </div>
          <div>
            <label className={lbl}>Описание услуги</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Введите описание"
              className={inp}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Стоимость, сом</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className={inp}
              />
            </div>
            <div>
              <label className={lbl}>Длительность, мин</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="0"
                className={inp}
              />
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className={`w-full py-3.5 rounded-full font-medium transition-colors ${
              name.trim()
                ? "bg-[#F5653E] text-white hover:bg-[#E5542D] active:scale-95"
                : "bg-[#E5E6E8] text-[#C4C8CA] cursor-not-allowed"
            }`}
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  );
};

export const DoctorServicesPage: FC = () => {
  const [services, setServices] = useState<DoctorService[]>(MOCK_SERVICES);
  const [modalOpen, setModalOpen] = useState(false);

  const handleAdd = (s: Omit<DoctorService, "id">) =>
    setServices((prev) => [...prev, { ...s, id: String(Date.now()) }]);

  return (
    <>
      <DoctorPageLayout
        title="Услуги"
        headerRight={
          <button
            onClick={() => setModalOpen(true)}
            className="w-10 h-10 rounded-full bg-[#F5653E] flex items-center justify-center hover:bg-[#E5542D] transition-colors"
            aria-label="Добавить услугу"
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
        }
      >
        <div className="hidden lg:flex items-center justify-between mb-6">
          <h2 className="text-[28px] font-semibold text-[#191A1B]">Услуги</h2>
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
          <div className="grid grid-cols-3 px-5 py-3 border-b border-[#E5E6E8]">
            <span className="text-[#838A8D] text-sm font-medium">
              Название услуги
            </span>
            <span className="text-[#838A8D] text-sm font-medium">Описание</span>
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
      </DoctorPageLayout>

      <AddServiceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAdd}
      />
    </>
  );
};
