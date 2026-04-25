"use client";
import { useState } from "react";
import { auth, db } from "@/src/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const [formData, setFormData] = useState({ email: "", password: "", username: "", ligas: { pes6: false, pes2013: false } });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Crear el usuario en Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            // 2. Actualizar el perfil de Auth (displayName) de inmediato
            await updateProfile(user, { displayName: formData.username });

            // 3. CREAR EL DOCUMENTO EN FIRESTORE (Prioridad máxima)
            // Guardamos los datos antes de enviar el mail para asegurar presencia en DB
            await setDoc(doc(db, "users", user.uid), {
                nombre: formData.username,
                email: formData.email,
                rol: "dt", // Ahora todos entran como dt
                // Nueva estructura:
                ligas: {
                    pes6: formData.ligas.pes6 ? { rol: "dt", equipoId: "" } : null,
                    pes2013: formData.ligas.pes2013 ? { rol: "dt", equipoId: "" } : null
                },
                // Mantén campos antiguos para compatibilidad si los necesitas
                nombreEquipo: "Sin Equipo",
                discord: "",
                wins: 0,
                losses: 0,
                fechaRegistro: new Date().toISOString(),
                emailVerificado: false
            });

            // 4. ENVIAR EMAIL DE VERIFICACIÓN (Paso final)
            // Usamos un try interno por si el servicio de correos falla, que no rompa el registro
            try {
                await sendEmailVerification(user);
            } catch (emailError) {
                console.error("Error al enviar email, pero el usuario se creó en DB:", emailError);
            }

            // 5. Notificación y redirección
            alert(`¡Registro exitoso, ${formData.username}! Revisa tu correo (${formData.email}) para activar tu cuenta de DT.`);
            router.push("/verificar-email");

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Error desconocido";
            console.error("Error en el registro:", errorMessage);

            if (errorMessage.includes("auth/email-already-in-use")) {
                alert("Este correo ya está registrado en la liga.");
            } else if (errorMessage.includes("permission-denied")) {
                alert("Error de permisos en la base de datos. Avisa al administrador.");
            } else {
                alert("Error al registrar: " + errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-[#0a0a0a] p-6 text-[#f0ece0]">
            <div className="w-full max-w-md bg-[#111] border border-[#2a2a2a] border-t-4 border-t-[#c9a84c] p-10 shadow-2xl relative">

                {/* Decoración de esquina estética */}
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#c9a84c]/30"></div>

                <h1 className="font-bebas text-5xl text-center text-white mb-2 tracking-widest uppercase italic">
                    Unirse a <span className="text-[#c9a84c]">La Liga Online</span>
                </h1>
                <p className="font-barlow-condensed text-center text-[#555] uppercase tracking-[3px] text-sm mb-10 italic">
                    Crea tu identidad de DT para empezar
                </p>

                <form onSubmit={handleRegister} className="flex flex-col gap-6 font-barlow-condensed">
                    <div className="space-y-1">
                        <label className="text-[15px] text-[#c9a84c] uppercase font-bold tracking-widest ml-1 italic">Nombre de DT (Nick PES 6)</label>
                        <input
                            type="text"
                            placeholder="Usuario Online"
                            className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white outline-none focus:border-[#c9a84c] transition-all italic"
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[15px] text-[#c9a84c] uppercase font-bold tracking-widest ml-1 italic">Correo Electrónico</label>
                        <input
                            type="email"
                            placeholder="dt@ellegado.com"
                            className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white outline-none focus:border-[#c9a84c] transition-all italic"
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[15px] text-[#c9a84c] uppercase font-bold tracking-widest ml-1 italic">Contraseña de Acceso</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white outline-none focus:border-[#c9a84c] transition-all"
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                    <div className="flex gap-4 p-4 bg-[#1a1a1a] border border-[#333] justify-center">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.ligas.pes6}
                                onChange={(e) => setFormData({ ...formData, ligas: { ...formData.ligas, pes6: e.target.checked } })}
                            />
                            <span className="text-sm font-bold uppercase italic text-[#c9a84c]">Jugar PES 6</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.ligas.pes2013}
                                onChange={(e) => setFormData({ ...formData, ligas: { ...formData.ligas, pes2013: e.target.checked } })}
                            />
                            <span className="text-sm font-bold uppercase italic text-[#00aaff]">Jugar PES 2013</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#c9a84c] text-black font-bebas text-3xl py-3 mt-4 tracking-[4px] uppercase hover:bg-white transition-all shadow-[0_0_20px_rgba(201,168,76,0.2)] disabled:opacity-50 italic"
                    >
                        {loading ? "Inscribiendo..." : "Finalizar Registro"}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-[#222] pt-6">
                    <p className="text-[#444] text-xs uppercase tracking-widest italic">
                        ¿Ya formas parte? {" "}
                        <Link href="/login" className="text-[#c9a84c] hover:underline font-bold">Inicia Sesión</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}