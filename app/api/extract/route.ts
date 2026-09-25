import { NextRequest, NextResponse } from 'next/server';
import { extractEntitiesFromParagraph } from '@/lib/nlp-entity-extractor';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { text, paragraphIndex } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Default fast local NLP extraction
    const localResult = extractEntitiesFromParagraph(text);

    // If Gemini API Key is configured, we can optionally enhance the 2-3 word entity search query
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `You are a video editor NLP news search assistant. Read this subtitle paragraph and extract:
1. Specific People (e.g., "Yoon Suk Yeol", "Joe Biden", "Jensen Huang")
2. Locations/Nations (e.g., "Seoul", "Red Sea", "Washington")
3. Concrete Events or Hardware Nouns (e.g., "C-17 aircraft", "semiconductor fab", "ceasefire talks")
4. Construct a strict 2 to 3 word targeted news photo search query. NEVER include generic words like "today", "news", "people".

Paragraph: "${text}"

Respond in JSON format:
{
  "people": string[],
  "locations": string[],
  "events": string[],
  "query": string
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return NextResponse.json({
            paragraphIndex,
            entities: {
              people: parsed.people || localResult.people,
              locations: parsed.locations || localResult.locations,
              events: parsed.events || localResult.events,
              coreKeywords: localResult.coreKeywords
            },
            query: parsed.query || localResult.coreKeywords.join(' '),
            source: 'gemini_enhanced'
          });
        }
      } catch (geminiError) {
        // Graceful fallback to deterministic local NLP engine
        console.warn('Gemini enhancement skipped, using local NLP:', geminiError);
      }
    }

    return NextResponse.json({
      paragraphIndex,
      entities: {
        people: localResult.people,
        locations: localResult.locations,
        events: localResult.events,
        coreKeywords: localResult.coreKeywords
      },
      query: localResult.coreKeywords.join(' '),
      source: 'local_nlp'
    });
  } catch (error) {
    console.error('Extraction error:', error);
    return NextResponse.json({ error: 'Failed to process paragraph' }, { status: 500 });
  }
}
