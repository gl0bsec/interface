import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Text Embedding Explorer",
  description: "Interactive web application for visualizing and analyzing text embeddings",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}