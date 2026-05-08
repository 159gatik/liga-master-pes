"use client";
import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { usePathname } from "next/navigation";

// 1. Interfaces Actualizadas
interface UserData {
    rol: 'admin' | 'dt' | 'invitado';
    nombre?: string;
    equipoId?: string;
    nombreEquipo?: string;
    discord?: string;
    wins?: number;
    losses?: number;
    estado?: 'online' | 'offline'; // Campo para los usuarios activos
    fechaRegistro?: any;           // Para evitar errores de tipo con Timestamps
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
                const userRef = doc(db, "users", firebaseUser.uid);
                const userDoc = await getDoc(userRef);

                if (userDoc.exists()) {
                    setUserData(userDoc.data() as UserData);

                    // --- LÓGICA DE USUARIO EN LÍNEA ---
                    // Cada vez que el usuario se detecta, actualizamos su estado a 'online'
                    await updateDoc(userRef, {
                        estado: "online",
                        ultimaConexion: serverTimestamp()
                    });
                }
            } else {
                // Si el usuario cierra sesión, el estado debería pasar a offline
                // Nota: Esto solo funciona si el usuario hace clic en "Cerrar Sesión"
                if (user?.uid) {
                    const lastUserRef = doc(db, "users", user.uid);
                    await updateDoc(lastUserRef, { estado: "offline" });
                }
                setUser(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user?.uid]); // Escuchamos el UID para limpiezas de estado

    // --- MANEJO DE CIERRE DE PESTAÑA ---
    useEffect(() => {
        if (!user) return;

        const setOffline = () => {
            const userRef = doc(db, "users", user.uid);
            // Nota: updateDoc es asíncrono, en 'beforeunload' a veces no llega a completarse
            // pero es la mejor opción sin usar Realtime Database.
            updateDoc(userRef, { estado: "offline" });
        };

        window.addEventListener("beforeunload", setOffline);
        return () => window.removeEventListener("beforeunload", setOffline);
    }, [user]);

    const isAdmin = userData?.rol === 'admin';
    const ligaActiva = pathname?.startsWith("/pes2013") ? "pes2013" : "pes6";

    const equipoIdActivo = ligaActiva === "pes2013"
        ? userData?.ligas?.pes2013?.equipoId
        : (userData?.ligas?.pes6?.equipoId || userData?.equipoId);

    const nombreEquipoActivo = ligaActiva === "pes2013"
        ? userData?.ligas?.pes2013?.nombreEquipo
        : (userData?.ligas?.pes6?.nombreEquipo || userData?.nombreEquipo);

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