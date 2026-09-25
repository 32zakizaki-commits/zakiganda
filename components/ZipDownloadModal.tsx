'use client';

import React from 'react';
import { Download, CheckCircle2, RefreshCw, X, FileArchive, Layers, Clock } from 'lucide-react';
import { ZipDownloadProgress } from '@/lib/zip-download-service';

interface ZipDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: ZipDownloadProgress | null;
  totalPictures: number;
}

export const ZipDownloadModal: React.FC<ZipDownloadModalProps> = ({
  isOpen,
  onClose,
  progress,
  totalPictures
}) => {
  if (!isOpen) return null;

  const isDone = progress?.percentage === 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative max-w-md w-full bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#30363d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <FileArchive className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Downloading All Pictures as ZIP
              </h3>
              <p className="text-[11px] text-slate-400">
                Named sequentially: <span className="font-mono text-emerald-300">1.png, 2.png, 3.png...</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-[#21262d] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Body */}
        <div className="py-6 space-y-4 text-center">
          <div className="flex items-center justify-center">
            {isDone ? (
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 animate-pulse">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
            )}
          </div>

          <div>
            <div className="text-sm font-bold text-white mb-1">
              {isDone ? 'ZIP Package Download Started!' : (progress?.status || 'Preparing high-resolution pictures...')}
            </div>
            <p className="text-xs text-slate-400">
              {isDone
                ? `All ${totalPictures} storyboard pictures (1.png to ${totalPictures}.png) and timing manifest saved to your downloads.`
                : `Rendering Full HD 1920x1080 frames with zero duplicate pictures.`}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Progress</span>
              <span className="text-sky-400 font-bold">{progress?.percentage || 0}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[#0d1117] border border-[#30363d] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${progress?.percentage || 0}%` }}
              />
            </div>
          </div>

          {/* File Manifest Preview */}
          <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] text-left text-xs font-mono text-slate-300 space-y-1">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-sans font-semibold">
              ZIP Package Contents:
            </div>
            <div className="text-[11px] text-emerald-400">
              ✓ 1.png <span className="text-slate-500 font-sans">(First paragraph: 00:00)</span>
            </div>
            <div className="text-[11px] text-emerald-400">
              ✓ 2.png, 3.png ... {totalPictures}.png
            </div>
            <div className="text-[11px] text-sky-300">
              ✓ storyboard_timings.csv <span className="text-slate-500 font-sans">(Premiere / Final Cut)</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#30363d] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-xs font-semibold text-white transition-colors"
          >
            {isDone ? 'Done' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
