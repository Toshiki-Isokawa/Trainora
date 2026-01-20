// types/registration.ts
export type RegistrationProfile = {
  name: string;
  birthDate: string;
  gender: "male" | "female" | "other";
  height: number;
  latestWeight?: number;
  bodyFat?: number;
  muscleMass?: number;
  profileImageUrl?: string | null;
  imageKey?: string | null;
};
