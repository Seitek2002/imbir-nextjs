"use client";

import { FC, useEffect, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ClinicCard } from "@/entities/clinic";
import { DoctorCard } from "@/entities/doctor";
import { ServiceCard } from "@/entities/service";

import { profileKeys, removeFavorite } from "@/shared/api";

import { SavedItem, SavedType } from "../model";

type Props = {
  items: SavedItem[];
  activeTab: SavedType;
};

export const ProfileSaved: FC<Props> = ({ items, activeTab }) => {
  const [savedItems, setSavedItems] = useState(items);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const filteredItems = savedItems.filter((item) => item.type === activeTab);

  const queryClient = useQueryClient();
  const { mutate: removeFromSaved } = useMutation({
    mutationFn: (id: string) => removeFavorite(Number(id)),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: profileKeys.favorites() }),
  });

  const handleUnsave = (id: string) => {
    removeFromSaved(id);
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
  };

  if (filteredItems.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center border border-border">
        <p className="text-muted text-lg">Список пуст</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="flex flex-col gap-4">
        {filteredItems.map((item) => {
          if (item.type === "doctor") {
            return (
              <DoctorCard
                key={item.id}
                {...item.data} // <-- Используем spread оператор для передачи всех свойств
                initialSaved={true}
                onSave={() => handleUnsave(item.id)}
                variant="horizontal"
              />
            );
          }

          if (item.type === "clinic") {
            return (
              <ClinicCard
                key={item.id}
                {...item.data} // <-- Spread оператор
                initialSaved={true}
                onSave={() => handleUnsave(item.id)}
                variant="horizontal" // Для мобилок клиники обычно тоже горизонтальные
              />
            );
          }

          if (item.type === "service") {
            return (
              <ServiceCard
                key={item.id}
                {...item.data}
                initialSaved={true}
                onSave={() => handleUnsave(item.id)}
                variant="horizontal"
              />
            );
          }

          return null;
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
      {filteredItems.map((item) => {
        if (item.type === "doctor") {
          return (
            <DoctorCard
              key={item.id}
              {...item.data} // <-- Spread оператор
              initialSaved={true}
              onSave={() => handleUnsave(item.id)}
              variant="vertical"
            />
          );
        }

        if (item.type === "clinic") {
          return (
            <ClinicCard
              key={item.id}
              {...item.data} // <-- Spread оператор
              initialSaved={true}
              onSave={() => handleUnsave(item.id)}
              variant="vertical"
            />
          );
        }

        if (item.type === "service") {
          return (
            <ServiceCard
              key={item.id}
              {...item.data}
              initialSaved={true}
              onSave={() => handleUnsave(item.id)}
              variant="vertical"
            />
          );
        }

        return null;
      })}
    </div>
  );
};
