import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EchoHome — Florida Beach House Finder',
  description: 'Find sandy-beach single-family homes in Florida under $400K. Powered by AI.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
