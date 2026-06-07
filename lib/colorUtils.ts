import chroma from 'chroma-js';

export type HarmonyType = 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'square';

export function generatePalette(baseColor: string, harmony: HarmonyType): string[] {
  try {
    const color = chroma(baseColor);
    const hue = color.get('hsl.h');
    const sat = color.get('hsl.s');
    const light = color.get('hsl.l');
    
    switch (harmony) {
      case 'monochromatic':
        // Koristimo brighten/darken umjesto direktnog HSL-a
        return [
          color.hex(),
          color.brighten(1.2).hex(),
          color.brighten(0.5).hex(),
          color.darken(0.5).hex(),
          color.darken(1.2).hex(),
        ];
        
      case 'analogous':
        return [
          color.hex(),
          chroma(baseColor).set('hsl.h', (hue - 30 + 360) % 360).hex(),
          chroma(baseColor).set('hsl.h', (hue - 15 + 360) % 360).hex(),
          chroma(baseColor).set('hsl.h', (hue + 15) % 360).hex(),
          chroma(baseColor).set('hsl.h', (hue + 30) % 360).hex(),
        ];
        
      case 'complementary': {
        const compHue = (hue + 180) % 360;
        return [
          color.hex(),
          color.brighten(0.5).hex(),
          chroma(baseColor).set('hsl.h', compHue).hex(),
          chroma(baseColor).set('hsl.h', compHue).brighten(0.5).hex(),
          chroma(baseColor).set('hsl.h', compHue).darken(0.5).hex(),
        ];
      }
        
      case 'triadic': {
        return [
          color.hex(),
          chroma(baseColor).set('hsl.h', (hue + 120) % 360).hex(),
          chroma(baseColor).set('hsl.h', (hue + 240) % 360).hex(),
          color.brighten(0.5).hex(),
          color.darken(0.5).hex(),
        ];
      }
        
      case 'tetradic': {
        return [
          color.hex(),
          chroma(baseColor).set('hsl.h', (hue + 90) % 360).hex(),
          chroma(baseColor).set('hsl.h', (hue + 180) % 360).hex(),
          chroma(baseColor).set('hsl.h', (hue + 270) % 360).hex(),
          color.brighten(0.5).hex(),
        ];
      }
        
      case 'square': {
        return [
          color.hex(),
          chroma(baseColor).set('hsl.h', (hue + 90) % 360).hex(),
          chroma(baseColor).set('hsl.h', (hue + 180) % 360).hex(),
          chroma(baseColor).set('hsl.h', (hue + 270) % 360).hex(),
          color.darken(0.5).hex(),
        ];
      }
        
      default:
        return Array(5).fill(baseColor);
    }
  } catch (error) {
    console.error('Error generating palette:', error);
    // Fallback - vrati nijanse iste boje
    const color = chroma(baseColor);
    return [
      color.brighten(1.5).hex(),
      color.brighten(0.8).hex(),
      color.hex(),
      color.darken(0.5).hex(),
      color.darken(1.2).hex(),
    ];
  }
}

export function getTextColor(hex: string): 'white' | 'black' {
  try {
    const rgb = chroma(hex).rgb();
    const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    return brightness > 128 ? 'black' : 'white';
  } catch {
    return 'white';
  }
}

export function cssVariables(colors: string[]): string {
  return colors.map((color, i) => `  --color-${i + 1}: ${color};`).join('\n');
}