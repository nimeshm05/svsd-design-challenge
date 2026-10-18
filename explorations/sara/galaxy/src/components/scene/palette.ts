import * as THREE from "three";

export const C = {
  space: new THREE.Color("#05060A"),
  indigo: new THREE.Color("#2B2F7A"),
  violet: new THREE.Color("#6B5BD6"),
  peri: new THREE.Color("#A9A4FF"),
  ember: new THREE.Color("#FF6A3D"),
  copper: new THREE.Color("#FFB38A"),
  core: new THREE.Color("#F3EEFF"),
};

// moment colours, indexed by momentTypeIndex
export const momentTypes = [
  "feed",
  "diaper",
  "skin-to-skin",
  "cares",
  "note",
  "photo",
  "voice",
  "weight",
  "support-change",
  "procedure",
] as const;

export const momentCols = [
  new THREE.Color("#FFD2B8"), // feed: warm milk
  new THREE.Color("#FFF1D6"), // diaper: bright mote
  new THREE.Color("#FF7E4F"), // skin-to-skin: copper bloom
  new THREE.Color("#FFB38A"), // cares: copper spark
  new THREE.Color("#F3EEFF"), // note
  new THREE.Color("#F3EEFF"), // photo
  new THREE.Color("#C8C2FF"), // voice
  new THREE.Color("#E4E0FF"), // weight
  new THREE.Color("#A9A4FF"), // breathing help
  new THREE.Color("#8C7BFF"), // procedure: cool violet
];

export const momentSize: Record<string, number> = {
  feed: 0.042,
  diaper: 0.032,
  "skin-to-skin": 0.062,
  cares: 0.054,
  note: 0.035,
  photo: 0.042,
  voice: 0.048,
  weight: 0.048,
  "support-change": 0.058,
  procedure: 0.048,
};
