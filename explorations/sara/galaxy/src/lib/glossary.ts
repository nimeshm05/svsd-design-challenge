// Plain-language explanations. These explain; they don't advise.
// Each entry needs review by NICU staff before the prototype is shown to families.

export type Term = { label: string; what: string; why: string };

export const glossary: Record<string, Term> = {
  cpap: {
    label: "CPAP",
    what: "A small mask or prongs that blow a gentle, steady stream of air into the nose. It keeps the tiny air sacs in the lungs from closing between breaths.",
    why: "Arjun does the breathing himself; CPAP just makes each breath a little easier while his lungs mature.",
  },
  ventilator: {
    label: "Ventilator",
    what: "A machine that breathes for a baby, or helps each breath, through a soft tube in the windpipe.",
    why: "In his first days it let Arjun rest and save his energy for growing.",
  },
  "high-flow": {
    label: "High flow",
    what: "Warm, moist air through soft, thin tubes that sit just inside the nose. It is gentler than CPAP.",
    why: "Moving to high flow means he needs less help keeping his lungs open.",
  },
  "low-flow": {
    label: "Low flow",
    what: "A small trickle of air or oxygen through thin nasal tubes.",
    why: "This is often one of the last steps before a baby breathes room air with no extra help.",
  },
  apnea: {
    label: "Apnea",
    what: "A pause in breathing that lasts longer than usual. Very common in babies born early, because the part of the brain that sets the breathing rhythm is still developing.",
    why: "Most babies grow out of it as they get closer to their due date. The team watches for pauses and helps if needed.",
  },
  "bili lights": {
    label: "Bili lights",
    what: "Blue lights that help the skin break down bilirubin, a yellow substance many newborns have too much of in their first week.",
    why: "It's gentle and common. A small mask protects his eyes while the lights are on.",
  },
  "gavage feed": {
    label: "Gavage (tube) feed",
    what: "Milk given through a thin, soft tube that goes from the nose or mouth into the tummy.",
    why: "Sucking, swallowing and breathing together is hard work for a baby born this early. Tube feeds let him grow while he learns.",
  },
  "iv nutrition": {
    label: "IV nutrition",
    what: "Nutrients given through a thin line into a vein, while the tummy gets used to milk.",
    why: "It covers most of his needs in the first days, and is reduced as milk feeds increase.",
  },
  fortifier: {
    label: "Fortifier",
    what: "A small powder or liquid added to breast milk to give extra protein, calories and minerals.",
    why: "Babies born early grow quickly and need a little more than milk alone provides.",
  },
  colostrum: {
    label: "Colostrum",
    what: "A mother's first milk: thick, yellowish and full of protective substances.",
    why: "A few drops swabbed in the cheek coat his mouth, even before he can feed.",
  },
  meconium: {
    label: "Meconium",
    what: "A baby's very first poop: dark green-black and sticky.",
    why: "It's a sign that his tummy and bowels are starting to work.",
  },
  "kangaroo care": {
    label: "Skin-to-skin (kangaroo care)",
    what: "Holding your baby, wearing only a diaper, directly on your bare chest.",
    why: "Your warmth, heartbeat and voice help him settle. It's something only you can give him.",
  },
  cares: {
    label: "Cares",
    what: "The routine hands-on care done every few hours: temperature, diaper, mouth care, a position change.",
    why: "Parents can do cares too. Your touch is familiar to him.",
  },
  incubator: {
    label: "Incubator",
    what: "A clear, enclosed bed that keeps a baby warm and protected from noise and germs.",
    why: "Moving out of it to an open crib means he can keep himself warm.",
  },
  "umbilical line": {
    label: "Umbilical line",
    what: "A thin tube placed in the belly button, used in the first days for fluids, nutrition and blood tests.",
    why: "It means fewer needle pokes while he's very small.",
  },
  "picc line": {
    label: "PICC line",
    what: "A long, thin IV placed in an arm or leg that can stay in for weeks.",
    why: "It gives nutrition until he's on full milk feeds.",
  },
  "head ultrasound": {
    label: "Head ultrasound",
    what: "A painless scan done through the soft spot on top of the head.",
    why: "It's a routine check for every baby born this early. The team will tell you the results.",
  },
  "eye exam": {
    label: "Eye exam",
    what: "A check of the back of the eye, where blood vessels are still growing in babies born early.",
    why: "Routine for babies born before 30 weeks. Exams repeat every one to two weeks until the eyes are mature.",
  },
  "blood test": {
    label: "Blood test",
    what: "A few drops of blood, usually from a heel prick.",
    why: "It helps the team keep his feeds and care just right.",
  },
  "hearing screen": {
    label: "Hearing screen",
    what: "A quick, painless test with tiny earphones, done while the baby sleeps.",
    why: "Every baby has one before going home.",
  },
  "cue-based feeding": {
    label: "Cue-based feeding",
    what: "Offering a bottle or breast when the baby shows he's ready (rooting, sucking on a hand), and stopping when he tires.",
    why: "It keeps feeding calm and safe while he learns to suck, swallow and breathe together.",
  },
};

export function termKey(word: string) {
  return word.toLowerCase();
}
