import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "🏆 Quiniela Mundial 2026",
  description: "Ranking y seguimiento de la Quiniela Mundial 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className="h-full antialiased"
    >
      <body
        className={`
          ${poppins.className}
          min-h-screen
          bg-slate-100
        `}
      >
        {children}
      </body>
    </html>
  );
}