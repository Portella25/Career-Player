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
  happiness: number;
  attributes: PlayerAttributes;
};

export type RelationshipMap = {
  coach: number;
  squad: number;
  fans: number;
};

export type CareerCalendar = {
  season: number;
  week: number;
  phase: "training" | "match" | "life" | "recovery";
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

export type LifeEventOption = {
  id: string;
  label: string;
  detail: string;
  effects: {
    reputation?: number;
    energy?: number;
    form?: number;
    happiness?: number;
    balance?: number;
    coach?: number;
    squad?: number;
    fans?: number;
  };
};

export type LifeEvent = {
  id: string;
  title: string;
  description: string;
  options: LifeEventOption[];
};

export type CareerEventLog = {
  id: string;
  week: number;
  type: "training" | "match" | "life" | "finance";
  label: string;
};

export type CareerSnapshot = {
  player: PlayerProfile;
  calendar: CareerCalendar;
  lastMatch?: MatchResult;
  pendingLifeEvent?: LifeEvent;
  matchHistory: MatchResult[];
  relationships: RelationshipMap;
  eventLog: CareerEventLog[];
  ledger: {
    balance: number;
    weeklySalary: number;
    weeklyExpenses: number;
    taxRate: number;
    totalEarned: number;
    lastNetIncome: number;
  };
};
