import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'ASPETi',
  description: 'Aktuální nabídky – ASPETi',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="cs">
      <body className="min-h-screen bg-[#F5F7F6] text-[#0B1F2A] antialiased">
        {children}
      </body>
    </html>
  );
}
