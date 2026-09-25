'use client';

import React from 'react';
import { Film, Download, Layers, Sparkles, FileCode, FileArchive, CheckCircle2, Youtube } from 'lucide-react';

interface HeaderProps {
  totalParagraphs: number;
  totalDurationSeconds: number;
  onExportJSON: () => void;
  onExportStoryboard: () => void;
  onDownloadHtml: () => void;
  onDownloadAllZip: () => void;
  isProcessing: boolean;
  isDownloadingZip?: boolean;
}

export const VideoEditorHeader: React.FC<HeaderProps> = ({
  totalParagraphs,
  totalDurationSeconds,
  onExportJSON,
  onExportStoryboard,
  onDownloadHtml,
  onDownloadAllZip,
  isProcessing,
  isDownloadingZip = false
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0d1117]/95 backdrop-blur-md border-b border-[#30363d] px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">
                  NewsSync Studio
                </h1>
                <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  YouTube Subtitle &amp; Article Screen Extractor
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Extract Subtitles from YouTube Link · Zero Duplicates · Export ZIP (1.png, 2.png, 3.png...)
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          {totalParagraphs > 0 && (
            <div className="flex items-center gap-3 text-xs text-slate-400 md:ml-4 pl-4 md:border-l border-[#30363d]">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span className="font-mono text-slate-200">{totalParagraphs}</span>
                <span className="text-slate-500">Blocks</span>
              </div>
              <span className="text-slate-600">·</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-slate-200">{formatTime(totalDurationSeconds)}</span>
                <span className="text-slate-500">Duration</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          {isProcessing ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#161b22] border border-[#30363d] text-xs text-amber-300 font-mono animate-pulse">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Extracting Subtitle Paragraphs &amp; News Screens...</span>
            </div>
          ) : totalParagraphs > 0 ? (
            <>
              {/* PRIMARY CTA: Download All Pictures in ZIP (1.png, 2.png, 3.png...) */}
              <button
                onClick={onDownloadAllZip}
                disabled={isDownloadingZip}
                title="Download all extracted pictures in a ZIP file named sequentially 1.png, 2.png, 3.png..."
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 border border-emerald-400/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <FileArchive className="w-4 h-4" />
                <span>Download All Pictures (ZIP: 1.png, 2.png...)</span>
                <span className="text-[10px] bg-black/25 px-1.5 py-0.5 rounded font-mono">
                  {totalParagraphs}
                </span>
              </button>

              <button
                onClick={onExportStoryboard}
                title="Export text and high-res image table for Premiere Pro / Final Cut"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] hover:border-slate-500 text-xs font-medium text-slate-200 hover:text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                <span>Storyboard</span>
              </button>

              <button
                onClick={onExportJSON}
                title="Export raw JSON with parsed timing blocks and image metadata"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] hover:border-slate-500 text-xs font-medium text-slate-200 hover:text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>JSON</span>
              </button>

              <button
                onClick={onDownloadHtml}
                title="Download Standalone Single-File index.html"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Standalone HTML</span>
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
};
