"use client";
import { createContext, useContext } from "react";

type Liga = "pes6" | "pes2013";

interface LigaContextType {
    liga: Liga;
    col: (nombre: string) => string;
}

const LigaContext = createContext<LigaContextType>({
    liga: "pes6",
    col: (nombre) => nombre, // pes6 usa colecciones sin prefijo
});

export function LigaProvider({ liga, children }: { liga: Liga, children: React.ReactNode }) {
    const col = (nombre: string) => {
        if (liga === "pes6") return nombre;           // → "equipos"
        return `pes2013_${nombre}`;                   // → "pes2013_equipos"
    };
    return (
        <LigaContext.Provider value={{ liga, col }}>
            {children}
        </LigaContext.Provider>
    );
}

export const useLiga = () => useContext(LigaContext);