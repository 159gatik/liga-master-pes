"use client";
import { useState } from "react";
import { db } from "../../src/lib/firebase";
import { useAuth } from "@/src/lib/hooks/useAuht";  // Corregido typo
import { collection, addDoc } from "firebase/firestore";
import emailjs from '@emailjs/browser';

interface FormularioProps {
    equipoPreseleccionado?: string;
}

export default function FormularioPostulacion({ equipoPreseleccionado = "" }: FormularioProps) {
    const { user } = useAuth();
    const [enviando, setEnviando] = useState(false);
    const [formData, setFormData] = useState({
        nombre: "",
        nickname: "",
        edad: "",
        email: "",
        discord: "",
        internet: "",
        jugoOnline: "SI",
        Pais: "",
        equipo: equipoPreseleccionado
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Verificación de seguridad antes de procesar
        if (!user) return alert("Debes iniciar sesión para postularte.");
        if (!formData.equipo) return alert("Por favor, selecciona un equipo.");

        setEnviando(true);

        try {
            // 1. GUARDAR EN FIREBASE CON UID PARA EL BLOQUEO
            await addDoc(collection(db, "postulaciones"), {
                ...formData,
                uid: user.uid, // <--- CAMPO CRÍTICO PARA EL FILTRADO
                fecha: new Date().toISOString()
            });

            // 2. ENVIAR EMAILJS
            await emailjs.send(
                'service_nb187ge',
                'template_rxcjm7t',
                {
                    from_name: formData.nombre,
                    pes_nick: formData.nickname,
                    equipo_nombre: formData.equipo,
                    discord_user: formData.discord,
                    user_email: formData.email,
                    internet_speed: formData.internet,
                    experiencia: formData.jugoOnline,
                    edad_dt: formData.edad,
                    pais_dt: formData.Pais
                },
                'qK8p-VpJF5iDs8kPJ'
            );

            alert("¡Postulación enviada con éxito! El Admin revisará tu solicitud.");

            // Recarga para que EquiposPage detecte el UID en la BD y muestre el cartel de bloqueo
            window.location.reload();

        } catch (error) {
            console.error("Error completo:", error);
            alert("Ocurrió un error al enviar. Intenta nuevamente.");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <section className="max-w-2xl mx-auto bg-[#111] border border-[#2a2a2a] border-t-4 border-t-[#c9a84c] p-8 shadow-2xl animate-fade-in">
            <form onSubmit={handleSubmit} className="space-y-5 font-barlow-condensed text-white">

                {/* FILA 1: NOMBRES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] tracking-[2px] text-[#888] uppercase">Nombre Real / Nick</label>
                        <input type="text" required disabled={enviando} className="bg-[#1a1a1a] border border-[#333] p-2 outline-none focus:border-[#c9a84c] transition-colors" onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] tracking-[2px] text-[#888] uppercase">Nickname PES 6 *</label>
                        <input type="text" required disabled={enviando} className="bg-[#1a1a1a] border border-[#333] p-2 outline-none focus:border-[#c9a84c] transition-colors" onChange={(e) => setFormData({ ...formData, nickname: e.target.value })} />
                    </div>
                </div>

                {/* FILA 2: EQUIPO Y PAIS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] tracking-[2px] text-[#c9a84c] uppercase font-bold italic">Equipo Seleccionado</label>
                        <input type="text" value={formData.equipo} readOnly className="bg-[#1a1a1a] border border-[#c9a84c] p-2 text-[#c9a84c] font-bold outline-none cursor-default" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] tracking-[2px] text-[#888] uppercase">País de residencia</label>
                        <input type="text" required disabled={enviando} className="bg-[#1a1a1a] border border-[#333] p-2 outline-none focus:border-[#c9a84c] transition-colors" onChange={(e) => setFormData({ ...formData, Pais: e.target.value })} />
                    </div>
                </div>

                {/* FILA 3: EDAD Y DISCORD */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] tracking-[2px] text-[#888] uppercase">Edad</label>
                        <input type="number" required disabled={enviando} className="bg-[#1a1a1a] border border-[#333] p-2 outline-none focus:border-[#c9a84c]" onChange={(e) => setFormData({ ...formData, edad: e.target.value })} />
                    </div>
                    <div className="flex flex-col md:col-span-2 gap-1">
                        <label className="text-[10px] tracking-[2px] text-[#888] uppercase">Usuario Discord (Ej: user#1234)</label>
                        <input type="text" required disabled={enviando} className="bg-[#1a1a1a] border border-[#333] p-2 outline-none focus:border-[#c9a84c]" onChange={(e) => setFormData({ ...formData, discord: e.target.value })} />
                    </div>
                </div>

                {/* FILA 4: EMAIL Y RED */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] tracking-[2px] text-[#888] uppercase">Correo de contacto</label>
                        <input type="email" required disabled={enviando} className="bg-[#1a1a1a] border border-[#333] p-2 outline-none focus:border-[#c9a84c]" onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] tracking-[2px] text-[#888] uppercase">Velocidad Internet (MB)</label>
                        <input type="text" required disabled={enviando} className="bg-[#1a1a1a] border border-[#333] p-2 outline-none focus:border-[#c9a84c]" onChange={(e) => setFormData({ ...formData, internet: e.target.value })} />
                    </div>
                </div>

                {/* RADIO: EXPERIENCIA */}
                <div className="bg-[#0a0a0a] p-4 border border-[#222]">
                    <label className="text-[10px] tracking-[2px] text-[#c9a84c] uppercase block mb-3 font-bold">¿Tienes experiencia en PES 6 Online?</label>
                    <div className="flex gap-10">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="radio" name="online" value="SI" defaultChecked className="accent-[#c9a84c]" onChange={(e) => setFormData({ ...formData, jugoOnline: e.target.value })} />
                            <span className="text-xs uppercase tracking-widest text-[#888] group-hover:text-white transition-colors">Sí</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="radio" name="online" value="NO" className="accent-[#c9a84c]" onChange={(e) => setFormData({ ...formData, jugoOnline: e.target.value })} />
                            <span className="text-xs uppercase tracking-widest text-[#888] group-hover:text-white transition-colors">No</span>
                        </label>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={enviando}
                    className="w-full bg-[#c9a84c] text-black font-bebas text-2xl py-4 mt-4 tracking-[4px] uppercase hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(201,168,76,0.1)]"
                >
                    {enviando ? "Enviando..." : "Finalizar Postulación"}
                </button>
            </form>
        </section>
    );
}