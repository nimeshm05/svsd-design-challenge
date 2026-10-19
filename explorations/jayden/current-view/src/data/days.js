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
  { t: '8:15 a.m.', h: 8.25, cat: 'proc', title: 'Breathing support made gentler', plain: 'CPAP mask taken off. Soft nose prongs (nasal cannula) put on.', med: 'CPAP discontinued → nasal cannula [flow] L/min', by: '[Name], respiratory therapist', device: 'cannula', short: 'Gentler breathing help' },
  { t: '9:00 a.m.', h: 9, cat: 'care', title: 'Care time', plain: CARE, med: '', by: 'Priya, day nurse' },
  { t: '10:30 a.m.', h: 10.5, cat: 'proc', title: 'IV line taken out of her hand', plain: 'She no longer needs fluids through a vein. All her milk now goes through her feeding tube.', med: 'PIV removed · full enteral feeds', by: 'Priya, day nurse', device: 'iv', short: 'IV out' },
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

// Current (bedside) view: where today stands right now. Today is a star still forming;
// tonight it joins her sky. Two versions so the tone can be checked on a hard day too.
export const today = {
  day: 23,
  clock: { label: '2:10 p.m.', night: '1:12 a.m.', h: 14.17 },
  // Who she is: opened by tapping her name. Never medical events; her as a person.
  // Traits come from what is already recorded (her nurses' notes, her monitors) or what a parent noticed:
  // nothing here asks her nurses to do more.
  about: {
    age: '23 days old',
    along: '30 weeks, 2 days along',
    due: 'Her due date is about 10 weeks away.',
    traits: [
      { text: 'She settles when her hands are near her face.', from: "From her nurses' notes" },
      { text: "She calms to Dad's voice.", from: 'Noticed by Dad' },
      { text: 'She rests best with the cover over her incubator.', from: "From her nurses' notes" },
      { text: 'During skin-to-skin, she is calm and steady.', from: 'From her monitors' },
    ],
    senses: [
      'Voices are some of the clearest things she can hear now.',
      'Her eyes open more each week, but bright light is still a lot for her.',
      'Gentle, still touch is easier for her than stroking.',
    ],
  },
  // Who's caring for her right now. Parents see the team, and ask for help in one place.
  team: [
    { initials: 'P', name: 'Priya', role: 'Her nurse today, until 7 p.m.', primary: true },
    { initials: 'L', name: 'Lena', role: 'Charge nurse · comes when Priya is with another baby' },
    { initials: 'O', name: 'Dr. Osei', role: 'Baby doctor on call' },
    { initials: 'M', name: 'Marcus', role: 'Her nurse tonight, from 7 p.m.' },
  ],
  calm: {
    status: 'Sleeping after her noon feed.', // how she is right now: observational, never medical
    // 1. What changed for her today (from orders), newest last
    changes: [
      {
        t: '8:15 a.m.', h: 8.25, title: 'Her breathing help was made gentler', short: 'Breathing with gentler help', line: 'The mask came off. Soft prongs in her nose give her air now.',
        plain: 'The CPAP mask came off. Soft prongs in her nose now give her air.',
        term: { word: 'Nasal cannula', means: 'soft prongs in her nose that give a gentle flow of air' },
        by: '[Name], respiratory therapist', device: 'cannula',
      },
      {
        t: '10:30 a.m.', h: 10.5, title: 'Her IV line came out', short: 'Free of her IV line', line: 'All her milk comes through her feeding tube now.',
        plain: "She doesn't need fluids through a vein anymore. All her milk now goes through her feeding tube.",
        term: { word: 'IV line', means: 'a thin tube in a vein that gives fluids' },
        by: 'Priya, her nurse', device: 'iv',
      },
    ],
    // 2. What the team decided (from signed rounds notes, consults and scheduling)
    //    status: decided | deciding (teams haven't settled it) | waiting (on a test, consult or date)
    decisions: [
      {
        t: '11:00 a.m.', h: 11, status: 'decided', team: 'Breathing', short: 'A plan for her breathing', line: 'Gentler help for about two days. Dad was there when her team decided.',
        text: 'Stay on the gentler breathing help for about 2 days, then check again.',
        source: "Dr. [Name]'s rounds note · Dad was there",
      },
    ],
    // 3. Coming up after the next care time, and anything still waiting on a date
    upcoming: [{ when: 'In about 2 days', short: 'Breathing check', text: 'Her doctors check her breathing again.' }],
    waiting: [{ short: 'Eye exam', text: 'An eye exam to check how her eyes are growing.', note: 'Date not set yet' }],
    // Everyday care, from what nurses already chart at each care time (no volumes, no numbers)
    care: [
      { h: 0, t: '12:00 a.m.', diaper: 'Wet diaper', sleep: 'Slept before and after', short: 'A midnight feed', line: 'A fresh diaper, then back to sleep.' },
      { h: 3, t: '3:00 a.m.', diaper: 'Wet diaper', sleep: 'Back to sleep quickly', short: 'A quiet feed in the night', line: 'Back to sleep quickly.' },
      { h: 6, t: '6:00 a.m.', diaper: 'Wet and dirty diaper', sleep: 'Awake for a little while after', short: 'Awake for a while', line: 'After her early feed, she looked around for a little while.' },
      { h: 9, t: '9:00 a.m.', diaper: 'Wet diaper', sleep: 'Slept after', short: 'Her morning feed', line: 'Then a long nap.' },
      { h: 12, t: '12:00 p.m.', diaper: 'Wet diaper', sleep: 'Resting since', short: 'Her noon feed', line: 'She has been sleeping since.' },
    ],
    // Family moments, as her nurse notes them in her chart (parent present, joined a care time, read or sang
    // to her). The monitor shows what's recorded at the bedside; nothing depends on a phone.
    saved: [{ h: 12.67, t: '12:40 p.m.', text: 'Dad read her a story', short: 'Dad read her a story', line: 'Noted by Priya, her nurse.', from: 'Noted by Priya, her nurse' }],
    // a first today: drawn as a planet on the arc, as in her sky
    firsts: [{ h: 9.4, t: '9:25 a.m.', short: 'Wore her own clothes for the first time', title: 'Her own clothes, for the first time', line: 'The soft sleepsuit you brought from home.', plain: 'Her nurse dressed her in the soft sleepsuit you brought from home.' }],
    // Her setup through the day: what was on her at midnight, and what changed when
    setup: {
      start: ['cpap', 'feeding', 'heart', 'temp', 'pulse', 'iv'],
      changes: [{ h: 8.25, add: ['cannula'], remove: ['cpap'] }, { h: 10.5, remove: ['iv'] }],
    },
    // Wires and tubes that changed today, shown on Sara's scan
    wires: [
      { id: 'cannula', label: 'Nasal cannula', status: 'new' },
      { id: 'iv', label: 'IV line', status: 'removed' },
    ],
    next: { t: '3:00 p.m.', what: 'Feeding, diaper change, temperature check', you: 'You’re welcome to be there for it.', why: 'Care is grouped every 3 hours so she can sleep longer in between.' },
    moments: 4, // moments today: each adds light to today's star
  },
  harder: {
    status: 'Resting on her CPAP mask, after a long night.',
    // one line on the home screen: [words] in brackets are clinical terms, tappable for what they mean
    statusOne: 'Resting on her [CPAP] mask after a long night',
    statusTerm: { word: 'CPAP', means: 'a small mask that gives steady air pressure so her lungs stay open' },
    changes: [
      {
        t: '4:15 a.m.', h: 4.25, title: 'She is back on the CPAP mask', short: 'Back on her CPAP mask for a while', one: 'Back on her [CPAP] mask for more breathing support', line: 'Her breathing needed more support in the night. She is resting now.',
        plain: 'Her breathing needed more support overnight, so the team put the mask back on. She is resting now.',
        term: { word: 'CPAP', means: 'a small mask that gives steady air pressure so her lungs stay open' },
        by: 'Marcus, her night nurse', device: 'cpap',
      },
    ],
    decisions: [
      {
        t: '11:00 a.m.', h: 11, status: 'deciding', team: 'Breathing', short: 'A plan, still being made', one: 'Deciding when she can go back to her [nasal cannula]', line: 'Her breathing team is deciding when she can go back to her nasal cannula.',
        term: { word: 'Nasal cannula', means: 'soft prongs in her nose that give a gentle flow of air' },
        text: 'Her breathing team is still deciding what to try next.',
        source: 'From her breathing team',
      },
    ],
    upcoming: [{ when: 'Tomorrow, 10 a.m.', short: 'Rounds with you', text: 'Her breathing team will talk it through with you at rounds.' }],
    waiting: [{ short: 'Eye exam', text: 'An eye exam to check how her eyes are growing.', note: 'Date not set yet' }],
    care: [
      { h: 0, t: '12:00 a.m.', diaper: 'Wet diaper', sleep: 'Slept before and after', short: 'A midnight feed', one: 'A midnight feed, then back to sleep', line: 'A fresh diaper, then back to sleep.' },
      { h: 3, t: '3:00 a.m.', diaper: 'Wet diaper', sleep: 'Unsettled, then slept', short: 'A restless night', one: 'A restless night, with a few [oxygen dips]', line: 'A few brief dips in her oxygen, then she slept.', term: { word: 'Oxygen dips (desats)', means: 'her oxygen level dropping for a moment; her nurse watches closely and helps' } },
      { h: 6, t: '6:00 a.m.', diaper: 'Wet diaper', sleep: 'Resting on CPAP', short: 'Her early feed', one: 'Her early feed, resting on her [CPAP] mask', line: 'Resting with her CPAP mask on.' },
      { h: 9, t: '9:00 a.m.', diaper: 'Wet and dirty diaper', sleep: 'Slept after', short: 'Her morning feed', one: 'Her morning feed through her [feeding tube], then a long nap', line: 'Through her feeding tube, then a long nap.', term: { word: 'Feeding tube', means: 'a thin tube through her nose to her tummy that carries her milk' } },
      { h: 12, t: '12:00 p.m.', diaper: 'Wet diaper', sleep: 'Resting since', short: 'Her noon feed', one: 'Her noon feed, and resting since', line: 'She has been resting since.' },
    ],
    saved: [{ h: 5.2, t: '5:10 a.m.', text: 'Mom came in before her early feed', short: 'Mom came in before her early feed', line: 'Noted by Marcus, her night nurse.', from: 'Noted by Marcus, her night nurse' }],
    firsts: [{ h: 9.4, t: '9:25 a.m.', short: 'Wore her own clothes for the first time', one: 'Wore the soft sleepsuit you brought from home', title: 'Her own clothes, for the first time', line: 'The soft sleepsuit you brought from home.', plain: 'Her nurse dressed her in the soft sleepsuit you brought from home.' }],
    setup: {
      start: ['cannula', 'feeding', 'heart', 'temp', 'pulse'],
      changes: [{ h: 4.25, add: ['cpap'], remove: ['cannula'] }],
    },
    wires: [{ id: 'cpap', label: 'CPAP mask', status: 'new' }],
    next: { t: '3:00 p.m.', what: 'Feeding, diaper change, temperature check', you: 'You can stay close and talk to her.', why: 'Care is grouped every 3 hours so she can sleep longer in between.' },
    moments: 2,
  },
}

