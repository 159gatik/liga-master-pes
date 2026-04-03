"use client";
import { useState } from "react";
import { auth } from "@/src/lib/firebase";
import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
    const router = useRouter();

    // 1. FUNCIÓN PARA INICIAR SESIÓN
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMensaje({ tipo: "", texto: "" });

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/equipos");
        } catch (error) {
            console.error("Error de usuario:", error);
            let textoError = "Error al iniciar sesión.";
            if (error.code === "auth/user-not-found") textoError = "El usuario no existe.";
            if (error.code === "auth/wrong-password") textoError = "Contraseña incorrecta.";
            if (error.code === "auth/invalid-credential") textoError = "Credenciales inválidas.";

            setMensaje({ tipo: "error", texto: textoError });
        } finally {
            setLoading(false);
        }
    };

    // 2. FUNCIÓN PARA "OLVIDASTE TU CONTRASEÑA"
    const handleResetPassword = async () => {
        if (!email) {
            setMensaje({ tipo: "error", texto: "Ingresá tu email para restablecer la contraseña." });
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            setMensaje({
                tipo: "exito",
                texto: "Email de recuperación enviado. Revisá tu bandeja de entrada."
            });
        } catch (error) {
            console.error("Error al enviar la recuperación:", error);
            setMensaje({ tipo: "error", texto: "No se pudo enviar el correo de recuperación." });
        }
    };

    return (
        <section className="max-w-md mx-auto bg-[#111] border border-[#2a2a2a] p-8 shadow-2xl border-t-4 border-t-[#c9a84c]">
            <div className="mb-8 text-center">
                <h2 className="font-bebas text-4xl text-white tracking-widest uppercase">Acceso DT</h2>
                <p className="font-barlow-condensed text-[#888] text-xs uppercase tracking-[2px]">Ingresá a la oficina de El Legado</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5 font-barlow-condensed">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] tracking-[2px] text-[#888] uppercase">Email</label>
                    <input
                        type="email"
                        required
                        className="bg-[#1a1a1a] border border-[#333] p-3 text-white outline-none focus:border-[#c9a84c] transition-colors"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[10px] tracking-[2px] text-[#888] uppercase">Contraseña</label>
                    <input
                        type="password"
                        required
                        className="bg-[#1a1a1a] border border-[#333] p-3 text-white outline-none focus:border-[#c9a84c] transition-colors"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {mensaje.texto && (
                    <p className={`text-[11px] uppercase tracking-widest text-center font-bold ${mensaje.tipo === "error" ? "text-red-500" : "text-[#27ae60]"
                        }`}>
                        {mensaje.texto}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#c9a84c] text-black font-bebas text-2xl py-3 tracking-[3px] hover:bg-white transition-all disabled:opacity-50"
                >
                    {loading ? "Entrando..." : "Entrar"}
                </button>

                <div className="text-center pt-2">
                    <button
                        type="button"
                        onClick={handleResetPassword}
                        className="text-[10px] text-[#555] uppercase tracking-widest hover:text-[#c9a84c] transition-colors underline decoration-[#333]"
                    >
                        ¿Olvidaste tu contraseña?
                    </button>
                </div>
            </form>
        </section>
    );
}