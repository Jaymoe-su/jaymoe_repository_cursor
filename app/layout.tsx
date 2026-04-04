/**
 * Root layout component that wraps all pages in the application.
 * This layout:
 * - Sets up Geist fonts (both Sans and Mono variants)
 * - Configures metadata like title and favicon
 * - Provides the basic HTML structure
 * - Applies font variables to the entire app
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import FeedbackWidgetLoader from "@/app/components/FeedbackWidget/FeedbackWidgetLoader";
import FeedbackWidgetErrorBoundary from "@/app/components/FeedbackWidget/FeedbackWidgetErrorBoundary";
import "./styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Elizabeth's prototypes",
  description: "The home for all my prototypes",
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✨</text></svg>",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
        <FeedbackWidgetErrorBoundary>
          <FeedbackWidgetLoader />
        </FeedbackWidgetErrorBoundary>
        <Script
          id="monterey-widget"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,o,n,t,e,r,y){
                m[t]=m[t]||function(){(m[t].q=m[t].q||[]).push(arguments)};
                var s=o.createElement(n);s.async=1;s.src=e;
                var x=o.getElementsByTagName(n)[0];x.parentNode.insertBefore(s,x);
              })(window,document,'script','Monterey','https://cdn.monterey.ai/widget.js');
              Monterey('init', {
                token: '${process.env.NEXT_PUBLIC_MONTEREY_TOKEN || ""}',
                showWidget: false
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
