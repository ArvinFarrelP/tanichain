import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';

const bodyFont = Inter({ subsets: ['latin'], variable: '--font-body' });
const displayFont = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });

export const metadata: Metadata = {
  title: 'TaniChain — Transparent Agricultural Payments on Stellar',
  description:
    'TaniChain connects farmers, buyers, and cooperatives with transparent, blockchain-verified payment commitments on the Stellar network.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${bodyFont.variable} ${displayFont.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
