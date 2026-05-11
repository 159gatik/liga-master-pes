"use client";
import { useState, useRef } from "react";
import { auth, db } from "@/src/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import Link from "next/link";
import { Alert } from "@/src/lib/alerts";

export default function RegisterPage() {
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        username: "",
        aceptarReglamento: false
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        // VALIDACIONES PREVIAS
        if (formData.password !== formData.confirmPassword) {
            return Alert.fire({ icon: 'warning', title: 'CONTRASEÑA', text: 'Las contraseñas no coinciden.' });
        }

        if (!formData.aceptarReglamento) {
            return Alert.fire({ icon: 'warning', title: 'REGLAMENTO', text: 'Debes aceptar el reglamento para unirte.' });
        }

        if (!captchaToken) {
            return Alert.fire({ icon: 'warning', title: 'SEGURIDAD', text: 'Completa el reCAPTCHA.' });
        }

        setLoading(true);

        try {
            // 1. Crear el usuario en Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            // 2. Actualizar displayName
            await updateProfile(user, { displayName: formData.username });

            // 3. Crear documento en Firestore (Estructura optimizada para PES 6)
            await setDoc(doc(db, "users", user.uid), {
                nombre: formData.username,
                email: formData.email,
                rol: "invitado",
                ligas: {
                    pes6: { rol: "pendiente", equipoId: "" }
                },
                nombreEquipo: "Sin Equipo",
                discord: "",
                whatsapp: "",
                wins: 0,
                losses: 0,
                fechaRegistro: new Date().toISOString(),
                emailVerificado: false
            });

            // 4. Enviar email de verificación
            try {
                await sendEmailVerification(user);
            } catch (emailError) {
                console.error("Error al enviar mail:", emailError);
            }

            Alert.fire({
                icon: 'success',
                title: '¡CONTRATO FIRMADO!',
                text: `Bienvenido DT ${formData.username}. Activa tu cuenta desde el email enviado.`,
            }).then(() => {
                router.push("/verificar-email");
            });

        } catch (error: any) {
            console.error("Error registro:", error.message);
            let msg = "Error al procesar el registro.";
            if (error.code === "auth/email-already-in-use") msg = "Este email ya está en uso.";
            Alert.fire({ icon: 'error', title: 'ERROR', text: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] p-6 text-[#f0ece0] pt-24 italic">
            <div className="w-full max-w-md bg-[#111] border border-[#2a2a2a] border-t-4 border-t-[#c9a84c] p-10 shadow-2xl relative animate-in fade-in zoom-in duration-500">

                {/* Decoración de esquina */}
                <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#c9a84c]/20"></div>

                <div className="mb-10 text-center">
                    <h1 className="font-bebas text-6xl text-white tracking-tighter uppercase leading-none">
                        Nuevo <span className="text-[#c9a84c]">DT</span>
                    </h1>
                    <p className="font-barlow-condensed text-[#555] uppercase tracking-[4px] text-xs mt-2">
                        Ficha por la liga El Legado
                    </p>
                </div>

                <form onSubmit={handleRegister} className="flex flex-col gap-5 font-barlow-condensed">

                    {/* NICKNAME */}
                    <div className="space-y-1">
                        <label className="text-[10px] text-[#c9a84c] uppercase font-bold tracking-[2px] ml-1">Nickname de DT</label>
                        <input
                            type="text"
                            required
                            placeholder="EJ: NICK_DT"
                            className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white outline-none focus:border-[#c9a84c] transition-all"
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>

                    {/* EMAIL */}
                    <div className="space-y-1">
                        <label className="text-[10px] text-[#c9a84c] uppercase font-bold tracking-[2px] ml-1">Email Oficial</label>
                        <input
                            type="email"
                            required
                            placeholder="dt@ellegado.com"
                            className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white outline-none focus:border-[#c9a84c] transition-all"
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    {/* PASSWORD GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] text-[#c9a84c] uppercase font-bold tracking-[2px] ml-1">Contraseña</label>
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white outline-none focus:border-[#c9a84c] transition-all"
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-[#c9a84c] uppercase font-bold tracking-[2px] ml-1">Confirmar</label>
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full bg-[#1a1a1a] border border-[#333] p-3 text-white outline-none focus:border-[#c9a84c] transition-all"
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* LIGA INFO */}
                    <div className="p-3 bg-black/40 border-l-2 border-[#c9a84c] flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Inscripción Activa:</span>
                        <span className="text-xs font-bold text-[#c9a84c] uppercase">PES 6 ONLINE</span>
                    </div>

                    {/* REGLAMENTO */}
                    <label className="flex items-start gap-3 p-4 bg-black/20 border border-white/5 cursor-pointer group">
                        <input
                            type="checkbox"
                            required
                            className="mt-1 accent-[#c9a84c]"
                            onChange={(e) => setFormData({ ...formData, aceptarReglamento: e.target.checked })}
                        />
                        <p className="text-[10px] text-gray-500 uppercase leading-relaxed group-hover:text-gray-300 transition-colors">
                            Acepto el <span className="text-white underline">reglamento</span>, las normas de conducta y el uso de herramientas de conexión obligatorias.
                        </p>
                    </label>

                    {/* CAPTCHA */}
                    <div className="flex justify-center my-2 grayscale hover:grayscale-0 transition-all scale-90">
                        <ReCAPTCHA
                            ref={recaptchaRef}
                            sitekey="6Lc4B8wsAAAAAO0OCTlfTLqukUxTMuwFffafksXo"
                            onChange={(token) => setCaptchaToken(token)}
                            theme="dark"
                        />
                    </div>

                    {/* BOTÓN ESTILO CONTRATO */}
                    <button
                        type="submit"
                        disabled={loading || !captchaToken}
                        className="relative w-full bg-[#c9a84c] text-black font-bebas text-4xl py-4 mt-4 tracking-[3px] uppercase hover:bg-white hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_20px_rgba(201,168,76,0.15)] disabled:opacity-20"
                    >
                        {loading ? "Firmando..." : "Firmar Contrato"}
                    </button>
                </form>

                <div className="mt-10 text-center border-t border-white/5 pt-6 font-barlow-condensed">
                    <p className="text-[#444] text-[11px] uppercase tracking-widest">
                        ¿Ya tienes ficha de DT? {" "}
                        <Link href="/login" className="text-[#c9a84c] hover:text-white font-bold transition-colors">Entrar a la Oficina</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}