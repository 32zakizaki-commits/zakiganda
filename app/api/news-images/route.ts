import { NextRequest, NextResponse } from 'next/server';
import { PublisherFilter, searchNewsPictures, getFallbackKoreanNewsImage } from '@/lib/news-image-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const filter = (searchParams.get('filter') as PublisherFilter) || 'korea';

    if (!query.trim()) {
      return NextResponse.json({ images: [getFallbackKoreanNewsImage('대한민국 주요 뉴스')] });
    }

    const images = await searchNewsPictures(query, filter);

    return NextResponse.json({ images });
  } catch (error) {
    console.error('News image route error:', error);
    return NextResponse.json({ images: [getFallbackKoreanNewsImage('대한민국 뉴스')] });
  }
}
