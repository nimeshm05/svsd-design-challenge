// Generates data/stay.json: a SYNTHETIC 54-day NICU stay for a baby born at 27 weeks.
// Never real patient data. Deterministic (seeded) so the galaxy looks the same on every run.
// Clinical shape (weights, support, timing of firsts) is illustrative and should be checked
// by someone with NICU experience before it is shown as realistic.
//
//   node scripts/generate-stay.mjs

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..", "data", "stay.json");

// ---------- seeded rng ----------
function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(27);
const jitter = (n) => Math.round((rand() - 0.5) * 2 * n);

const TOTAL_DAYS = 54; // today is day 54
const BIRTH = new Date(Date.UTC(2026, 7, 24)); // 24 Aug 2026 → day 54 is 16 Oct 2026

const baby = {
  name: "Arjun",
  pronoun: { subject: "he", object: "him", possessive: "his" },
  birthDate: BIRTH.toISOString().slice(0, 10),
  gestationalAgeAtBirthWeeks: 27,
  birthWeightGrams: 980,
  family: { mom: "Mom", dad: "Dad", grandma: "Nani" },
};

// ---------- support (breathing help) ----------
function supportFor(d) {
  if (d <= 3) return "ventilator";
  if (d <= 13) return "cpap";
  if (d <= 16) return "high-flow";
  if (d <= 30) return "cpap"; // back on CPAP in the hard week, stays until week 5
  if (d <= 40) return "high-flow";
  if (d <= 49) return "low-flow";
  return "room-air";
}

// ---------- mood (how the day went) ----------
const moodOverrides = {
  1: "mixed", 2: "mixed", 3: "mixed", 5: "mixed", 10: "mixed",
  16: "mixed", 17: "hard", 18: "hard", 19: "mixed", 20: "hard", 21: "mixed",
  27: "mixed", 30: "mixed", 39: "mixed", 46: "mixed",
};
const moodFor = (d) => moodOverrides[d] ?? "calm";

// ---------- weight ----------
// early dip (~8%) to day 5, back to birth weight on day 12, slow gain in the hard week,
// then steady gains of roughly 15–20 g/kg/day.
const weights = [];
{
  let w = baby.birthWeightGrams;
  for (let d = 1; d <= TOTAL_DAYS; d++) {
    if (d === 1) w = 980;
    else if (d <= 5) w -= 20;
    else if (d <= 12) w += Math.round((980 - 900) / 7);
    else if (d >= 16 && d <= 21) w += 6 + jitter(4);
    else w += Math.round(w * 0.016) + jitter(5);
    if (d === 12) w = 980;
    weights.push(w);
  }
}

// ---------- parent presence ----------
// minutes per visit; 0 = nobody could come that day.
const visits = {}; // day -> [{who, start, minutes, skin}]
for (let d = 1; d <= TOTAL_DAYS; d++) {
  const v = [];
  const weekday = (d + 0) % 7; // 0..6, day 1 is a Monday-ish
  if (d === 1) v.push({ who: "Dad", start: 15 * 60, minutes: 40 });
  else if (d === 2) v.push({ who: "Mom", start: 11 * 60, minutes: 60 }, { who: "Dad", start: 19 * 60, minutes: 45 });
  else if (d === 10 || d === 11) {
    // Mom has a cold and stays home; Dad does a short evening visit on day 11.
    if (d === 11) v.push({ who: "Dad", start: 19 * 60, minutes: 35 });
  } else if (d === 29) {
    // nobody could come in today
  } else {
    const momMin = d < 6 ? 90 : 120 + jitter(50);
    v.push({ who: "Mom", start: 10 * 60 + jitter(30), minutes: momMin, skin: d >= 6 && d !== 17 && d !== 18 });
    if (weekday !== 3 || d < 8) v.push({ who: "Dad", start: 18 * 60 + 30 + jitter(20), minutes: 50 + jitter(25), skin: d === 23 || (d > 23 && rand() < 0.35) });
  }
  visits[d] = v;
}

