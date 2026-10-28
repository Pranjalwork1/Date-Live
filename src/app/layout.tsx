import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Moonlit — Watch Together | Romantic Virtual Movie Dates',
  description:
    'Different places. One little movie night. Create a private room for two, share your screen with movie sound, talk, chat, and send animated reactions.',
  keywords: [
    'watch together',
    'movie date',
    'long distance couple',
    'screen share with audio',
    'virtual cinema',
    'romantic watch party',
  ],
  authors: [{ name: 'Moonlit Team' }],
  openGraph: {
    title: 'Moonlit — Watch Together',
    description: 'Different places. One little movie night.',
    siteName: 'Moonlit',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="h-full antialiased dark"
    >
      <body className="min-h-full flex flex-col bg-[#080A18] text-[#F8FAFC]">
        {children}
      </body>
    </html>
  );
}
