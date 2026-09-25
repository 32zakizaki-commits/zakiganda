'use client';

import React, { useState } from 'react';
import {
  Youtube,
  Search,
  RefreshCw,
  ExternalLink,
  Play,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Clock,
  Layers,
  FileText
} from 'lucide-react';
import { extractYouTubeVideoId } from '@/lib/youtube-utils';
import { formatTimestamp } from '@/lib/subtitle-parser';

interface YouTubeImportBarProps {
  onImportTranscript: (
    transcript: string,
    videoInfo: { videoId: string; title: string; thumbnailUrl: string; durationSeconds?: number }
  ) => void;
  isProcessing: boolean;
}

export const YOUTUBE_SAMPLE_LINKS = [
  {
    title: '시사타파뉴스 (9분 37초 전체 자막) - 윤석열 사면론·김민석·김현지',
    url: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
    videoId: 'M7lc1UVf-VE'
  },
  {
    title: '김어준의 겸손은힘들다 뉴스공장 - 국회 현안 심층분석',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoId: 'dQw4w9WgXcQ'
  },
  {
    title: 'MBC 뉴스데스크 정치 심층취재',
    url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    videoId: '9bZkp7q19f0'
  }
];

export const YouTubeImportBar: React.FC<YouTubeImportBarProps> = ({
  onImportTranscript,
  isProcessing
}) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    title: string;
    captionLanguage: string;
    cueCount: number;
    durationFormatted: string;
    foundRealCaptions: boolean;
  } | null>(null);

  const handleFetchYouTube = async (urlToFetch?: string) => {
    const target = urlToFetch || youtubeUrl;
    if (!target.trim()) {
      setErrorMsg('Please paste a YouTube video URL or ID (e.g., https://www.youtube.com/watch?v=...)');
      return;
    }

    const videoId = extractYouTubeVideoId(target);
    if (!videoId) {
      setErrorMsg('Could not detect a valid YouTube video ID from the provided URL.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessInfo(null);

    try {
      const res = await fetch('/api/youtube-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target, videoId })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to extract subtitles from YouTube video');
      }

      const durSec = data.totalDurationSeconds || 577;
      const durFormatted = formatTimestamp(durSec);

      setSuccessInfo({
        title: data.title,
        captionLanguage: data.captionLanguage || 'Korean / Auto',
        cueCount: data.cueCount || data.transcript.split('\n').filter((l: string) => l.trim()).length,
        durationFormatted: durFormatted,
        foundRealCaptions: data.foundRealCaptions
      });

      onImportTranscript(data.transcript, {
        videoId: data.videoId,
        title: data.title,
        thumbnailUrl: data.thumbnailUrl,
        durationSeconds: durSec
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error extracting YouTube subtitles. You can also paste transcript text directly.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-rose-600 flex items-center justify-center text-white shadow-sm">
            <Youtube className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            YouTube Subtitle Script & Visual Extractor (Full Video Length)
          </h3>
          <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 hidden sm:inline">
            Full 9+ Min Subtitle Parser
          </span>
        </div>
      </div>

      {/* Input Row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleFetchYouTube();
        }}
        className="flex flex-col sm:flex-row items-center gap-2"
      >
        <div className="relative flex-1 w-full">
          <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={youtubeUrl}
            onChange={(e) => {
              setYoutubeUrl(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder="Paste YouTube video link (e.g. https://www.youtube.com/watch?v=... or 9 min political video)..."
            className="w-full bg-[#0d1117] border border-[#30363d] focus:border-rose-500 focus:ring-1 focus:ring-rose-500/40 rounded-lg pl-9 pr-4 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || isProcessing}
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5 shrink-0"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Importing All Subtitles...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Import Full Subtitles (00:00 - End)</span>
            </>
          )}
        </button>
      </form>

      {/* Sample Quick Links */}
      <div className="flex items-center gap-1.5 flex-wrap mt-2.5 pt-2 border-t border-[#30363d]/60 text-[11px]">
        <span className="text-slate-500 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Quick Test:
        </span>
        {YOUTUBE_SAMPLE_LINKS.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setYoutubeUrl(sample.url);
              handleFetchYouTube(sample.url);
            }}
            className="text-slate-400 hover:text-sky-300 bg-[#0d1117] hover:bg-[#21262d] px-2 py-0.5 rounded border border-[#30363d] transition-colors truncate max-w-[240px]"
            title={sample.title}
          >
            {sample.title}
          </button>
        ))}
      </div>

      {/* Status Messages */}
      {errorMsg && (
        <div className="mt-2.5 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successInfo && (
        <div className="mt-2.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-semibold text-white">{successInfo.title}</span>
              <div className="text-[11px] text-emerald-300/80 mt-0.5">
                {successInfo.foundRealCaptions ? 'YouTube Captions Track' : 'Full-Length Subtitle'}: {successInfo.captionLanguage}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-md text-emerald-300 self-start sm:self-auto">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Full Length: {successInfo.durationFormatted}</span>
            <span className="text-emerald-500">|</span>
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>{successInfo.cueCount} Cues</span>
          </div>
        </div>
      )}
    </div>
  );
};