// ---------- weeks ----------
const weeks = [
  {
    index: 1,
    title: "Hello, small one",
    summary: "Arjun arrived eleven weeks early. He spent his first days resting while machines did some of the work, and on day 6 you held him for the first time.",
    hardPart: "Most babies lose a little weight in their first days. Arjun dropped to 900 g by day 5, which the team expected, and began gaining it back.",
  },
  {
    index: 2,
    title: "Finding a rhythm",
    summary: "Feeds grew from drops to full feeds of Mom's milk. On day 12 he was back to his birth weight, and on day 14 he tried a gentler kind of breathing help.",
  },
  {
    index: 3,
    title: "A harder week",
    summary: "This week asked more of Arjun. He gained slowly and needed more help breathing again. You kept coming; on the hardest days your voice was there.",
    hardPart: "On day 17 his breathing pauses came more often, and the team moved him back to CPAP. This is common for babies born this early and usually means the lungs need more time. The care team called you that afternoon; the plan was to give his lungs rest.",
  },
  {
    index: 4,
    title: "Steadying",
    summary: "The pauses settled. Dad held him skin-to-skin for the first time, and Arjun had his first bath.",
  },
  {
    index: 5,
    title: "Breathing more on his own",
    summary: "On day 31 Arjun came off CPAP for good and moved to soft high-flow tubes. You could see his whole face for the first time in weeks.",
    hardPart: "His first eye exam on day 30 was routine. Babies born this early are checked every one to two weeks; the team will share each result with you.",
  },
  {
    index: 6,
    title: "First bottle",
    summary: "Arjun wore his first outfit and, on day 38, took milk from a bottle for the first time: a few careful sips, then a rest.",
  },
  {
    index: 7,
    title: "Learning to feed",
    summary: "More bottles, a first try at the breast, and his breathing help turned down to a whisper of oxygen.",
  },
  {
    index: 8,
    title: "Room to breathe",
    summary: "Arjun is breathing room air and sleeping in an open crib. This chapter is still being written.",
  },
];

// ---------- named firsts ----------
const firsts = {
  1: { time: "04:12", type: "note", first: "Hello, Arjun", title: "Arjun was born", plain: "Arjun was born at 4:12 AM, at 27 weeks, weighing 980 g. The team settled him into a warm incubator with help breathing.", by: "Nurse Leah", terms: ["incubator", "ventilator"] },
  2: { time: "09:30", type: "feed", first: "First drops of milk", title: "First drops of Mom's milk", plain: "A nurse swabbed a few drops of Mom's first milk inside his cheeks. It is not for nutrition yet; it gently coats his mouth.", by: "Nurse Leah", terms: ["colostrum"] },
  3: { time: "16:40", type: "diaper", first: "First poop", title: "First poop!", plain: "His very first poop arrived this afternoon: dark and sticky, exactly what the team hoped to see. His tummy is starting to work.", by: "Nurse Tomás", terms: ["meconium"] },
  4: { time: "10:05", type: "support-change", first: "Off the ventilator", title: "Moved from the ventilator to CPAP", plain: "The breathing tube came out. Arjun now breathes on his own, with CPAP gently keeping his lungs open.", by: "Dr. Okafor", terms: ["ventilator", "cpap"] },
  6: { time: "11:10", type: "skin-to-skin", first: "First hold", title: "First hold, skin-to-skin with Mom", plain: "Arjun lay on Mom's chest for 1 hour 20 minutes. He stayed warm and settled the whole time.", by: "Mom", terms: ["kangaroo care"] },
  12: { time: "23:30", type: "weight", first: "Back to birth weight", title: "Back to birth weight", plain: "980 g, the same as the day he was born. The early dip is behind him.", by: "Nurse Grace" },
  14: { time: "09:45", type: "support-change", first: "First try on high flow", title: "Moved from CPAP to high flow", plain: "The team tried a gentler kind of breathing help: soft tubes in his nose instead of the CPAP mask.", by: "Dr. Okafor", terms: ["high-flow", "cpap"] },
  23: { time: "19:00", type: "skin-to-skin", first: "Dad's first hold", title: "Dad's first hold", plain: "Arjun lay on Dad's chest for the first time. Dad hummed; Arjun slept.", by: "Dad", terms: ["kangaroo care"] },
  26: { time: "11:30", type: "cares", first: "First bath", title: "First bath", plain: "Mom gave Arjun a short, warm swaddle bath with Nurse Grace. He opened his eyes in the water.", by: "Mom" },
  31: { time: "10:20", type: "support-change", first: "Off CPAP", title: "Off CPAP", plain: "The CPAP mask came off for good. Arjun moved to high flow, and you could see his whole face.", by: "Dr. Okafor", terms: ["cpap", "high-flow"] },
  35: { time: "10:40", type: "photo", first: "First outfit", title: "First outfit", plain: "Arjun is warm enough now to wear clothes. Mom chose the striped one.", by: "Mom", media: "photo" },
  38: { time: "11:00", type: "feed", first: "First bottle", title: "First bottle", plain: "Arjun took 8 ml from a bottle, with pauses to breathe. The rest of the feed went through his tube.", by: "Mom", terms: ["gavage feed", "cue-based feeding"] },
  44: { time: "10:30", type: "feed", first: "First breastfeed", title: "First try at the breast", plain: "Arjun latched for a few minutes and mostly snuggled. Practice counts.", by: "Mom", terms: ["cue-based feeding"] },
  50: { time: "08:15", type: "support-change", first: "Room air", title: "Breathing room air", plain: "The nasal tubes came off. Arjun is breathing room air, with no extra help.", by: "Dr. Okafor", terms: ["low-flow"] },
  52: { time: "14:20", type: "cares", first: "Open crib", title: "Moved to an open crib", plain: "Arjun can now keep himself warm, so he moved out of the incubator into an open crib.", by: "Nurse Leah", terms: ["incubator"] },
};

