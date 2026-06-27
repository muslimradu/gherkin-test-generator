import React, { useState } from 'react';
import { Copy, Download, Check, FileCode2, ChevronDown } from 'lucide-react';
import type { GeneratedFile } from '../types/gherkin';
import { copyToClipboard } from '../utils/clipboard';
import { downloadFile } from '../utils/download';

interface Props {
  files: GeneratedFile[];
  activeIndex: number;
  onSelectFile: (index: number) => void;
}

export const Toolbar: React.FC<Props> = ({ files, activeIndex, onSelectFile }) => {
  const [copied, setCopied] = useState(false);
  const activeFile = files[activeIndex];

  const handleCopy = async () => {
    if (!activeFile) return;
    const ok = await copyToClipboard(activeFile.content);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!activeFile) return;
    downloadFile(activeFile.filename, activeFile.content, 'text/plain');
  };

  if (files.length === 0) return null;

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-200 shrink-0">
      {/* File selector */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {files.length === 1 ? (
          <div className="flex items-center gap-2 min-w-0">
            <FileCode2 size={13} className="text-emerald-500 shrink-0" />
            <span className="text-xs text-slate-600 font-mono truncate">{activeFile?.filename}</span>
          </div>
        ) : (
          <div className="relative">
            <select
              value={activeIndex}
              onChange={(e) => onSelectFile(Number(e.target.value))}
              className="appearance-none bg-white border border-slate-200 text-slate-600 text-xs rounded-lg pl-2 pr-6 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-300 cursor-pointer font-mono shadow-sm"
            >
              {files.map((f, i) => (
                <option key={i} value={i}>
                  {f.filename}
                </option>
              ))}
            </select>
            <ChevronDown
              size={11}
              className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        )}
        {files.length > 1 && (
          <span className="text-[10px] text-slate-400 shrink-0">
            {files.length} files generated
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-500" />
              <span className="text-emerald-600">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              Copy Code
            </>
          )}
        </button>

        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-200"
        >
          <Download size={12} />
          Download
        </button>
      </div>
    </div>
  );
};