// "What's ahead": her care plans, kept apart from her sky (memories stay memories).
// One track per area her team is working on: steps in order, never dates for going home,
// and a step back reads as "working on this again", never as failed.
// status: decided | deciding (teams haven't settled it) | waiting (on a test, consult or date)
export const ahead = {
  calm: {
    tracks: [
      {
        area: 'Breathing', steps: ['CPAP mask', 'Nasal cannula', 'Breathing on her own'], at: 1, status: 'decided',
        plan: 'Stay on the nasal cannula for about 2 days, then check again.',
        who: 'Breathing and baby doctors · agreed at rounds', review: 'In about 2 days',
      },
      {
        area: 'Feeding', steps: ['Feeding tube', 'First bottle', 'Feeding by mouth'], at: 0, status: 'waiting',
        plan: 'All her milk goes through her tube while she grows stronger.',
        who: 'Baby doctors and lactation team', review: 'Talked about at rounds each week',
      },
      {
        area: 'Staying warm', steps: ['Incubator', 'Open crib'], at: 0, status: 'waiting',
        plan: 'In her incubator until she can keep herself warm.',
        who: 'Her nurses and baby doctors', review: 'Checked every day',
      },
    ],
    checks: [{ what: 'Eye exam', note: 'Date not set yet' }, { what: 'Hearing screen', note: 'Before she goes to a new unit' }],
    coming: [
      { when: 'Tomorrow, 10 a.m.', what: 'Rounds', note: "You're welcome to join and ask anything." },
      { when: 'Thursday', what: 'Family meeting', note: 'Her doctors, nurse and social worker, about the next few weeks.' },
    ],
  },
  harder: {
    tracks: [
      {
        area: 'Breathing', steps: ['CPAP mask', 'Nasal cannula', 'Breathing on her own'], at: 0, again: true, status: 'deciding',
        who: 'Breathing team', review: 'Tomorrow at rounds, 10 a.m.',
      },
      {
        area: 'Feeding', steps: ['Feeding tube', 'First bottle', 'Feeding by mouth'], at: 0, status: 'waiting',
        plan: 'All her milk goes through her tube while she grows stronger.',
        who: 'Baby doctors and lactation team', review: 'Talked about at rounds each week',
      },
      {
        area: 'Staying warm', steps: ['Incubator', 'Open crib'], at: 0, status: 'waiting',
        plan: 'In her incubator until she can keep herself warm.',
        who: 'Her nurses and baby doctors', review: 'Checked every day',
      },
    ],
    checks: [{ what: 'Eye exam', note: 'Date not set yet' }, { what: 'Hearing screen', note: 'Before she goes to a new unit' }],
    coming: [
      { when: 'Tomorrow · 10 a.m.', what: 'Rounds about her breathing', note: 'Her breathing team will talk it through with you.' },
      { when: 'Thursday', what: 'Family meeting', note: 'Her doctors, nurse and social worker, about the next few weeks.' },
    ],
  },
}

