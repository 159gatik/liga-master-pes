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
    const { user, userData } = useAuth();
    const [enviando, setEnviando] = useState(false);

    // Estado para la validación de identidad
    const [nombreConfirmacion, setNombreConfirmacion] = useState("");
    const [esNombreValido, setEsNombreValido] = useState(true);

    const [formData, setFormData] = useState({
        nicknamePes: "",
        edad: "",
        email: "",
        discord: "",
        internet: "",
        jugoOnline: "SI",
        pais: "",
        equipoNombre: equipoPreseleccionado,
        equipoId: equipoIdPreseleccionado
    });

    // Validar el nombre en tiempo real
    useEffect(() => {
        if (nombreConfirmacion.length > 0 && userData?.nombre) {
            setEsNombreValido(nombreConfirmacion === userData.nombre);
        } else {
            setEsNombreValido(true);
        }
    }, [nombreConfirmacion, userData?.nombre]);

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            equipoNombre: equipoPreseleccionado,
            equipoId: equipoIdPreseleccionado
        }));
    }, [equipoPreseleccionado, equipoIdPreseleccionado]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Verificación final antes de enviar
        if (nombreConfirmacion !== userData?.nombre) {
            alert("El nombre de confirmación no coincide con tu Nick de registro.");
            return;
        }

        if (!user || !userData) return alert("Debes iniciar sesión.");
        if (!formData.equipoId) return alert("Selecciona un equipo de la grilla.");

        setEnviando(true);

        try {
            await addDoc(collection(db, "postulaciones"), {
                uid: user.uid,
                nombre: userData.nombre,
                equipoNombre: formData.equipoNombre,
                equipoId: formData.equipoId,
                nicknamePes: formData.nicknamePes,
                discord: formData.discord,
                email: formData.email,
                pais: formData.pais,
                edad: formData.edad,
                internet: formData.internet,
                experiencia: formData.jugoOnline,
                fecha: serverTimestamp()
            });

            await emailjs.send(
                'service_nb187ge', 'template_rxcjm7t',
                {
                    from_name: userData.nombre,
                    equipo_nombre: formData.equipoNombre,
                    discord_user: formData.discord,
                    user_email: formData.email
                },
                'qK8p-VpJF5iDs8kPJ'
            );

            alert("¡Postulación enviada con éxito!");
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("Error al enviar.");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <section className="max-w-2xl mx-auto bg-[#111] border border-[#2a2a2a] border-t-4 border-t-[#c9a84c] p-8 shadow-2xl">
            <div className="mb-6 border-b border-[#222] pb-4 text-center">
                <p className="text-[10px] tracking-[3px] text-[#c9a84c] uppercase font-bold italic">Postulante Detectado</p>
                <h2 className="font-bebas text-5xl text-white italic tracking-widest">{userData?.nombre || "Cargando..."}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 font-barlow-condensed text-white">

                {/* CAMPO DE VALIDACIÓN DE NOMBRE */}
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] tracking-[2px] text-[#c9a84c] uppercase font-bold">Confirmar Identidad</label>
                    <p className="text-[11px] text-gray-500 italic mb-1 uppercase">Escribe tu Nick de registro exactamente igual:</p>
                    <input
                        type="text"
                        required
                        value={nombreConfirmacion}
                        className={`bg-[#1a1a1a] border p-2 outline-none transition-all ${esNombreValido ? 'border-[#333] focus:border-[#c9a84c]' : 'border-red-600 focus:border-red-600'
                            }`}
                        placeholder="Confirmar Nick..."
                        onChange={(e) => setNombreConfirmacion(e.target.value)}
                    />
                    {!esNombreValido && (
                        <span className="text-red-600 text-[10px] uppercase font-bold italic animate-pulse">El nombre no coincide</span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* PREGUNTA DE EXPERIENCIA LIGA MASTER ONLINE */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] tracking-[2px] text-[#888] uppercase">¿Experiencia en Liga Master Online?</label>
                        <select
                            required
                            className="bg-[#1a1a1a] border border-[#333] p-2 outline-none focus:border-[#c9a84c] text-sm uppercase"
                            onChange={(e) => setFormData({ ...formData, jugoOnline: e.target.value })}
                            value={formData.jugoOnline}
                        >
                            <option value="SI">SÍ, TENGO EXPERIENCIA</option>
                            <option value="NO">NO, SOY NUEVO</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] tracking-[2px] text-[#888] uppercase">País de residencia</label>
                        <input type="text" required className="bg-[#1a1a1a] border border-[#333] p-2 outline-none focus:border-[#c9a84c]"
                            onChange={(e) => setFormData({ ...formData, pais: e.target.value })} />
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-[10px] tracking-[2px] text-[#c9a84c] uppercase font-bold italic">Equipo Seleccionado</label>
                    <input type="text" value={formData.equipoNombre} readOnly className="bg-[#1a1a1a] border border-[#c9a84c] p-2 text-[#c9a84c] font-bold cursor-default uppercase" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] tracking-[2px] text-[#888] uppercase">Usuario Discord</label>
                        <input type="text" required placeholder="Nombre#1234" className="bg-[#1a1a1a] border border-[#333] p-2 outline-none focus:border-[#c9a84c]"
                            onChange={(e) => setFormData({ ...formData, discord: e.target.value })} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] tracking-[2px] text-[#888] uppercase">Internet (MB)</label>
                        <input type="text" required className="bg-[#1a1a1a] border border-[#333] p-2 outline-none focus:border-[#c9a84c]"
                            onChange={(e) => setFormData({ ...formData, internet: e.target.value })} />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={enviando || !esNombreValido || nombreConfirmacion === ""}
                    className={`w-full font-bebas text-3xl py-4 mt-4 tracking-[4px] uppercase transition-all shadow-lg ${(enviando || !esNombreValido || nombreConfirmacion === "")
                        ? "bg-gray-800 text-gray-500 cursor-not-allowed opacity-50"
                        : "bg-[#c9a84c] text-black hover:bg-white active:scale-95"
                        }`}
                >
                    {enviando ? "Procesando..." : "Finalizar Postulación"}
                </button>
            </form>
        </section>
    );
}