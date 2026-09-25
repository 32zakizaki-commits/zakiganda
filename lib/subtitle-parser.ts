export interface SubtitleCue {
  id: string;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  startFormatted: string; // e.g., "00:15"
  endFormatted: string;
  durationFormatted: string; // e.g., "(27s)"
  text: string;
}

export interface IdeaParagraph {
  id: string;
  index: number;
  startTime: number;
  endTime: number;
  duration: number;
  durationLabel: string; // e.g. "01:15 - 01:42 (27s)"
  text: string;
  cues: SubtitleCue[];
  extractedEntities: {
    people: string[];
    locations: string[];
    events: string[];
    coreKeywords: string[];
  };
  searchQuery: string;
  publisherFilter?: string;
  matchedImage?: {
    url: string;
    thumbnail: string;
    title: string;
    source: string;
    outlet: string;
    sourceUrl?: string;
    visualType?: 'article_screen' | 'tv_broadcast' | 'press_photo' | 'editorial_clip';
    personName?: string;
    personRole?: string;
    headline?: string;
    subheadline?: string;
  };
  alternateImages?: Array<{
    url: string;
    thumbnail: string;
    title: string;
    source: string;
    outlet: string;
    visualType?: 'article_screen' | 'tv_broadcast' | 'press_photo' | 'editorial_clip';
    personName?: string;
    personRole?: string;
    headline?: string;
    subheadline?: string;
  }>;
  selectedImageIndex: number;
}

export type GroupingSensitivity = 'idea_block' | 'sentence' | 'fixed_window' | 'custom';

export interface GroupingOptions {
  sensitivity: GroupingSensitivity;
}

export function formatTimestamp(seconds: number, includeHours: boolean = false): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (includeHours || h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function parseTimeToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  const cleaned = timeStr.trim().replace(',', '.');
  const parts = cleaned.split(':');
  if (parts.length === 3) {
    const hours = parseFloat(parts[0]) || 0;
    const minutes = parseFloat(parts[1]) || 0;
    const seconds = parseFloat(parts[2]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    const minutes = parseFloat(parts[0]) || 0;
    const seconds = parseFloat(parts[1]) || 0;
    return minutes * 60 + seconds;
  } else if (parts.length === 1) {
    return parseFloat(parts[0]) || 0;
  }
  return 0;
}

export function parseSubtitlesToCues(input: string): SubtitleCue[] {
  if (!input || !input.trim()) return [];
  const text = input.trim();

  if (text.includes('-->')) {
    return parseSrtOrVtt(text);
  }

  const bracketTimestampRegex = /(?:\[|\()(\d{1,2}:\d{2}(?::\d{2})?(?:\.\d{1,3})?)(?:\]|\))\s*([^\n\r]+)/g;
  const lineTimestampRegex = /^(\d{1,2}:\d{2}(?::\d{2})?)\s+(.+)$/gm;

  if (bracketTimestampRegex.test(text) || lineTimestampRegex.test(text)) {
    return parseTimestampedTranscript(text);
  }

  return parsePlainTextToTimedCues(text);
}

function parseSrtOrVtt(content: string): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.split(/\n\s*\n/);
  let cueIndex = 1;

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length === 0 || !lines[0]) continue;

    let timingLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('-->')) {
        timingLineIndex = i;
        break;
      }
    }
    if (timingLineIndex === -1) continue;

    const timingLine = lines[timingLineIndex];
    const [startStr, endStr] = timingLine.split('-->').map(s => s.trim().split(' ')[0]);

    const startTime = parseTimeToSeconds(startStr);
    const endTime = parseTimeToSeconds(endStr);

    const textLines = lines.slice(timingLineIndex + 1)
      .map(l => l.replace(/<[^>]*>/g, '').trim())
      .filter(l => l.length > 0);

    const cueText = textLines.join(' ');

    if (cueText.length > 0) {
      cues.push({
        id: `cue-${cueIndex++}`,
        startTime,
        endTime: Math.max(endTime, startTime + 1),
        startFormatted: formatTimestamp(startTime),
        endFormatted: formatTimestamp(endTime),
        durationFormatted: `(${Math.round(endTime - startTime)}s)`,
        text: cueText
      });
    }
  }

  return cues;
}

function parseTimestampedTranscript(content: string): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  let cueIndex = 1;
  const timestampRegex = /(?:\[|\()?\b(\d{1,2}:\d{2}(?::\d{2})?(?:\.\d{1,3})?)\b(?:\]|\))?\s*[:-]?\s*(.*)/;

  let currentStartTime = 0;
  let currentText = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const match = line.match(timestampRegex);
    if (match) {
      if (currentText) {
        const nextTime = parseTimeToSeconds(match[1]);
        const dur = Math.max(1, nextTime - currentStartTime);
        cues.push({
          id: `cue-${cueIndex++}`,
          startTime: currentStartTime,
          endTime: nextTime,
          startFormatted: formatTimestamp(currentStartTime),
          endFormatted: formatTimestamp(nextTime),
          durationFormatted: `(${Math.round(dur)}s)`,
          text: currentText.trim()
        });
      }
      currentStartTime = parseTimeToSeconds(match[1]);
      currentText = match[2] || '';
    } else {
      currentText += ' ' + line;
    }
  }

  if (currentText) {
    const estDuration = Math.max(3, Math.round(currentText.split(/\s+/).length * 0.4));
    const endTime = currentStartTime + estDuration;
    cues.push({
      id: `cue-${cueIndex++}`,
      startTime: currentStartTime,
      endTime,
      startFormatted: formatTimestamp(currentStartTime),
      endFormatted: formatTimestamp(endTime),
      durationFormatted: `(${Math.round(estDuration)}s)`,
      text: currentText.trim()
    });
  }

  return cues;
}

