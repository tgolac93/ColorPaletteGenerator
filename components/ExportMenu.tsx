'use client';

import { useState } from 'react';
import { Copy, Download, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  colors: string[];
  colorNames?: string[];
}

export default function ExportMenu({ colors, colorNames = [] }: Props) {
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<'css' | 'tailwind' | 'json' | 'scss'>('css');
  
  // CSS format - sada s imenima kao komentarima
  const cssCode = `:root {
${colors.map((c, i) => {
  const name = colorNames[i] || `color-${i + 1}`;
  return `  /* ${name} */\n  --${name.replace(/\s+/g, '-').toLowerCase()}: ${c};`;
}).join('\n\n')}
}

/* Usage Example */
.button {
  background: var(--primary);
  color: var(--background);
}

.gradient {
  background: linear-gradient(90deg, ${colors.join(', ')});
}`;

  // Tailwind format - koristi imena za custom boje
  const tailwindCode = `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
${colors.map((c, i) => {
  const name = colorNames[i] || `custom-${i + 1}`;
  const cleanName = name.replace(/\s+/g, '-').toLowerCase();
  return `        '${cleanName}': '${c}',`;
}).join('\n')}
      }
    }
  }
}

/* Usage: className="bg-primary text-secondary" */`;

  // SCSS format s varijablama
  const scssCode = `// Color Palette
${colors.map((c, i) => {
  const name = colorNames[i] || `color-${i + 1}`;
  const cleanName = name.replace(/\s+/g, '-').toLowerCase();
  return `$${cleanName}: ${c};`;
}).join('\n')}

// Usage
.element {
  background: $primary;
  color: $background;
}

// Map for looping
$colors: (
${colors.map((c, i) => {
  const name = colorNames[i] || `color-${i + 1}`;
  const cleanName = name.replace(/\s+/g, '-').toLowerCase();
  return `  '${cleanName}': $${cleanName},`;
}).join('\n')}
);`;

  // JSON format - uključuje imena
  const jsonCode = JSON.stringify({
    palette: {
      name: "My Color Palette",
      generated: new Date().toISOString(),
      totalColors: colors.length,
      colors: colors.map((hex, i) => ({
        id: i + 1,
        name: colorNames[i] || `Color ${i + 1}`,
        hex: hex,
        rgb: hexToRgb(hex),
      })),
      gradient: `linear-gradient(90deg, ${colors.join(', ')})`,
    }
  }, null, 2);

  const getCode = () => {
    if (format === 'css') return cssCode;
    if (format === 'tailwind') return tailwindCode;
    if (format === 'scss') return scssCode;
    return jsonCode;
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(getCode());
    setCopied(true);
    toast.success(`${format.toUpperCase()} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([getCode()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const extensions = { css: 'css', tailwind: 'js', scss: 'scss', json: 'json' };
    a.download = `palette.${extensions[format]}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  return (
    <div className="space-y-4">
      {/* Format selector */}
      <div className="flex flex-wrap gap-2">
        {(['css', 'tailwind', 'scss', 'json'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
              format === f 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                : 'bg-white/10 hover:bg-white/20 text-white/80'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      
      {/* Code preview */}
      <div className="relative">
        <pre className="bg-black/50 backdrop-blur text-green-400 p-4 rounded-xl overflow-x-auto text-xs font-mono max-h-80 overflow-y-auto">
          <code>{getCode()}</code>
        </pre>
        
        {/* Action buttons */}
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={copyToClipboard}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all backdrop-blur"
            title="Copy"
          >
            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
          </button>
          <button
            onClick={download}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all backdrop-blur"
            title="Download"
          >
            <Download size={16} />
          </button>
        </div>
      </div>
      
      {/* Helper text */}
      <div className="text-xs text-white/40 text-center space-x-2">
        {format === 'css' && '🎨 CSS variables with color names as comments'}
        {format === 'tailwind' && '⚡ Tailwind config with named colors'}
        {format === 'scss' && '💅 SCSS variables and color map'}
        {format === 'json' && '📦 Structured data with RGB values'}
      </div>
    </div>
  );
}

// Helper funkcija
function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return { r, g, b };
}