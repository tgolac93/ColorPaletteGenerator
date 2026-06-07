'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Trash2, Copy, Check, Palette, Download, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ExportMenu from '@/components/ExportMenu';

export default function HistoryPage() {
  const { palettes, deletePalette } = useLocalStorage();
  const [exportingPalette, setExportingPalette] = useState<{
    id: string;
    name: string;
    colors: string[];
    colorNames: string[];
  } | null>(null);
  
  const copyPalette = async (colors: { hex: string; name: string }[]) => {
    const colorHexes = colors.map(c => c.hex).join(', ');
    await navigator.clipboard.writeText(colorHexes);
    toast.success('Palette copied!');
  };
  
  const openExportPopup = (palette: any) => {
    // Ispravno ekstraktiranje hex vrijednosti
    const colors = palette.colors.map((c: any) => typeof c === 'string' ? c : c.hex);
    const colorNames = palette.colors.map((c: any, i: number) => 
      typeof c === 'string' ? `Color ${i + 1}` : (c.name || `Color ${i + 1}`)
    );
    setExportingPalette({
      id: palette.id,
      name: palette.name,
      colors: colors,
      colorNames: colorNames,
    });
  };
  
  const closeExportPopup = () => {
    setExportingPalette(null);
  };
  
  return (
    <>
      <Navbar />
      <main className="min-h-screen from-gray-900 via-purple-900 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent mb-3">
              Saved Palettes
            </h1>
            <p className="text-white/60">Your collection of beautiful color combinations</p>
          </div>
          
          {palettes.length === 0 ? (
            <div className="text-center py-20 bg-white/5 backdrop-blur rounded-2xl">
              <Palette size={48} className="mx-auto mb-4 text-white/30" />
              <p className="text-white/40">No saved palettes yet. Generate and save some!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {palettes.map(palette => (
                <div key={palette.id} className="bg-white/10 backdrop-blur rounded-2xl overflow-hidden hover:bg-white/15 transition-all">
                  {/* Color strip - koristi .hex */}
                  <div className="h-24 flex">
                    {palette.colors.map((color: any, i: number) => (
                      <div 
                        key={i} 
                        className="flex-1 hover:flex-[1.5] transition-all duration-300"
                        style={{ backgroundColor: typeof color === 'string' ? color : color.hex }}
                        title={typeof color === 'string' ? `Color ${i + 1}` : (color.name || `Color ${i + 1}`)}
                      />
                    ))}
                  </div>
                  
                  <div className="p-5">
                    <h3 className="font-semibold text-lg text-white mb-2">{palette.name}</h3>
                    
                    {/* Color names */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {palette.colors.map((color: any, i: number) => (
                        <span 
                          key={i}
                          className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60"
                        >
                          {typeof color === 'string' ? `C${i + 1}` : (color.name || `C${i + 1}`)}
                        </span>
                      ))}
                    </div>
                    
                    <p className="text-sm text-white/40 mb-4">
                      {new Date(palette.createdAt).toLocaleDateString()}
                    </p>
                    
                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyPalette(palette.colors)}
                        className="flex-1 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-sm text-white flex items-center justify-center gap-2"
                      >
                        <Copy size={14} /> Copy
                      </button>
                      
                      <button
                        onClick={() => openExportPopup(palette)}
                        className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all text-sm text-white flex items-center justify-center gap-2"
                      >
                        <Download size={14} /> Export
                      </button>
                      
                      <button
                        onClick={() => deletePalette(palette.id)}
                        className="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-all text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      {/* Export Popup Modal */}
      {exportingPalette && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeExportPopup}
        >
          <div 
            className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popup header */}
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur border-b border-white/10 p-5 rounded-t-2xl flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Export Palette
                </h2>
                <p className="text-sm text-white/40 mt-1">{exportingPalette.name}</p>
              </div>
              <button
                onClick={closeExportPopup}
                className="p-2 rounded-lg hover:bg-white/10 transition-all"
              >
                <X size={20} className="text-white/60" />
              </button>
            </div>
            
            {/* Color preview in popup */}
            <div className="p-5 border-b border-white/10">
              <div className="h-16 rounded-xl overflow-hidden flex mb-4">
                {exportingPalette.colors.map((color, i) => (
                  <div
                    key={i}
                    className="flex-1"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {exportingPalette.colorNames.map((name, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60">
                    {name}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Export menu */}
            <div className="p-5">
              <ExportMenu 
                colors={exportingPalette.colors} 
                colorNames={exportingPalette.colorNames} 
              />
            </div>
            
            {/* Close button */}
            <div className="p-5 pt-0">
              <button
                onClick={closeExportPopup}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}