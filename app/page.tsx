'use client';

import React, { useState, useEffect, useRef } from 'react';
import { VideoEditorHeader } from '@/components/VideoEditorHeader';
import { YouTubeImportBar } from '@/components/YouTubeImportBar';
import { YouTubePlayerCard } from '@/components/YouTubePlayerCard';
import { SubtitleInputPanel } from '@/components/SubtitleInputPanel';
import { TimelineTrack } from '@/components/TimelineTrack';
import { ParagraphCard } from '@/components/ParagraphCard';
import { ZoomModal } from '@/components/ZoomModal';
import { RefineQueryModal } from '@/components/RefineQueryModal';
import { ZipDownloadModal } from '@/components/ZipDownloadModal';
import {
  parseSubtitlesToCues,
  groupCuesIntoIdeaParagraphs,
  IdeaParagraph,
  GroupingSensitivity
} from '@/lib/subtitle-parser';
import { extractEntitiesFromParagraph, generateSearchQuery } from '@/lib/nlp-entity-extractor';
import {
  buildAllVisualsForParagraph,
  NewsImageResult,
  VisualDisplayMode
} from '@/lib/news-image-service';
import {
  downloadAllPicturesAsZip,
  ZipDownloadProgress
} from '@/lib/zip-download-service';
import { SUBTITLE_PRESETS, SubtitlePreset } from '@/lib/presets';
import { ShieldCheck, FileArchive, Sparkles } from 'lucide-react';

const processParagraphsFromText = (
  rawText: string,
  sensitivity: GroupingSensitivity,
  visualMode: VisualDisplayMode | 'smart_auto' = 'smart_auto'
): IdeaParagraph[] => {
  if (!rawText || !rawText.trim()) return [];

  const cues = parseSubtitlesToCues(rawText);
  const rawParagraphs = groupCuesIntoIdeaParagraphs(cues, { sensitivity });

  const usedUrls = new Set<string>();

  return rawParagraphs.map((rawPara, idx) => {
    const nlpResult = extractEntitiesFromParagraph(rawPara.text);
    const searchQuery = generateSearchQuery(nlpResult, rawPara.text);
    const personName = nlpResult.matchedPerson?.name;

    const visuals = buildAllVisualsForParagraph(
      rawPara.text,
      idx,
      rawPara.durationLabel,
      personName,
      usedUrls
    );

    let primary: NewsImageResult;
    const lower = rawPara.text.toLowerCase();

    if (visualMode === 'article_screen') {
      primary = visuals.articleScreen;
    } else if (visualMode === 'tv_broadcast') {
      primary = visuals.tvBroadcastScreen;
    } else if (visualMode === 'editorial_clip') {
      primary = visuals.editorialClip;
    } else if (visualMode === 'press_photo') {
      if (visuals.pressPhoto && !usedUrls.has(visuals.pressPhoto.url)) {
        primary = visuals.pressPhoto;
      } else {
        primary = visuals.articleScreen;
      }
    } else {
      // Smart Auto (Zero Duplicates - Each paragraph receives its distinct unique visual)
      if (lower.includes('사설') || lower.includes('editorial') || lower.includes('논평') || lower.includes('칼럼')) {
        primary = visuals.editorialClip;
      } else if (lower.includes('>>') || lower.includes('tv') || lower.includes('방송') || lower.includes('특보') || lower.includes('속보')) {
        primary = visuals.tvBroadcastScreen;
      } else if (visuals.pressPhoto && !usedUrls.has(visuals.pressPhoto.url)) {
        primary = visuals.pressPhoto;
      } else {
        // Cycle between Article Screen and TV Screen with unique styles per paragraph
        primary = (idx % 2 === 0) ? visuals.articleScreen : visuals.tvBroadcastScreen;
      }
    }

    usedUrls.add(primary.url);
    const alternates = visuals.allCandidates.filter(c => c.url !== primary.url);

    return {
      ...rawPara,
      extractedEntities: {
        people: nlpResult.people,
        locations: nlpResult.locations,
        events: nlpResult.events,
        coreKeywords: nlpResult.coreKeywords
      },
      searchQuery,
      publisherFilter: 'korea',
      matchedImage: primary,
      alternateImages: alternates,
      selectedImageIndex: 0
    };
  });
};

