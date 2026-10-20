// The words her team uses, explained for a parent. Keyed by the exact term as it appears in the app.
//   short:  the quiet one-line meaning shown under her current step on Next Steps
//   stands: what an abbreviation (or the name her team may use) stands for, if any
//   body:   1–2 plain sentences shown when the term is tapped; entries without one aren't tappable
//   image:  a local illustration (public/images/glossary/); null shows no picture
// Placeholder copy, for care-team review. It explains; it never advises or predicts.
export const glossary = {
  'CPAP mask': {
    short: 'steady air pressure through a small mask, so her lungs stay open',
    stands: 'CPAP: Continuous Positive Airway Pressure',
    body: 'A small mask over her nose gives a steady, gentle push of air. It helps keep the tiny air sacs in her lungs open, so each breath takes less effort.',
    image: null,
  },
  'Nasal cannula': {
    short: 'a gentle flow of air through soft prongs in her nose',
    body: 'Two short, soft prongs rest just inside her nostrils and give a gentle flow of air, sometimes with extra oxygen. It is a lighter kind of breathing help than a CPAP mask.',
    image: null,
  },
  'Breathing on her own': { short: 'no breathing help needed' },
  'Feeding tube': {
    short: 'a thin tube through her nose to her tummy that carries her milk',
    stands: 'Often called an NG tube: nasogastric, from nose to stomach',
    body: 'A thin, soft tube goes through her nose down to her tummy and carries her milk there. Babies born early are still learning to suck, swallow and breathe together, so the tube feeds her in the meantime.',
    image: null,
  },
  'First bottle': { short: 'learning to suck, swallow and breathe together' },
  Breastfeeding: { short: 'feeding at your breast, when you and she are ready' },
  Incubator: {
    short: 'a warm, covered bed that keeps her temperature steady',
    stands: 'Sometimes called an isolette',
    body: 'A clear, covered bed that keeps the air around her warm and a little moist. Very small babies can’t hold on to their own body heat yet, so the incubator does it for her.',
    image: null,
  },
  'Open crib': {
    short: 'a regular baby bed, once she can keep herself warm',
    body: 'A regular, uncovered baby bed. Babies move to one when they can stay warm on their own, dressed and wrapped in a blanket.',
    image: null,
  },
  'Eye exam': {
    stands: 'Often called an ROP exam: retinopathy of prematurity',
    body: 'An eye doctor looks at the back of her eyes, where the blood vessels are still growing. Babies born very early have this check, often more than once.',
    image: null,
  },
  'Hearing screen': {
    stands: 'Often an ABR: automated auditory brainstem response',
    body: 'Soft sounds play through tiny earphones while small sensors notice how her hearing nerve responds. It’s done while she rests, and it’s a routine check for babies in the NICU.',
    image: null,
  },
}

