import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#060814] text-white">
        {children}
      </body>
    </html>
  );
}
