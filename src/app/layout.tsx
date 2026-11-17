import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Klucz — Twój menedżer haseł",
  description: "Prosty, prywatny sejf na Twoje hasła.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pl">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
