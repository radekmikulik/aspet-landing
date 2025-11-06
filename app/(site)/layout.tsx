import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ASPETi',
  description: 'Aktuální nabídky – ASPETi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <body className="min-h-screen bg-[#F5F7F6] text-[#0B1F2A] antialiased">
        {children}
      </body>
    </html>
  );
}
