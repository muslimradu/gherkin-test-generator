import React, { useRef } from 'react';
import { Upload, Trash2, Zap, AlertCircle } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import type { TargetLanguage } from '../types/gherkin';

const PLACEHOLDER = `Feature: Login

  Scenario: Login successfully
    Given User membuka halaman login
    When User mengisi username "admin"
    And User mengisi password "123456"
    And User klik tombol Login
    Then User berhasil masuk ke dashboard`;

interface Props {
  value: string;
  onChange: (v: string) => void;
  language: TargetLanguage;
  onLanguageChange: (l: TargetLanguage) => void;
  onGenerate: () => void;
  onClear: () => void;
  error: string | null;
  isGenerating: boolean;
}

export const GherkinInput: React.FC<Props> = ({
  value,
  onChange,
  language,
  onLanguageChange,
  onGenerate,
  onClear,
  error,
  isGenerating,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      onChange(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const lineCount = value ? value.split('\n').length : 0;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 tracking-wide">Gherkin Input</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Paste or upload your <span className="text-emerald-600 font-mono">.feature</span> file
          </p>
        </div>
        {lineCount > 0 && (
          <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded-md">
            {lineCount} line{lineCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Textarea */}
      <div className="relative flex-1 min-h-0">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={PLACEHOLDER}
          className={`w-full h-full resize-none bg-slate-50 border rounded-xl p-4 font-mono text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 transition-colors leading-relaxed ${
            error
              ? 'border-red-300 focus:ring-red-200 bg-red-50/30'
              : 'border-slate-200 focus:ring-emerald-200 focus:border-emerald-400'
          }`}
          spellCheck={false}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle size={14} className="text-red-500 shrink-0" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Language Selector */}
      <LanguageSelector value={language} onChange={onLanguageChange} />

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
        >
          <Upload size={13} />
          Upload .feature
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".feature,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />

        <button
          onClick={onClear}
          disabled={!value}
          className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          <Trash2 size={13} />
          Clear
        </button>

        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-emerald-200"
        >
          <Zap size={13} className={isGenerating ? 'animate-pulse' : ''} />
          {isGenerating ? 'Generating…' : 'Generate'}
        </button>
      </div>
    </div>
  );
};
