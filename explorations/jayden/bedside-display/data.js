// Synthetic data only. Mila is not a real baby; every name and detail here is made up.
window.BABY = {
  name: "Mila",
  day: 23,
  bornWeeks: "27 weeks, 3 days",
  correctedAge: "30 weeks, 5 days",
  room: "Room 14",

  // Two versions of today so we can design for setbacks, not only good days.
  chapters: {
    steady: {
      summary:
        "Mila had a calm night and slept well between care times. This morning the team moved her to a gentler kind of breathing support. Her feeds are going through her feeding tube as planned.",
      changes: [
        { kind: "new", text: "Nasal cannula started: soft prongs that give a gentle flow of air" },
        { kind: "removed", text: "CPAP mask removed" },
        { kind: "removed", text: "IV line in her hand removed: all her milk now goes through the feeding tube" },
      ],
      milestone: "First skin-to-skin time with Dad (45 minutes)",
      confirmedBy: "Priya, day nurse",
      confirmedAt: "7:40 a.m.",
    },
    harder: {
      summary:
        "Mila needed more help with her breathing overnight, so the team moved her back to CPAP. She is resting now. The team will talk through what this means with you at rounds.",
      changes: [
        { kind: "new", text: "CPAP mask back on: gives steady air pressure to help her breathe" },
        { kind: "removed", text: "Nasal cannula paused" },
      ],
      milestone: null,
      confirmedBy: "Marcus, night nurse",
      confirmedAt: "6:55 a.m.",
    },
    quiet: {
      summary: "A quiet day. Mila slept well between care times and her feeds went as planned. Nothing about her care changed today.",
      changes: [],
      milestone: null,
      confirmedBy: "Priya, day nurse",
      confirmedAt: "7:35 a.m.",
    },
  },

  // Current view: the single latest update and what's coming up soon, per kind of day.
  // `item` links an update to a piece of equipment so the display can offer "See it on her".
  now: {
    steady: {
      latest: { time: "11:40 a.m.", text: "Moved to a nasal cannula: a gentler kind of breathing support.", item: "cannula", by: "Priya, day nurse",
        terms: [{ term: "nasal cannula", plain: "soft prongs in her nose that give a gentle flow of air" }] },
      // Moments on today's arc (h = hour of the day). They add light to today's forming star.
      events: [{ h: 10.25, text: "Skin-to-skin with Daniel", kind: "moment" }, { h: 11.67, text: "Nasal cannula", kind: "update" }],
      soon: [
        { when: "3:00 p.m.", what: "Next care: feeding, diaper change, temperature check", you: "You can help with the diaper change." },
        { when: "Tomorrow, 10:00 a.m.", what: "Rounds: the team reviews her plan", you: "You're welcome to join." },
      ],
    },
    harder: {
      latest: { time: "4:15 a.m.", text: "Back on CPAP to give her breathing more support overnight. She is resting now.", item: "cpap", by: "Marcus, night nurse",
        terms: [{ term: "CPAP", plain: "a small mask that gives steady air pressure to help her breathe" }] },
      events: [{ h: 4.25, text: "Back on CPAP", kind: "update" }, { h: 9.5, text: "You sang to her", kind: "moment" }],
      soon: [
        { when: "3:00 p.m.", what: "Next care: feeding, diaper change, temperature check", you: "You can stay close and talk to her." },
        { when: "Tomorrow, 10:00 a.m.", what: "Rounds: the team will talk through her breathing with you", you: null },
      ],
    },
    quiet: {
      latest: { time: null, text: "No changes since yesterday. Mila is resting.", item: null, by: "Priya, day nurse", terms: [] },
      events: [{ h: 9.5, text: "You read her a story", kind: "moment" }],
      soon: [
        { when: "3:00 p.m.", what: "Next care: feeding, diaper change, temperature check", you: "You can help with the diaper change." },
        { when: "Tomorrow, 10:00 a.m.", what: "Rounds: the team reviews her plan", you: "You're welcome to join." },
      ],
    },
  },

  clock: { label: "2:10 p.m.", h: 14.17 },
  careHours: [0, 3, 6, 9, 12, 15, 18, 21], // care is grouped every 3 hours so she can sleep in between
  shift: { now: "Priya", until: "7 p.m.", next: "Marcus" },
  pastDays: 22, // earlier days are already stars

  nextCare: {
    time: "3:00 p.m.",
    nightTime: "3:00 a.m.",
    what: "Feeding, diaper change, temperature check",
    why: "We group care together so Mila can sleep longer in between.",
  },

  // Positions refer to the setup drawing in index.html.
  equipment: [
    { id: "cannula", name: "Nasal cannula", plain: "Gives a gentle flow of air through her nose", status: "new", x: 306, y: 312, lx: 40, ly: 200 },
    { id: "tube", name: "Feeding tube", plain: "Carries milk straight to her tummy", status: "same", x: 322, y: 322, lx: 40, ly: 300 },
    { id: "leads", name: "Heart monitor stickers", plain: "Three small stickers that count her heartbeat", status: "same", x: 375, y: 297, lx: 250, ly: 440 },
    { id: "temp", name: "Temperature sensor", plain: "Lets the incubator keep her warm", status: "same", x: 398, y: 306, lx: 470, ly: 440 },
    { id: "pulseox", name: "Pulse oximeter", plain: "Soft wrap on her foot that measures oxygen", status: "same", x: 446, y: 279, lx: 640, ly: 300 },
    { id: "iv", name: "IV line", plain: "Removed today: no longer needed", status: "removed", x: 362, y: 272, lx: 640, ly: 130 },
  ],

  team: [
    { initials: "PR", name: "Priya R.", role: "Day nurse", line: "Cares for Mila all day and is your first person to ask" },
    { initials: "MT", name: "Marcus T.", role: "Night nurse", line: "Cares for Mila overnight, 7 p.m. to 7 a.m." },
    { initials: "JL", name: "Jo L.", role: "Nursing assistant (CNA)", line: "Helps with care times, supplies and comfort" },
    { initials: "AO", name: "Dr. Okafor", role: "Neonatologist", line: "Baby doctor who leads Mila's care this week" },
    { initials: "SK", name: "Sam K.", role: "Respiratory therapist", line: "Helps with breathing support" },
    { initials: "EV", name: "Elena V.", role: "Lactation consultant", line: "Helps with pumping and breastfeeding" },
  ],

  plans: [
    { specialty: "Breathing", plan: "Try the nasal cannula for the next few days", open: false },
    { specialty: "Feeding", plan: "Slowly increase milk amounts", open: false },
    { specialty: "Eyes", plan: "Eye check scheduled for next week", open: true, note: "Day and time not set yet" },
  ],

  questions: [
    { text: "When can we try holding her during a feed?", answered: true, answer: "Talked through at rounds on Day 22" },
    { text: "What does the new breathing support feel like for her?", answered: false },
  ],
};
