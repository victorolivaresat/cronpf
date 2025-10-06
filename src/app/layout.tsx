
import type { Metadata } from 'next';
import { AppProviders } from '@/components/providers/app-providers';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { es } from 'date-fns/locale';

export const metadata: Metadata = {
  title: 'Cron PF',
  description: 'Gestión de proyectos.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AppProviders>
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}

    