// ---------- procedures & support changes (non-firsts) ----------
const procedures = {
  1: [{ time: "05:30", title: "Umbilical lines placed", plain: "Two thin tubes were placed in his belly button so the team can give fluids and take blood without extra pokes.", terms: ["umbilical line"] }],
  2: [{ time: "13:00", title: "Bili lights on", plain: "A soft blue light shines on his skin to help clear bilirubin, which makes many newborns look a little yellow.", terms: ["bili lights"] }],
  5: [{ time: "15:00", title: "Bili lights off", plain: "His bilirubin came down and the blue lights were switched off.", terms: ["bili lights"] }],
  7: [{ time: "10:00", title: "Head ultrasound", plain: "A routine scan through the soft spot on his head. Every baby born this early has one; the team shares results with you.", terms: ["head ultrasound"] }],
  9: [{ time: "14:30", title: "PICC line placed", plain: "A long, thin IV was placed in his arm so the umbilical lines could come out.", terms: ["picc line"] }],
  19: [{ time: "09:00", title: "Blood test", plain: "A small heel-prick blood test to check his blood count. Results are part of the team's morning review.", terms: ["blood test"] }],
  21: [{ time: "16:00", title: "PICC line out", plain: "He is on full milk feeds, so the IV in his arm came out.", terms: ["picc line"] }],
  28: [{ time: "10:00", title: "Second head ultrasound", plain: "A routine follow-up scan, scheduled for every baby born this early.", terms: ["head ultrasound"] }],
  30: [{ time: "13:30", title: "First eye exam", plain: "A routine eye check. Babies born this early are checked every one to two weeks while their eyes finish developing.", terms: ["eye exam"] }],
  44: [{ time: "13:00", title: "Eye exam", plain: "A routine follow-up eye check.", terms: ["eye exam"] }],
  53: [{ time: "15:00", title: "Hearing screen", plain: "A quiet test while he slept, using tiny earphones. It is done for every baby before going home.", terms: ["hearing screen"] }],
};
const supportChanges = {
  17: { time: "14:10", title: "Back on CPAP", plain: "His breathing pauses were coming more often, so the team moved him back to CPAP to give his lungs more rest. The care team called you at 2:30 PM.", by: "Dr. Okafor", terms: ["cpap", "apnea"] },
  41: { time: "09:30", title: "Moved to low flow", plain: "His breathing help was turned down to a gentle trickle of air through thin nasal tubes.", by: "Dr. Okafor", terms: ["low-flow"] },
};

