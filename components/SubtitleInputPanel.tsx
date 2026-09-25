'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Sliders,
  Sparkles,
  Play,
  RotateCcw,
  Check,
  Flame,
  Cpu,
  Building,
  Trophy,
  Newspaper,
  Tv,
  Camera,
  Layers,
  Youtube,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { GroupingSensitivity } from '@/lib/subtitle-parser';
import { PublisherFilter, VisualDisplayMode } from '@/lib/news-image-service';
import { SUBTITLE_PRESETS, SubtitlePreset } from '@/lib/presets';
import { extractYouTubeVideoId } from '@/lib/youtube-utils';
import { YOUTUBE_SAMPLE_LINKS } from './YouTubeImportBar';

interface InputPanelProps {
  subtitleText: string;
  onChangeSubtitleText: (text: string) => void;
  sensitivity: GroupingSensitivity;
  onChangeSensitivity: (s: GroupingSensitivity) => void;
  publisherFilter: PublisherFilter;
  onChangePublisherFilter: (f: PublisherFilter) => void;
  visualMode?: VisualDisplayMode | 'smart_auto';
  onChangeVisualMode?: (m: VisualDisplayMode | 'smart_auto') => void;
  onProcess: () => void;
  onClear: () => void;
  isProcessing: boolean;
  selectedPresetId?: string;
  onSelectPreset: (preset: SubtitlePreset) => void;
  onImportYouTube?: (transcript: string, videoInfo: { videoId: string; title: string; thumbnailUrl: string }) => void;
  totalBlocksExtracted?: number;
  linkedVideoInfo?: { videoId: string; title: string; thumbnailUrl?: string } | null;
}

