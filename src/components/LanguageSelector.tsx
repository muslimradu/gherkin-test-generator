import React from 'react';
import type { TargetLanguage } from '../types/gherkin';
import { ChevronDown } from 'lucide-react';

interface LanguageOption {
  value: TargetLanguage;
  label: string;
  badge: string;
  badgeClass: string;
  group: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: 'playwright-ts', label: 'Playwright TypeScript', badge: 'TS', badgeClass: 'bg-blue-100 text-blue-700 border-blue-200', group: 'Playwright' },
  { value: 'playwright-js', label: 'Playwright JavaScript', badge: 'JS', badgeClass: 'bg-yellow-100 text-yellow-700 border-yellow-200', group: 'Playwright' },
  { value: 'cypress-ts',    label: 'Cypress TypeScript',   badge: 'TS', badgeClass: 'bg-blue-100 text-blue-700 border-blue-200', group: 'Cypress' },
  { value: 'cypress-js',    label: 'Cypress JavaScript',   badge: 'JS', badgeClass: 'bg-yellow-100 text-yellow-700 border-yellow-200', group: 'Cypress' },
  { value: 'selenium-java', label: 'Selenium Java',        badge: 'Java', badgeClass: 'bg-orange-100 text-orange-700 border-orange-200', group: 'Selenium' },
];

const FRAMEWORK_ICONS: Record<string, string> = {
  Playwright: '🎭',
  Cypress:    '🌲',
  Selenium:   '🔬',
};

interface Props {
  value: TargetLanguage;
  onChange: (lang: TargetLanguage) => void;
}

export const LanguageSelector: React.FC<Props> = ({ value, onChange }) => {
  const selected = LANGUAGE_OPTIONS.find((o) => o.value === value) ?? LANGUAGE_OPTIONS[0];

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        Target Framework
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as TargetLanguage)}
          className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 cursor-pointer shadow-sm transition-colors"
        >
          {['Playwright', 'Cypress', 'Selenium'].map((group) => (
            <optgroup key={group} label={`${FRAMEWORK_ICONS[group]} ${group}`}>
              {LANGUAGE_OPTIONS.filter((o) => o.group === group).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
          <ChevronDown size={14} />
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-0.5">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono border ${selected.badgeClass}`}>
          {selected.badge}
        </span>
        <span className="text-xs text-slate-400">{selected.label} selected</span>
      </div>
    </div>
  );
};