// ---------- nurse notes ----------
const notes = {
  1: "He is small and strong-hearted. We'll keep him warm, quiet and dark today.",
  3: "Bili lights on, eye mask in place. He's been grabbing at his tubes, which we love to see.",
  5: "Weight down a little, as expected this week. He tolerated his feeds well.",
  8: "Feeds increased again. He likes his hand near his face.",
  10: "Mom called twice tonight. I told Arjun she says goodnight.",
  13: "Sleepy and content. Opened his eyes during cares.",
  16: "A few more breathing pauses today. We're watching closely and he's comfortable.",
  17: "Back on CPAP this afternoon. He settled quickly once he was on it.",
  18: "Resting. Kept the lights low and handled him gently.",
  20: "A tiring day for him. Mom's voice note seemed to calm him at 3 AM.",
  22: "Fewer pauses today. He's gaining again.",
  25: "Lovely quiet night. He's starting to have awake, alert moments.",
  27: "A little more oxygen needed during the day, then settled by evening.",
  32: "His whole face is visible now. He frowns when he's concentrating.",
  36: "Rooting at the pacifier during tube feeds, a good sign for bottles.",
  39: "Tired after his bottle practice, so we let him rest and finished by tube.",
  42: "Took two full bottles today.",
  46: "Fussy this evening; settled with a swaddle and Dad's voice.",
  48: "Feeding well and alert for longer stretches.",
  51: "Slept through the night and took his whole 2 AM feed.",
  53: "Happy in his crib. He likes the mobile.",
  54: "Good morning. He finished his 8 AM bottle and is snoozing.",
};
const nurses = ["Nurse Leah", "Nurse Tomás", "Nurse Grace", "Nurse Imani"];

// ---------- voice notes ----------
const voice = {
  2: { by: "Mom", title: "Mom said goodnight", plain: "A voice note from Mom: \"Goodnight, little star. I'll be back in the morning.\"", time: "21:40", secs: 24 },
  5: { by: "Nani", title: "Nani sang to him", plain: "Nani sang the lullaby she used to sing to your mom.", time: "20:10", secs: 58 },
  8: { by: "Dad", title: "Dad read a story", plain: "Dad recorded the first page of his favorite picture book.", time: "22:05", secs: 71 },
  10: { by: "Mom", title: "Mom, from home", plain: "\"I have a cold, so I can't come in today. I'm thinking about you every minute.\"", time: "11:30", secs: 33 },
  11: { by: "Nani", title: "Nani's lullaby", plain: "Nani sang to him again, a little slower.", time: "21:00", secs: 62 },
  15: { by: "Dad", title: "Dad hummed", plain: "Dad hummed the song from your wedding.", time: "23:10", secs: 40 },
  17: { by: "Mom", title: "Mom's voice", plain: "\"I'm here, Arjun. You rest. We'll do this slowly.\"", time: "22:30", secs: 29 },
  18: { by: "Nani", title: "Nani's prayer", plain: "Nani sent a quiet blessing for him.", time: "07:00", secs: 45 },
  20: { by: "Mom", title: "Mom's 3 AM song", plain: "The nurse played Mom's song when he was unsettled at 3 AM.", time: "03:00", secs: 52 },
  24: { by: "Dad", title: "Dad's story, part two", plain: "The second page of the picture book.", time: "21:45", secs: 66 },
  29: { by: "Mom", title: "Mom, from home", plain: "\"We couldn't come in today. We love you. Back tomorrow.\"", time: "18:20", secs: 21 },
  29.5: { by: "Nani", title: "Nani sang", plain: "Nani sang to him while the family stayed home.", time: "20:30", secs: 57 },
  33: { by: "Nani", title: "Nani's new song", plain: "A new song from Nani, about the moon.", time: "20:00", secs: 63 },
  37: { by: "Dad", title: "Dad's story, part three", plain: "Dad finished the picture book.", time: "22:00", secs: 74 },
  40: { by: "Mom", title: "Mom's lullaby", plain: "Mom recorded her own lullaby.", time: "21:15", secs: 48 },
  43: { by: "Nani", title: "Nani said hello", plain: "\"Hello, my darling. Soon I will hold you.\"", time: "19:40", secs: 18 },
  47: { by: "Dad", title: "Dad's new book", plain: "A new picture book, about a bear.", time: "21:50", secs: 69 },
  51: { by: "Nani", title: "Nani sang", plain: "Nani's moon song again.", time: "20:00", secs: 63 },
  53: { by: "Mom", title: "Mom said goodnight", plain: "\"Goodnight, little star. You did so much today.\"", time: "21:30", secs: 22 },
};

