import './globals.css';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="cs">
      <body className="min-h-screen bg-[#F5F7F6] text-[#0B1F2A]">
        {children}
      </body>
    </html>
  );
}
