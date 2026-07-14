import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "TinDog AI Agent",
  description: "Animated Next.js UI for the TinDog LangChain/LangGraph AI agent backend.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>): JSX.Element {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