// ---------- photos (placeholders; never real babies) ----------
const photos = {
  6: { by: "Nurse Grace", title: "A photo of the first hold", plain: "Nurse Grace took a photo of you and Arjun together." },
  14: { by: "Nurse Leah", title: "A photo from Nurse Leah", plain: "His hand wrapped around Mom's finger." },
  26: { by: "Nurse Grace", title: "A photo of bath time", plain: "Bath time, eyes open." },
  41: { by: "Dad", title: "A photo from Dad", plain: "Asleep in the striped outfit." },
  52: { by: "Nurse Leah", title: "A photo in the open crib", plain: "His first nap in the open crib." },
};

// ---------- day stories (the narrator line) ----------
const stories = {
  1: "Arjun arrived at 4:12 AM. Small, warm, and here.",
  2: "His first drops of Mom's milk, and a soft blue light to help his skin.",
  3: "His first poop arrived. The nurses cheered a little.",
  4: "The breathing tube came out. He's breathing with CPAP now.",
  5: "Down to 900 g, as expected. The blue lights came off.",
  6: "You held him for the first time. He stayed warm on your chest.",
  7: "A routine head scan, and a quiet day.",
  10: "Mom couldn't come in with her cold. Her voice note played at bedtime.",
  12: "Back to his birth weight: 980 g.",
  14: "A first try on gentler breathing help.",
  16: "More breathing pauses than usual. The team watched closely.",
  17: "He needed more help breathing again and went back on CPAP. He settled quickly.",
  18: "A day of rest. Lights low, voices soft.",
  20: "A tiring day. Mom's song calmed him at 3 AM.",
  21: "His IV came out. He's on full milk feeds now.",
  23: "Dad held him skin-to-skin for the first time.",
  26: "His first bath. He opened his eyes in the water.",
  29: "Nobody could come in today. Two voice notes kept him company.",
  30: "His first routine eye exam.",
  31: "Off CPAP. You could see his whole face.",
  35: "His first outfit: the striped one.",
  38: "His first bottle: a few careful sips, then a rest.",
  41: "His breathing help turned down to a whisper.",
  44: "A first try at the breast. Mostly snuggles.",
  50: "Breathing room air. No extra help.",
  51: "He slept through the night and took his whole 2 AM feed.",
  52: "He moved into an open crib this afternoon.",
  53: "A quiet hearing screen while he slept, and two full bottles.",
  54: "A calm morning. Mom is here.",
};
function defaultStory(d, mood) {
  if (mood === "hard") return "A harder day. The team kept him comfortable.";
  if (mood === "mixed") return "A mixed day, with some rest in between.";
  const lines = [
    "A steady day of feeds and sleep.",
    "Calm and growing.",
    "A quiet day. He slept well between feeds.",
    "Settled, warm and gaining.",
    "Feeds went well, and he had some awake time.",
  ];
  return lines[(d * 7) % lines.length];
}

// ---------- helpers ----------
const hhmm = (m) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const toMin = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
function feedMlPerKgDay(d) {
  if (d <= 2) return 10;
  if (d <= 10) return 10 + (d - 2) * 17;
  return 160;
}
const supportLabel = { ventilator: "a ventilator", cpap: "CPAP", "high-flow": "high flow", "low-flow": "low flow", "room-air": "room air" };

// today's "now" for the demo: 1:52 PM
const NOW_TODAY = 13 * 60 + 52;

