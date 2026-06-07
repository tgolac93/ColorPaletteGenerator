'use client';

import { useState, useRef, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  color: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ color, onChange }: Props) {
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingHue, setIsDraggingHue] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inputMode, setInputMode] = useState<'hex' | 'hsl'>('hex');
  const [hexInput, setHexInput] = useState('');
  
  const saturationRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const rgb = hexToRgb(color);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    setHue(hsl.h);
    setSaturation(hsl.s);
    setLightness(hsl.l);
    setHexInput(color.toUpperCase());
  }, [color]);
  
  const updateColor = (h: number, s: number, l: number) => {
    const newColor = hslToHex(h, s, l);
    onChange(newColor);
    setHexInput(newColor.toUpperCase());
  };
  
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setHexInput(value);
    
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      const rgb = hexToRgb(value);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      setHue(hsl.h);
      setSaturation(hsl.s);
      setLightness(hsl.l);
      onChange(value);
    }
  };
  
  const handleHexBlur = () => {
    if (!/^#[0-9A-F]{6}$/i.test(hexInput)) {
      setHexInput(color.toUpperCase());
    }
  };
  
  // Dohvati koordinate s miša ili toucha
  const getClientCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0];
      return { clientX: touch.clientX, clientY: touch.clientY };
    }
    // Mouse event
    return { clientX: e.clientX, clientY: e.clientY };
  };
  
  const handleSaturationMove = (clientX: number, clientY: number) => {
    if (!saturationRef.current) return;
    const rect = saturationRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(0, clientX - rect.left), rect.width);
    const y = Math.min(Math.max(0, clientY - rect.top), rect.height);
    const s = (x / rect.width) * 100;
    const l = 100 - (y / rect.height) * 100;
    setSaturation(s);
    setLightness(l);
    updateColor(hue, s, l);
  };
  
  const handleHueMove = (clientX: number) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(0, clientX - rect.left), rect.width);
    const newHue = (x / rect.width) * 360;
    setHue(newHue);
    updateColor(newHue, saturation, lightness);
  };
  
  const copyToClipboard = async () => {
    const currentColor = color.toUpperCase();
    await navigator.clipboard.writeText(currentColor);
    setCopied(true);
    toast.success(`${currentColor} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleHslInput = (h: number, s: number, l: number) => {
    const clampedH = Math.min(Math.max(0, h), 360);
    const clampedS = Math.min(Math.max(0, s), 100);
    const clampedL = Math.min(Math.max(0, l), 100);
    setHue(clampedH);
    setSaturation(clampedS);
    setLightness(clampedL);
    updateColor(clampedH, clampedS, clampedL);
  };
  
  // Mouse/Touch start handlers
  const handleSaturationStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const { clientX, clientY } = getClientCoordinates(e);
    handleSaturationMove(clientX, clientY);
  };
  
  const handleHueStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDraggingHue(true);
    const { clientX } = getClientCoordinates(e);
    handleHueMove(clientX);
  };
  
  // Global event listeners za drag
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (isDragging) {
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        handleSaturationMove(clientX, clientY);
      } else if (isDraggingHue) {
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        handleHueMove(clientX);
      }
    };
    
    const handleEnd = () => {
      setIsDragging(false);
      setIsDraggingHue(false);
    };
    
    if (isDragging || isDraggingHue) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleEnd);
      window.addEventListener('touchcancel', handleEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
    };
  }, [isDragging, isDraggingHue, hue, saturation, lightness]);
  
  const currentHex = color.toUpperCase();
  const currentHsl = `${Math.round(hue)}°, ${Math.round(saturation)}%, ${Math.round(lightness)}%`;
  
  return (
    <div className="space-y-4 min-w-[250px]">
      {/* Saturation & Lightness picker */}
      <div className="space-y-2">
        <div 
          ref={saturationRef}
          className="relative w-full aspect-square rounded-xl cursor-pointer touch-none overflow-hidden shadow-lg"
          style={{ background: `hsl(${hue}, 100%, 50%)` }}
          onMouseDown={handleSaturationStart}
          onTouchStart={handleSaturationStart}
        >
          <div className="absolute inset-0" style={{ background: `linear-gradient(to right, white, transparent)` }} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent, black)` }} />
          
          <div
            className="absolute w-5 h-5 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              left: `${(saturation / 100) * 100}%`,
              top: `${100 - (lightness / 100) * 100}%`,
              backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
            }}
          />
        </div>
      </div>
      
      {/* Hue slider */}
      <div className="space-y-2">
        <div 
          ref={hueRef}
          className="relative h-8 rounded-xl cursor-pointer touch-none overflow-hidden shadow-lg"
          style={{ background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' }}
          onMouseDown={handleHueStart}
          onTouchStart={handleHueStart}
        >
          <div
            className="absolute w-4 h-8 bg-white rounded shadow-lg transform -translate-x-1/2 pointer-events-none"
            style={{ left: `${(hue / 360) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Toggle buttons za HEX/HSL */}
      <div className="flex gap-2">
        <button
          onClick={() => setInputMode('hex')}
          className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            inputMode === 'hex' 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
              : 'bg-white/10 hover:bg-white/20 text-white/80'
          }`}
        >
          HEX
        </button>
        <button
          onClick={() => setInputMode('hsl')}
          className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            inputMode === 'hsl' 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
              : 'bg-white/10 hover:bg-white/20 text-white/80'
          }`}
        >
          HSL
        </button>
      </div>
      
      {/* Input tabs - HEX or HSL */}
      <div className="flex gap-2">
        <div 
          className="w-10 h-10 rounded-xl shadow-lg cursor-pointer transition-transform hover:scale-105"
          style={{ backgroundColor: currentHex }}
          onClick={copyToClipboard}
          title="Click to copy color"
        />
        <div className="flex-1 relative">
          {inputMode === 'hex' ? (
            <input
              type="text"
              value={hexInput}
              onChange={handleHexChange}
              onBlur={handleHexBlur}
              placeholder="#RRGGBB"
              className="w-full px-3 py-2 pr-10 rounded-xl bg-white/10 border border-white/20 text-white font-mono text-sm outline-none focus:border-purple-500"
            />
          ) : (
            <div className="flex gap-1">
              <input
                type="number"
                value={Math.round(hue)}
                onChange={(e) => handleHslInput(parseInt(e.target.value), saturation, lightness)}
                min="0"
                max="360"
                className="w-16 px-2 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm outline-none focus:border-purple-500 text-center"
                placeholder="H"
              />
              <span className="text-white/60 self-center">°</span>
              <input
                type="number"
                value={Math.round(saturation)}
                onChange={(e) => handleHslInput(hue, parseInt(e.target.value), lightness)}
                min="0"
                max="100"
                className="w-16 px-2 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm outline-none focus:border-purple-500 text-center"
                placeholder="S"
              />
              <span className="text-white/60 self-center">%</span>
              <input
                type="number"
                value={Math.round(lightness)}
                onChange={(e) => handleHslInput(hue, saturation, parseInt(e.target.value))}
                min="0"
                max="100"
                className="w-16 px-2 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm outline-none focus:border-purple-500 text-center"
                placeholder="L"
              />
              <span className="text-white/60 self-center">%</span>
            </div>
          )}
          
          {/* Copy button */}
          {inputMode === 'hex' && (
            <button
              onClick={copyToClipboard}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
              title="Copy hex code"
            >
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-white/60" />}
            </button>
          )}
        </div>
      </div>
      
      {/* HSL preview tekst */}
      <div className="text-center text-xs text-white/40">
        HSL: {currentHsl}
      </div>
      
      {/* Preset colors */}
      <div className="flex gap-2 flex-wrap">
        {['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'].map(preset => (
          <button
            key={preset}
            onClick={() => {
              const rgb = hexToRgb(preset);
              const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
              setHue(hsl.h);
              setSaturation(hsl.s);
              setLightness(hsl.l);
              onChange(preset);
              setHexInput(preset.toUpperCase());
            }}
            className="w-8 h-8 rounded-lg shadow-lg transition-transform hover:scale-110 cursor-pointer"
            style={{ backgroundColor: preset }}
          />
        ))}
      </div>
    </div>
  );
}

// Helper funkcije (iste kao prije)
function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return { r, g, b };
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}