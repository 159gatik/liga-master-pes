import { Bebas_Neue, Barlow_Condensed, Barlow } from 'next/font/google';
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from './components/Footer';
import AuthGuard from './components/Auth/AuthGuard';
import { LigaProvider } from "@/src/lib/context/LigaContext";
import SelectorLiga from "./components/SelectorLiga";
const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas'
});

const barlowCond = Barlow_Condensed({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-barlow-cond'
});

const barlow = Barlow({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-barlow'
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${bebas.variable} ${barlowCond.variable} ${barlow.variable}`}>
      <body className="font-mono bg-[#0a0a0a]">
        <AuthGuard>
          <LigaProvider liga="pes6">
            <Navbar />
            {children}
            <SelectorLiga /> 
            <Footer />
          </LigaProvider>
        </AuthGuard>
      </body>
    </html>
  );
}