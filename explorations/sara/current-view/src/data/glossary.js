// The words her team uses, explained for a parent. Keyed by the exact term as it appears in the app.
//   short:  the quiet one-line meaning shown under her current step on Next Steps
//   stands: what an abbreviation (or the name her team may use) stands for, if any
//   body:   1–2 plain sentences shown when the term is tapped; entries without one aren't tappable
//   image:  a local illustration (public/images/glossary/); null shows the placeholder
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
  'Pulse oximeter': {
    short: 'a soft wrap on her foot that measures the oxygen in her blood',
    stands: 'Often called a pulse ox, or a sat monitor',
    body: 'A soft wrap on her foot or hand shines a gentle red light through her skin to measure how much oxygen her blood is carrying. It doesn’t hurt, and it shows on the monitor beside her bed.',
    image: null,
  },
  'Spot checks': {
    short: 'her oxygen checked now and then, not all the time',
    body: 'Instead of wearing the wrap all the time, her nurse puts it on now and then to check her oxygen.',
    image: null,
  },
  'Off the oxygen monitor': { short: 'no oxygen wrap needed' },
  'Central line': {
    short: 'a thin, longer-lasting tube into a larger vein',
    stands: 'May be called a PICC line or a UVC (umbilical venous catheter)',
    body: 'A thin, soft tube that reaches a larger vein, put in through her arm, leg or belly button. It can stay in for longer than a regular IV and carries fluids, nutrition and medicine.',
    image: null,
  },
  'IV line': {
    short: 'a small tube into a vein in her hand, foot or scalp',
    stands: 'IV: intravenous, meaning into a vein',
    body: 'A tiny, soft tube sits in one of her veins, often in her hand or foot, and carries fluids or medicine straight into her blood.',
    image: null,
  },
  'No IV needed': { short: 'all her fluids and milk go in another way' },
  Ventilator: {
    short: 'a machine that breathes for her through a small tube',
    stands: 'A mechanical ventilator; the tube is often called an ET tube (endotracheal)',
    body: 'A soft tube goes through her mouth or nose into her windpipe, and the machine gives her breaths, doing some or all of the work of breathing for her.',
    image: null,
  },
  'Coming off the ventilator': {
    short: 'the machine does less, a little at a time',
    stands: 'Her team may call this weaning, then extubation when the tube comes out',
    body: 'Her team turns the machine down a little at a time, so she does more of the breathing herself. When the tube comes out, she often moves to a CPAP mask.',
    image: null,
  },
  'Off the ventilator': { short: 'no breathing tube needed' },
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

export const GLOSSARY_PLACEHOLDER = '/images/glossary/placeholder.svg'
