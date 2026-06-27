import React from 'react';
import { Toolbar } from './Toolbar';
import type { GeneratedFile } from '../types/gherkin';
import { Code2 } from 'lucide-react';

interface Props {
  files: GeneratedFile[];
  activeIndex: number;
  onSelectFile: (i: number) => void;
}

function highlightCode(code: string): React.ReactNode[] {
  const lines = code.split('\n');
  return lines.map((line, lineIdx) => {
    if (line.trim().startsWith('//')) {
      return (
        <div key={lineIdx} className="table-row">
          <span className="table-cell pr-5 text-right text-slate-300 select-none w-8 min-w-[2rem]">
            {lineIdx + 1}
          </span>
          <span className="table-cell text-slate-400 italic">{line}</span>
        </div>
      );
    }

    const tokenize = (src: string): React.ReactNode[] => {
      const result: React.ReactNode[] = [];
      let rest = src;
      let k = 0;

      while (rest.length > 0) {
        const strMatch = rest.match(/^(['"][^'"]*['"])/);
        if (strMatch) {
          result.push(<span key={k++} className="text-amber-600">{strMatch[1]}</span>);
          rest = rest.slice(strMatch[1].length);
          continue;
        }

        const kwMatch = rest.match(/^(import|from|const|let|var|async|await|require|test|expect)\b/);
        if (kwMatch) {
          result.push(<span key={k++} className="text-violet-600 font-semibold">{kwMatch[1]}</span>);
          rest = rest.slice(kwMatch[1].length);
          continue;
        }

        const fnMatch = rest.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\()/);
        if (fnMatch) {
          result.push(<span key={k++} className="text-sky-600">{fnMatch[1]}</span>);
          rest = rest.slice(fnMatch[1].length);
          continue;
        }

        const propMatch = rest.match(/^(\.[a-zA-Z_$][a-zA-Z0-9_$]*)/);
        if (propMatch) {
          result.push(<span key={k++} className="text-emerald-600">{propMatch[1]}</span>);
          rest = rest.slice(propMatch[1].length);
          continue;
        }

        const punctMatch = rest.match(/^([{}();,])/);
        if (punctMatch) {
          result.push(<span key={k++} className="text-slate-400">{punctMatch[1]}</span>);
          rest = rest.slice(1);
          continue;
        }

        result.push(<span key={k++} className="text-slate-600">{rest[0]}</span>);
        rest = rest.slice(1);
      }

      return result;
    };

    return (
      <div key={lineIdx} className="table-row group hover:bg-slate-50">
        <span className="table-cell pr-5 text-right text-slate-300 select-none w-8 min-w-[2rem] group-hover:text-slate-400">
          {lineIdx + 1}
        </span>
        <span className="table-cell">{tokenize(line)}</span>
      </div>
    );
  });
}

export const CodeOutput: React.FC<Props> = ({ files, activeIndex, onSelectFile }) => {
  const activeFile = files[activeIndex];
  const isEmpty = files.length === 0;

  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 border-b border-slate-200 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-300" />
          <div className="w-3 h-3 rounded-full bg-yellow-300" />
          <div className="w-3 h-3 rounded-full bg-green-300" />
        </div>
        <div className="flex-1 flex justify-center">
          <span className="text-xs text-slate-400 font-mono">
            {activeFile?.filename ?? 'output'}
          </span>
        </div>
        <Code2 size={13} className="text-slate-300" />
      </div>

      {/* Toolbar */}
      <Toolbar files={files} activeIndex={activeIndex} onSelectFile={onSelectFile} />

      {/* Code area */}
      <div className="flex-1 overflow-auto p-4 bg-white">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 text-center select-none">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
              <Code2 size={28} className="text-slate-300" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">No output yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Write Gherkin on the left and click{' '}
                <span className="text-emerald-500 font-semibold">Generate</span>
              </p>
            </div>
            <div className="flex flex-col gap-1.5 text-left bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              {['Feature: …', '  Scenario: …', '    Given …', '    When …', '    Then …'].map(
                (hint, i) => (
                  <div key={i} className="font-mono text-xs text-slate-400">
                    {hint}
                  </div>
                )
              )}
            </div>
          </div>
        ) : (
          <div className="table font-mono text-xs leading-6 w-full min-w-full">
            {highlightCode(activeFile?.content ?? '')}
          </div>
        )}
      </div>
    </div>
  );
};
