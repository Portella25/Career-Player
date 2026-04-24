export type PlayerPosition = "ST" | "CAM" | "CM" | "W" | "CB" | "GK";

export type PlayerAttributes = {
  finishing: number;
  passing: number;
  pace: number;
  stamina: number;
  mentality: number;
};

export type PlayerProfile = {
  id: string;
  name: string;
  age: number;
  position: PlayerPosition;
  club: string;
  reputation: number;
  energy: number;
  form: number;
  attributes: PlayerAttributes;
};

export type CareerCalendar = {
  season: number;
  week: number;
  phase: "training" | "match" | "recovery";
  nextOpponent: string;
};

export type TrainingFocus = keyof PlayerAttributes;

export type MatchEvent = {
  minute: number;
  type: "chance" | "goal" | "assist" | "miss" | "save";
  label: string;
  impact: number;
};

export type MatchResult = {
  id: string;
  opponent: string;
  teamGoals: number;
  opponentGoals: number;
  playerRating: number;
  goals: number;
  assists: number;
  reputationDelta: number;
  energyDelta: number;
  events: MatchEvent[];
};

export type CareerSnapshot = {
  player: PlayerProfile;
  calendar: CareerCalendar;
  lastMatch?: MatchResult;
  matchHistory: MatchResult[];
  ledger: {
    balance: number;
    weeklySalary: number;
    totalEarned: number;
  };
};