export const SubtitleInputPanel: React.FC<InputPanelProps> = ({
  subtitleText,
  onChangeSubtitleText,
  sensitivity,
  onChangeSensitivity,
  visualMode = 'smart_auto',
  onChangeVisualMode,
  onProcess,
  onClear,
  isProcessing,
  selectedPresetId,
  onSelectPreset,
  onImportYouTube,
  totalBlocksExtracted = 0,
  linkedVideoInfo = null
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [youtubeInputUrl, setYoutubeInputUrl] = useState('');
  const [isFetchingYouTube, setIsFetchingYouTube] = useState(false);
  const [ytErrorMsg, setYtErrorMsg] = useState<string | null>(null);
  const [ytSuccessMsg, setYtSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFetchYouTubeLink = async (urlToFetch?: string) => {
    const target = urlToFetch || youtubeInputUrl;
    if (!target.trim()) {
      setYtErrorMsg('Please enter a YouTube video URL or ID (e.g. https://www.youtube.com/watch?v=...)');
      return;
    }

    const videoId = extractYouTubeVideoId(target);
    if (!videoId) {
      setYtErrorMsg('Invalid YouTube URL. Please check the video link.');
      return;
    }

    setIsFetchingYouTube(true);
    setYtErrorMsg(null);
    setYtSuccessMsg(null);

    try {
      const res = await fetch('/api/youtube-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target, videoId })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to extract captions from YouTube video');
      }

      setYtSuccessMsg(`Loaded subtitles from: "${data.title}"`);
      onChangeSubtitleText(data.transcript);

      if (onImportYouTube) {
        onImportYouTube(data.transcript, {
          videoId: data.videoId,
          title: data.title,
          thumbnailUrl: data.thumbnailUrl
        });
      }
    } catch (err: any) {
      console.error(err);
      setYtErrorMsg(err.message || 'Error extracting YouTube subtitles.');
    } finally {
      setIsFetchingYouTube(false);
    }
  };

  const handleFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        onChangeSubtitleText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const sensitivityOptions: Array<{
    id: GroupingSensitivity;
    title: string;
    description: string;
    badge: string;
  }> = [
    {
      id: 'idea_block',
      title: 'By Idea Block (Default: ~15-30s)',
      description: 'Groups coherent thoughts around specific persons or subjects (2-4 sentences)',
      badge: 'Zero Duplicates Optimized'
    },
    {
      id: 'sentence',
      title: 'By Sentence (~8-15s)',
      description: 'Splits strictly on grammatical sentence endpoints (. ? !)',
      badge: 'Fine Granularity'
    },
    {
      id: 'fixed_window',
      title: '30s Fixed Window',
      description: 'Standard 25-30 second broadcast video intervals',
      badge: 'Fixed Duration'
    }
  ];

  const getPresetIcon = (id: string) => {
    switch (id) {
      case 'korea-park-jiewon-yoon-pardon':
        return <Flame className="w-3.5 h-3.5 text-amber-400" />;
      case 'korea-democratic-factions':
        return <Flame className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const visualModeOptions: Array<{
    id: VisualDisplayMode | 'smart_auto';
    label: string;
    desc: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'smart_auto',
      label: 'Smart Auto',
      desc: 'Zero-duplicate blend of article screens & press photos',
      icon: <Layers className="w-3.5 h-3.5 text-sky-400" />
    },
    {
      id: 'article_screen',
      label: 'Article Screens (기사 캡처)',
      desc: 'Digital news portal screenshot with subtitle quotes & headline',
      icon: <Newspaper className="w-3.5 h-3.5 text-emerald-400" />
    },
    {
      id: 'tv_broadcast',
      label: 'TV News Broadcast (방송 뉴스)',
      desc: '16:9 TV news breaking chyron with studio graphics',
      icon: <Tv className="w-3.5 h-3.5 text-rose-400" />
    },
    {
      id: 'press_photo',
      label: 'Press Photos (보도 사진)',
      desc: 'High-resolution press pool portraits and assembly photos',
      icon: <Camera className="w-3.5 h-3.5 text-amber-400" />
    }
  ];

  const lineCount = subtitleText ? subtitleText.trim().split('\n').length : 0;

  return (
    <section className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-2xl flex flex-col gap-4">
      {/* Top Header */}
      <div className="flex flex-col gap-2 pb-3 border-b border-[#30363d]">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              YouTube Subtitle Script &amp; Visual Extractor
            </h2>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Zero Duplicate Pictures
            </span>
          </div>

          {totalBlocksExtracted > 0 && (
            <span className="text-xs font-mono text-sky-400 bg-[#0d1117] px-2.5 py-0.5 rounded border border-sky-500/30">
              {totalBlocksExtracted} Unique Visuals Ready
            </span>
          )}
        </div>

        <p className="text-xs text-slate-400">
          Paste YouTube video links or transcript text below to extract matching news pictures and article screenshots for each paragraph.
        </p>
      </div>

      {/* DIRECT FEATURE: Import Subtitles from YouTube Link */}
      <div className="p-3.5 rounded-lg bg-[#0d1117] border border-rose-500/30 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white flex items-center gap-1.5">
            <Youtube className="w-4 h-4 text-rose-500" />
            <span>Import Subtitles from YouTube Video Link:</span>
          </label>
          <span className="text-[10px] text-rose-400 font-mono">
            Auto-Fetch Subtitles
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={youtubeInputUrl}
              onChange={(e) => {
                setYoutubeInputUrl(e.target.value);
                if (ytErrorMsg) setYtErrorMsg(null);
              }}
              placeholder="Paste YouTube URL (e.g. https://www.youtube.com/watch?v=...)..."
              className="w-full bg-[#161b22] border border-[#30363d] focus:border-rose-500 focus:ring-1 focus:ring-rose-500/40 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => handleFetchYouTubeLink()}
            disabled={isFetchingYouTube || isProcessing}
            className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            {isFetchingYouTube ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Import &amp; Extract</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Test YouTube Links */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
          <span className="text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Try Samples:
          </span>
          {YOUTUBE_SAMPLE_LINKS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setYoutubeInputUrl(sample.url);
                handleFetchYouTubeLink(sample.url);
              }}
              className="text-slate-400 hover:text-sky-300 bg-[#161b22] hover:bg-[#21262d] px-2 py-0.5 rounded border border-[#30363d] transition-colors truncate max-w-[190px]"
              title={sample.title}
            >
              {sample.title}
            </button>
          ))}
        </div>

        {/* Status Messages */}
        {ytErrorMsg && (
          <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{ytErrorMsg}</span>
          </div>
        )}

        {ytSuccessMsg && (
          <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{ytSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Sample Script Presets */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Or Choose Sample Script Presets:</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {SUBTITLE_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm ring-1 ring-sky-500/30 font-semibold'
                    : 'bg-[#0d1117] hover:bg-[#21262d] text-slate-300 hover:text-white border border-[#30363d]'
                }`}
                title={preset.description}
              >
                {getPresetIcon(preset.id)}
                <span className="truncate max-w-[220px]">{preset.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Textarea Input Displaying Subtitle Script */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>Current Subtitle Script &amp; Timestamps:</span>
          </label>
          <span className="text-[11px] font-mono text-slate-400">
            {lineCount} cues loaded
          </span>
        </div>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative rounded-lg border transition-all ${
            dragActive
              ? 'border-sky-500 bg-sky-950/20 ring-2 ring-sky-500/20'
              : 'border-[#30363d] bg-[#0d1117]'
          }`}
        >
          <textarea
            value={subtitleText}
            onChange={(e) => onChangeSubtitleText(e.target.value)}
            placeholder={`Paste YouTube subtitles or transcripts with timestamps here...\n\nExample:\n[00:00] 현 시점에서 박지원 하면 김민석을 당대표로 만든 주역으로 보입니다.\n[00:05] 오늘이 사람이 윤석열 사면 언급을 했습니다.\n[00:21] 그러나 박지원은 박근혜는 사과했지만 윤석일은 사과가 없다...`}
            rows={8}
            className="w-full bg-transparent p-3.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none resize-none leading-relaxed"
          />

          {/* Upload & Clear Bar */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#161b22]/90 border-t border-[#30363d] rounded-b-lg">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-[11px] font-medium text-slate-300 hover:text-white transition-colors"
              >
                <UploadCloud className="w-3.5 h-3.5 text-sky-400" />
                <span>Upload .SRT / .VTT</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".srt,.vtt,.txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                }}
              />
            </div>

            {subtitleText && (
              <button
                type="button"
                onClick={onClear}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear Script</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Visual Mode Selector (Article Screen vs TV Chyron vs Press Photo) */}
      {onChangeVisualMode && (
        <div>
          <label className="text-xs font-semibold text-slate-200 flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5">
              <Newspaper className="w-3.5 h-3.5 text-emerald-400" />
              <span>Extracted Visual Style Mode:</span>
            </span>
            <span className="text-[10px] text-slate-400">
              Customize screenshot vs press photo
            </span>
          </label>

          <div className="grid grid-cols-2 gap-2">
            {visualModeOptions.map((opt) => {
              const isSelected = visualMode === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeVisualMode(opt.id)}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'bg-sky-500/20 border-sky-500/50 text-white shadow-sm ring-1 ring-sky-500/30'
                      : 'bg-[#0d1117] hover:bg-[#21262d] border-[#30363d] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-medium text-xs">
                    {opt.icon}
                    <span className={isSelected ? 'text-sky-300 font-bold' : ''}>{opt.label}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                    {opt.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Paragraph Grouping Sensitivity */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span>Idea Segmentation Granularity:</span>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          {sensitivityOptions.map((opt) => {
            const isActive = sensitivity === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeSensitivity(opt.id)}
                className={`text-left p-2.5 rounded-lg border transition-all flex items-start justify-between gap-2 ${
                  isActive
                    ? 'bg-[#1f2937] border-sky-500/50 shadow-sm'
                    : 'bg-[#0d1117] hover:bg-[#21262d] border-[#30363d] opacity-80 hover:opacity-100'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {opt.title}
                    </span>
                    {opt.id === 'idea_block' && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/30">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                    {opt.description}
                  </p>
                </div>
                {isActive && <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Process Button */}
      <button
        type="button"
        onClick={onProcess}
        disabled={isProcessing || !subtitleText.trim()}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${
          isProcessing
            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
            : !subtitleText.trim()
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 hover:from-sky-400 hover:to-indigo-400 text-white shadow-sky-500/20 hover:scale-[1.01] active:scale-[0.99]'
        }`}
      >
        {isProcessing ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-sky-300" />
            <span>Extracting Paragraphs &amp; News Pictures...</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-current" />
            <span>Extract Each Paragraph &amp; Article Screen (Zero Duplicates)</span>
          </>
        )}
      </button>
    </section>
  );
};
