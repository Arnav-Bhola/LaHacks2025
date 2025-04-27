import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ResultProvider } from "@/context/ResultContext";
import { PortfolioProvider } from "@/context/PortfolioContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Portfolio Tracker",
  description: "Track your investment portfolio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
    >
      <body className={`${inter.className} bg-gray-100 dark:bg-gray-900`}>
        {/* Pass contexts for the app to be based on */}
        <ResultProvider>
          <PortfolioProvider>{children}</PortfolioProvider>
        </ResultProvider>
      </body>
    </html>
  );
}

