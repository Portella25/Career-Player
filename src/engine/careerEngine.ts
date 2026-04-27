import type { CareerObjective, CareerSnapshot, LifeEvent, LifeEventOption, MatchResult, TrainingFocus, WeeklyAssessment } from "@/domain/career";
import { createSeededRandom } from "./random";

const opponents = ["Porto Norte", "Sevilla Azul", "Milano Primavera", "Dortmund II", "Rotterdam 1908", "Monaco Rouge"];
const initialObjectives: CareerObjective[] = [
  { id: "score-3", label: "Marcar 3 gols", current: 0, target: 3, rewardReputation: 4, rewardBalance: 80, completed: false },
  { id: "rating-75", label: "Nota média 75+ em 3 jogos", current: 0, target: 3, rewardReputation: 5, rewardBalance: 120, completed: false },
  { id: "coach-60", label: "Confiança do técnico 60", current: 48, target: 60, rewardReputation: 3, rewardBalance: 60, completed: false },
];
const lifeEvents: LifeEvent[] = [
  {
    id: "coach-extra-session",
    title: "O treinador chama para uma conversa",
    description: "Ele quer saber se você aceita um treino extra depois da partida para provar compromisso.",
    options: [
      { id: "accept", label: "Aceitar treino", detail: "+Treinador · -Energia", effects: { coach: 6, energy: -10, form: 2 } },
      { id: "decline", label: "Preservar corpo", detail: "+Felicidade · -Treinador", effects: { happiness: 5, coach: -3, energy: 6 } },
    ],
  },
  {
    id: "fans-photo",
    title: "Torcedores esperam no portão",
    description: "Um pequeno grupo pede fotos enquanto você tenta sair rápido para descansar.",
    options: [
      { id: "stop", label: "Parar para fotos", detail: "+Fãs · -Energia", effects: { fans: 7, reputation: 2, energy: -5 } },
      { id: "leave", label: "Ir embora", detail: "+Energia · -Fãs", effects: { energy: 5, fans: -4, happiness: -2 } },
    ],
  },
  {
    id: "squad-dinner",
    title: "Jantar do elenco",
    description: "Veteranos convidam você para se integrar, mas a conta pesa no orçamento da semana.",
    options: [
      { id: "join", label: "Ir ao jantar", detail: "+Elenco · -€60", effects: { squad: 8, happiness: 4, balance: -60 } },
      { id: "skip", label: "Ficar em casa", detail: "+€ · -Elenco", effects: { squad: -3, happiness: -1, energy: 4 } },
    ],
  },
];

export const initialCareer: CareerSnapshot = {
  player: {
    id: "academy-10",
    name: "Rafael Nogueira",
    age: 17,
    position: "ST",
    club: "Lisbon Lions U19",
    reputation: 12,
    energy: 82,
    form: 61,
    happiness: 55,
    attributes: {
      finishing: 64,
      passing: 53,
      pace: 71,
      stamina: 58,
      mentality: 49,
    },
  },
  calendar: {
    season: 2026,
    week: 1,
    phase: "training",
    nextOpponent: opponents[0],
  },
  relationships: {
    coach: 48,
    squad: 44,
    fans: 36,
  },
  objectives: initialObjectives,
  contract: {
    club: "Lisbon Lions U19",
    status: "academy",
    weeklySalary: 120,
    appearances: 0,
    nextReviewWeek: 6,
  },
  eventLog: [],
  matchHistory: [],
  ledger: {
    balance: 450,
    weeklySalary: 120,
    weeklyExpenses: 35,
    taxRate: 0.12,
    totalEarned: 450,
    lastNetIncome: 0,
  },
};

const clamp = (value: number, min = 0, max = 99) => Math.min(max, Math.max(min, value));

const getLifeEvent = (season: number, week: number) => {
  const random = createSeededRandom(`life:${season}:${week}`);
  return lifeEvents[Math.floor(random() * lifeEvents.length)];
};

export const trainPlayer = (career: CareerSnapshot, focus: TrainingFocus): CareerSnapshot => {
  const fatigue = focus === "stamina" ? 4 : 7;

  return {
    ...career,
    player: {
      ...career.player,
      energy: clamp(career.player.energy - fatigue),
      form: clamp(career.player.form + 1),
      attributes: {
        ...career.player.attributes,
        [focus]: clamp(career.player.attributes[focus] + 1),
      },
    },
    eventLog: [
      { id: `training:${career.calendar.season}:${career.calendar.week}:${focus}`, week: career.calendar.week, type: "training" as const, label: `Treino de ${focus}` },
      ...(career.eventLog ?? []),
    ].slice(0, 8),
    calendar: {
      ...career.calendar,
      phase: "match",
    },
  };
};

const getNextOpponent = (season: number, week: number) => {
  const random = createSeededRandom(`calendar:${season}:${week}`);
  return opponents[Math.floor(random() * opponents.length)];
};

