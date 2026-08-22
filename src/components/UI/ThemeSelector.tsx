import React from 'react';
import { usePlayerStore, ThemeOption } from '../../store/usePlayerStore';
import { Palette } from 'lucide-react';

const THEMES: { id: ThemeOption; name: string; color: string }[] = [
  { id: 'vintage-gold', name: 'Champagne Gold', color: '#d4af37' },
  { id: 'warm-vermilion', name: 'Warm Vermilion', color: '#ff5733' },
  { id: 'electric-teal', name: 'Electric Teal', color: '#00e5ff' },
  { id: 'neon-violet', name: 'Neon Violet', color: '#a855f7' },
  { id: 'cyber-emerald', name: 'Cyber Emerald', color: '#00ff9d' },
];

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = usePlayerStore();

  return (
    <div className="flex items-center gap-2 p-1.5 rounded-full bg-bg-elevated/80 border border-border/60 backdrop-blur-md shadow-lg">
      <div className="pl-2.5 pr-1 text-text-muted flex items-center gap-1.5 text-xs font-mono">
        <Palette className="w-3.5 h-3.5 text-accent" />
        <span className="hidden sm:inline">Palette</span>
      </div>
      <div className="flex items-center gap-1.5">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            title={t.name}
            className={`w-6 h-6 rounded-full transition-transform duration-200 flex items-center justify-center ${
              theme === t.id ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-black' : 'hover:scale-110 opacity-70 hover:opacity-100'
            }`}
            style={{ backgroundColor: t.color }}
          />
        ))}
      </div>
    </div>
  );
};
