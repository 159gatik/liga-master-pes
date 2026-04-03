"use client";
import { useState } from "react";
import { auth, db } from "../../src/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const [formData, setFormData] = useState({ email: "", password: "", username: "" });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            // Actualizamos el perfil de Auth para que ya tenga el nombre
            await updateProfile(user, { displayName: formData.username });

            // Guardamos en Firestore con la estructura que espera nuestro useAuth
            await setDoc(doc(db, "users", user.uid), {
                nombre: formData.username,
                email: formData.email,
                rol: "invitado", // Rol inicial por defecto
                equipoId: "",
                nombreEquipo: "Sin Equipo",
                wins: 0,
                losses: 0,
                fechaRegistro: new Date().toISOString()
            });

            alert("¡Registro exitoso! Bienvenido a la liga.");
            router.push("/"); // Redirigir al inicio
        } catch (error) {
            console.error("Error:", error.message);
            alert("Error al registrar: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-[#0a0a0a] p-6 text-[#f0ece0]">
            <div className="w-full max-w-md bg-[#111] border border-[#2a2a2a] border-t-4 border-t-[#c9a84c] p-10 shadow-2xl">

                <h1 className="font-bebas text-5xl text-center text-white mb-2 tracking-widest uppercase italic">
                    Unirse a <span className="text-[#c9a84c]">La Liga</span>
                </h1>
                <p className="font-barlow-condensed text-center text-[#555] uppercase tracking-[3px] text-sm mb-10">
                    Crea tu cuenta de DT para empezar
                </p>

                <form onSubmit={handleRegister} className="flex flex-col gap-6 font-barlow-condensed">
                    <div className="space-y-1">
                        <label className="text-[10px] text-[#c9a84c] uppercase font-bold tracking-widest ml-1">Nombre de DT (PES)</label>
                        <input
                            type="text"
                            placeholder="Ej: DT_Gamer10"
                            className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white outline-none focus:border-[#c9a84c] transition-all"
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] text-[#c9a84c] uppercase font-bold tracking-widest ml-1">Correo Electrónico</label>
                        <input
                            type="email"
                            placeholder="tu@email.com"
                            className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white outline-none focus:border-[#c9a84c] transition-all"
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] text-[#c9a84c] uppercase font-bold tracking-widest ml-1">Contraseña</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white outline-none focus:border-[#c9a84c] transition-all"
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#c9a84c] text-black font-bebas text-2xl py-3 mt-4 tracking-[4px] uppercase hover:bg-white transition-all shadow-lg disabled:opacity-50"
                    >
                        {loading ? "Procesando..." : "Finalizar Registro"}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-[#222] pt-6">
                    <p className="text-[#444] text-xs uppercase tracking-widest">
                        ¿Ya tienes cuenta? {" "}
                        <Link href="/login" className="text-[#c9a84c] hover:underline">Inicia Sesión</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}