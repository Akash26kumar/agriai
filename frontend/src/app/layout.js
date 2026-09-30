import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AgriAI — Agricultural Intelligence Platform",
  description: "AI-powered agricultural assistant for Indian farmers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={inter.className}
        style={{
          color: "var(--text-primary)",
        }}
      >
        <div className="flex min-h-screen relative z-10">
          <Sidebar />
          <main className="flex-1 ml-60 flex flex-col min-h-screen bg-transparent">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
