import { useState, useCallback } from 'react';
import { GherkinInput } from './components/GherkinInput';
import { CodeOutput } from './components/CodeOutput';
import { parseGherkin } from './parser/gherkinParser';
import { generate } from './generator/index';
import type { TargetLanguage, GeneratedFile } from './types/gherkin';
import { BookOpen } from 'lucide-react';

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
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-200 text-lg select-none">
              🥒
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">
                Gherkin <span className="text-emerald-500">→</span> Test Generator
              </h1>
              <p className="text-[10px] text-slate-400 leading-tight">
                Playwright · Cypress · Selenium — Boilerplate in seconds
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
                  Boilerplate ready to customize
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
            Gherkin → Test Generator · Built for QA Automation Engineers
          </p>
          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            <span>Made by</span>
            <a
              href="https://github.com/muslimradu"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              Radu Muhammad Rodu Muslim
            </a>
            <span className="text-slate-300">·</span>
            <span>Parser v1.0 · TypeScript · Vite · React</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
