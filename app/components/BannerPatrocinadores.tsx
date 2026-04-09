"use client";

const patrocinadores = [
    { name: "Konami", logo: "/logos/konami.png" },
    { name: "Adidas", logo: "/logos/adidas.png" },
    { name: "Nike", logo: "/logos/nike.png" },
    { name: "Mastercard", logo: "/logos/mastercard.png" },
    { name: "PlayStation", logo: "/logos/ps5.png" },
    { name: "Pirelli", logo: "/logos/pirelli.png" },
    // Agregá aquí los patrocinadores reales de tu liga
];

export default function BannerPatrocinadores() {
    return (
        <section className="w-full bg-[#111] border-y border-[#c9a84c]/20 py-8 mb-10 overflow-hidden relative">
            {/* Gradientes laterales para efecto de desvanecimiento */}
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10"></div>
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10"></div>

            <div className="flex animate-marquee whitespace-nowrap items-center">
                {/* Duplicamos la lista para que el loop sea infinito e imperceptible */}
                {[...patrocinadores, ...patrocinadores].map((patro, index) => (
                    <div key={index} className="flex items-center mx-12 opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
                        <span className="font-bebas text-xl text-gray-500 mr-4 tracking-tighter italic">OFFICIAL PARTNER</span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {/* <img
                            src={patro.logo}
                            alt={patro.name}
                            className="h-8 md:h-10 object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/100x40?text=" + patro.name }}
                        /> */}
                    </div>
                ))}
            </div>

            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    display: flex;
                    width: max-content;
                    animation: marquee 30s linear infinite;
                }
            `}</style>
        </section>
    );
}