import { create } from 'zustand';
import { EMPTY_ANSWERS, type GuidedAnswers } from '@/domain/rules/guided-start';

export const GUIDED_STEPS = ['idea', 'stack', 'experience', 'runsOn', 'summary'] as const;
export type GuidedStep = (typeof GUIDED_STEPS)[number];

/** The kit picked in the Stack step: a kit id, "Ainda não sei", or not answered yet. */
export type KitChoice = string | 'none' | undefined;

type GuidedState = {
  answers: GuidedAnswers;
  /** Kit answer kept apart so "not answered" can follow the recommendation. */
  kitChoice: KitChoice;
  step: number;
  setAnswers(patch: Partial<GuidedAnswers>): void;
  setKitChoice(choice: KitChoice): void;
  goTo(step: number): void;
  reset(): void;
};

/**
 * Draft of the guided start. Lives in memory only: closing and coming back in the same
 * session continues where the person stopped; creating the project clears it.
 */
export const useGuided = create<GuidedState>()((set) => ({
  answers: EMPTY_ANSWERS,
  kitChoice: undefined,
  step: 0,
  setAnswers: (patch) => set((state) => ({ answers: { ...state.answers, ...patch } })),
  setKitChoice: (kitChoice) => set({ kitChoice }),
  goTo: (step) => set({ step: Math.max(0, Math.min(GUIDED_STEPS.length - 1, step)) }),
  reset: () => set({ answers: EMPTY_ANSWERS, kitChoice: undefined, step: 0 }),
}));
