// Content for each day in Mila's sky. Ported from the Claude Design file
// "NICU Sky · Star Day View" (Star, planet and Star · phone frames).
// Placeholders in [brackets] are intentional: they stand in for chart data.

const CARE = 'Feed through her tube, diaper change, temperature check.'

const baseEvents = [
  { t: '12:00 a.m.', h: 0, cat: 'care', title: 'Care time', plain: CARE, med: '', by: '[Night nurse] (N1)' },
  { t: '2:00 a.m.', h: 2, cat: 'med', title: 'Caffeine', plain: 'Her daily medicine that helps her remember to breathe steadily.', med: 'caffeine citrate [dose] via NG, once daily', by: '[Night nurse] (N1)' },
  { t: '3:00 a.m.', h: 3, cat: 'care', title: 'Care time', plain: CARE, med: '', by: '[Night nurse] (N1)' },
  { t: '5:30 a.m.', h: 5.5, cat: 'test', title: 'Small blood test', plain: 'A tiny heel prick to check her blood sugar and how well her lungs are working.', med: 'capillary blood gas + glucose · result: [result]', by: '[Night nurse] (N1)' },
  { t: '6:00 a.m.', h: 6, cat: 'care', title: 'Care time', plain: CARE, med: '', by: '[Night nurse] (N1)' },
  { t: '7:40 a.m.', h: 7.67, cat: 'check', title: 'Morning check and 3D recording', plain: "Priya looked her over head to toe and recorded today's 3D picture.", med: 'full assessment · 3D scan captured', by: 'Priya, day nurse' },
  { t: '8:15 a.m.', h: 8.25, cat: 'proc', title: 'Breathing support made gentler', plain: 'CPAP mask taken off. Soft nose prongs (nasal cannula) put on.', med: 'CPAP discontinued → nasal cannula [flow] L/min', by: '[Name], respiratory therapist' },
  { t: '9:00 a.m.', h: 9, cat: 'care', title: 'Care time', plain: CARE, med: '', by: 'Priya, day nurse' },
  { t: '10:30 a.m.', h: 10.5, cat: 'proc', title: 'IV line taken out of her hand', plain: 'She no longer needs fluids through a vein. All her milk now goes through her feeding tube.', med: 'PIV removed · full enteral feeds', by: 'Priya, day nurse' },
  { t: '11:00 a.m.', h: 11, cat: 'check', title: "Doctor's rounds", plain: "The team went over her progress and today's plan. Dad was there.", med: 'see Conversations & notes', by: 'Dr. [Name]' },
  { t: '12:00 p.m.', h: 12, cat: 'care', title: 'Care time', plain: CARE, med: '', by: 'Priya, day nurse' },
  { t: '2:00 p.m.', h: 14, cat: 'med', title: 'Vitamin D drops', plain: 'Helps her bones grow strong.', med: 'cholecalciferol [dose] via NG, once daily', by: 'Priya, day nurse' },
  { t: '3:00 p.m.', h: 15, cat: 'care', title: 'Care time', plain: CARE, med: '', by: 'Priya, day nurse' },
  { t: '6:00 p.m.', h: 18, cat: 'care', title: 'Care time', plain: CARE, med: '', by: 'Priya, day nurse' },
  { t: '9:00 p.m.', h: 21, cat: 'care', title: 'Care time', plain: CARE, med: '', by: '[Night nurse] (N2)' },
]

const skinToSkin = { t: '1:00 p.m.', h: 13, cat: 'moment', title: 'First skin-to-skin with Dad', plain: "45 minutes resting on Dad's chest. Saved as a planet in her sky.", med: 'kangaroo care, 45 min', by: 'Priya, day nurse' }

const things = [
  { title: 'Gentler breathing help', isNew: true, text: 'Soft tubes in her nose now give her air, instead of a mask.' },
  { title: 'All her milk goes through her feeding tube', text: 'She had 8 feeds today, every 3 hours.' },
  { title: 'The IV in her hand came out', text: "She doesn't need fluids through a vein anymore." },
]

const dayParts = [
  { name: 'Overnight', hours: '12 – 7 a.m.', text: 'Slept well. Small blood test.' },
  { name: 'Morning', hours: '7 a.m. – 12 p.m.', text: 'Breathing help changed. IV out.', highlight: true },
  { name: 'Afternoon', hours: '12 – 5 p.m.', text: 'Vitamin drops. Fed and rested.' },
  { name: 'Evening', hours: '5 p.m. – 12 a.m.', text: 'Fed and rested. Night nurse came on.' },
]

const team = [
  { shift: 'Night · until 7 a.m.', people: [{ initials: 'N1', name: '[Night nurse]', role: 'Nurse' }] },
  {
    shift: 'Day · 7 a.m. – 7 p.m.',
    people: [
      { initials: 'P', name: 'Priya', role: 'Primary nurse · main contact', primary: true },
      { initials: 'Dr', name: 'Dr. [Name]', role: 'Baby doctor' },
      { initials: 'RT', name: '[Name]', role: 'Breathing specialist' },
    ],
  },
  { shift: 'Night · from 7 p.m.', people: [{ initials: 'N2', name: '[Night nurse]', role: 'Nurse' }] },
]

const meds = [
  { name: 'Caffeine', chart: 'caffeine citrate · [dose]', why: 'Helps her remember to breathe steadily', when: '2:00 a.m.', by: 'N1' },
  { name: 'Vitamin D drops', chart: 'cholecalciferol · [dose]', why: 'Helps her bones grow strong', when: '2:00 p.m.', by: 'Priya' },
  { name: 'Milk fortifier', chart: 'HMF · [amount] per feed', why: 'Adds extra calories and protein to her milk', when: 'Every feed (8×)', by: 'N1, Priya, N2' },
]

