import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'NewsSync - Subtitle Semantic News Picture Engine',
  description: '2-Stage AI & NLP Engine that groups YouTube subtitles into coherent semantic idea paragraphs and automatically pairs them with high-resolution news imagery from global and Korean outlets.',
  openGraph: {
    title: 'NewsSync - Subtitle Semantic News Picture Engine',
    description: '2-Stage AI & NLP Engine that groups YouTube subtitles into coherent semantic idea paragraphs and automatically pairs them with high-resolution news imagery from global and Korean outlets.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NewsSync - Subtitle Semantic News Picture Engine',
    description: '2-Stage AI & NLP Engine that groups YouTube subtitles into coherent semantic idea paragraphs and automatically pairs them with high-resolution news imagery from global and Korean outlets.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
