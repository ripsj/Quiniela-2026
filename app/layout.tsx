import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
          bg-gradient-to-br
          from-[#17104F]
          via-[#2754FF]
          to-[#6D16E8]
        `}
      >
        {children}
      </body>
    </html>
  );
}
