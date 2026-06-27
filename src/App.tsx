import React, { useState, useCallback } from 'react';
import { GherkinInput } from './components/GherkinInput';
import { CodeOutput } from './components/CodeOutput';
import { parseGherkin } from './parser/gherkinParser';
import { generate } from './generator/index';
import type { TargetLanguage, GeneratedFile } from './types/gherkin';
import { Sparkles, Github, BookOpen } from 'lucide-react';

function App() {
  const [gherkinText, setGherkinText] = useState('');
  const [language, setLanguage] = useState<TargetLanguage>('playwright-ts');
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(async () => {
    setError(null);
    if (!gherkinText.trim()) {
      setError('Please input a Gherkin feature first.');
      return;
    }
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 200));
    const parseResult = parseGherkin(gherkinText);
    if (!parseResult.success || !parseResult.feature) {
      setError(parseResult.error ?? 'Invalid Gherkin format.');
      setGeneratedFiles([]);
      setIsGenerating(false);
      return;
    }
    try {
      const files = generate(parseResult.feature, language);
      setGeneratedFiles(files);
      setActiveFileIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed.');
    } finally {
      setIsGenerating(false);
    }
  }, [gherkinText, language]);

  const handleClear = useCallback(() => {
    setGherkinText('');
    setError(null);
    setGeneratedFiles([]);
    setActiveFileIndex(0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* ── Header ── */}
      <header className="shrink-0 border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-200">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">
                Gherkin <span className="text-emerald-500">→</span> Playwright
              </h1>
              <p className="text-[10px] text-slate-400 leading-tight">
                Automation Boilerplate Generator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {generatedFiles.length > 0 && (
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-emerald-600 font-medium">
                  {generatedFiles.length} file{generatedFiles.length !== 1 ? 's' : ''} ready
                </span>
              </div>
            )}
            <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
              <a
                href="https://playwright.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <BookOpen size={13} />
                Docs
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <Github size={13} />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main panel ── */}
      <main className="flex-1 max-w-screen-xl w-full mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-[calc(100vh-9rem)]">
          {/* Left panel */}
          <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
            <GherkinInput
              value={gherkinText}
              onChange={setGherkinText}
              language={language}
              onLanguageChange={setLanguage}
              onGenerate={handleGenerate}
              onClear={handleClear}
              error={error}
              isGenerating={isGenerating}
            />
          </div>

          {/* Right panel */}
          <div className="flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-800 tracking-wide">
                  Generated Code
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Playwright boilerplate ready to customize
                </p>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <CodeOutput
                files={generatedFiles}
                activeIndex={activeFileIndex}
                onSelectFile={setActiveFileIndex}
              />
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="shrink-0 border-t border-slate-200 bg-white py-3">
        <div className="max-w-screen-xl mx-auto px-6 flex items-center justify-between">
          <p className="text-[10px] text-slate-400">
            Gherkin → Playwright Generator · Built for QA Automation Engineers
          </p>
          <div className="flex items-center gap-4 text-[10px] text-slate-400">
            <span>Parser v1.0</span>
            <span className="text-slate-300">·</span>
            <span>TypeScript · Vite · React</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