// "What's ahead" → Tomorrow: the next day only, so parents can take it one day at a time.
// Sample data. Notes say what happens and where a parent fits in; they never predict how it will go.
export const tomorrow = {
  day: 'Wednesday',
  // Prototype: pretend it's already 6 a.m. on that day, so finished items show as done.
  // Items before nowH are done; an item at nowH is happening now. Set to null for a day not yet started.
  nowH: 6,
  items: [
    { h: 3, t: '3 a.m.', what: 'IV insertion', note: 'A new IV line, so it’s ready for her surgery.' },
    { h: 6, t: '6 a.m.', what: 'Care time', note: 'Diaper change and temperature check. You’re welcome to be there.' },
    { h: 7, t: '7 a.m.', what: 'Morning rounds', note: 'Her team talks through her day. You can join and ask anything.' },
    { h: 10, t: '10 a.m.', what: 'Heart surgery', note: 'Her team will show you where to wait and keep you updated.' },
    { h: 14, t: '2 p.m.', what: 'Her surgeon talks with you', note: 'They’ll come find you to share how it went.' },
    { h: 17, t: '5 p.m.', what: 'Time to sit with her', note: 'Her nurse will help you settle in by her bed.' },
  ],
  // the rest of the week, one quiet line per day; days with nothing planned say so plainly
  rest: [
    { day: 'Thursday', line: 'Family meeting with her team' },
    { day: 'Friday', line: 'Breathing check' },
    { day: 'Saturday', line: 'Her usual care times' },
    { day: 'Sunday', line: 'Her usual care times' },
  ],
}

