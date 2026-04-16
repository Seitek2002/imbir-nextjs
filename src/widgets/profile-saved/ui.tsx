"use client";

import { FC, useEffect, useState } from "react";

import { ClinicCard } from "@/entities/clinic";
import { DoctorCard } from "@/entities/doctor";
import type { SavedItem, SavedType } from "@/entities/saved";
import { ServiceCard } from "@/entities/service";

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

  const handleUnsave = (id: string) => {
    console.log("Unsave:", id);
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
  };

  if (filteredItems.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center border border-[#E5E6E8]">
        <p className="text-[#838A8D] text-lg">Список пуст</p>
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
                name={item.data.name}
                specialty={item.data.specialty}
                workplaces={item.data.workplaces}
                isOnlineAvailable={item.data.isOnlineAvailable}
                rating={item.data.rating}
                reviews={item.data.reviews}
                experience={item.data.experience}
                image={item.data.image}
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
                name={item.data.name}
                address={item.data.address}
                rating={item.data.rating}
                reviews={item.data.reviews}
                experience={item.data.experience}
                image={item.data.image}
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
                name={item.data.name}
                category={item.data.category}
                clinic={item.data.clinic}
                rating={item.data.rating}
                reviews={item.data.reviews}
                price={item.data.price}
                image={item.data.image}
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {filteredItems.map((item) => {
        if (item.type === "doctor") {
          return (
            <DoctorCard
              key={item.id}
              name={item.data.name}
              specialty={item.data.specialty}
              workplaces={item.data.workplaces}
              isOnlineAvailable={item.data.isOnlineAvailable}
              rating={item.data.rating}
              reviews={item.data.reviews}
              experience={item.data.experience}
              image={item.data.image}
              initialSaved={true}
              onSave={() => handleUnsave(item.id)}
            />
          );
        }

        if (item.type === "clinic") {
          return (
            <ClinicCard
              key={item.id}
              name={item.data.name}
              address={item.data.address}
              rating={item.data.rating}
              reviews={item.data.reviews}
              experience={item.data.experience}
              image={item.data.image}
              initialSaved={true}
              onSave={() => handleUnsave(item.id)}
            />
          );
        }

        if (item.type === "service") {
          return (
            <ServiceCard
              key={item.id}
              name={item.data.name}
              category={item.data.category}
              clinic={item.data.clinic}
              rating={item.data.rating}
              reviews={item.data.reviews}
              price={item.data.price}
              image={item.data.image}
              initialSaved={true}
              onSave={() => handleUnsave(item.id)}
            />
          );
        }

        return null;
      })}
    </div>
  );
};
