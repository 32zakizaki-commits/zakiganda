'use client';

import React from 'react';
import { Youtube, ExternalLink, X, Clock, Play } from 'lucide-react';

interface YouTubePlayerCardProps {
  videoId: string;
  videoTitle?: string;
  currentTimestampSeconds?: number;
  onClose: () => void;
}

export const YouTubePlayerCard: React.FC<YouTubePlayerCardProps> = ({
  videoId,
  videoTitle = 'YouTube Video Playback',
  currentTimestampSeconds = 0,
  onClose
}) => {
  if (!videoId) return null;

  return (
    <div className="bg-[#161b22] border border-rose-500/30 rounded-xl overflow-hidden shadow-2xl mb-5 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0d1117] border-b border-[#30363d]">
        <div className="flex items-center gap-2 truncate">
          <div className="w-5 h-5 rounded bg-rose-600 flex items-center justify-center text-white">
            <Youtube className="w-3 h-3" />
          </div>
          <span className="text-xs font-bold text-white truncate max-w-[400px]">
            {videoTitle}
          </span>
          {currentTimestampSeconds > 0 && (
            <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Seek: {Math.floor(currentTimestampSeconds / 60)}:{String(Math.floor(currentTimestampSeconds % 60)).padStart(2, '0')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 hover:underline"
          >
            <span>Open in YouTube</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-[#21262d] transition-colors"
            title="Close video player"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Embedded 16:9 Iframe Player with timestamp start */}
      <div className="relative aspect-video w-full bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&start=${Math.floor(currentTimestampSeconds)}&rel=0`}
          title={videoTitle}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
};
