import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import CartDrawer from "@/components/CartDrawer";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Sweet Home Comfort",
  description: "Cama, Mesa e Banho de alto padrão.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${playfair.variable} font-body bg-stone-50 text-stone-900 antialiased`}>
        {/* Provedores globais - não injetam layout, apenas lógica */}
        <CartProvider>
          <CartDrawer />
          {/* As notificações globais do ERP e Loja */}
          <Toaster richColors position="top-right" />
          
          {/* Aqui as rotas serão injetadas LIVRES de amarras visuais */}
          {children}
        </CartProvider>
      </body>
    </html>
  );
}