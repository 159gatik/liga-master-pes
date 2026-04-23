import { LigaProvider } from "@/src/lib/context/LigaContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function LayoutPes2013({ children }: { children: React.ReactNode }) {
    return (
        <LigaProvider liga="pes2013">
            {children}
        </LigaProvider>
    );
}