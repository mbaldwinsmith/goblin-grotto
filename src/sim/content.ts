export const resourceKinds = [
  "stone",
  "wood",
  "food",
  "ore",
  "bedkit",
  "iron",
  "copper",
  "gold",
  "gems",
] as const;
export type Resource = (typeof resourceKinds)[number];
export const resources: Record<Resource, { label: string; color: number }> = {
  stone: { label: "Loose stone", color: 0x95a3a5 },
  wood: { label: "Wood", color: 0xb29260 },
  food: { label: "Edible mushrooms", color: 0x81bca7 },
  ore: { label: "Mixed ore", color: 0xa8977b },
  bedkit: { label: "Bed kit", color: 0xb99b68 },
  iron: { label: "Iron ore", color: 0xafbabd },
  copper: { label: "Copper ore", color: 0xd08a62 },
  gold: { label: "Gold ore", color: 0xe4c665 },
  gems: { label: "Gemstones", color: 0xa7a2e8 },
};
export const depositKinds = [...resourceKinds, "masonry"] as const;
export type Deposit = (typeof depositKinds)[number];
export const deposits: Record<
  Deposit,
  {
    label: string;
    resource: Resource;
    quantity: number;
    action: "mine" | "gather";
  }
> = {
  stone: {
    label: "Loose stone",
    resource: "stone",
    quantity: 3,
    action: "gather",
  },
  wood: { label: "Tree", resource: "wood", quantity: 5, action: "gather" },
  food: {
    label: "Edible mushrooms",
    resource: "food",
    quantity: 5,
    action: "gather",
  },
  ore: {
    label: "Mixed ore seam",
    resource: "ore",
    quantity: 2,
    action: "mine",
  },
  bedkit: {
    label: "Abandoned bed kit",
    resource: "bedkit",
    quantity: 1,
    action: "gather",
  },
  iron: { label: "Iron vein", resource: "iron", quantity: 2, action: "mine" },
  copper: {
    label: "Copper vein",
    resource: "copper",
    quantity: 2,
    action: "mine",
  },
  gold: { label: "Gold vein", resource: "gold", quantity: 2, action: "mine" },
  gems: { label: "Gem pocket", resource: "gems", quantity: 2, action: "mine" },
  masonry: {
    label: "Ancient masonry",
    resource: "stone",
    quantity: 3,
    action: "gather",
  },
};
export const featureKinds = [
  "grove",
  "ruin",
  "mine",
  "pond",
  "shrine",
  "den",
  "undergrowth",
  "approach",
  "entrance",
] as const;
export type FeatureKind = (typeof featureKinds)[number];
export const features: Record<
  FeatureKind,
  {
    label: string;
    description: string;
    color: number;
    walkable: boolean;
    buildable: boolean;
    landmark: boolean;
  }
> = {
  grove: {
    label: "Lanterncap grove",
    description:
      "Pale mushrooms glow beneath an arch of roots. Supper, if the goblins are feeling brave.",
    color: 0x92ceb0,
    walkable: true,
    buildable: true,
    landmark: true,
  },
  ruin: {
    label: "Forgotten hall",
    description:
      "Small stone doorways and broken tiles. Whoever lived here left in a hurry.",
    color: 0xa1a099,
    walkable: true,
    buildable: false,
    landmark: true,
  },
  mine: {
    label: "Old delver workings",
    description:
      "Rusty rails vanish into the rock. Bright flecks promise metal beyond the broken supports.",
    color: 0xbb956d,
    walkable: true,
    buildable: false,
    landmark: true,
  },
  pond: {
    label: "Whispering pool",
    description:
      "The water is shallow at the edges and dark in the middle. Go around, little goblins.",
    color: 0x609da3,
    walkable: false,
    buildable: false,
    landmark: true,
  },
  shrine: {
    label: "Crooked little shrine",
    description:
      "A tilted stone face wears a patient grin. Someone has left it a pebble.",
    color: 0xc7b99a,
    walkable: true,
    buildable: false,
    landmark: true,
  },
  den: {
    label: "Abandoned beast den",
    description:
      "Old claw marks and a very large sleeping hollow. Nothing lives here now. Probably.",
    color: 0xa68e6e,
    walkable: true,
    buildable: false,
    landmark: true,
  },
  undergrowth: {
    label: "Forest undergrowth",
    description: "Ferns and stubborn little shrubs crowd the hillside.",
    color: 0x6c8a54,
    walkable: true,
    buildable: true,
    landmark: false,
  },
  approach: {
    label: "Traveller approach",
    description:
      "A worn track reaches the edge of the woods. Future visitors will come this way.",
    color: 0xafa186,
    walkable: true,
    buildable: false,
    landmark: false,
  },
  entrance: {
    label: "Grotto entrance",
    description:
      "Cool cave air meets the hillside breeze. A way out—and a way in.",
    color: 0x9fbc8b,
    walkable: true,
    buildable: false,
    landmark: false,
  },
};

export const stockpileFilters = {
  all: { label: "All goods", resources: resourceKinds },
  food: { label: "Food", resources: ["food"] },
  building: { label: "Building supplies", resources: ["wood", "stone"] },
  valuables: {
    label: "Ore and valuables",
    resources: ["ore", "iron", "copper", "gold", "gems"],
  },
  crafted: { label: "Crafted goods", resources: ["bedkit"] },
} as const satisfies Record<
  string,
  { label: string; resources: readonly Resource[] }
>;
export type StockpileFilter = keyof typeof stockpileFilters;
export const stockpileFilterKinds = [
  "all",
  "food",
  "building",
  "valuables",
  "crafted",
] as const;
