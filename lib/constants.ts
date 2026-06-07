import { HarmonyType } from "./colorUtils";

export const HARMONIES: { type: HarmonyType; label: string; description: string }[] = [
    { type: 'monochromatic', label: 'Monochromatic', description: 'Same hue, different shades' },
    { type: 'analogous', label: 'Analogous', description: 'Colors next to each other on the wheel' },
    { type: 'complementary', label: 'Complementary', description: 'Opposite colors on the wheel' },
    { type: 'triadic', label: 'Triadic', description: 'Three evenly spaced colors' },
    { type: 'tetradic', label: 'Tetradic', description: 'Two complementary pairs' },
    { type: 'square', label: 'Square', description: 'Four evenly spaced colors' },
  ];