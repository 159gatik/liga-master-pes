"use client";
import { useState, useEffect } from "react";
import { db } from "../../src/lib/firebase";
import { useAuth } from "@/src/lib/hooks/useAuht";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import emailjs from '@emailjs/browser';

interface FormularioProps {
    equipoPreseleccionado?: string;
    equipoIdPreseleccionado?: string;
}

export default function FormularioPostulacion({
    equipoPreseleccionado = "",
    equipoIdPreseleccionado = ""
}: FormularioProps) {
    const { user } = useAuth();
    const [enviando, setEnviando] = useState(false);

    const [formData, setFormData] = useState({
        nombre: "",
        nickname: "",
        edad: "",
        email: "",
        discord: "",
        internet: "",
        jugoOnline: "SI", // Valor por defecto
        Pais: "",
        equipoNombre: equipoPreseleccionado,
        equipoId: equipoIdPreseleccionado
    });

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            equipoNombre: equipoPreseleccionado,
            equipoId: equipoIdPreseleccionado
        }));
    }, [equipoPreseleccionado, equipoIdPreseleccionado]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!user) return alert("Debes iniciar sesión para postularte.");
        if (!formData.equipoId) return alert("Por favor, selecciona un equipo de la grilla.");

        setEnviando(true);

        try {
            await addDoc(collection(db, "postulaciones"), {
                uid: user.uid,
                nombreDT: formData.nombre,
                equipoNombre: formData.equipoNombre,
                equipoId: formData.equipoId,
                nickname: formData.nickname,
                discord: formData.discord,
                email: formData.email,
                pais: formData.Pais,
                edad: formData.edad,
                internet: formData.internet,
                experiencia: formData.jugoOnline, // <--- Esto es lo que verá la Bandeja
                fecha: serverTimestamp()
            });

            await emailjs.send(
                'service_nb187ge',
                'template_rxcjm7t',
                {
                    from_name: formData.nombre,
                    pes_nick: formData.nickname,
                    equipo_nombre: formData.equipoNombre,
                    discord_user: formData.discord,
                    user_email: formData.email,
                    experiencia: formData.jugoOnline // Lo enviamos también al correo
                },
                'qK8p-VpJF5iDs8kPJ'
            );

            alert("¡Postulación enviada con éxito!");
            window.location.reload();

        } catch (error) {
            console.error("Error al postular:", error);
            alert("Error al enviar.");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <section className="max-w-2xl mx-auto bg-[#111] border border-[#2a2a2a] border-t-4 border-t-[#c9a84c] p-8 shadow-2xl animate-fade-in">
            <form onSubmit={handleSubmit} className="space-y-5 font-barlow-condensed text-white">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] tracking-[2px] text-[#888] uppercase">Nombre Real</label>
                        <input type="text" required disabled={enviando} className="bg-[#1a1a1a] border border-[#333] p-2 outline-none focus:border-[#c9a84c]"
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] tracking-[2px] text-[#888] uppercase">Nickname PES 6 *</label>
                        <input type="text" required disabled={enviando} className="bg-[#1a1a1a] border border-[#333] p-2 outline-none focus:border-[#c9a84c]"
                            onChange={(e) => setFormData({ ...formData, nickname: e.target.value })} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] tracking-[2px] text-[#c9a84c] uppercase font-bold italic">Equipo Seleccionado</label>
                        <input type="text" value={formData.equipoNombre} readOnly className="bg-[#1a1a1a] border border-[#c9a84c] p-2 text-[#c9a84c] font-bold cursor-default" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] tracking-[2px] text-[#888] uppercase">País de residencia</label>
                        <input type="text" required disabled={enviando} className="bg-[#1a1a1a] border border-[#333] p-2 outline-none focus:border-[#c9a84c]"
                            onChange={(e) => setFormData({ ...formData, Pais: e.target.value })} />
                    </div>
                </div>

                {/* SECCIÓN DE EXPERIENCIA ONLINE */}
                <div className="bg-[#0a0a0a] p-4 border border-[#222]">
                    <label className="text-[10px] tracking-[2px] text-[#c9a84c] uppercase block mb-3 font-bold">¿Tienes experiencia en PES 6 Online?</label>
                    <div className="flex gap-10">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="online"
                                value="SI"
                                checked={formData.jugoOnline === "SI"}
                                className="accent-[#c9a84c]"
                                onChange={(e) => setFormData({ ...formData, jugoOnline: e.target.value })}
                            />
                            <span className="text-xs uppercase tracking-widest text-[#888] group-hover:text-white transition-colors">Sí</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="online"
                                value="NO"
                                checked={formData.jugoOnline === "NO"}
                                className="accent-[#c9a84c]"
                                onChange={(e) => setFormData({ ...formData, jugoOnline: e.target.value })}
                            />
                            <span className="text-xs uppercase tracking-widest text-[#888] group-hover:text-white transition-colors">No</span>
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] tracking-[2px] text-[#888] uppercase">Edad</label>
                        <input type="number" required disabled={enviando} className="bg-[#1a1a1a] border border-[#333] p-2 outline-none focus:border-[#c9a84c]"
                            onChange={(e) => setFormData({ ...formData, edad: e.target.value })} />
                    </div>
                    <div className="flex flex-col md:col-span-2 gap-1">
                        <label className="text-[10px] tracking-[2px] text-[#888] uppercase">Usuario Discord</label>
                        <input type="text" required disabled={enviando} className="bg-[#1a1a1a] border border-[#333] p-2 outline-none focus:border-[#c9a84c]"
                            onChange={(e) => setFormData({ ...formData, discord: e.target.value })} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] tracking-[2px] text-[#888] uppercase">Correo de contacto</label>
                        <input type="email" required disabled={enviando} className="bg-[#1a1a1a] border border-[#333] p-2 outline-none focus:border-[#c9a84c]"
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] tracking-[2px] text-[#888] uppercase">Internet (MB)</label>
                        <input type="text" required disabled={enviando} className="bg-[#1a1a1a] border border-[#333] p-2 outline-none focus:border-[#c9a84c]"
                            onChange={(e) => setFormData({ ...formData, internet: e.target.value })} />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={enviando}
                    className="w-full bg-[#c9a84c] text-black font-bebas text-2xl py-4 mt-4 tracking-[4px] uppercase hover:bg-white transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(201,168,76,0.1)]"
                >
                    {enviando ? "Enviando..." : "Finalizar Postulación"}
                </button>
            </form>
        </section>
    );
}