// app/(site)/layout.tsx
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ASPETi',
  description: 'Last-minute nabídky služeb a ubytování',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body className="min-h-screen bg-[#F5F7F6] text-gray-900">
        {children}
      </body>
    </html>
  );
}
