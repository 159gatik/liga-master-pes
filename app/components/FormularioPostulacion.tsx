"use client";
import { useState } from "react";
import { db } from "../../src/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

interface FormularioProps {
    equipoPreseleccionado?: string;
}

export default function FormularioPostulacion({ equipoPreseleccionado = "" }: FormularioProps) {
    const [formData, setFormData] = useState({
        nombre: "",
        nickname: "",
        edad: "",
        email: "",
        discord: "",
        internet: "",
        jugoOnline: "SI",
        equipo: equipoPreseleccionado
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "postulaciones"), {
                ...formData,
                fecha: new Date().toISOString()
            });
            alert("¡Postulación enviada con éxito!");
        } catch (error) {
            console.error("Error al enviar:", error);
            alert("Error al enviar la postulación.");
        }
    };

    return (
        <section className="max-w-2xl mx-auto bg-[#111] border border-[#2a2a2a] border-t-4 border-t-[#c9a84c] p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5 font-barlow-condensed">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Nombre */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] tracking-[2px] text-[#888] uppercase">Nombre / Nick</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-[#1a1a1a] border border-[#333] p-2 text-white outline-none focus:border-[#c9a84c] transition-colors"
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        />
                    </div>

                    {/* Nickname Juego */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] tracking-[2px] text-[#888] uppercase">Nickname PES 6 *</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-[#1a1a1a] border border-[#333] p-2 text-white outline-none focus:border-[#c9a84c] transition-colors"
                            onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Edad */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] tracking-[2px] text-[#888] uppercase">Edad *</label>
                        <input
                            type="number"
                            required
                            className="w-full bg-[#1a1a1a] border border-[#333] p-2 text-white outline-none focus:border-[#c9a84c]"
                            onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                        />
                    </div>

                    {/* Discord */}
                    <div className="flex flex-col md:col-span-2 gap-1">
                        <label className="text-[10px] tracking-[2px] text-[#888] uppercase">Usuario Discord *</label>
                        <input
                            type="text"
                            required
                            placeholder="Ej: usuario#1234"
                            className="w-full bg-[#1a1a1a] border border-[#333] p-2 text-white outline-none focus:border-[#c9a84c]"
                            onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] tracking-[2px] text-[#888] uppercase">Correo electrónico *</label>
                    <input
                        type="email"
                        required
                        className="w-full bg-[#1a1a1a] border border-[#333] p-2 text-white outline-none focus:border-[#c9a84c]"
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Internet */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] tracking-[2px] text-[#888] uppercase">Velocidad Internet (MB)</label>
                        <input
                            type="text"
                            className="w-full bg-[#1a1a1a] border border-[#333] p-2 text-white outline-none focus:border-[#c9a84c]"
                            onChange={(e) => setFormData({ ...formData, internet: e.target.value })}
                        />
                    </div>

                    {/* Equipo Seleccionado (Solo Lectura) */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] tracking-[2px] text-[#c9a84c] uppercase font-bold">Equipo Elegido</label>
                        <input
                            type="text"
                            value={formData.equipo || "Seleccioná un escudo arriba"}
                            readOnly
                            className="w-full bg-[#1a1a1a] border border-[#c9a84c] p-2 text-[#c9a84c] font-bold outline-none cursor-default"
                        />
                    </div>
                </div>

                {/* Radio: ¿Jugó Online? */}
                <div className="pt-2">
                    <label className="text-[10px] tracking-[2px] text-[#888] uppercase block mb-3">¿Ya jugaste PES 6 Online?</label>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio" name="online" value="SI" defaultChecked
                                className="w-4 h-4 accent-[#c9a84c]"
                                onChange={(e) => setFormData({ ...formData, jugoOnline: e.target.value })}
                            />
                            <span className="text-xs uppercase tracking-widest group-hover:text-[#c9a84c] transition-colors">Sí, tengo experiencia</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio" name="online" value="NO"
                                className="w-4 h-4 accent-[#c9a84c]"
                                onChange={(e) => setFormData({ ...formData, jugoOnline: e.target.value })}
                            />
                            <span className="text-xs uppercase tracking-widest group-hover:text-[#c9a84c] transition-colors">No, soy nuevo</span>
                        </label>
                    </div>
                </div>

                {/* Botón Enviar */}
                <button
                    type="submit"
                    className="w-full bg-[#c9a84c] text-[#0a0a0a] font-bold py-4 mt-4 uppercase tracking-[4px] text-sm hover:bg-[#f0d070] transition-all transform hover:scale-[1.01] active:scale-[0.98]"
                >
                    Enviar Postulación
                </button>
            </form>
        </section>
    );
}