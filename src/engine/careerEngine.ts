import type { CareerSnapshot, MatchResult, TrainingFocus } from "@/domain/career";
import { createSeededRandom } from "./random";

const opponents = ["Porto Norte", "Sevilla Azul", "Milano Primavera", "Dortmund II", "Rotterdam 1908", "Monaco Rouge"];

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
  matchHistory: [],
  ledger: {
    balance: 450,
    weeklySalary: 120,
    totalEarned: 450,
  },
};

const clamp = (value: number, min = 0, max = 99) => Math.min(max, Math.max(min, value));

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
    },
    calendar: {
      season: nextSeason,
      week: nextWeek,
      phase: "recovery",
      nextOpponent: getNextOpponent(nextSeason, nextWeek),
    },
    ledger: {
      ...career.ledger,
      balance: career.ledger.balance + career.ledger.weeklySalary,
      totalEarned: career.ledger.totalEarned + career.ledger.weeklySalary,
    },
    matchHistory: [result, ...(career.matchHistory ?? [])].slice(0, 6),
    lastMatch: result,
  };
};

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
