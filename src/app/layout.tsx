import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Agentation } from "agentation";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "CAMA HAUTE COUTURE",
  description: "CAMA Haute Couture Internal Management Portal",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png' },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    title: "CAMA HAUTE COUTURE",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body className={inter.className}>
        <div id="cama-app-root" className="flex min-h-screen w-full flex-col bg-background">
          {children}
        </div>
        <div className="print:hidden">
          {process.env.NODE_ENV === 'development' && <Agentation />}
        </div>
      </body>
    </html>
  );
}
