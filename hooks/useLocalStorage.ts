'use client';

import { useState, useEffect } from 'react';
import { SavedPalette, ColorWithName } from '@/types';

export function useLocalStorage() {
  const [palettes, setPalettes] = useState<SavedPalette[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('color-palettes');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPalettes(parsed);
      } catch (e) {
        console.error('Failed to parse palettes:', e);
        localStorage.removeItem('color-palettes');
      }
    }
  }, []);

  const savePalette = (colors: ColorWithName[], name?: string) => {
    const newPalette: SavedPalette = {
      id: Date.now().toString(),
      name: name || `Palette ${palettes.length + 1}`,
      colors: colors,
      createdAt: new Date(),
    };
    const updated = [newPalette, ...palettes].slice(0, 20);
    setPalettes(updated);
    localStorage.setItem('color-palettes', JSON.stringify(updated));
  };

  const deletePalette = (id: string) => {
    const updated = palettes.filter(p => p.id !== id);
    setPalettes(updated);
    localStorage.setItem('color-palettes', JSON.stringify(updated));
  };

  return { palettes, savePalette, deletePalette };
}