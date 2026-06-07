'use client';

import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import ColorBox from '@/components/ColorBox';
import ColorPicker from '@/components/ColorPicker';
import { generatePalette, type HarmonyType } from '@/lib/colorUtils';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Save, RefreshCw, X } from 'lucide-react';
import ExportMenu from '@/components/ExportMenu';

// Default color names
const defaultNames = ['Primary', 'Secondary', 'Accent', 'Neutral', 'Background'];

export default function Home() {
  const [baseColor, setBaseColor] = useState('#8b5cf6');
  const [harmony, setHarmony] = useState<HarmonyType>('monochromatic');
  const [colors, setColors] = useState<string[]>([]);
  const [colorNames, setColorNames] = useState<string[]>([...defaultNames]);
  const [locked, setLocked] = useState<boolean[]>([false, false, false, false, false]);
  const { savePalette } = useLocalStorage();
  
  // State for save popup
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [paletteName, setPaletteName] = useState('');

  useEffect(() => {
    const newColors = generatePalette(baseColor, harmony);
    const finalColors = newColors.map((color, i) => locked[i] ? colors[i] : color);
    setColors(finalColors);
    
    if (!locked.some(lock => lock)) {
      setColorNames(defaultNames);
    }
  }, [baseColor, harmony]);

  const updateColor = (index: number, newColor: string) => {
    const newColors = [...colors];
    newColors[index] = newColor;
    setColors(newColors);
    if (index === 0) setBaseColor(newColor);
  };

  const updateColorName = (index: number, newName: string) => {
    const newNames = [...colorNames];
    newNames[index] = newName;
    setColorNames(newNames);
  };

  const toggleLock = (index: number) => {
    const newLocked = [...locked];
    newLocked[index] = !newLocked[index];
    setLocked(newLocked);
  };

  const randomize = () => {
    const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    setBaseColor(randomHex);
    setLocked([false, false, false, false, false]);
    setColorNames(defaultNames);
  };

  // Open save popup
  const openSavePopup = () => {
    const defaultName = `Palette ${new Date().toLocaleDateString()}`;
    setPaletteName(defaultName);
    setShowSavePopup(true);
  };

  // Save palette with custom name
  const confirmSavePalette = () => {
    const paletteColors = colors.map((hex, i) => ({
      hex,
      name: colorNames[i]
    }));
    savePalette(paletteColors, paletteName);
    setShowSavePopup(false);
    setPaletteName('');
  };

  const harmonies: { type: HarmonyType; label: string }[] = [
    { type: 'monochromatic', label: 'Mono' },
    { type: 'analogous', label: 'Analog' },
    { type: 'complementary', label: 'Comp' },
    { type: 'triadic', label: 'Triad' },
    { type: 'tetradic', label: 'Tetrad' },
    { type: 'square', label: 'Square' },
  ];

  return (
    <>
      <Navbar />
      <Toaster position="top-right" />
      
      <main className="bg-gradient-to-br min-h-screen p4 pr-8">
        <div className="max-w-7xl p-4 mx-auto">
          
          {/* Hero header */}
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Color Palette Generator
            </h1>
            <p className="text-white/60">Create and name your custom color palette</p>
          </div>
          
          {/* Harmony buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {harmonies.map(h => (
              <button
                key={h.type}
                onClick={() => setHarmony(h.type)}
                className={`px-5 py-2 rounded-full font-medium transition-all ${
                  harmony === h.type 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105' 
                    : 'bg-white/10 hover:bg-white/20 text-white/80'
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>

          {/* Color Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10 justify-items-center place-items-center">
            {colors.map((color, i) => (
              <div key={i} className="relative w-full max-w-[200px]">
                <ColorBox
                  color={color}
                  name={colorNames[i] || `Color ${i + 1}`}
                  index={i}
                  locked={locked[i]}
                  onLock={() => toggleLock(i)}
                  onColorChange={(newColor) => updateColor(i, newColor)}
                  onNameChange={(newName) => updateColorName(i, newName)}
                />
              </div>
            ))}
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-col md:flex-row p-4 justify-center items-center gap-4 mb-10">
            <button
              onClick={randomize}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all flex items-center gap-2 text-white font-medium"
            >
              <RefreshCw size={18} /> Random Palette
            </button>
            <button
              onClick={openSavePopup}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2 text-white font-medium shadow-lg"
            >
              <Save size={18} /> Save Palette
            </button>
          </div>
          
          {/* Color picker */} 
          <div className="flex justify-center items-center gap-4 mb-10">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 flex items-center gap-4">
              <ColorPicker color={baseColor} onChange={setBaseColor} />
            </div>
          </div>  
          
          {/* Live Preview */}
          <div className="bg-white/5 backdrop-blur rounded-2xl mb-10 p-6 text-center">
            <p className="text-sm text-white/50 mb-2">Live Preview</p>
            <div className="h-16 rounded-xl" style={{
              background: `linear-gradient(90deg, ${colors.join(', ')})`
            }} />
          </div>
          
          {/* Export section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6">
              <h3 className="font-semibold mb-4 text-white/80">📤 Export Palette</h3>
              <ExportMenu colors={colors} colorNames={colorNames} />
            </div>
          </div>
        </div>
      </main>
      
      {/* Save Palette Popup */}
      {showSavePopup && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowSavePopup(false)}
        >
          <div 
            className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl max-w-md w-full shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popup header */}
            <div className="border-b border-white/10 p-5 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Save Palette
              </h2>
              <button
                onClick={() => setShowSavePopup(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-all"
              >
                <X size={20} className="text-white/60" />
              </button>
            </div>
            
            {/* Popup content */}
            <div className="p-5">
              {/* Color preview */}
              <div className="h-16 rounded-xl overflow-hidden flex mb-4">
                {colors.map((color, i) => (
                  <div
                    key={i}
                    className="flex-1"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              
              {/* Color names preview */}
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {colorNames.map((name, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60">
                    {name}
                  </span>
                ))}
              </div>
              
              {/* Input for palette name */}
              <label className="block text-sm font-medium text-white/60 mb-2">
                Palette Name
              </label>
              <input
                type="text"
                value={paletteName}
                onChange={(e) => setPaletteName(e.target.value)}
                placeholder="Enter palette name..."
                className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 outline-none focus:border-purple-500 transition-all"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && confirmSavePalette()}
              />
            </div>
            
            {/* Popup actions */}
            <div className="border-t border-white/10 p-5 flex gap-3">
              <button
                onClick={() => setShowSavePopup(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmSavePalette}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all text-white font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}