import { ClinicListItem, DoctorListItem, ServiceItem } from "@/shared/dummies";

export type SavedType = "doctor" | "clinic" | "service";

export type SavedItem =
  | {
      id: string;
      type: "doctor";
      savedAt: string;
      data: DoctorListItem;
    }
  | {
      id: string;
      type: "clinic";
      savedAt: string;
      data: ClinicListItem;
    }
  | {
      id: string;
      type: "service";
      savedAt: string;
      data: ServiceItem;
    };
