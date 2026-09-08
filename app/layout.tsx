import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crypto Lottery | Multi-Winner USDT Lottery",
  description: "Decentralized 30-ticket USDT lottery with 7 winners. Built on EVM/TRON.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="scanlines min-h-screen flex flex-col">
        <div id="wagmi-root" />
        {children}
      </body>
    </html>
  );
}