// "What's ahead" → This week: today and the next six days. Routine care is a quiet line;
// major events (surgeries, procedures) open their own page. Days are named by weekday and her day count.
// `every`: a recurring task, every N hours from midnight. Today's box lists each one; other days show `what`.
export const week = [
  { name: 'Tuesday', short: 'Tue', day: 23, today: true, items: [
    { t: '7 a.m.', what: 'Rounds' }, { what: 'Care every 3 hours', label: 'Care time', every: 3 }, { t: '7 p.m.', what: 'Marcus takes over' },
  ] },
  { name: 'Wednesday', short: 'Wed', day: 24, items: [
    { t: '3 a.m.', what: 'IV insertion' }, { t: '7 a.m.', what: 'Rounds' },
    { t: '10 a.m.', what: 'Heart surgery', event: 'heart-surgery' },
    { t: '2 p.m.', what: 'Surgeon talks with you' }, { what: 'Care every 3 hours', label: 'Care time', every: 3 },
  ] },
  { name: 'Thursday', short: 'Thu', day: 25, items: [
    { t: '7 a.m.', what: 'Rounds' }, { t: '1 p.m.', what: 'Family meeting' }, { what: 'Care every 3 hours', label: 'Care time', every: 3 },
  ] },
  { name: 'Friday', short: 'Fri', day: 26, items: [
    { t: '7 a.m.', what: 'Rounds' }, { what: 'Breathing check' }, { what: 'Care every 3 hours', label: 'Care time', every: 3 },
  ] },
  { name: 'Saturday', short: 'Sat', day: 27, items: [{ t: '8 a.m.', what: 'Rounds' }, { what: 'Care every 3 hours', label: 'Care time', every: 3 }] },
  { name: 'Sunday', short: 'Sun', day: 28, items: [{ t: '8 a.m.', what: 'Rounds' }, { what: 'Care every 3 hours', label: 'Care time', every: 3 }] },
  { name: 'Monday', short: 'Mon', day: 29, items: [{ t: '7 a.m.', what: 'Rounds' }, { what: 'Care every 3 hours', label: 'Care time', every: 3 }] },
]

