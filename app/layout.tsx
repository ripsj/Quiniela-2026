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
          from-[#001F5B]
          via-[#003C8F]
          to-[#8B1538]
        `}
      >
        {children}
      </body>
    </html>
  );
}
