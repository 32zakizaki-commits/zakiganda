'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, Sparkles, Check, Globe, RefreshCw } from 'lucide-react';
import { IdeaParagraph } from '@/lib/subtitle-parser';
import { NewsImageResult, PublisherFilter, searchNewsPictures } from '@/lib/news-image-service';

interface RefineQueryModalProps {
  paragraph: IdeaParagraph | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyImage: (paragraphId: string, query: string, image: NewsImageResult) => void;
}

export const RefineQueryModal: React.FC<RefineQueryModalProps> = ({
  paragraph,
  isOpen,
  onClose,
  onApplyImage
}) => {
  if (!isOpen || !paragraph) return null;

  return (
    <RefineQueryModalContent
      key={paragraph.id}
      paragraph={paragraph}
      onClose={onClose}
      onApplyImage={onApplyImage}
    />
  );
};

interface ContentProps {
  paragraph: IdeaParagraph;
  onClose: () => void;
  onApplyImage: (paragraphId: string, query: string, image: NewsImageResult) => void;
}

const RefineQueryModalContent: React.FC<ContentProps> = ({
  paragraph,
  onClose,
  onApplyImage
}) => {
  const [queryInput, setQueryInput] = useState<string>(paragraph.searchQuery || '');
  const [publisher, setPublisher] = useState<PublisherFilter>('all');
  const [candidates, setCandidates] = useState<NewsImageResult[]>(() => {
    const list: NewsImageResult[] = [];
    if (paragraph.matchedImage) list.push(paragraph.matchedImage);
    if (paragraph.alternateImages) list.push(...paragraph.alternateImages);
    return list;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<NewsImageResult | null>(
    paragraph.matchedImage || null
  );

  const fetchImages = useCallback(async (q: string, pub: PublisherFilter) => {
    if (!q.trim()) return;
    setIsLoading(true);
    try {
      const results = await searchNewsPictures(q, pub);
      setCandidates(results);
      if (results.length > 0) {
        setSelectedImage(results[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchImages(queryInput, publisher);
  };

  const handleApply = () => {
    if (selectedImage) {
      onApplyImage(paragraph.id, queryInput, selectedImage);
      onClose();
    }
  };

  const entitySuggestions = [
    ...paragraph.extractedEntities.people,
    ...paragraph.extractedEntities.locations,
    ...paragraph.extractedEntities.events
  ].filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl w-full bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d] bg-[#0d1117]">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Refine News Query for Block #{paragraph.index}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Target 2-3 concrete named entities to avoid irrelevant or generic stock photos
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#21262d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Query Search Form */}
          <form onSubmit={handleSearchSubmit} className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Enter 2-3 word entity query (e.g., 'Yoon Suk Yeol summit' or 'Red Sea ship')..."
                className="w-full bg-[#0d1117] border border-[#30363d] focus:border-sky-500 rounded-lg pl-10 pr-24 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-md bg-sky-500 hover:bg-sky-400 text-white text-xs font-medium transition-colors flex items-center gap-1"
              >
                {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
              </button>
            </div>

            {/* Quick Entity Insertion Chips */}
            {entitySuggestions.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] text-slate-500">Detected Entities:</span>
                {entitySuggestions.map((ent, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQueryInput(ent);
                      fetchImages(ent, publisher);
                    }}
                    className="text-[11px] px-2 py-0.5 rounded bg-[#0d1117] hover:bg-[#21262d] text-sky-300 hover:text-white border border-[#30363d] transition-colors"
                  >
                    + {ent}
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Publisher Source Tabs */}
          <div className="flex items-center gap-2 border-b border-[#30363d] pb-3 text-xs">
            <span className="text-slate-400 text-[11px] flex items-center gap-1 mr-1">
              <Globe className="w-3 h-3 text-emerald-400" />
              Outlet:
            </span>
            {[
              { id: 'all', label: 'All Feeds' },
              { id: 'global', label: 'Global (Reuters / AP)' },
              { id: 'korea', label: 'Korea (Yonhap / KBS)' },
              { id: 'aggregators', label: 'Aggregators' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setPublisher(tab.id as PublisherFilter);
                  fetchImages(queryInput, tab.id as PublisherFilter);
                }}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  publisher === tab.id
                    ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Results Grid */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300">
              Select High-Resolution Photo Candidate:
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-sky-400" />
                <span>Searching verified news archives for &ldquo;{queryInput}&rdquo;...</span>
              </div>
            ) : candidates.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No direct photo found. Try adjusting keywords.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {candidates.map((cand, idx) => {
                  const isPicked = selectedImage?.url === cand.url;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedImage(cand)}
                      className={`relative rounded-lg overflow-hidden border cursor-pointer group transition-all ${
                        isPicked
                          ? 'border-sky-500 ring-2 ring-sky-500/40 bg-[#0d1117]'
                          : 'border-[#30363d] hover:border-slate-500 bg-[#0d1117]/80'
                      }`}
                    >
                      <div className="aspect-video w-full relative bg-black overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cand.thumbnail || cand.url}
                          alt={cand.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        {isPicked && (
                          <div className="absolute top-2 right-2 bg-sky-500 text-white rounded-full p-1 shadow-md">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <div className="text-[11px] font-medium text-slate-200 line-clamp-1">
                          {cand.title}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                          <span className="text-emerald-400">{cand.outlet}</span>
                          <span className="truncate max-w-[120px]">{cand.source}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#30363d] bg-[#0d1117]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!selectedImage}
            className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-sky-500/20 transition-colors"
          >
            Apply Selected Picture
          </button>
        </div>
      </div>
    </div>
  );
};
