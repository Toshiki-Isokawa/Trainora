export type ActivityDraft = {
  workStyle: "" | "standing" | "desk";
  highIntensity: "" | "1-2" | "3-4" | "more";
  lowIntensity: "" | "1-2" | "3-4" | "more";
  tempSaved?: boolean;
};

export type ActivityResponse = {
  workStyle: "standing" | "desk";
  highIntensity: "1-2" | "3-4" | "more";
  lowIntensity: "1-2" | "3-4" | "more";
};

export const ACTIVITY_LOCAL_KEY = "onboarding:activity:draft";