export const simulateMatch = (career: CareerSnapshot): CareerSnapshot => {
  const seed = `${career.player.id}:${career.calendar.season}:${career.calendar.week}:${career.player.form}`;
  const random = createSeededRandom(seed);
  const attackScore = career.player.attributes.finishing * 0.45 + career.player.attributes.pace * 0.25 + career.player.form * 0.2 + career.player.energy * 0.1;
  const chanceCount = 2 + Math.floor(random() * 3);
  const events: MatchResult["events"] = [];
  let goals = 0;
  let assists = 0;

  for (let index = 0; index < chanceCount; index += 1) {
    const minute = 12 + Math.floor(random() * 76);
    const successThreshold = attackScore / 115;
    const scored = random() < successThreshold;
    const assisted = !scored && random() < career.player.attributes.passing / 160;

    if (scored) goals += 1;
    if (assisted) assists += 1;

    events.push({
      minute,
      type: scored ? "goal" : assisted ? "assist" : "miss",
      label: scored ? "Finalização decisiva" : assisted ? "Passe quebra-linha" : "Chance desperdiçada",
      impact: scored ? 8 : assisted ? 5 : -2,
    });
  }

  events.sort((a, b) => a.minute - b.minute);

  const playerRating = clamp(Math.round(58 + goals * 14 + assists * 8 + career.player.form * 0.12 - (100 - career.player.energy) * 0.08), 40, 99);
  const opponentGoals = Math.floor(random() * 3);
  const teamGoals = Math.max(goals, Math.floor(random() * 2) + goals + (assists > 0 ? 1 : 0));
  const grossSalary = career.ledger.weeklySalary;
  const tax = Math.round(grossSalary * career.ledger.taxRate);
  const netIncome = grossSalary - tax - career.ledger.weeklyExpenses;
  const result: MatchResult = {
    id: seed,
    opponent: career.calendar.nextOpponent,
    teamGoals,
    opponentGoals,
    playerRating,
    goals,
    assists,
    reputationDelta: goals * 3 + assists * 2 + (playerRating > 75 ? 2 : 0),
    energyDelta: -14,
    events,
  };

  const nextSeason = career.calendar.week >= 52 ? career.calendar.season + 1 : career.calendar.season;
  const nextWeek = career.calendar.week >= 52 ? 1 : career.calendar.week + 1;

  return {
    ...career,
    player: {
      ...career.player,
      energy: clamp(career.player.energy + result.energyDelta),
      reputation: clamp(career.player.reputation + result.reputationDelta),
      form: clamp(career.player.form + goals * 2 + assists - 1),
      happiness: clamp(career.player.happiness + (teamGoals > opponentGoals ? 2 : -2)),
    },
    calendar: {
      season: nextSeason,
      week: nextWeek,
      phase: "life",
      nextOpponent: getNextOpponent(nextSeason, nextWeek),
    },
    ledger: {
      ...career.ledger,
      balance: career.ledger.balance + netIncome,
      totalEarned: career.ledger.totalEarned + grossSalary,
      lastNetIncome: netIncome,
    },
    pendingLifeEvent: getLifeEvent(nextSeason, nextWeek),
    matchHistory: [result, ...(career.matchHistory ?? [])].slice(0, 6),
    eventLog: [
      { id: `match:${result.id}`, week: career.calendar.week, type: "match" as const, label: `${teamGoals}-${opponentGoals} vs ${result.opponent}` },
      { id: `finance:${result.id}`, week: career.calendar.week, type: "finance" as const, label: `Saldo semanal €${netIncome}` },
      ...(career.eventLog ?? []),
    ].slice(0, 8),
    lastMatch: result,
  };
};

export const resolveLifeEvent = (career: CareerSnapshot, option: LifeEventOption): CareerSnapshot => ({
  ...career,
  player: {
    ...career.player,
    reputation: clamp(career.player.reputation + (option.effects.reputation ?? 0)),
    energy: clamp(career.player.energy + (option.effects.energy ?? 0)),
    form: clamp(career.player.form + (option.effects.form ?? 0)),
    happiness: clamp(career.player.happiness + (option.effects.happiness ?? 0)),
  },
  relationships: {
    coach: clamp(career.relationships.coach + (option.effects.coach ?? 0)),
    squad: clamp(career.relationships.squad + (option.effects.squad ?? 0)),
    fans: clamp(career.relationships.fans + (option.effects.fans ?? 0)),
  },
  ledger: {
    ...career.ledger,
    balance: career.ledger.balance + (option.effects.balance ?? 0),
  },
  pendingLifeEvent: undefined,
  eventLog: [
    { id: `life:${career.calendar.season}:${career.calendar.week}:${option.id}`, week: career.calendar.week, type: "life" as const, label: option.label },
    ...(career.eventLog ?? []),
  ].slice(0, 8),
  calendar: {
    ...career.calendar,
    phase: "recovery",
  },
});

export const recoverPlayer = (career: CareerSnapshot): CareerSnapshot => ({
  ...career,
  player: {
    ...career.player,
    energy: clamp(career.player.energy + 18),
  },
  calendar: {
    ...career.calendar,
    phase: "training",
  },
});
