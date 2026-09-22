export type DoctorInvitationStatus = "accepted" | "declined" | "pending";

export type InvitationBranch = {
  address: string;
  id: number;
  name?: string;
};

type InvitationBase = {
  branch: InvitationBranch | null;
  created_at: string;
  id: number;
  message: string;
  responded_at: null | string;
  status: DoctorInvitationStatus;
};

export type ClinicDoctorInvitation = InvitationBase & {
  doctor_id: number;
  doctor_name: string;
  doctor_photo: null | string;
  doctor_specialty: string;
};

export type DoctorInvitation = InvitationBase & {
  clinic_id: number;
  clinic_logo: null | string;
  clinic_name: string;
};

export type CreateDoctorInvitationBody = {
  branch_id?: number;
  doctor_id: number;
  message?: string;
};
