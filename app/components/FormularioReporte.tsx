"use client";
import { useState } from "react";
import { db } from "@/src/lib/firebase";
import { doc, writeBatch, collection, addDoc, serverTimestamp, increment } from "firebase/firestore";
import { useAuth } from "@/src/lib/hooks/useAuht";

interface Props {
    fechaNumero: number;
    rivales: { id: string, nombre: string }[]; // Lista de equipos para el select
}

export default function FormularioReporte({ fechaNumero, rivales }: Props) {
    const { userData, user } = useAuth();
    const [subiendo, setSubiendo] = useState(false);
    const [formData, setFormData] = useState({
        rivalId: "",
        resultado: "victoria", // victoria, empate, derrota
        comentario: "",
        captura1: "",
        captura2: "",
        captura3: ""
    });

    const enviarReporte = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !userData?.equipoId) return alert("Error de sesión");
        if (!formData.captura1 || !formData.captura2 || !formData.captura3) {
            return alert("Las 3 capturas son obligatorias según el reglamento.");
        }

        setSubiendo(true);
        try {
            const batch = writeBatch(db);
            const reporteRef = collection(db, "reportes");
            const userRef = doc(db, "users", user.uid);
            const equipoRef = doc(db, "equipos", userData.equipoId);

            // 1. Guardar el reporte
            await addDoc(reporteRef, {
                ...formData,
                dtUid: user.uid,
                equipoId: userData.equipoId,
                nombreDT: userData.nombre,
                fechaTorneo: Number(fechaNumero),
                timestamp: serverTimestamp(),
            });

            // 2. Actualizar estadísticas del DT y Puntos del Equipo
            const esWin = formData.resultado === "victoria";
            const esEmpate = formData.resultado === "empate";

            batch.update(userRef, {
                wins: esWin ? increment(1) : increment(0),
                losses: formData.resultado === "derrota" ? increment(1) : increment(0)
            });

            batch.update(equipoRef, {
                puntos: esWin ? increment(3) : esEmpate ? increment(1) : increment(0),
                pj: increment(1), // Partidos Jugados
                pg: esWin ? increment(1) : increment(0),
                pe: esEmpate ? increment(1) : increment(0),
                pp: formData.resultado === "derrota" ? increment(1) : increment(0)
            });

            await batch.commit();
            alert("Reporte subido y tabla actualizada.");
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("Error al subir el reporte.");
        } finally {
            setSubiendo(false);
        }
    };

    return (
        <form onSubmit={enviarReporte} className="bg-[#111] border border-[#222] p-6 space-y-4 font-barlow-condensed">
            <h4 className="font-bebas text-2xl text-[#c9a84c] italic uppercase">Reportar Fecha {fechaNumero}</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Selección de Rival */}
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-500 uppercase font-bold">Rival</label>
                    <select
                        required
                        className="bg-[#0a0a0a] border border-[#333] p-2 text-white outline-none focus:border-[#c9a84c]"
                        onChange={(e) => setFormData({ ...formData, rivalId: e.target.value })}
                    >
                        <option value="">Seleccionar Rival...</option>
                        {rivales.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                    </select>
                </div>

                {/* Resultado */}
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-500 uppercase font-bold">Tu Resultado</label>
                    <select
                        className="bg-[#0a0a0a] border border-[#333] p-2 text-white outline-none focus:border-[#c9a84c]"
                        onChange={(e) => setFormData({ ...formData, resultado: e.target.value })}
                    >
                        <option value="victoria">VICTORIA (+3 pts)</option>
                        <option value="empate">EMPATE (+1 pts)</option>
                        <option value="derrota">DERROTA (0 pts)</option>
                    </select>
                </div>
            </div>

            {/* Capturas Obligatorias */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input type="url" required placeholder="Link Captura 1 (IMGUR/Discord)" className="bg-[#0a0a0a] border border-[#333] p-2 text-xs"
                    onChange={(e) => setFormData({ ...formData, captura1: e.target.value })} />
                <input type="url" required placeholder="Link Captura 2 (Resultado)" className="bg-[#0a0a0a] border border-[#333] p-2 text-xs"
                    onChange={(e) => setFormData({ ...formData, captura2: e.target.value })} />
                <input type="url" required placeholder="Link Captura 3 (Estadísticas)" className="bg-[#0a0a0a] border border-[#333] p-2 text-xs"
                    onChange={(e) => setFormData({ ...formData, captura3: e.target.value })} />
            </div>

            <textarea
                placeholder="Comentario extra del partido"
                className="w-full bg-[#0a0a0a] border border-[#333] p-3 text-sm h-24 outline-none focus:border-[#c9a84c]"
                onChange={(e) => setFormData({ ...formData, comentario: e.target.value })}
            />

            <button
                type="submit"
                disabled={subiendo}
                className="w-full bg-[#c9a84c] text-black font-bebas text-xl py-3 hover:bg-white transition-all disabled:opacity-50"
            >
                {subiendo ? "PROCESANDO RESULTADO..." : "SUBIR REPORTE OFICIAL"}
            </button>
        </form>
    );
}