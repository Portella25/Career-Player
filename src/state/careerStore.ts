import { create } from "zustand";
import type { CareerSnapshot, LifeEventOption, TrainingFocus } from "@/domain/career";
import { acceptClubOffer, initialCareer, recoverPlayer, rejectClubOffer, resolveLifeEvent, simulateMatch, trainPlayer } from "@/engine/careerEngine";
import { loadCareerSave, persistCareerSave } from "@/persistence/localSave";

type CareerStore = {
  career: CareerSnapshot;
  train: (focus: TrainingFocus) => void;
  playMatch: () => void;
  chooseLifeEvent: (option: LifeEventOption) => void;
  acceptOffer: () => void;
  rejectOffer: () => void;
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
  acceptOffer: () => set((state) => commit(acceptClubOffer(state.career))),
  rejectOffer: () => set((state) => commit(rejectClubOffer(state.career))),
  recover: () => set((state) => commit(recoverPlayer(state.career))),
  resetCareer: () => set(commit(initialCareer)),
}));
