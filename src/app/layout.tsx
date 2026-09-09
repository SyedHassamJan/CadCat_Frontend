import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | CAD Marketplace',
    default: 'CAD Marketplace — Professional CAD Blocks & Files',
  },
  description:
    'Download free and premium CAD blocks, DWG files, and DXF drawings for architecture, furniture, electrical, mechanical, and more.',
  keywords: ['CAD blocks', 'DWG files', 'DXF drawings', 'AutoCAD blocks', 'free CAD files'],
  openGraph: {
    title: 'CAD Marketplace',
    description: 'Professional CAD blocks and files for architects and engineers.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
