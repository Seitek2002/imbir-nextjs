export type {
  DoctorProfileData,
  DoctorService,
  DoctorAppointment,
  DoctorReview,
} from "./model";

export {
  MOCK_DOCTOR_PROFILE,
  MOCK_APPOINTMENTS,
  MOCK_SERVICES,
  MOCK_REVIEWS,
} from "./model";

export { FieldView, formStyles } from "./ui";
export { useDoctorCabinet, mapApiToProfile } from "./useDoctorCabinet";
