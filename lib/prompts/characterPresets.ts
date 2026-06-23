import type { CharacterPreset } from "@/types/sprite";

export const knightPreset: CharacterPreset = {
  id: "sd-knight-spear",
  name: "SD Knight with Spear",
  description:
    "A cute SD/chibi medieval knight wearing silver plate armor, a closed helmet with visor slits, a red plume, gold armor accents, and holding a brown spear with a silver spearhead.",
  characterType: "Knight",
  weapon: "Spear",
  paletteNotes:
    "limited palette: black outline, silver and gray armor, red plume, gold accents, brown spear shaft, white highlights"
};

export const characterPresets: CharacterPreset[] = [
  knightPreset,
  {
    id: "forest-mage",
    name: "Forest Mage",
    description:
      "A small robed mage with leaf-green fabric, a wooden staff, bright eyes, and simple readable magical accents.",
    characterType: "Mage",
    weapon: "Staff",
    paletteNotes:
      "limited palette: black outline, moss green robe, warm wood staff, cream highlights, muted gold trim"
  },
  {
    id: "cave-slime",
    name: "Cave Slime",
    description:
      "A bouncy round monster with a glossy simple body, tiny eyes, and a compact silhouette for enemy animation.",
    characterType: "Monster",
    weapon: "None",
    paletteNotes:
      "limited palette: black outline, teal body, darker shadow teal, pale cyan highlights"
  }
];
