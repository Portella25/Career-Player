import type { CareerSnapshot } from "@/domain/career";
import { initialCareer } from "@/engine/careerEngine";

const SAVE_KEY = "football-life-simulator:career-v1";

export const loadCareerSave = (): CareerSnapshot | undefined => {
  if (typeof window === "undefined") return undefined;

  const rawSave = window.localStorage.getItem(SAVE_KEY);
  if (!rawSave) return undefined;

  try {
    const parsed = JSON.parse(rawSave) as Partial<CareerSnapshot>;
    return {
      ...initialCareer,
      ...parsed,
      calendar: { ...initialCareer.calendar, ...parsed.calendar },
      ledger: { ...initialCareer.ledger, ...parsed.ledger },
      contract: { ...initialCareer.contract, ...parsed.contract },
      player: { ...initialCareer.player, ...parsed.player, attributes: { ...initialCareer.player.attributes, ...parsed.player?.attributes } },
      relationships: { ...initialCareer.relationships, ...parsed.relationships },
      objectives: parsed.objectives ?? initialCareer.objectives,
      scoutInterest: parsed.scoutInterest ?? initialCareer.scoutInterest,
      pendingOffer: parsed.pendingOffer,
      lastAssessment: parsed.lastAssessment,
      eventLog: parsed.eventLog ?? [],
      matchHistory: parsed.matchHistory ?? (parsed.lastMatch ? [parsed.lastMatch] : []),
    } as CareerSnapshot;
  } catch {
    window.localStorage.removeItem(SAVE_KEY);
    return undefined;
  }
};

export const persistCareerSave = (career: CareerSnapshot) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(career));
};
