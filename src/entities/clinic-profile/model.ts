export type ClinicProfile = {
  id: string;
  name: string;
  logo?: string;
  description: string;
  photos: string[];
  phone: string;
  email: string;
  address: string;
  schedule: string;
  rating?: number;
};

export const MOCK_CLINIC_PROFILE: ClinicProfile = {
  id: "1",
  name: "K-MED",
  logo: "/clinic-logo.png",
  description:
    "K-MED Наша клиника — это современная медицинская помощь, опытные врачи и индивидуальный подход к каждому пациенту. Мы используем проверенные методы и технологии, чтобы обеспечить точную диагностику, эффективное лечение и комфорт на каждом этапе заботы о вашем здоровье.",
  photos: [
    "/clinic-photo-1.jpg",
    "/clinic-photo-2.jpg",
    "/clinic-photo-3.jpg",
    "/clinic-photo-4.jpg",
  ],
  phone: "+996 996 000 000",
  email: "kmed@gmail.com",
  address: "г. Бишкек, ул. Тыныстанова, 189",
  schedule: "ПН-ПТ, 10:00-17:00",
  rating: 4.85,
};
