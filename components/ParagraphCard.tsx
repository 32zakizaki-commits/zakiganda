'use client';

import React, { useState } from 'react';
import {
  Clock,
  Maximize2,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  User,
  Sparkles,
  Newspaper,
  Tv,
  FileText,
  Camera,
  Download,
  Play
} from 'lucide-react';
import { IdeaParagraph } from '@/lib/subtitle-parser';
import { NewsImageResult } from '@/lib/news-image-service';
import { convertSvgDataUrlToPngBlob, fetchImageBlobSafe } from '@/lib/zip-download-service';

interface ParagraphCardProps {
  paragraph: IdeaParagraph;
  isActive: boolean;
  onSelect: () => void;
  onOpenZoom: (paragraph: IdeaParagraph) => void;
  onOpenRefine: (paragraph: IdeaParagraph) => void;
  onCycleImage: (paragraphId: string, direction: 'prev' | 'next') => void;
  onSeekVideo?: (timestampSeconds: number) => void;
  hasLinkedVideo?: boolean;
}

export const ParagraphCard: React.FC<ParagraphCardProps> = ({
  paragraph,
  isActive,
  onSelect,
  onOpenZoom,
  onOpenRefine,
  onCycleImage,
  onSeekVideo,
  hasLinkedVideo = false
}) => {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isDownloadingSingle, setIsDownloadingSingle] = useState(false);

  const matchedImg = paragraph.matchedImage;
  const alternatesCount = (paragraph.alternateImages?.length || 0) + (matchedImg ? 1 : 0);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const payload = `[${paragraph.durationLabel}]\n${paragraph.text}\nEntity/Person: ${paragraph.searchQuery}\nSource: ${matchedImg?.outlet || 'Yonhap News'} (${matchedImg?.source || 'Wire'})`;
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSinglePng = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!matchedImg?.url || isDownloadingSingle) return;

    setIsDownloadingSingle(true);
    try {
      let blob: Blob;
      if (matchedImg.url.startsWith('data:image/svg+xml')) {
        blob = await convertSvgDataUrlToPngBlob(matchedImg.url, 1920, 1080);
      } else {
        blob = await fetchImageBlobSafe(matchedImg.url);
      }

      const fileName = `${paragraph.index}.png`;
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Failed to download single image:', err);
    } finally {
      setIsDownloadingSingle(false);
    }
  };

  // Highlight extracted entities inside subtitle text (e.g. Park Jie-won, Rhyu Si-min, Choo Mi-ae, Kim Min-seok)
  const renderHighlightedText = (text: string) => {
    const allEntities = [
      ...paragraph.extractedEntities.people,
      ...paragraph.extractedEntities.locations,
      ...paragraph.extractedEntities.events
    ].filter(Boolean);

    if (allEntities.length === 0) {
      return <span>{text}</span>;
    }

    const sortedEntities = [...allEntities].sort((a, b) => b.length - a.length);
    const escaped = sortedEntities.map(e => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${escaped})`, 'gi');

    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, i) => {
          const isEntity = sortedEntities.some(e => e.toLowerCase() === part.toLowerCase());
          if (isEntity) {
            return (
              <mark
                key={i}
                className="bg-amber-500/20 text-amber-300 px-1 py-0.5 rounded font-semibold border border-amber-500/30"
              >
                {part}
              </mark>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </>
    );
  };

  const getVisualTypeBadge = (img?: NewsImageResult) => {
    const type = img?.visualType;
    switch (type) {
      case 'article_screen':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/25">
            <Newspaper className="w-3 h-3 text-sky-400" />
            <span>기사 캡처 (Article Screen)</span>
          </span>
        );
      case 'tv_broadcast':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/25">
            <Tv className="w-3 h-3 text-rose-400" />
            <span>TV 방송 뉴스 (TV Screen)</span>
          </span>
        );
      case 'editorial_clip':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">
            <FileText className="w-3 h-3 text-amber-400" />
            <span>사설 스크랩 (Editorial Clip)</span>
          </span>
        );
      case 'press_photo':
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
            <Camera className="w-3 h-3 text-emerald-400" />
            <span>보도 사진 (Press Photo)</span>
          </span>
        );
    }
  };

  return (
    <article
      id={paragraph.id}
      onClick={onSelect}
      className={`relative rounded-xl border transition-all duration-200 overflow-hidden ${
        isActive
          ? 'bg-[#161b22] border-sky-500 ring-1 ring-sky-500/50 shadow-2xl shadow-sky-950/40'
          : 'bg-[#161b22]/90 hover:bg-[#161b22] border-[#30363d] hover:border-slate-500 shadow-lg'
      }`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-5">
        {/* =========================================================================
            DETAIL 1 & 2: DURATION & SUBTITLE (Left Column - 7 Cols)
           ========================================================================= */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-4">
          <div>
            {/* DETAIL 1: STRICT DURATION FORMAT */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#0d1117] text-slate-300 border border-[#30363d] flex items-center justify-center text-xs font-mono font-bold">
                  {paragraph.index}
                </span>

                {/* Duration: Start timestamp - End timestamp (e.g., "01:15 - 01:42 (27s)") */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#0d1117] border border-[#30363d] text-amber-400 font-mono text-xs font-semibold tracking-wide shadow-inner">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Duration: {paragraph.durationLabel}</span>
                </div>

                {hasLinkedVideo && onSeekVideo && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSeekVideo(paragraph.startTime);
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-[11px] font-medium text-rose-300 transition-colors"
                    title="Jump to this moment in YouTube player"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Play Video</span>
                  </button>
                )}
              </div>

              {/* Actions: Copy & Individual Download */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleDownloadSinglePng}
                  disabled={isDownloadingSingle}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors"
                  title={`Download single image as ${paragraph.index}.png`}
                >
                  <Download className="w-3 h-3" />
                  <span>{isDownloadingSingle ? 'Saving...' : `${paragraph.index}.png`}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                  title="Copy duration, subtitle and image attribution"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* DETAIL 2: SUBTITLE PARAGRAPH TEXT */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Subtitle Idea Segment</span>
                {paragraph.extractedEntities.people.length > 0 && (
                  <span className="text-amber-400 text-[11px] font-medium flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Person: {paragraph.extractedEntities.people.join(', ')}
                  </span>
                )}
              </div>
              <p className="text-sm md:text-[15px] font-normal text-slate-100 leading-relaxed font-sans select-text">
                {renderHighlightedText(paragraph.text)}
              </p>
            </div>
          </div>

          {/* Extracted Entity Tags / Query Info */}
          <div className="pt-3 border-t border-[#30363d]/60 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 text-[11px]">Matched Person / Query:</span>
              <span className="font-mono text-xs text-sky-300 font-semibold bg-[#0d1117] px-2.5 py-0.5 rounded border border-sky-500/30">
                &ldquo;{paragraph.searchQuery}&rdquo;
              </span>
            </div>

            {matchedImg?.personRole && (
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <span className="text-slate-500">Official Role:</span>
                <span className="text-slate-300 font-medium">{matchedImg.personRole}</span>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            DETAIL 3: HIGH-RESOLUTION NEWS PICTURE / ARTICLE SCREEN (Right Column - 5 Cols)
           ========================================================================= */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between flex-wrap gap-1">
              {getVisualTypeBadge(matchedImg)}

              {/* Sequence Filename Tag & Outlet Badge */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  {paragraph.index}.png
                </span>
                <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 truncate max-w-[150px]">
                  {matchedImg?.outlet || 'Yonhap News (Korea)'}
                </span>
              </div>
            </div>

            {/* Clickable Zoom Image Container */}
            <div
              onClick={() => onOpenZoom(paragraph)}
              className="relative aspect-video w-full rounded-lg overflow-hidden border border-[#30363d] bg-[#0d1117] cursor-pointer group shadow-md"
            >
              {matchedImg?.url && !imageError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={matchedImg.thumbnail || matchedImg.url}
                  alt={matchedImg.title || paragraph.searchQuery}
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-indigo-950 text-center">
                  <Sparkles className="w-6 h-6 text-sky-400 mb-1" />
                  <p className="text-xs font-semibold text-slate-200">Verified Press Photo & Article Archive</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{paragraph.searchQuery}</p>
                </div>
              )}

              {/* Zoom Hover Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 text-white text-xs font-medium border border-white/20 shadow-xl">
                  <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Click to Zoom</span>
                </span>
              </div>

              {/* Caption Scrim Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none">
                <p className="text-[11px] text-white/95 font-medium line-clamp-1 leading-tight">
                  {matchedImg?.title || paragraph.searchQuery}
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  Source: {matchedImg?.source || 'Yonhap News Press Pool'}
                </p>
              </div>
            </div>
          </div>

          {/* Picture Actions Toolbar: Refine Query & Candidate Switcher */}
          <div className="flex items-center justify-between gap-2 pt-1">
            {/* Refine Query Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenRefine(paragraph);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] hover:border-sky-500/60 text-xs font-medium text-slate-300 hover:text-white transition-all shadow-sm"
              title="Manually adjust search terms or select alternative photos / article screens"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
              <span>Change Screen / Refine</span>
            </button>

            {/* Candidate Image Switcher if available */}
            {alternatesCount > 1 && (
              <div className="flex items-center gap-1 bg-[#0d1117] px-2 py-1 rounded-lg border border-[#30363d]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCycleImage(paragraph.id, 'prev');
                  }}
                  className="p-1 text-slate-400 hover:text-white hover:bg-[#21262d] rounded transition-colors"
                  title="Previous image / article screen"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono text-slate-400 px-1">
                  {(paragraph.selectedImageIndex || 0) + 1}/{alternatesCount}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCycleImage(paragraph.id, 'next');
                  }}
                  className="p-1 text-slate-400 hover:text-white hover:bg-[#21262d] rounded transition-colors"
                  title="Next image / article screen"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