// Major events, in full. PLACEHOLDER medical content: written for the prototype only and must be
// reviewed by her care team before any parent sees it. Calm, plain, never a promise about how it goes.
export const events = {
  'heart-surgery': {
    name: 'Heart surgery',
    when: 'Tomorrow, Wednesday · Day 24',
    time: '10 a.m.',
    target: 'heart',
    targetLabel: 'Her heart',
    involves: [
      'Her surgeons will close a small blood vessel near her heart. Before birth, this vessel lets blood skip the lungs. It usually closes on its own after birth, and for her it hasn’t yet.',
      'She’ll be asleep and comfortable the whole time, with medicine so she feels no pain. Her surgeon will explain exactly what they plan to do when you meet.',
    ],
    risks: [
      'Like any surgery, there is a small chance of bleeding or infection. Her team watches for both closely.',
      'She may need more breathing help for a while afterwards, while she rests and heals.',
      'Her cry may sound softer or hoarse for a time.',
    ],
    duration: 'About 1 to 2 hours',
    done: 'Around 12 p.m.',
    doneNote: 'This is an estimate. If it takes longer, her team will let you know.',
  },
}

// Her whole stay so far, shaped like Nimesh's galaxy data (explorations/nimesh/galaxy):
// support = breathing help that day, mood = calm / mixed / hard, parent = minutes a parent was there.
const PARENT_MINUTES = [0, 45, 30, 120, 60, 162, 90, 40, 140, 70, 30, 150, 110, 180, 60, 90, 200, 150, 80, 120, 60, 130, 90]
export const stay = {
  today: 23,
  weeks: ['Hello, small one', 'Finding a rhythm', 'More help breathing', 'This week'],
  firsts: { 4: 'First touch', 6: 'First hold', 14: 'First bottle', 23: 'Her own clothes' },
  days: Array.from({ length: 23 }, (_, i) => {
    const d = i + 1
    return {
      d,
      week: Math.ceil(d / 7),
      weight: 880 + Math.max(0, d - 5) * 16 - (d <= 5 ? d * 6 : 0),
      support: d <= 4 ? 'ventilator' : d <= 20 ? 'cpap' : 'high-flow',
      mood: d === 17 ? 'hard' : d === 16 || d === 18 ? 'mixed' : 'calm',
      parent: PARENT_MINUTES[i],
    }
  }),
}

// Weeks of her stay: a title, a short summary, and (when there was one) what was hard,
// told plainly and quietly, as in Nimesh's week panel. `caption` is the few words under each week's
// name in her sky, in a parent's gentle voice.
export const weekInfo = [
  { title: 'Hello, small one', caption: 'Hello, small one', summary: 'Mila arrived thirteen weeks early. She rested while machines did some of the work, you touched her hand on day 4, and on day 6 you held her for the first time.' },
  { title: 'Finding a rhythm', caption: 'Getting to know you', summary: 'Her feeds grew bigger and steadier, and she slowly gained weight. On day 14 she had her first bottle.' },
  { title: 'More help breathing', caption: 'Holding on together', summary: 'For part of this week Mila needed more help with her breathing, and her team stayed close.',
    hard: 'On day 17 her breathing needed more support overnight, so her team turned up her CPAP. By evening she was settled again. Her nurse can tell you what this means for her.' },
  { title: 'This week', caption: 'Right here beside you', summary: 'Her breathing needed more help again in the night, and she wore her own clothes for the first time. This week is still forming.' },
]

