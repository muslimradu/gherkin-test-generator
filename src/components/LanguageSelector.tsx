import React from 'react';
import type { TargetLanguage } from '../types/gherkin';
import { ChevronDown } from 'lucide-react';

interface LanguageOption {
  value: TargetLanguage;
  label: string;
  badge: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: 'playwright-ts', label: 'Playwright TypeScript', badge: 'TS' },
  { value: 'playwright-js', label: 'Playwright JavaScript', badge: 'JS' },
];

interface Props {
  value: TargetLanguage;
  onChange: (lang: TargetLanguage) => void;
}

export const LanguageSelector: React.FC<Props> = ({ value, onChange }) => {
  const selected = LANGUAGE_OPTIONS.find((o) => o.value === value) ?? LANGUAGE_OPTIONS[0];

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        Target Language
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as TargetLanguage)}
          className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 cursor-pointer shadow-sm transition-colors"
        >
          {LANGUAGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
          <ChevronDown size={14} />
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-0.5">
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
            selected.badge === 'TS'
              ? 'bg-blue-100 text-blue-600 border border-blue-200'
              : 'bg-yellow-100 text-yellow-600 border border-yellow-200'
          }`}
        >
          {selected.badge}
        </span>
        <span className="text-xs text-slate-400">{selected.label} selected</span>
      </div>
    </div>
  );
};
