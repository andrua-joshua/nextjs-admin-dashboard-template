import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'ServiPay - Find Your Perfect Job Match',
  description: 'Connect with opportunities that match your skills and get paid fairly. ServiPay makes job matching simple and rewarding.',
  icons: {
    icon: 'images/logo/servipay.jpeg',
    apple: 'images/logo/servipay.jpeg',
    shortcut: 'images/logo/servipay.jpeg',
  },
};

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Explicit favicon link to override any defaults */}
        <link rel="icon" href="/images/logo/servipay.jpeg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/images/logo/servipay.jpeg" />
        <link rel="shortcut icon" href="/images/logo/servipay.jpeg" type="image/jpeg" />
      </head>
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <AuthProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
