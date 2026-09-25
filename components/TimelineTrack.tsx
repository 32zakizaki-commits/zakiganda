'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, Volume2, Maximize2 } from 'lucide-react';
import { IdeaParagraph, formatTimestamp } from '@/lib/subtitle-parser';

interface TimelineTrackProps {
  paragraphs: IdeaParagraph[];
  activeParagraphId: string | null;
  onSelectParagraph: (id: string) => void;
  onSeekSeconds?: (seconds: number) => void;
  totalDuration?: number;
}

export const TimelineTrack: React.FC<TimelineTrackProps> = ({
  paragraphs,
  activeParagraphId,
  onSelectParagraph,
  onSeekSeconds,
  totalDuration: propTotalDuration
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayTime, setCurrentPlayTime] = useState(0);

  const totalDuration = propTotalDuration || (paragraphs.length > 0 ? paragraphs[paragraphs.length - 1].endTime : 0);

  useEffect(() => {
    let interval: any = null;
    if (isPlaying && totalDuration > 0) {
      interval = setInterval(() => {
        setCurrentPlayTime((prev) => {
          const next = prev + 0.2;
          if (next >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          // Auto sync active paragraph based on time
          const currentPara = paragraphs.find(p => next >= p.startTime && next < p.endTime);
          if (currentPara && currentPara.id !== activeParagraphId) {
            onSelectParagraph(currentPara.id);
          }
          return next;
        });
      }, 200);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, totalDuration, paragraphs, activeParagraphId, onSelectParagraph]);

  if (paragraphs.length === 0 || totalDuration === 0) {
    return null;
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = ratio * totalDuration;
    setCurrentPlayTime(targetTime);

    const match = paragraphs.find(p => targetTime >= p.startTime && targetTime <= p.endTime);
    if (match) {
      onSelectParagraph(match.id);
    }
  };

  // Generate timecode ruler marks
  const tickInterval = totalDuration > 120 ? 30 : 15;
  const tickCount = Math.floor(totalDuration / tickInterval);
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => i * tickInterval);

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 mb-8 shadow-xl">
      {/* Timeline Controls Header */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#30363d]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#0d1117] p-1 rounded-lg border border-[#30363d]">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-1.5 rounded-md transition-colors ${
                isPlaying ? 'bg-amber-500 text-black' : 'bg-sky-500 text-white hover:bg-sky-400'
              }`}
              title={isPlaying ? 'Pause Timeline' : 'Play Timeline Preview'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentPlayTime(0);
                if (paragraphs[0]) onSelectParagraph(paragraphs[0].id);
              }}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-[#21262d] transition-colors"
              title="Rewind to Start"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-sky-400 font-bold bg-[#0d1117] px-2 py-1 rounded border border-[#30363d]">
              {formatTimestamp(currentPlayTime, true)}
            </span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">
              {formatTimestamp(totalDuration, true)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="hidden sm:inline">Linear Idea Sequence:</span>
          <span className="font-mono text-slate-200 font-semibold">{paragraphs.length} Semantic Blocks</span>
        </div>
      </div>

      {/* Interactive Timeline Ruler & Track */}
      <div className="mt-4 pt-1">
        {/* Timecode Ruler */}
        <div className="relative h-4 w-full mb-1 text-[10px] font-mono text-slate-500 select-none">
          {ticks.map((t) => {
            const leftPercent = (t / totalDuration) * 100;
            return (
              <div
                key={t}
                className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${leftPercent}%` }}
              >
                <span>{formatTimestamp(t)}</span>
                <div className="w-[1px] h-1.5 bg-slate-600 mt-0.5" />
              </div>
            );
          })}
        </div>

        {/* Linear Block Bar */}
        <div
          onClick={handleSeek}
          className="relative h-12 w-full bg-[#0d1117] rounded-lg border border-[#30363d] overflow-hidden cursor-pointer group select-none shadow-inner"
        >
          {/* Paragraph Blocks */}
          <div className="absolute inset-0 flex h-full">
            {paragraphs.map((p, idx) => {
              const widthPercent = ((p.endTime - p.startTime) / totalDuration) * 100;
              const isActive = activeParagraphId === p.id;
              const colorSchemes = [
                'bg-indigo-950/80 hover:bg-indigo-900/90 border-indigo-700/50 text-indigo-200',
                'bg-sky-950/80 hover:bg-sky-900/90 border-sky-700/50 text-sky-200',
                'bg-emerald-950/80 hover:bg-emerald-900/90 border-emerald-700/50 text-emerald-200',
                'bg-amber-950/80 hover:bg-amber-900/90 border-amber-700/50 text-amber-200',
                'bg-purple-950/80 hover:bg-purple-900/90 border-purple-700/50 text-purple-200'
              ];
              const scheme = colorSchemes[idx % colorSchemes.length];

              return (
                <div
                  key={p.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectParagraph(p.id);
                    setCurrentPlayTime(p.startTime);
                  }}
                  style={{ width: `${widthPercent}%` }}
                  className={`relative h-full border-r border-y transition-all flex flex-col justify-center px-2 overflow-hidden ${scheme} ${
                    isActive ? 'ring-2 ring-sky-400 z-10 brightness-125' : ''
                  }`}
                  title={`[${p.durationLabel}] ${p.searchQuery}`}
                >
                  <div className="flex items-center justify-between text-[11px] font-semibold truncate leading-tight">
                    <span className="truncate">#{p.index} {p.searchQuery}</span>
                  </div>
                  <div className="text-[9px] font-mono text-slate-400 truncate opacity-75">
                    {Math.round(p.duration)}s
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scrubbing Playhead Indicator */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-amber-400 z-20 pointer-events-none transition-all duration-75 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
            style={{ left: `${(currentPlayTime / totalDuration) * 100}%` }}
          >
            <div className="w-2.5 h-2.5 bg-amber-400 rounded-full -ml-[4px] -mt-[3px] shadow" />
          </div>
        </div>
      </div>
    </div>
  );
};
