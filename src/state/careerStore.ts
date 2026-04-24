import { create } from "zustand";
import type { CareerSnapshot, LifeEventOption, TrainingFocus } from "@/domain/career";
import { initialCareer, recoverPlayer, resolveLifeEvent, simulateMatch, trainPlayer } from "@/engine/careerEngine";
import { loadCareerSave, persistCareerSave } from "@/persistence/localSave";

type CareerStore = {
  career: CareerSnapshot;
  train: (focus: TrainingFocus) => void;
  playMatch: () => void;
  chooseLifeEvent: (option: LifeEventOption) => void;
  recover: () => void;
  resetCareer: () => void;
};

const commit = (career: CareerSnapshot) => {
  persistCareerSave(career);
  return { career };
};

export const useCareerStore = create<CareerStore>((set) => ({
  career: loadCareerSave() ?? initialCareer,
  train: (focus) => set((state) => commit(trainPlayer(state.career, focus))),
  playMatch: () => set((state) => commit(simulateMatch(state.career))),
  chooseLifeEvent: (option) => set((state) => commit(resolveLifeEvent(state.career, option))),
  recover: () => set((state) => commit(recoverPlayer(state.career))),
  resetCareer: () => set(commit(initialCareer)),
}));
