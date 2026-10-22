import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import Script from "next/script";
import { getTheme } from "@/lib/theme";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});

export const metadata: Metadata = {
  title: "NIDO Support CRM — Invent Money",
  description: "Triagem de tickets da comunidade de trainers da Invent Money.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const theme = await getTheme();

  return (
    <html lang="pt-BR" data-theme={theme} className={`${archivo.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full">
        <Script id="theme-init" strategy="beforeInteractive">
          {`try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light"){document.documentElement.dataset.theme=t;document.cookie="theme="+t+"; path=/; max-age=31536000; samesite=lax"}}catch(e){}`}
        </Script>
        {children}
      </body>
    </html>
  );
}
