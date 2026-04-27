import type { CareerObjective, CareerSnapshot, ClubOffer, LifeEvent, LifeEventOption, MatchResult, ScoutInterest, TrainingFocus, WeeklyAssessment } from "@/domain/career";
import { createSeededRandom } from "./random";

const opponents = ["Porto Norte", "Sevilla Azul", "Milano Primavera", "Dortmund II", "Rotterdam 1908", "Monaco Rouge"];
const initialObjectives: CareerObjective[] = [
  { id: "score-3", label: "Marcar 3 gols", current: 0, target: 3, rewardReputation: 4, rewardBalance: 80, completed: false },
  { id: "rating-75", label: "Nota média 75+ em 3 jogos", current: 0, target: 3, rewardReputation: 5, rewardBalance: 120, completed: false },
  { id: "coach-60", label: "Confiança do técnico 60", current: 48, target: 60, rewardReputation: 3, rewardBalance: 60, completed: false },
];
const initialScoutInterest: ScoutInterest[] = [
  { club: "Braga Vale", tier: "local", interest: 18 },
  { club: "Anderlecht Juniors", tier: "national", interest: 8 },
  { club: "Torino Academy", tier: "elite", interest: 3 },
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
  scoutInterest: initialScoutInterest,
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

const advanceObjectives = (career: CareerSnapshot, result: MatchResult) => {
  let reputationReward = 0;
  let balanceReward = 0;
  const objectives = career.objectives.map((objective) => {
    if (objective.completed) return objective;

    const current =
      objective.id === "score-3"
        ? Math.min(objective.target, objective.current + result.goals)
        : objective.id === "rating-75"
          ? Math.min(objective.target, objective.current + (result.playerRating >= 75 ? 1 : 0))
          : Math.min(objective.target, career.relationships.coach);
    const completed = current >= objective.target;
    if (completed) {
      reputationReward += objective.rewardReputation;
      balanceReward += objective.rewardBalance;
    }
    return { ...objective, current, completed };
  });

  return { objectives, reputationReward, balanceReward };
};

const assessWeek = (career: CareerSnapshot, result: MatchResult): WeeklyAssessment => {
  const score = result.playerRating + result.goals * 5 + result.assists * 3 + Math.round(career.relationships.coach * 0.15);
  if (score >= 92) return { id: `assessment:${result.id}`, grade: "A", label: "Semana dominante", trustDelta: 5, salaryDelta: 12 };
  if (score >= 78) return { id: `assessment:${result.id}`, grade: "B", label: "Boa evolução", trustDelta: 3, salaryDelta: 5 };
  if (score >= 63) return { id: `assessment:${result.id}`, grade: "C", label: "Dentro do plano", trustDelta: 1, salaryDelta: 0 };
  return { id: `assessment:${result.id}`, grade: "D", label: "Abaixo do esperado", trustDelta: -4, salaryDelta: 0 };
};

const updateScoutInterest = (career: CareerSnapshot, result: MatchResult) =>
  career.scoutInterest.map((scout, index) => {
    const tierPenalty = index * 2;
    const delta = Math.max(0, Math.round(result.playerRating / 18) + result.goals * 4 + result.assists * 2 + Math.floor(career.player.reputation / 18) - tierPenalty);
    return { ...scout, interest: clamp(scout.interest + delta, 0, 100) };
  });

const generateOffer = (career: CareerSnapshot, scoutInterest: ScoutInterest[], week: number): ClubOffer | undefined => {
  if (career.pendingOffer) return career.pendingOffer;
  const scout = scoutInterest.find((item) => item.interest >= 72 && item.club !== career.player.club);
  if (!scout) return undefined;

  const tierMultiplier = scout.tier === "elite" ? 3 : scout.tier === "national" ? 2 : 1;
  return {
    id: `offer:${scout.club}:${week}`,
    club: scout.club,
    tier: scout.tier,
    role: scout.tier === "elite" ? "prospect" : scout.tier === "national" ? "rotation" : "starter",
    weeklySalary: career.contract.weeklySalary + 65 * tierMultiplier,
    signingBonus: 180 * tierMultiplier,
    reputationRequired: 18 * tierMultiplier,
  };
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
  const grossSalary = career.contract.weeklySalary;
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
  const objectiveProgress = advanceObjectives(career, result);
  const assessment = assessWeek(career, result);
  const scoutInterest = updateScoutInterest(career, result);
  const pendingOffer = generateOffer(career, scoutInterest, nextWeek);
  const nextSalary = grossSalary + assessment.salaryDelta;
  const nextStatus = career.contract.appearances + 1 >= 8 && career.relationships.coach + assessment.trustDelta >= 65 ? "rotation" : career.contract.status;

  return {
    ...career,
    player: {
      ...career.player,
      energy: clamp(career.player.energy + result.energyDelta),
      reputation: clamp(career.player.reputation + result.reputationDelta + objectiveProgress.reputationReward),
      form: clamp(career.player.form + goals * 2 + assists - 1),
      happiness: clamp(career.player.happiness + (teamGoals > opponentGoals ? 2 : -2)),
    },
    relationships: {
      ...career.relationships,
      coach: clamp(career.relationships.coach + assessment.trustDelta),
    },
    calendar: {
      season: nextSeason,
      week: nextWeek,
      phase: "life",
      nextOpponent: getNextOpponent(nextSeason, nextWeek),
    },
    contract: {
      ...career.contract,
      weeklySalary: nextSalary,
      status: nextStatus,
      appearances: career.contract.appearances + 1,
      nextReviewWeek: nextWeek + 5,
    },
    objectives: objectiveProgress.objectives,
    scoutInterest,
    pendingOffer,
    lastAssessment: assessment,
    ledger: {
      ...career.ledger,
      weeklySalary: nextSalary,
      balance: career.ledger.balance + netIncome + objectiveProgress.balanceReward,
      totalEarned: career.ledger.totalEarned + grossSalary,
      lastNetIncome: netIncome,
    },
    pendingLifeEvent: getLifeEvent(nextSeason, nextWeek),
    matchHistory: [result, ...(career.matchHistory ?? [])].slice(0, 6),
    eventLog: [
      { id: `match:${result.id}`, week: career.calendar.week, type: "match" as const, label: `${teamGoals}-${opponentGoals} vs ${result.opponent}` },
      { id: `finance:${result.id}`, week: career.calendar.week, type: "finance" as const, label: `Saldo semanal €${netIncome}` },
      ...(objectiveProgress.balanceReward > 0 ? [{ id: `objective:${result.id}`, week: career.calendar.week, type: "life" as const, label: `Bônus de meta €${objectiveProgress.balanceReward}` }] : []),
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

export const acceptClubOffer = (career: CareerSnapshot): CareerSnapshot => {
  if (!career.pendingOffer) return career;

  return {
    ...career,
    player: {
      ...career.player,
      club: career.pendingOffer.club,
      reputation: clamp(career.player.reputation + 3),
      happiness: clamp(career.player.happiness + 6),
    },
    contract: {
      club: career.pendingOffer.club,
      status: career.pendingOffer.role,
      weeklySalary: career.pendingOffer.weeklySalary,
      appearances: 0,
      nextReviewWeek: career.calendar.week + 6,
    },
    relationships: { coach: 42, squad: 35, fans: 22 },
    ledger: {
      ...career.ledger,
      weeklySalary: career.pendingOffer.weeklySalary,
      balance: career.ledger.balance + career.pendingOffer.signingBonus,
    },
    scoutInterest: initialScoutInterest.map((scout) => ({ ...scout, interest: scout.club === career.pendingOffer?.club ? 0 : Math.max(0, scout.interest - 20) })),
    pendingOffer: undefined,
    eventLog: [
      { id: `transfer:${career.calendar.season}:${career.calendar.week}`, week: career.calendar.week, type: "life" as const, label: `Assinou com ${career.pendingOffer.club}` },
      ...(career.eventLog ?? []),
    ].slice(0, 8),
  };
};

export const rejectClubOffer = (career: CareerSnapshot): CareerSnapshot => ({
  ...career,
  scoutInterest: career.scoutInterest.map((scout) => (scout.club === career.pendingOffer?.club ? { ...scout, interest: 45 } : scout)),
  eventLog: career.pendingOffer
    ? [
        { id: `reject:${career.pendingOffer.id}`, week: career.calendar.week, type: "life" as const, label: `Recusou ${career.pendingOffer.club}` },
        ...(career.eventLog ?? []),
      ].slice(0, 8)
    : career.eventLog,
  pendingOffer: undefined,
});
