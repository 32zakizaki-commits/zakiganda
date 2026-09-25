'use client';

import React from 'react';
import { X, ExternalLink, Download, Copy, Check, Clock, Globe, ShieldCheck } from 'lucide-react';
import { IdeaParagraph } from '@/lib/subtitle-parser';

interface ZoomModalProps {
  paragraph: IdeaParagraph | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ZoomModal: React.FC<ZoomModalProps> = ({ paragraph, isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !paragraph || !paragraph.matchedImage) return null;

  const img = paragraph.matchedImage;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(img.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d] bg-[#0d1117]">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-sky-500/10 text-sky-400 font-mono text-xs font-semibold border border-sky-500/20">
              #{paragraph.index}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>{paragraph.durationLabel}</span>
            </div>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <span className="text-xs text-emerald-400 font-medium hidden sm:inline">
              {img.outlet}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-xs font-medium text-slate-200 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy URL'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#21262d] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* High Resolution Image Viewport */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.url}
            alt={img.title || paragraph.searchQuery}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Details Footer */}
        <div className="p-6 bg-[#0d1117] border-t border-[#30363d] space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-white leading-snug">
              {img.title || paragraph.searchQuery}
            </h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Attribution: {img.source}</span>
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#161b22] border border-[#30363d] text-xs text-slate-300">
            <span className="text-slate-500 font-medium">Subtitle Context: </span>
            {paragraph.text}
          </div>
        </div>
      </div>
    </div>
  );
};