function parsePlainTextToTimedCues(content: string): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  const rawSentences = content
    .replace(/([.?!。！？])\s+/g, '$1|§|')
    .split('|§|')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  let currentTime = 0;
  let cueIndex = 1;

  for (const sent of rawSentences) {
    const words = sent.split(/\s+/).length;
    const duration = Math.max(3.5, Math.round((words / 2.5) * 10) / 10);
    const endTime = currentTime + duration;

    cues.push({
      id: `cue-${cueIndex++}`,
      startTime: currentTime,
      endTime,
      startFormatted: formatTimestamp(currentTime),
      endFormatted: formatTimestamp(endTime),
      durationFormatted: `(${Math.round(duration)}s)`,
      text: sent
    });

    currentTime = endTime + 0.3;
  }

  return cues;
}

/**
 * STAGE 1: SEMANTIC IDEA PARAGRAPH GROUPING
 * Groups sequential subtitle cues into cohesive 15-30 second "Idea Blocks"
 * so each paragraph centers around one main person/topic.
 */
export function groupCuesIntoIdeaParagraphs(
  cues: SubtitleCue[],
  options: GroupingOptions = { sensitivity: 'idea_block' }
): Array<Omit<IdeaParagraph, 'extractedEntities' | 'searchQuery' | 'selectedImageIndex'>> {
  if (!cues || cues.length === 0) return [];

  const sensitivity = options.sensitivity || 'idea_block';
  const paragraphs: Array<Omit<IdeaParagraph, 'extractedEntities' | 'searchQuery' | 'selectedImageIndex'>> = [];

  let currentBlockCues: SubtitleCue[] = [];
  let blockIndex = 1;

  const isSentenceEnd = (text: string): boolean => {
    return /[.?!。！？]["']?$/.test(text.trim());
  };

  for (let i = 0; i < cues.length; i++) {
    const cue = cues[i];
    if (currentBlockCues.length === 0) {
      currentBlockCues.push(cue);
      continue;
    }

    const firstCue = currentBlockCues[0];
    const prevCue = currentBlockCues[currentBlockCues.length - 1];
    const accumulatedDuration = prevCue.endTime - firstCue.startTime;
    const gapSincePrevCue = cue.startTime - prevCue.endTime;
    const prevEnds = isSentenceEnd(prevCue.text);

    let shouldSplit = false;

    if (sensitivity === 'sentence') {
      if (prevEnds || accumulatedDuration >= 10 || gapSincePrevCue >= 1.5) {
        shouldSplit = true;
      }
    } else if (sensitivity === 'fixed_window') {
      if (accumulatedDuration >= 28) {
        shouldSplit = true;
      }
    } else {
      // Default: By Idea Block (14-30 seconds, 2-4 sentences talking about one cohesive idea)
      if (accumulatedDuration >= 13 && (gapSincePrevCue >= 1.0 || currentBlockCues.length >= 2 || prevEnds)) {
        shouldSplit = true;
      } else if (accumulatedDuration >= 30) {
        shouldSplit = true;
      } else if (gapSincePrevCue >= 2.5 && accumulatedDuration >= 8) {
        shouldSplit = true;
      }
    }

    if (shouldSplit) {
      const startTime = firstCue.startTime;
      const endTime = prevCue.endTime;
      const dur = Math.max(1, Math.round(endTime - startTime));
      const fullText = currentBlockCues.map(c => c.text).join(' ').trim();

      paragraphs.push({
        id: `para-${blockIndex}`,
        index: blockIndex++,
        startTime,
        endTime,
        duration: dur,
        durationLabel: `${formatTimestamp(startTime)} - ${formatTimestamp(endTime)} (${dur}s)`,
        text: fullText,
        cues: [...currentBlockCues]
      });

      currentBlockCues = [cue];
    } else {
      currentBlockCues.push(cue);
    }
  }

  if (currentBlockCues.length > 0) {
    const startTime = currentBlockCues[0].startTime;
    const endTime = currentBlockCues[currentBlockCues.length - 1].endTime;
    const dur = Math.max(1, Math.round(endTime - startTime));
    const fullText = currentBlockCues.map(c => c.text).join(' ').trim();

    paragraphs.push({
      id: `para-${blockIndex}`,
      index: blockIndex++,
      startTime,
      endTime,
      duration: dur,
      durationLabel: `${formatTimestamp(startTime)} - ${formatTimestamp(endTime)} (${dur}s)`,
      text: fullText,
      cues: [...currentBlockCues]
    });
  }

  return paragraphs;
}