// ---------- build days ----------
const days = [];
for (let d = 1; d <= TOTAL_DAYS; d++) {
  const date = new Date(BIRTH.getTime() + (d - 1) * 86400000).toISOString().slice(0, 10);
  const support = supportFor(d);
  const mood = moodFor(d);
  const weight = weights[d - 1];
  const prevWeight = d > 1 ? weights[d - 2] : null;
  const moments = [];
  let n = 0;
  const id = () => `d${d}-${++n}`;
  const add = (m) => moments.push({ id: id(), ...m });

  const bottleDay = d >= 38;
  const nurseOf = (min) => nurses[(d + Math.floor(min / 720)) % nurses.length];

  // feeds every 3 hours
  const ml = Math.max(1, Math.round(((weight / 1000) * feedMlPerKgDay(d)) / 8));
  for (const h of [2, 5, 8, 11, 14, 17, 20, 23]) {
    const t = h * 60;
    if (d === TOTAL_DAYS && t > NOW_TODAY) continue;
    if (d === 1 && t < 6 * 60) continue;
    const firstHere = firsts[d] && firsts[d].type === "feed" && Math.abs(toMin(firsts[d].time) - t) < 120;
    if (firstHere) continue;
    let title, plain, terms;
    if (d <= 2) {
      title = "Tiny feed";
      plain = `A tiny ${ml} ml of Mom's milk through his feeding tube, mostly to wake up his tummy. Most of his nutrition still comes through his IV.`;
      terms = ["gavage feed", "iv nutrition"];
    } else if (bottleDay && (h === 11 || h === 17 || (d >= 42 && h === 8) || (d >= 46 && (h === 14 || h === 20)) || (d >= 50 && h === 2))) {
      const took = d >= 50 ? ml : Math.round(ml * (0.4 + (d - 38) * 0.05));
      title = d >= 50 ? `Bottle · ${took} ml` : `Bottle practice · ${took} ml`;
      plain = took >= ml ? `He took his whole feed, ${took} ml, from a bottle.` : `He took ${took} ml from a bottle, then rested. The rest went through his tube.`;
      terms = ["cue-based feeding"];
    } else {
      title = `Feed · ${ml} ml`;
      plain = `${ml} ml of ${d >= 14 ? "Mom's milk with a little fortifier" : "Mom's milk"}, through his feeding tube over about 30 minutes.`;
      terms = d >= 14 ? ["gavage feed", "fortifier"] : ["gavage feed"];
    }
    add({ time: hhmm(t + jitter(6) + 6), type: "feed", title, plain, by: nurseOf(t), terms });
  }

  // diapers at some cares
  for (const h of [5, 11, 17, 23]) {
    const t = h * 60 + 20 + jitter(10);
    if (d === TOTAL_DAYS && t > NOW_TODAY) continue;
    if (d < 3) continue;
    const isDirty = rand() < 0.45;
    add({ time: hhmm(t), type: "diaper", title: "Diaper change", plain: isDirty ? "Wet and dirty. His tummy is working." : "A wet one.", by: nurseOf(t) });
  }

  // parent visits → cares + skin-to-skin
  let parentMinutes = 0;
  for (const v of visits[d]) {
    if (d === TOTAL_DAYS && v.start > NOW_TODAY) continue;
    let minutes = v.minutes;
    if (d === TOTAL_DAYS) minutes = Math.min(minutes, NOW_TODAY - v.start);
    parentMinutes += minutes;
    const careT = v.start + 15;
    if (d >= 3) add({ time: hhmm(careT), type: "cares", title: `${v.who} did his cares`, plain: `${v.who} took his temperature, changed his diaper and cleaned his mouth${d >= 10 ? ", then tucked him back in" : ""}.`, by: v.who, terms: ["cares"] });
    const firstSkin = firsts[d] && firsts[d].type === "skin-to-skin";
    if (v.skin && !firstSkin && minutes > 50) {
      const dur = Math.round(minutes * 0.7);
      add({ time: hhmm(v.start + 30), type: "skin-to-skin", title: `Skin-to-skin with ${v.who} · ${Math.floor(dur / 60)}h ${dur % 60}m`, plain: `Arjun lay on ${v.who}'s chest for ${Math.floor(dur / 60) ? Math.floor(dur / 60) + " h " : ""}${dur % 60} min. He stayed warm and calm.`, by: v.who, terms: ["kangaroo care"], durationMinutes: dur });
    }
  }

  // weight check (night, measured just before midnight; today's from the early hours)
  {
    const wt = d === TOTAL_DAYS ? "00:30" : "23:30";
    const isFirstWeight = firsts[d] && firsts[d].type === "weight";
    if (!isFirstWeight) {
      const delta = prevWeight == null ? 0 : weight - prevWeight;
      let plain;
      if (prevWeight == null) plain = `${weight} g at birth.`;
      else if (delta < 0) plain = `${weight} g, down ${-delta} g. Most babies lose a little weight in their first days before gaining it back.`;
      else if (delta === 0) plain = `${weight} g, the same as yesterday.`;
      else plain = `${weight.toLocaleString("en-US")} g, up ${delta} g since yesterday.`;
      add({ time: wt, type: "weight", title: `Weighed ${weight.toLocaleString("en-US")} g`, plain, by: nurseOf(toMin(wt)), grams: weight });
    }
  }

  // nurse note
  if (notes[d]) {
    const t = d === TOTAL_DAYS ? 9 * 60 + 10 : 7 * 60 + 10 + jitter(20);
    add({ time: hhmm(t), type: "note", title: `A note from ${nurseOf(t)}`, plain: notes[d], by: nurseOf(t) });
  }

  // photos
  if (photos[d]) add({ time: hhmm(12 * 60 + 15 + jitter(30)), type: "photo", ...photos[d], media: "photo" });

  // voice notes (some days have two)
  for (const key of [d, d + 0.5]) {
    const vn = voice[key];
    if (!vn) continue;
    add({ time: vn.time, type: "voice", title: vn.title, plain: vn.plain, by: vn.by, media: "voice", seconds: vn.secs });
  }

  // procedures and support changes
  for (const p of procedures[d] ?? []) add({ type: "procedure", by: "Care team", ...p });
  if (supportChanges[d]) add({ type: "support-change", ...supportChanges[d] });

  // the named first
  if (firsts[d]) add({ ...firsts[d] });

  moments.sort((a, b) => toMin(a.time) - toMin(b.time));
  // stable ids after sort
  moments.forEach((m, i) => (m.id = `d${d}-${String(i + 1).padStart(2, "0")}`));

  const firstOfDay = firsts[d]?.first;
  days.push({
    date,
    dayIndex: d,
    week: Math.ceil(d / 7),
    weightGrams: weight,
    mood,
    parentMinutes,
    support,
    supportLabel: supportLabel[support],
    first: firstOfDay,
    story: stories[d] ?? defaultStory(d, mood),
    moments,
  });
}

