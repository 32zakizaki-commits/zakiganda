import JSZip from 'jszip';
import { IdeaParagraph } from './subtitle-parser';

export interface ZipDownloadProgress {
  current: number;
  total: number;
  percentage: number;
  status: string;
}

/**
 * Converts an SVG string or Data URL into a high-resolution PNG Blob (1920x1080)
 */
export async function convertSvgDataUrlToPngBlob(
  svgDataUrl: string,
  width: number = 1920,
  height: number = 1080
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get 2d canvas context'));
          return;
        }

        // Crisp white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Draw SVG scaled up to 1920x1080 full HD
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas toBlob returned null'));
            }
          },
          'image/png',
          0.95
        );
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (e) => {
      reject(new Error(`Failed to load SVG image into canvas: ${e}`));
    };

    img.src = svgDataUrl;
  });
}

/**
 * Fetches an image URL through our local proxy to avoid CORS blocks
 */
export async function fetchImageBlobSafe(url: string): Promise<Blob> {
  if (url.startsWith('data:image/svg+xml')) {
    return convertSvgDataUrlToPngBlob(url);
  }

  if (url.startsWith('data:image/')) {
    const res = await fetch(url);
    return res.blob();
  }

  try {
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error(`Proxy fetch failed with status ${res.status}`);
    return res.blob();
  } catch {
    // Direct fetch fallback
    const directRes = await fetch(url, { mode: 'cors' });
    return directRes.blob();
  }
}

/**
 * Downloads all extracted paragraph pictures bundled into a ZIP file.
 * Strictly names each image by its sequence number: 1.png, 2.png, 3.png...
 * where 1 is the first paragraph in the subtitle timeline.
 */
export async function downloadAllPicturesAsZip(
  paragraphs: IdeaParagraph[],
  onProgress?: (progress: ZipDownloadProgress) => void,
  zipFileName?: string
): Promise<void> {
  if (!paragraphs || paragraphs.length === 0) {
    throw new Error('No paragraphs to download');
  }

  const zip = new JSZip();
  const total = paragraphs.length;

  // 1. Process each picture in order: 1.png, 2.png, 3.png...
  for (let i = 0; i < total; i++) {
    const para = paragraphs[i];
    const itemNumber = i + 1; // 1-indexed (1 is first in subtitle)

    if (onProgress) {
      onProgress({
        current: itemNumber,
        total,
        percentage: Math.round((itemNumber / total) * 80),
        status: `Processing image ${itemNumber}/${total} (${itemNumber}.png)...`
      });
    }

    const img = para.matchedImage;
    if (img?.url) {
      try {
        let blob: Blob;
        if (img.url.startsWith('data:image/svg+xml')) {
          blob = await convertSvgDataUrlToPngBlob(img.url, 1920, 1080);
        } else {
          blob = await fetchImageBlobSafe(img.url);
        }

        // Save strictly named by number: 1.png, 2.png, 3.png...
        zip.file(`${itemNumber}.png`, blob);
      } catch (err) {
        console.warn(`Failed to process picture for item #${itemNumber}, generating fallback:`, err);
        // If external image fails, convert fallback article SVG
        if (img.thumbnail && img.thumbnail.startsWith('data:image/svg+xml')) {
          const fallbackBlob = await convertSvgDataUrlToPngBlob(img.thumbnail, 1920, 1080);
          zip.file(`${itemNumber}.png`, fallbackBlob);
        }
      }
    }
  }

  // 2. Add companion Video Timing & Storyboard Sheet for Video Editors (Premiere, CapCut, DaVinci)
  if (onProgress) {
    onProgress({
      current: total,
      total,
      percentage: 85,
      status: 'Generating video storyboard timing sheet...'
    });
  }

  let csvContent = '\uFEFFSequence,FileName,Duration,StartTime,EndTime,SubtitleText,Headline,Outlet\n';
  let txtContent = '===================================================\n';
  txtContent += '  NEWSSYNC VIDEO STORYBOARD TIMING MANIFEST\n';
  txtContent += `  Total Images: ${total} (Named 1.png to ${total}.png)\n`;
  txtContent += '  1 is the first image corresponding to 00:00\n';
  txtContent += '===================================================\n\n';

  paragraphs.forEach((p, idx) => {
    const num = idx + 1;
    const cleanText = p.text.replace(/"/g, '""').replace(/\n/g, ' ');
    const headline = (p.matchedImage?.title || p.searchQuery || '').replace(/"/g, '""');
    const outlet = (p.matchedImage?.outlet || 'Yonhap News').replace(/"/g, '""');

    csvContent += `${num},${num}.png,"${p.durationLabel}","${p.startTime}s","${p.endTime}s","${cleanText}","${headline}","${outlet}"\n`;

    txtContent += `[IMAGE ${num}.png] Timing: ${p.durationLabel}\n`;
    txtContent += `  Headline : ${p.matchedImage?.title || p.searchQuery}\n`;
    txtContent += `  Outlet   : ${p.matchedImage?.outlet || 'News'}\n`;
    txtContent += `  Subtitle : ${p.text}\n\n`;
  });

  zip.file('storyboard_timings.csv', csvContent);
  zip.file('storyboard_timings.txt', txtContent);

  // 3. Compress ZIP
  if (onProgress) {
    onProgress({
      current: total,
      total,
      percentage: 92,
      status: `Compressing ${total} pictures into ZIP package...`
    });
  }

  const content = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  if (onProgress) {
    onProgress({
      current: total,
      total,
      percentage: 100,
      status: 'Download ready!'
    });
  }

  // 4. Trigger browser download
  const defaultName = zipFileName || `newssync_storyboard_pictures_1_to_${total}.zip`;
  const downloadUrl = URL.createObjectURL(content);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = defaultName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(downloadUrl);
}
