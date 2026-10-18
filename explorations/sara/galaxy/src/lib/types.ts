export type Mood = "calm" | "mixed" | "hard";
export type Support = "ventilator" | "cpap" | "high-flow" | "low-flow" | "room-air";
export type MomentType =
  | "feed"
  | "diaper"
  | "skin-to-skin"
  | "cares"
  | "note"
  | "photo"
  | "voice"
  | "weight"
  | "support-change"
  | "procedure";

export type Moment = {
  id: string;
  time: string; // HH:MM
  type: MomentType;
  title: string;
  plain: string;
  by?: string;
  first?: string;
  media?: "photo" | "voice";
  seconds?: number;
  grams?: number;
  durationMinutes?: number;
  terms?: string[];
};

export type Day = {
  date: string;
  dayIndex: number;
  week: number;
  weightGrams: number;
  mood: Mood;
  parentMinutes: number;
  support: Support;
  supportLabel: string;
  first?: string;
  story: string;
  moments: Moment[];
};

export type Week = { index: number; title: string; summary: string; hardPart?: string };

export type Baby = {
  name: string;
  pronoun: { subject: string; object: string; possessive: string };
  birthDate: string;
  gestationalAgeAtBirthWeeks: number;
  birthWeightGrams: number;
};

export type Stay = {
  baby: Baby;
  today: { dayIndex: number; nowTime: string };
  status: string;
  lastVisit: { dayIndex: number; time: string };
  recap: { dayIndex: number; caption: string }[];
  liveArrival: Omit<Moment, "id"> & { notification: string };
  weeks: Week[];
  days: Day[];
};
