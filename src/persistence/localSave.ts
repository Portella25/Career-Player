import type { CareerSnapshot } from "@/domain/career";

const SAVE_KEY = "football-life-simulator:career-v1";

export const loadCareerSave = (): CareerSnapshot | undefined => {
  if (typeof window === "undefined") return undefined;

  const rawSave = window.localStorage.getItem(SAVE_KEY);
  if (!rawSave) return undefined;

  try {
    return JSON.parse(rawSave) as CareerSnapshot;
  } catch {
    window.localStorage.removeItem(SAVE_KEY);
    return undefined;
  }
};

export const persistCareerSave = (career: CareerSnapshot) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(career));
};
