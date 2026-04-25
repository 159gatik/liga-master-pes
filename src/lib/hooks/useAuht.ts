"use client";
import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { usePathname } from "next/navigation";

interface UserData {
    rol: 'admin' | 'dt' | 'invitado';
    nombre?: string;
    equipoId?: string;        // pes6 (legado, no borrar)
    nombreEquipo?: string;    // pes6 (legado, no borrar)
    discord?: string;
    wins?: number;
    losses?: number;
    ligas?: {
        pes6?: {
            estado: 'postulado' | 'aprobado' | 'rechazado';
            equipoId?: string;
            nombreEquipo?: string;
        };
        pes2013?: {
            estado: 'postulado' | 'aprobado' | 'rechazado';
            equipoId?: string;
            nombreEquipo?: string;
        };
    };
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data() as UserData);
                }
            } else {
                setUser(null);
                setUserData(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const isAdmin = userData?.rol === 'admin';

    // Detecta la liga activa según la URL
    const ligaActiva = pathname?.startsWith("/pes2013") ? "pes2013" : "pes6";

    // Devuelve el equipoId y nombreEquipo según la liga activa
    const equipoIdActivo = ligaActiva === "pes2013"
        ? userData?.ligas?.pes2013?.equipoId
        : (userData?.ligas?.pes6?.equipoId || userData?.equipoId); // fallback al campo legado

    const nombreEquipoActivo = ligaActiva === "pes2013"
        ? userData?.ligas?.pes2013?.nombreEquipo
        : (userData?.ligas?.pes6?.nombreEquipo || userData?.nombreEquipo); // fallback al campo legado

    const estadoLigaActiva = ligaActiva === "pes2013"
        ? userData?.ligas?.pes2013?.estado
        : userData?.ligas?.pes6?.estado;

    return {
        user,
        userData,
        isAdmin,
        loading,
        ligaActiva,
        equipoIdActivo,
        nombreEquipoActivo,
        estadoLigaActiva,
    };
}