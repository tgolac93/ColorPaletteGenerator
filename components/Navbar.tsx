'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Palette, History, Sparkles } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  
  return (
    <nav className="glass sticky top-4 mx-6 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Palette size={32} className="text-purple-400 group-hover:rotate-12 transition-transform" />
            <Sparkles size={14} className="absolute -top-1 -right-1 text-yellow-400 animate-pulse" />
          </div>
          <span className="font-bold text-xl gradient-text">
            Color Palette
          </span>
        </Link>
        
        <Link 
          href={pathname === '/' ? '/history' : '/'}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all backdrop-blur-sm"
        >
          <History size={18} />
          {pathname === '/' ? 'History' : 'Generator'}
        </Link>
      </div>
    </nav>
  );
}