// src/hooks/useAdmin.ts
import { useState, useEffect } from "react";
import { auth, db } from "../firebase"; // Ajustá la ruta a tu config de firebase
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export function useAdmin() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists() && userDoc.data().rol === "admin") {
                        setIsAdmin(true);
                    } else {
                        setIsAdmin(false);
                    }
                } catch (error) {
                    console.error("Error validando admin:", error);
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { isAdmin, loading };
}