const notes = [
  { meta: '11:00 a.m. · Rounds · Dad was there', text: 'Plan: stay on the nasal cannula for about 48 hours, then check again. Next eye exam [date].', by: 'Summary by Dr. [Name]' },
  { meta: '3:10 p.m. · Phone call · Mom', text: 'Priya explained the breathing change and the IV coming out.', by: 'Logged by Priya' },
]

const shared = {
  constellation: 'Breathing journey',
  headline: 'A calm day, and one step forward.',
  summary: 'She slept well and was comfortable. This morning her breathing help was made gentler.',
  summaryBy: 'From Priya, her nurse today',
  things,
  dayParts,
  comingUp: 'The doctors plan to keep her on the gentler breathing help for about 2 days, then check again. Eye exam on [date].',
  team,
  meds,
  notes,
}

export const days = {
  23: {
    ...shared,
    day: 23,
    kind: 'star',
    dateLong: 'Thu, Oct 15, 2026',
    dateShort: 'Thu, Oct 15',
    correctedAge: '30 wk 5 d',
    tooltip: { title: 'Day 23 · Today', sub: 'Tap the star to open the day' },
    openLabel: 'Open Day 23',
    howHeading: 'HOW MILA IS TODAY',
    events: baseEvents,
    milestone: null,
  },
  // Day 24 is the milestone (planet) day. Its details reuse Day 23's for now.
  24: {
    ...shared,
    day: 24,
    kind: 'planet',
    dateLong: 'Fri, Oct 16, 2026',
    dateShort: 'Fri, Oct 16',
    correctedAge: '30 wk 6 d',
    tooltip: { title: 'Day 24 · New planet', sub: 'First skin-to-skin with Dad' },
    openLabel: 'Open Day 24 milestone: first skin-to-skin with Dad',
    howHeading: 'HOW MILA WAS TODAY',
    events: [...baseEvents.slice(0, 11), skinToSkin, ...baseEvents.slice(11)],
    milestone: {
      eyebrow: "A NEW PLANET IN MILA'S SKY",
      title: 'First skin-to-skin with Dad',
      text: "Mila rested on Dad's chest for 45 minutes this afternoon. She stayed calm and comfortable the whole time.",
      meta: '1:00 p.m. · Noted by Priya, her nurse',
      tag: 'Milestone · planet 3',
    },
  },
}

export const FIRST_DAY = 23
export const LAST_DAY = 24

export const eventLabels = { care: 'CARE TIME', med: 'MEDICINE', proc: 'PROCEDURE', test: 'TEST', check: 'CHECK', moment: 'MOMENT' }

export const eventGroups = [
  { id: 'all', label: 'All' },
  { id: 'care', label: 'Care times' },
  { id: 'med', label: 'Medicines' },
  { id: 'proc', label: 'Procedures' },
  { id: 'test', label: 'Tests & checks' },
  { id: 'moment', label: 'Moments' },
]

export function inGroup(e, g) {
  if (g === 'all') return true
  if (g === 'test') return e.cat === 'test' || e.cat === 'check'
  return e.cat === g
}

export const devices = [
  { id: 'cannula', label: 'Nasal cannula', isNew: true, title: 'Nasal cannula · new today', route: 'air supply → cheeks → nose', text: 'Soft prongs in her nose give a gentle, steady flow of air. The moving line shows the air traveling to her nose.' },
  { id: 'feeding', label: 'Feeding tube', title: 'Feeding tube', route: 'pump → nose → tummy', text: "A thin tube carries milk through her nose and down to her tummy. The moving line shows the milk's path." },
  { id: 'heart', label: 'Heart stickers', title: 'Heart monitor stickers', route: 'chest → monitor', text: 'Three soft stickers on her chest count her heartbeat and breathing. They pulse with each reading.' },
  { id: 'temp', label: 'Temp sensor', title: 'Temperature sensor', route: 'belly → incubator', text: 'A small patch on her belly tells the incubator how warm to keep her.' },
  { id: 'pulse', label: 'Pulse oximeter', title: 'Pulse oximeter', route: 'foot → monitor', text: "A soft wrap on her foot shines a gentle light to measure oxygen. It doesn't hurt." },
  { id: 'iv', label: 'IV line', removed: true, title: 'IV line · removed 10:30 a.m.', route: 'was: hand → vein', text: 'No longer needed. All her milk now goes through the feeding tube. Shown as a faded outline.' },
]

export function selectedDevice(id) {
  return devices.find((d) => d.id === id) ?? devices[1]
}

export function countByCat(events) {
  return events.reduce((acc, e) => ({ ...acc, [e.cat]: (acc[e.cat] ?? 0) + 1 }), {})
}

// Desktop sky (1280×800 stage coordinates): [x, y, size]
export const skyStars = [
  [90, 560, 6], [140, 470, 5], [210, 600, 7], [300, 470, 9], [250, 360, 5],
  [360, 610, 6], [400, 300, 5], [430, 520, 7], [470, 380, 9], [540, 600, 6],
  [560, 270, 5], [600, 500, 7], [640, 610, 5], [680, 430, 9], [740, 250, 6],
  [770, 560, 7], [820, 470, 5], [860, 330, 9], [900, 610, 6], [950, 250, 5],
  [980, 520, 7], [1110, 600, 6],
]

export const skyPlanets = [
  { x: 330, y: 220, label: 'First time eyes open · Day 6' },
  { x: 700, y: 170, label: 'First sound · Day 14' },
  { x: 1050, y: 170, label: 'First skin-to-skin · Day 24' },
]