// ---------- recap and live arrival ----------
const data = {
  generatedNote: "SYNTHETIC DATA. Not a real baby. Clinical shape is illustrative; check with NICU staff before presenting as realistic.",
  baby,
  today: { dayIndex: TOTAL_DAYS, nowTime: hhmm(NOW_TODAY) },
  status: "Stable and growing. Today's focus: feeding.",
  lastVisit: { dayIndex: 51, time: "21:40" },
  recap: [
    { dayIndex: 52, caption: "Arjun moved into an open crib. He can keep himself warm now." },
    { dayIndex: 53, caption: "He had a quiet hearing screen while he slept, and took two full bottles." },
    { dayIndex: 54, caption: "A calm morning. He finished his 8 AM bottle and is snoozing." },
  ],
  liveArrival: {
    time: "14:04",
    type: "feed",
    title: "Bottle · 36 ml",
    plain: "Arjun finished his 2 PM feed, all 36 ml from a bottle, with Mom holding him.",
    by: "Mom",
    terms: ["cue-based feeding"],
    notification: "Arjun finished his 2 PM feed",
  },
  weeks,
  days,
};

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(data, null, 2) + "\n");
const counts = days.map((d) => d.moments.length);
console.log(`wrote ${out}: ${days.length} days, ${counts.reduce((a, b) => a + b, 0)} moments (${Math.min(...counts)}–${Math.max(...counts)} per day)`);
console.log("weights:", weights.join(" "));
