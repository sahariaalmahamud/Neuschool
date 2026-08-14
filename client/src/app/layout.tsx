import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Newsreader } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const sansFont = Plus_Jakarta_Sans({
  variable: "--font-neu-sans",
  subsets: ["latin"],
  display: "swap",
});

const serifFont = Newsreader({
  variable: "--font-neu-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Neuschool | Learning Management System",
  description: "A premium modern Learning Management System built with a warm editorial aesthetic.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sansFont.variable} ${serifFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-text-primary font-sans">
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
