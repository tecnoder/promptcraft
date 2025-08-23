import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthProvider";
import { SidebarLayout } from "@/components/SidebarLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PromptJedi - AI-Powered Prompt Engineering",
  description: "Transform your simple ideas into powerful, detailed prompts for AI tools",
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
      {
        url: "/icon",
        type: "image/png",
        sizes: "32x32",
      },
    ],
    shortcut: "/favicon.svg",
    apple: [
      {
        url: "/apple-icon",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <SidebarLayout>
              {children}
            </SidebarLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
