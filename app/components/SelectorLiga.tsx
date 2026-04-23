"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SelectorLiga() {
    const pathname = usePathname();
    const esPes2013 = pathname.startsWith("/pes2013");

    if (esPes2013) {
        return (
            <Link
                href="/"
                className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-[#111111] border border-[#c9a84c] px-4 py-3 shadow-2xl hover:bg-[#c9a84c] hover:text-black transition-all group"
            >
                <span className="font-bebas text-lg text-[#c9a84c] tracking-widest group-hover:text-black transition-colors">
                    ← PES 6
                </span>
                <span className="font-barlow-condensed text-[10px] text-[#666] uppercase tracking-widest group-hover:text-black transition-colors">
                    El Legado
                </span>
            </Link>
        );
    }

    return (
        <Link
            href="/pes2013"
            className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-[#0a1628] border border-[#00aaff] px-4 py-3 shadow-2xl hover:bg-[#00aaff] transition-all group"
        >
            <span className="font-bebas text-lg text-[#00aaff] tracking-widest group-hover:text-black transition-colors">
                PES 2013 →
            </span>
            <span className="font-barlow-condensed text-[10px] text-[#3a6688] uppercase tracking-widest group-hover:text-black transition-colors">
                La Leyenda
            </span>
        </Link>
    );
}