import { SpecialistFormData } from "@/entities/clinic-specialist";

export interface IProps {
  isEditing: boolean;
  d: SpecialistFormData;
  set: <K extends keyof SpecialistFormData>(
    field: K,
    value: SpecialistFormData[K],
  ) => void;
}
