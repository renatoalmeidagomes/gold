import type { Metadata } from "next";
import { Montserrat, Poppins } from "next/font/google";
import { StoreProvider } from "../context/StoreContext";
import "./globals.css";

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins"
});

const montserrat = Montserrat({ 
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800", "900"],
  variable: "--font-montserrat"
});

export const metadata: Metadata = {
  title: "Black Gold | Referência em Grife e Tendências",
  description: "A Loja 01 de Almenara. Seu estilo no topo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={`${poppins.variable} ${montserrat.variable} font-sans antialiased selection:bg-brand-gold selection:text-black pb-16 md:pb-0`}>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}


