'use client';

import { useState } from 'react';
import { Copy, Lock, Unlock, Check, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  color: string;
  name: string;
  index: number;
  locked: boolean;
  onLock: () => void;
  onColorChange: (color: string) => void;
  onNameChange: (name: string) => void;
}

export default function ColorBox({ color, name, index, locked, onLock, onColorChange, onNameChange }: Props) {
  const [copied, setCopied] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(name);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(color);
    setCopied(true);
    toast.success(`${color} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveName = () => {
    if (tempName.trim()) {
      onNameChange(tempName);
    } else {
      onNameChange(`Color ${index + 1}`);
    }
    setIsEditingName(false);
  };

  const getTextColor = (hex: string) => {
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? 'text-gray-900' : 'text-white';
  };

  const textColor = getTextColor(color);

  return (
    <div 
      className="group relative rounded-2xl overflow-hidden shadow-xl transition-transform hover:scale-105"
      style={{ backgroundColor: color }}
    >
      <div className="aspect-square p-4 flex flex-col justify-between">
        {/* Lock button */}
        <div className="flex justify-end">
          <button
            onClick={onLock}
            className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 p-2 rounded-lg"
          >
            {locked ? <Lock size={14} className="text-white" /> : <Unlock size={14} className="text-white/70" />}
          </button>
        </div>
        
        <div className="space-y-2">
          {/* Ime boje - editabilno */}
          <div className="text-center">
            {isEditingName ? (
              <div className="flex gap-1">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveName()}
                  className="w-full px-2 py-1 text-sm rounded-lg bg-black/50 text-white text-center font-medium outline-none"
                  autoFocus
                />
                <button
                  onClick={saveName}
                  className="px-2 py-1 text-xs rounded-lg bg-white/20 hover:bg-white/30"
                >
                  ✓
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1 group/name">
                <span className={`text-sm font-medium ${textColor}`}>
                  {name}
                </span>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="opacity-0 group-hover/name:opacity-100 transition-opacity"
                >
                  <Edit2 size={12} className={textColor} />
                </button>
              </div>
            )}
          </div>

          {/* Hex kod i copy */}
          <button
            onClick={copyToClipboard}
            className="w-full py-2 rounded-lg bg-black/30 backdrop-blur-sm hover:bg-black/40 transition-all flex items-center justify-center gap-1"
          >
            {copied ? <Check size={12} className={textColor} /> : <Copy size={12} className={textColor} />}
            <span className={`text-xs font-mono ${textColor}`}>
              {color}
            </span>
          </button>
          
          {/* Color picker */}
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-full h-6 rounded cursor-pointer bg-transparent border border-white/30"
          />
        </div>
      </div>
    </div>
  );
}