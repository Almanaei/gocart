import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShopHub - Modern Online Store",
  description: "Discover amazing products at unbeatable prices. Shop the latest trends with fast shipping and excellent customer service.",
  keywords: ["online store", "ecommerce", "shopping", "products", "deals", "fashion", "electronics"],
  authors: [{ name: "ShopHub Team" }],
  openGraph: {
    title: "ShopHub - Modern Online Store",
    description: "Discover amazing products at unbeatable prices with fast shipping and excellent customer service.",
    url: "https://shophub.com",
    siteName: "ShopHub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShopHub - Modern Online Store",
    description: "Discover amazing products at unbeatable prices with fast shipping and excellent customer service.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            <Header />
            <main>{children}</main>
            <Footer />
            <Toaster />
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
