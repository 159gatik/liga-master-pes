"use client";
import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// 1. Definimos qué datos esperamos de un usuario en Firestore
interface UserData {
    rol: 'admin' | 'dt' | 'invitado';
    nombre?: string;
    equipoId?: string;
    nombreEquipo?: string;
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);

    // 2. Usamos la interfaz en lugar de <any>
    const [userData, setUserData] = useState<UserData | null>(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                // Buscamos sus permisos en Firestore
                const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
                if (userDoc.exists()) {
                    // Le decimos a TypeScript: "Tranquilo, confía en mí, esto es un UserData"
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
    // 1. Definimos la constante isAdmin dentro del hook
    const isAdmin = userData?.rol === 'admin';

    // 2. LA AGREGAMOS AL RETURN (esto es lo que te falta)
    return { user, userData, isAdmin, loading };
}