const SUPPORT_LABEL = { ventilator: 'Ventilator', cpap: 'CPAP', 'high-flow': 'Nasal cannula' }
const DAY_FIRSTS = {
  23: { h: 9.4, t: '9:25 a.m.', short: 'Wore her own clothes for the first time', title: 'Her own clothes, for the first time', line: 'The soft sleepsuit you brought from home.', plain: 'Her nurse dressed her in the soft sleepsuit you brought from home.' },
  4: { h: 11, title: 'First touch', plain: 'You touched her hand for the first time, through the incubator’s porthole.' },
  6: { h: 14.25, title: 'First hold', plain: 'You held her for the first time. She stayed warm and calm on your chest.' },
  14: { h: 15.4, title: 'First bottle', plain: 'She tried her first bottle and took a little before resting.' },
}
// The few things a parent most needs to know about a day, in order. A thing can open to more:
// `at` is the hour it happened, `detail` what her nurse noted, `img` a photo slot for it.
const DAY_THINGS = {
  6: [
    { title: 'Her feeds grew a little', text: 'She now gets a little more milk through her feeding tube at each care time.' },
    { title: 'You held her for the first time', at: 14.25,
      detail: { title: 'Kangaroo hold, 45 min', text: 'She rested skin-to-skin on your chest, and her heart rate and breathing stayed steady the whole time.',
        img: '/images/kangaroo-hold.jpg', alt: 'A mother in a NICU chair holding her tiny baby skin-to-skin on her chest in a kangaroo hold, a soft blanket over them both.' } },
    { title: 'Steady on CPAP', text: 'Her gentle breathing help stayed the same, and her monitors were quiet for most of the day.' },
  ],
}
const CALM_STORIES = ['A calm day. She slept well between care times.', 'She grew a little and rested well.', 'A quiet day of feeds and sleep.', 'She was settled and comfortable all day.']
const fmt = (h) => {
  const hh = Math.floor(h), mm = Math.round((h - hh) * 60)
  return `${hh % 12 || 12}:${String(mm).padStart(2, '0')} ${hh < 12 ? 'a.m.' : 'p.m.'}`
}

// One day of her stay in detail: a short story and her moments, each with a lane on the day ring.
// kind: care (everyday care) · parent (time with family) · change (something changed for her) · first (a planet)
export function dayDetail(d) {
  const day = stay.days[d - 1]
  const isToday = d === stay.today
  const nowH = isToday ? today.clock.h : 24
  const m = []
  for (const h of [0, 3, 6, 9, 12, 15, 18, 21]) {
    if (h <= nowH) m.push({ h, kind: 'care', title: 'Care time', plain: 'Fed through her feeding tube, diaper changed, temperature checked.', by: h >= 7 && h < 19 ? 'Her day nurse' : 'Her night nurse' })
  }
  const fh = 12.6 + (d % 3) * 0.9
  if (day.parent > 0 && fh <= nowH) {
    const hrs = Math.floor(day.parent / 60), mins = day.parent % 60
    m.push({ h: fh, kind: 'parent', title: 'Time with family', plain: `A parent was with her for ${hrs ? `${hrs} h ` : ''}${mins} min.`, by: '' })
  }
  if (d === 5) m.push({ h: 10, kind: 'change', title: 'Off the ventilator', plain: 'She moved from the ventilator to CPAP, a gentler kind of breathing help.', by: 'Respiratory therapist' })
  if (d === 17) m.push({ h: 4.5, kind: 'change', hard: true, title: 'More breathing help for a while', plain: 'Her breathing needed more support overnight, so her team turned up her CPAP. She settled again by evening.', by: 'Her night nurse' })
  if (d === 21) m.push({ h: 9.5, kind: 'change', title: 'Gentler breathing help', plain: 'She moved from CPAP to soft nose prongs that give a gentle flow of air.', by: 'Respiratory therapist' })
  if (isToday) {
    today.calm.changes.forEach((c) => m.push({ h: c.h, kind: 'change', title: c.title, plain: c.plain, by: c.by }))
    today.calm.decisions.forEach((x) => m.push({ h: x.h, kind: 'change', title: 'Breathing plan decided', plain: x.text, by: x.source }))
  }
  if (DAY_FIRSTS[d]) m.push({ ...DAY_FIRSTS[d], kind: 'first', by: '' })
  m.sort((a, b) => a.h - b.h).forEach((x) => { x.t = fmt(x.h) })

  const story = isToday ? 'Today. She moved to gentler breathing help and her IV came out.'
    : d === 1 ? 'The day Mila arrived. She rested in her incubator while the ventilator helped her breathe.'
    : DAY_FIRSTS[d] ? DAY_FIRSTS[d].plain
    : d === 5 ? 'She came off the ventilator onto CPAP.'
    : d === 17 ? 'She needed more breathing help for a while, and settled by evening.'
    : d === 21 ? 'She moved to gentler breathing help.'
    : CALM_STORIES[d % CALM_STORIES.length]
  return { ...day, isToday, nowH, first: DAY_FIRSTS[d]?.title, story, supportLabel: SUPPORT_LABEL[day.support], moments: m,
    things: DAY_THINGS[d]?.map((x) => (x.at != null ? { ...x, t: fmt(x.at) } : x)) }
}
