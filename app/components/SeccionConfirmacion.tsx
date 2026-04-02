"use client";
import { useState } from "react";
import { db } from "../../src/lib/firebase"; // Ajustá la ruta a tu config
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function SeccionConfirmacion() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        vendedor: "",
        comprador: "",
        jugador: "",
        monto: ""
    });

    const enviarSolicitud = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addDoc(collection(db, "solicitudes_mercado"), {
                ...formData,
                monto: Number(formData.monto), // Convertimos a número para Pandas
                estado: "pendiente", // Para que vos lo apruebes después
                fecha: serverTimestamp()
            });
            alert("Solicitud enviada. El moderador revisará el presupuesto.");
            setFormData({ vendedor: "", comprador: "", jugador: "", monto: "" });
        } catch (error) {
            console.error("Error:", error);
            alert("Error al enviar la solicitud.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-[#111] border border-[#2a2a2a] border-t-4 border-t-[#27ae60] p-8 shadow-xl">
            <h4 className="font-bebas text-3xl text-[#27ae60] mb-6 tracking-[2px] uppercase">
                Confirmar Operación
            </h4>
            <form onSubmit={enviarSolicitud} className="space-y-4 font-barlow-condensed">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] text-[#888] uppercase mb-1 font-bold tracking-widest">Vendedor</label>
                        <select
                            required
                            className="w-full bg-[#1a1a1a] border border-[#333] p-2 text-white outline-none focus:border-[#c9a84c]"
                            onChange={(e) => setFormData({ ...formData, vendedor: e.target.value })}
                        >
                            <option value="">Seleccionar...</option>
                            <option value="Atlético Madrid">Atlético Madrid</option>
                            <option value="Bayern Munich">Bayern Munich</option>
                            {/* ... Mapear tus 10 equipos aquí */}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] text-[#888] uppercase mb-1 font-bold tracking-widest">Comprador</label>
                        <select
                            required
                            className="w-full bg-[#1a1a1a] border border-[#333] p-2 text-white outline-none focus:border-[#c9a84c]"
                            onChange={(e) => setFormData({ ...formData, comprador: e.target.value })}
                        >
                            <option value="">Seleccionar...</option>
                            <option value="Inter de Milán">Inter de Milán</option>
                            <option value="Real Madrid">Real Madrid</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] text-[#888] uppercase mb-1 font-bold tracking-widest">Nombre del Jugador</label>
                    <input
                        type="text"
                        required
                        placeholder="Ej: Radamel Falcao"
                        className="w-full bg-[#1a1a1a] border border-[#333] p-2 text-white outline-none focus:border-[#c9a84c]"
                        onChange={(e) => setFormData({ ...formData, jugador: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-[10px] text-[#888] uppercase mb-1 font-bold tracking-widest">Monto del Traspaso ($)</label>
                    <input
                        type="number"
                        required
                        placeholder="Solo números (Ej: 5000000)"
                        className="w-full bg-[#1a1a1a] border border-[#333] p-2 text-[#27ae60] font-bold outline-none focus:border-[#c9a84c]"
                        onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    />
                </div>

                <div className="bg-[#1a1a1a] p-4 text-[#888] italic text-xs border-l-2 border-[#c9a84c]">
                    Al enviar, ambos DTs confirman que el trato es legítimo. El sistema verificará el cumplimiento del presupuesto.
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full font-bold py-3 uppercase tracking-[3px] transition-all ${loading ? "bg-gray-600 cursor-not-allowed" : "bg-[#27ae60] text-black hover:bg-white"
                        }`}
                >
                    {loading ? "Procesando..." : "Enviar para Validación"}
                </button>
            </form>
        </div>
    );
}