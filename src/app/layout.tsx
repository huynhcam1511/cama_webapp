import type { Metadata, Viewport } from "next";
import { Inter, Cinzel, Playfair_Display, Montserrat } from "next/font/google";
import { AgentationToolbar } from "@/components/agentation-toolbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-inter" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });
const playfair = Playfair_Display({ subsets: ["latin", "vietnamese"], variable: "--font-playfair" });
const montserrat = Montserrat({ subsets: ["latin", "vietnamese"], variable: "--font-montserrat" });

export const metadata: Metadata = {
  title: "CAMA HAUTE COUTURE | Ultra Luxury Wedding",
  description: "CAMA Haute Couture Wedding Atelier & Management Portal",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-icon.png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CAMA Hub",
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
    <html lang="vi" className={`dark ${inter.variable} ${cinzel.variable} ${playfair.variable} ${montserrat.variable}`}>
      <body className={inter.className}>
        <div id="cama-app-root" className="flex min-h-screen w-full flex-col bg-background">
          {children}
        </div>
        <AgentationToolbar />
      </body>
    </html>
  );
}
