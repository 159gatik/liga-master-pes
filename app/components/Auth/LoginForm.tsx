"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/src/lib/firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface CuentaGuardada {
    uid: string;
    nombre: string;
    email: string;
    equipo?: string;
}

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });
    const [cuentasGuardadas, setCuentasGuardadas] = useState<CuentaGuardada[]>([]);
    const [vista, setVista] = useState<"selector" | "login">("selector");
    const router = useRouter();

    // 1. CARGAR CUENTAS DEL STORAGE AL INICIAR
    useEffect(() => {
        const guardadas = localStorage.getItem("cuentas_el_legado");
        if (guardadas) {
            const parsed = JSON.parse(guardadas);
            setCuentasGuardadas(parsed);
            if (parsed.length > 0) setVista("selector");
        } else {
            setVista("login");
        }
    }, []);

    // 2. FUNCIÓN PARA GUARDAR CUENTA EN LOCALSTORAGE TRAS LOGIN ÉXITOSO
    const registrarCuentaLocal = async (uid: string, email: string) => {
        try {
            const userSnap = await getDoc(doc(db, "users", uid));
            if (userSnap.exists()) {
                const data = userSnap.data();
                const nuevaCuenta: CuentaGuardada = {
                    uid,
                    email,
                    nombre: data.nombre || "Usuario",
                    equipo: data.nombreEquipo || "Sin Club"
                };

                const actuales = JSON.parse(localStorage.getItem("cuentas_el_legado") || "[]");
                const filtradas = actuales.filter((c: CuentaGuardada) => c.uid !== uid);
                filtradas.push(nuevaCuenta);

                localStorage.setItem("cuentas_el_legado", JSON.stringify(filtradas.slice(-4))); // Guardamos hasta 4
            }
        } catch (e) {
            console.error("Error al cachear cuenta", e);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMensaje({ tipo: "", texto: "" });

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            await registrarCuentaLocal(userCredential.user.uid, email);
            router.push("/");
        } catch (error: any) {
            let textoError = "Error al iniciar sesión.";
            if (error.code === "auth/invalid-credential") textoError = "Credenciales inválidas.";
            setMensaje({ tipo: "error", texto: textoError });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!email) {
            setMensaje({ tipo: "error", texto: "Ingresá tu email para restablecer." });
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            setMensaje({ tipo: "exito", texto: "Email de recuperación enviado." });
        } catch (error) {
            setMensaje({ tipo: "error", texto: "No se pudo enviar el correo." });
        }
    };

    const eliminarCuentaCache = (e: React.MouseEvent, uid: string) => {
        e.stopPropagation();
        const filtradas = cuentasGuardadas.filter(c => c.uid !== uid);
        setCuentasGuardadas(filtradas);
        localStorage.setItem("cuentas_el_legado", JSON.stringify(filtradas));
        if (filtradas.length === 0) setVista("login");
    };

    // --- VISTA SELECTOR DE PERFILES (ESTILO STEAM) ---
    if (vista === "selector") {
        return (
            <section className="max-w-2xl mx-auto text-center animate-in fade-in zoom-in duration-500">
                <h2 className="font-bebas text-5xl text-white mb-2 tracking-widest italic uppercase">Iniciar sesión como...</h2>
                <p className="font-barlow-condensed text-[#c9a84c] text-sm uppercase tracking-[4px] mb-12">Seleccioná tu credencial de DT</p>

                <div className="flex flex-wrap justify-center gap-6">
                    {cuentasGuardadas.map((cuenta) => (
                        <div
                            key={cuenta.uid}
                            onClick={() => { setEmail(cuenta.email); setVista("login"); }}
                            className="group relative w-44 bg-[#111] border border-white/5 p-6 cursor-pointer hover:border-[#c9a84c] hover:scale-105 transition-all shadow-2xl"
                        >
                            <button
                                onClick={(e) => eliminarCuentaCache(e, cuenta.uid)}
                                className="absolute top-2 right-2 text-gray-700 hover:text-red-500 transition-colors z-10"
                            >✕</button>

                            <div className="w-20 h-20 bg-[#1a1a1a] border-2 border-[#222] group-hover:border-[#c9a84c] mx-auto mb-4 flex items-center justify-center font-bebas text-4xl text-white italic">
                                {cuenta.nombre.charAt(0)}
                            </div>

                            <p className="font-bebas text-xl text-white truncate leading-none mb-1">{cuenta.nombre}</p>
                            <p className="font-barlow-condensed text-[10px] text-[#c9a84c] uppercase tracking-widest">{cuenta.equipo}</p>
                        </div>
                    ))}

                    {/* BOTÓN OTRA CUENTA */}
                    <button
                        onClick={() => { setEmail(""); setVista("login"); }}
                        className="w-44 border-2 border-dashed border-[#222] flex flex-col items-center justify-center text-gray-600 hover:border-white hover:text-white transition-all p-6"
                    >
                        <span className="text-4xl mb-2">+</span>
                        <span className="font-bebas text-lg italic uppercase">Otra cuenta</span>
                    </button>
                </div>
            </section>
        );
    }

    // --- VISTA FORMULARIO (DISEÑO ACTUALIZADO) ---
    return (
        <section className="max-w-md mx-auto bg-[#111] border border-[#2a2a2a] p-8 shadow-2xl border-t-4 border-t-[#c9a84c] animate-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 text-center">
                <h2 className="font-bebas text-4xl text-white tracking-widest uppercase italic">
                    {email ? "Validar Acceso" : "Acceso DT"}
                </h2>
                <p className="font-barlow-condensed text-[#888] text-xs uppercase tracking-[2px]">
                    {email ? `Identidad: ${email}` : "Ingresá a la oficina de El Legado"}
                </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5 font-barlow-condensed">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] tracking-[2px] text-[#888] uppercase">Email</label>
                    <input
                        type="email"
                        required
                        value={email}
                        className="bg-[#1a1a1a] border border-[#333] p-3 text-white outline-none focus:border-[#c9a84c] transition-colors italic"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[10px] tracking-[2px] text-[#888] uppercase">Contraseña</label>
                    <input
                        type="password"
                        required
                        autoFocus={email !== ""}
                        className="bg-[#1a1a1a] border border-[#333] p-3 text-white outline-none focus:border-[#c9a84c] transition-colors italic"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {mensaje.texto && (
                    <p className={`text-[11px] uppercase tracking-widest text-center font-bold animate-pulse ${mensaje.tipo === "error" ? "text-red-500" : "text-[#27ae60]"}`}>
                        {mensaje.texto}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#c9a84c] text-black font-bebas text-3xl py-3 tracking-[3px] hover:bg-white transition-all disabled:opacity-50 italic"
                >
                    {loading ? "Sincronizando..." : "Conectar"}
                </button>

                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <button
                        type="button"
                        onClick={() => setVista("selector")}
                        className="text-[10px] text-[#555] uppercase hover:text-white transition-colors"
                    >
                        Volver al inicio
                    </button>
                    <button
                        type="button"
                        onClick={handleResetPassword}
                        className="text-[10px] text-[#555] uppercase hover:text-[#c9a84c] transition-colors underline decoration-[#333]"
                    >
                        ¿Olvidaste la clave?
                    </button>
                </div>
            </form>
        </section>
    );
}