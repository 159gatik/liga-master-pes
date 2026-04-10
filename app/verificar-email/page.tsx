"use client";
import { auth } from "@/src/lib/firebase";
import { sendEmailVerification } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Mail, RefreshCw, ArrowLeft, CheckCircle } from "lucide-react";

export default function VerificarEmail() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState<string | null>(null);

    useEffect(() => {
        // Obtenemos el mail del usuario recién registrado
        const user = auth.currentUser;
        if (user) {
            setEmail(user.email);
            // Si ya está verificado por algún motivo, lo mandamos al inicio
            if (user.emailVerified) router.push("/");
        } else {
            // Si no hay usuario logueado, no debería estar acá
            router.push("/registro");
        }
    }, [router]);

    const handleResend = async () => {
        setLoading(true);
        try {
            if (auth.currentUser) {
                await sendEmailVerification(auth.currentUser);
                alert("¡Correo reenviado con éxito!");
            }
        } catch (error) {
            alert("Error al reenviar. Espera unos minutos e intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    // Dentro de tu página /verificar-email al hacer clic en "Continuar"
    const handleCheckVerification = async () => {
        if (auth.currentUser) {
            await auth.currentUser.reload(); // ESTO refresca el estado del email
            if (auth.currentUser.emailVerified) {
                router.push("/");
            } else {
                alert("Aún no has verificado tu correo.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-sans">
            <div className="max-w-md w-full bg-[#111] border border-[#222] p-8 shadow-2xl text-center">

                {/* Icono Principal */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-[#c9a84c]/10 rounded-full flex items-center justify-center border border-[#c9a84c]/30">
                        <Mail className="text-[#c9a84c] w-10 h-10 animate-pulse" />
                    </div>
                </div>

                <h1 className="font-bebas text-4xl text-[#c9a84c] mb-2 tracking-wide uppercase">
                    ¡Casi eres un DT oficial!
                </h1>

                <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                    Hemos enviado un enlace de activación a: <br />
                    <span className="text-white font-bold">{email || "tu correo"}</span>
                </p>

                <div className="space-y-4">
                    <div className="bg-black/40 border border-[#222] p-4 rounded text-left">
                        <h4 className="text-[#c9a84c] text-xs font-bold uppercase mb-2 flex items-center gap-2">
                            <CheckCircle size={14} /> Próximos pasos:
                        </h4>
                        <ul className="text-[13px] text-gray-500 space-y-2">
                            <li>• Revisa tu carpeta de <span className="text-gray-300">Spam o Correo no deseado</span>.</li>
                            <li>• Haz clic en el botón <span className="text-gray-300">Verify Email</span> en el mensaje.</li>
                            <li>• Una vez hecho, refresca esta página o vuelve a ingresar.</li>
                        </ul>
                    </div>

                    <button
                        onClick={handleCheckVerification}
                        className="w-full bg-[#c9a84c] text-black font-bebas text-xl py-3 hover:bg-[#b08d35] transition-all flex items-center justify-center gap-2"
                    >
                        Ya lo verifiqué, continuar
                    </button>

                    <button
                        onClick={handleResend}
                        disabled={loading}
                        className="w-full bg-transparent border border-[#333] text-gray-400 font-medium py-2 text-sm hover:bg-white/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <RefreshCw className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                        Reenviar correo de activación
                    </button>
                </div>

                <button
                    onClick={() => router.push("/login")}
                    className="mt-8 text-gray-600 text-xs flex items-center justify-center gap-1 hover:text-[#c9a84c] transition-colors"
                >
                    <ArrowLeft size={12} /> Volver al inicio de sesión
                </button>
            </div>
        </div>
    );
}