export default function Home() {
  const [subtitleText, setSubtitleText] = useState<string>(() => SUBTITLE_PRESETS[0]?.content || '');
  const [sensitivity, setSensitivity] = useState<GroupingSensitivity>('idea_block');
  const [visualMode, setVisualMode] = useState<VisualDisplayMode | 'smart_auto'>('smart_auto');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(() => SUBTITLE_PRESETS[0]?.id || 'korea-park-jiewon-yoon-pardon');
  const [paragraphs, setParagraphs] = useState<IdeaParagraph[]>(() =>
    processParagraphsFromText(SUBTITLE_PRESETS[0]?.content || '', 'idea_block', 'smart_auto')
  );
  const [activeParagraphId, setActiveParagraphId] = useState<string | null>(() => 'para-1');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Linked YouTube video state
  const [linkedVideoId, setLinkedVideoId] = useState<string | null>(null);
  const [linkedVideoTitle, setLinkedVideoTitle] = useState<string>('');
  const [currentVideoTimestamp, setCurrentVideoTimestamp] = useState<number>(0);

  // ZIP Download state & modal
  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);
  const [zipProgress, setZipProgress] = useState<ZipDownloadProgress | null>(null);
  const [isZipModalOpen, setIsZipModalOpen] = useState<boolean>(false);

  // Modals state
  const [zoomParagraph, setZoomParagraph] = useState<IdeaParagraph | null>(null);
  const [refineParagraph, setRefineParagraph] = useState<IdeaParagraph | null>(null);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleProcessWithText = (
    rawText: string,
    currentSens: GroupingSensitivity,
    currentMode: VisualDisplayMode | 'smart_auto'
  ) => {
    if (!rawText || !rawText.trim()) {
      setParagraphs([]);
      setActiveParagraphId(null);
      return;
    }
    setIsProcessing(true);

    try {
      const processed = processParagraphsFromText(rawText, currentSens, currentMode);
      setParagraphs(processed);
      if (processed.length > 0) {
        setActiveParagraphId(processed[0].id);
      }
    } catch (err) {
      console.error('Processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Debounced auto-processing when subtitleText or modes change
  const handleSubtitleTextChange = (newText: string) => {
    setSubtitleText(newText);
    if (selectedPresetId) setSelectedPresetId('');

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      handleProcessWithText(newText, sensitivity, visualMode);
    }, 350);
  };

  const handleImportYouTubeTranscript = (
    transcript: string,
    videoInfo: { videoId: string; title: string; thumbnailUrl: string }
  ) => {
    setSubtitleText(transcript);
    setLinkedVideoId(videoInfo.videoId);
    setLinkedVideoTitle(videoInfo.title);
    setSelectedPresetId('');
    handleProcessWithText(transcript, sensitivity, visualMode);
  };

  const handleSelectPreset = (preset: SubtitlePreset) => {
    setSelectedPresetId(preset.id);
    setSubtitleText(preset.content);
    setLinkedVideoId(null);
    handleProcessWithText(preset.content, sensitivity, visualMode);
  };

  const handleProcess = () => {
    handleProcessWithText(subtitleText, sensitivity, visualMode);
  };

  const handleClear = () => {
    setSubtitleText('');
    setParagraphs([]);
    setActiveParagraphId(null);
    setSelectedPresetId('');
    setLinkedVideoId(null);
  };

  const handleCycleImage = (paragraphId: string, direction: 'prev' | 'next') => {
    setParagraphs((prev) =>
      prev.map((p) => {
        if (p.id !== paragraphId) return p;
        const all = [p.matchedImage, ...(p.alternateImages || [])].filter(Boolean) as NewsImageResult[];
        if (all.length <= 1) return p;

        let nextIdx = (p.selectedImageIndex || 0) + (direction === 'next' ? 1 : -1);
        if (nextIdx >= all.length) nextIdx = 0;
        if (nextIdx < 0) nextIdx = all.length - 1;

        return {
          ...p,
          matchedImage: all[nextIdx],
          selectedImageIndex: nextIdx
        };
      })
    );
  };

  const handleApplyRefinedImage = (
    paragraphId: string,
    query: string,
    image: NewsImageResult
  ) => {
    setParagraphs((prev) =>
      prev.map((p) => {
        if (p.id !== paragraphId) return p;
        return {
          ...p,
          searchQuery: query,
          matchedImage: image,
          selectedImageIndex: 0
        };
      })
    );
    setRefineParagraph(null);
  };

  const handleSelectParagraph = (paraId: string) => {
    setActiveParagraphId(paraId);
    const target = paragraphs.find((p) => p.id === paraId);
    if (target) {
      setCurrentVideoTimestamp(target.startTime);
    }
  };

  const handleTimelineSeek = (seconds: number) => {
    setCurrentVideoTimestamp(seconds);
    const matched = paragraphs.find((p) => seconds >= p.startTime && seconds < p.endTime);
    if (matched) {
      setActiveParagraphId(matched.id);
    }
  };

  const handleDownloadAllZip = async () => {
    if (paragraphs.length === 0) return;
    setIsDownloadingZip(true);
    setIsZipModalOpen(true);
    setZipProgress({
      current: 0,
      total: paragraphs.length,
      percentage: 0,
      status: 'Initializing storyboard images...'
    });

    try {
      await downloadAllPicturesAsZip(paragraphs, (progress) => {
        setZipProgress(progress);
      });
    } catch (err: any) {
      console.error('ZIP download error:', err);
      setZipProgress({
        current: 0,
        total: paragraphs.length,
        percentage: 0,
        status: `Error: ${err.message || 'Failed to download ZIP'}`
      });
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const totalDuration = paragraphs.reduce((acc, curr) => Math.max(acc, curr.endTime), 0);

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(paragraphs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'newssync-korea-script.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportStoryboard = () => {
    let md = '# NewsSync Korea - Video Storyboard Export\n\n';
    md += `**Total Blocks:** ${paragraphs.length} | **Total Duration:** ${totalDuration}s | **Zero Duplicates Policy:** Enforced\n`;
    md += `**Image Numbering:** 1.png to ${paragraphs.length}.png (1 is first in subtitle at 00:00)\n\n---\n\n`;
    paragraphs.forEach((p, idx) => {
      const num = idx + 1;
      md += `### [${num}.png] Paragraph ${p.index}: ${p.durationLabel}\n\n`;
      md += `**Subtitle Text:**\n> ${p.text}\n\n`;
      md += `**Visual Type:** ${p.matchedImage?.visualType || 'article_screen'} | **Outlet:** ${p.matchedImage?.outlet || 'Kyunghyang Shinmun'}\n`;
      md += `**Headline:** ${p.matchedImage?.title || p.searchQuery}\n\n---\n\n`;
    });
    const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(md);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'newssync-storyboard.md');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDownloadHtml = () => {
    window.open('/index.html', '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30">
      {/* App Header */}
      <VideoEditorHeader
        totalParagraphs={paragraphs.length}
        totalDurationSeconds={totalDuration}
        onExportJSON={handleExportJSON}
        onExportStoryboard={handleExportStoryboard}
        onDownloadHtml={handleDownloadHtml}
        onDownloadAllZip={handleDownloadAllZip}
        isProcessing={isProcessing}
        isDownloadingZip={isDownloadingZip}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* LEFT COLUMN: YouTube Subtitle Script & Visual Extractor (4 Cols) */}
        <section className="xl:col-span-4 flex flex-col gap-4">
          <SubtitleInputPanel
            subtitleText={subtitleText}
            onChangeSubtitleText={handleSubtitleTextChange}
            selectedPresetId={selectedPresetId}
            onSelectPreset={handleSelectPreset}
            onImportYouTube={handleImportYouTubeTranscript}
            linkedVideoInfo={linkedVideoId ? { videoId: linkedVideoId, title: linkedVideoTitle } : null}
            sensitivity={sensitivity}
            onChangeSensitivity={(s) => {
              setSensitivity(s);
              if (subtitleText.trim()) {
                handleProcessWithText(subtitleText, s, visualMode);
              }
            }}
            publisherFilter="korea"
            onChangePublisherFilter={() => {}}
            visualMode={visualMode}
            onChangeVisualMode={(mode) => {
              setVisualMode(mode);
              if (subtitleText.trim()) {
                handleProcessWithText(subtitleText, sensitivity, mode);
              }
            }}
            onProcess={handleProcess}
            onClear={handleClear}
            isProcessing={isProcessing}
            totalBlocksExtracted={paragraphs.length}
          />

          {/* Linked YouTube Player Component (if YouTube video imported) */}
          {linkedVideoId && (
            <YouTubePlayerCard
              videoId={linkedVideoId}
              videoTitle={linkedVideoTitle}
              currentTimestampSeconds={currentVideoTimestamp}
              onClose={() => setLinkedVideoId(null)}
            />
          )}

          {/* Quick ZIP Download Info Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#161b22] to-[#1c2128] border border-[#30363d] shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileArchive className="w-4 h-4 text-emerald-400" />
                <span>Download Numbered Pictures</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                1.png, 2.png...
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Export all <strong className="text-white">{paragraphs.length} story visuals</strong> into a single ZIP archive. Image 1 is the first subtitle block, matching video editor storyboard sequences perfectly.
            </p>
            <button
              type="button"
              onClick={handleDownloadAllZip}
              disabled={paragraphs.length === 0 || isDownloadingZip}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <FileArchive className="w-4 h-4" />
              <span>Download All {paragraphs.length} Pictures (.ZIP)</span>
            </button>
          </div>
        </section>

        {/* RIGHT COLUMN: Timeline Track & Idea Paragraphs (8 Cols) */}
        <section className="xl:col-span-8 flex flex-col gap-5">
          {/* Top YouTube Subtitle Quick Importer Bar */}
          <YouTubeImportBar
            onImportTranscript={handleImportYouTubeTranscript}
            isProcessing={isProcessing}
          />

          {/* Interactive Timeline Bar */}
          <TimelineTrack
            paragraphs={paragraphs}
            activeParagraphId={activeParagraphId}
            onSelectParagraph={handleSelectParagraph}
            onSeekSeconds={handleTimelineSeek}
            totalDuration={totalDuration}
          />

          {/* Dynamic Paragraph Cards Grid / Storyboard */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Extracted Storyboard Paragraphs ({paragraphs.length} blocks)
                </h2>
                <span className="text-xs text-slate-400 font-mono">
                  ⏱️ 00:00 - {paragraphs[paragraphs.length - 1]?.durationLabel.split('-')[1]?.trim() || 'End'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Unique Visuals · Zero Duplicates</span>
              </div>
            </div>

            {paragraphs.length === 0 ? (
              <div className="p-12 text-center rounded-xl bg-[#161b22] border border-[#30363d] space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-200">No Subtitles Extracted Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Import a YouTube video link above, select one of the Korean news presets, or paste your transcript in the left panel to generate article screenshots and TV chyrons.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {paragraphs.map((para) => (
                  <ParagraphCard
                    key={para.id}
                    paragraph={para}
                    isActive={para.id === activeParagraphId}
                    onSelect={() => handleSelectParagraph(para.id)}
                    onZoom={() => setZoomParagraph(para)}
                    onRefine={() => setRefineParagraph(para)}
                    onCycleImage={(dir) => handleCycleImage(para.id, dir)}
                    onSeekVideo={linkedVideoId ? (sec) => handleTimelineSeek(sec) : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Zoom Modal */}
      {zoomParagraph && (
        <ZoomModal
          isOpen={!!zoomParagraph}
          paragraph={zoomParagraph}
          onClose={() => setZoomParagraph(null)}
          onSelectAlternate={(idx) => {
            setParagraphs((prev) =>
              prev.map((p) => {
                if (p.id !== zoomParagraph.id) return p;
                const all = [p.matchedImage, ...(p.alternateImages || [])].filter(Boolean) as NewsImageResult[];
                return {
                  ...p,
                  matchedImage: all[idx] || p.matchedImage,
                  selectedImageIndex: idx
                };
              })
            );
            setZoomParagraph(null);
          }}
        />
      )}

      {/* Refine Search Modal */}
      {refineParagraph && (
        <RefineQueryModal
          isOpen={!!refineParagraph}
          paragraph={refineParagraph}
          onClose={() => setRefineParagraph(null)}
          onApplyRefinedImage={(query, img) => handleApplyRefinedImage(refineParagraph.id, query, img)}
        />
      )}

      {/* ZIP Download Modal */}
      <ZipDownloadModal
        isOpen={isZipModalOpen}
        onClose={() => setIsZipModalOpen(false)}
        progress={zipProgress}
        totalItems={paragraphs.length}
      />
    </div>
  );
}
