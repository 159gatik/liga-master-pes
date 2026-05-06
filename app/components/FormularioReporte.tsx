"use client";
import { useState } from "react";
import { db } from "@/src/lib/firebase";
import { doc, writeBatch, collection, addDoc, serverTimestamp, increment } from "firebase/firestore";
import { useAuth } from "@/src/lib/hooks/useAuht";
import { Alert, Toast } from "@/src/lib/alerts";

interface Props {
    fechaNumero: number;
    rivales: { id: string, nombre: string }[];
    equipoNombre: string;
    esCopa?: boolean;
}

export default function FormularioReporte({ fechaNumero, rivales, equipoNombre, esCopa = false }: Props) {
    const { userData, user } = useAuth();
    const [subiendo, setSubiendo] = useState(false);
    const [formData, setFormData] = useState({
        rivalId: "",
        resultado: "victoria",
        golesPro: "",
        golesRival: "",
        comentario: "",
        captura1: "", captura2: "", captura3: "",
    });

    const enviarReporte = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user || !userData?.equipoId) return alert("Error de sesión");

        if (!formData.captura1 || !formData.captura2 || !formData.captura3) {
            return Alert.fire({
                icon: 'warning',
                title: 'FALTAN LAS CAPTURAS',
                text: 'Las 3 capturas son obligatorias según el reglamento.',
            });
        }

        if (formData.golesPro === "" || formData.golesRival === "") {
            return Alert.fire({
                icon: 'warning',
                title: 'DATOS INCOMPLETOS',
                text: 'Faltan ingresar los goles del partido.',
            });
        }

        setSubiendo(true);
        try {
            const batch = writeBatch(db);
            const nombreColeccion = esCopa ? "reportes_copa" : "reportes";
            const reporteRef = collection(db, nombreColeccion);
            const userRef = doc(db, "users", user.uid);
            const equipoRef = doc(db, "equipos", userData.equipoId);

            const nombreRival = rivales.find(r => r.id === formData.rivalId)?.nombre || "Rival Desconocido";

            // Guardar reporte con el campo DIVISION: "A"
            await addDoc(reporteRef, {
                ...formData,
                dtUid: user.uid,
                equipoId: userData.equipoId,
                nombreDT: userData.nombre,
                fechaTorneo: Number(fechaNumero),
                division: "A", // <--- INYECCIÓN AUTOMÁTICA PARA FILTRADO
                ronda: esCopa ? Number(fechaNumero) : null,
                torneo: esCopa ? "copa" : "liga",
                local: equipoNombre || userData?.nombre || "Equipo Local",
                visita: nombreRival,
                score: `${formData.golesPro}-${formData.golesRival}`,
                fecha: serverTimestamp(),
            });

            const esWin = formData.resultado === "victoria";
            const esEmpate = formData.resultado === "empate";

            batch.update(userRef, {
                wins: esWin ? increment(1) : increment(0),
                losses: formData.resultado === "derrota" ? increment(1) : increment(0)
            });

            batch.update(equipoRef, {
                puntos: esWin ? increment(3) : esEmpate ? increment(1) : increment(0),
                pj: increment(1),
                pg: esWin ? increment(1) : increment(0),
                pe: esEmpate ? increment(1) : increment(0),
                pp: formData.resultado === "derrota" ? increment(1) : increment(0),
                gf: increment(Number(formData.golesPro)),
                gc: increment(Number(formData.golesRival)),
                df: increment(Number(formData.golesPro) - Number(formData.golesRival))
            });

            await batch.commit();

            Toast.fire({
                icon: 'success',
                title: 'Reporte enviado con éxito'
            });

            window.location.reload();
        } catch (error) {
            console.error("Error al reportar:", error);
            Alert.fire({
                icon: 'warning',
                title: 'ERROR',
                text: 'No se pudo subir el reporte.',
            });
        } finally {
            setSubiendo(false);
        }
    };

    return (
        <form onSubmit={enviarReporte} className="bg-[#111] border-t-4 border-[#c9a84c] p-8 space-y-6 shadow-2xl relative">
            <div className="absolute top-0 right-0 p-3 opacity-5 font-bebas text-3xl select-none">OFFICIAL REPORT</div>

            <h4 className="font-bebas text-3xl text-[#c9a84c] italic uppercase tracking-tighter">
                Reportar <span className="text-white">Jornada {fechaNumero}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Rival del Encuentro</label>
                    <select
                        required
                        className="bg-[#0a0a0a] border border-white/5 p-3 text-white outline-none focus:border-[#c9a84c] font-barlow italic transition-all cursor-pointer"
                        onChange={(e) => setFormData({ ...formData, rivalId: e.target.value })}
                    >
                        <option value="">Seleccionar Rival...</option>
                        {rivales.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Resultado Final</label>
                    <select
                        className="bg-[#0a0a0a] border border-white/5 p-3 text-white outline-none focus:border-[#c9a84c] font-barlow italic transition-all cursor-pointer"
                        onChange={(e) => setFormData({ ...formData, resultado: e.target.value })}
                    >
                        <option value="victoria">VICTORIA (+3 pts)</option>
                        <option value="empate">EMPATE (+1 pts)</option>
                        <option value="derrota">DERROTA (0 pts)</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Mis Goles</label>
                    <input
                        type="number" required placeholder="0"
                        className="bg-[#0a0a0a] border border-white/5 p-4 text-center text-white font-bebas text-2xl outline-none focus:border-[#c9a84c]"
                        onChange={(e) => setFormData({ ...formData, golesPro: e.target.value })}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Goles Rival</label>
                    <input
                        type="number" required placeholder="0"
                        className="bg-[#0a0a0a] border border-white/5 p-4 text-center text-white font-bebas text-2xl outline-none focus:border-[#c9a84c]"
                        onChange={(e) => setFormData({ ...formData, golesRival: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block">Enlaces de Captura (Imgur / Discord)</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="url" required placeholder="Goles" className="bg-[#0a0a0a] border border-white/5 p-3 text-[11px] outline-none focus:border-[#c9a84c] font-barlow"
                        onChange={(e) => setFormData({ ...formData, captura1: e.target.value })} />
                    <input type="url" required placeholder="Resultado" className="bg-[#0a0a0a] border border-white/5 p-3 text-[11px] outline-none focus:border-[#c9a84c] font-barlow"
                        onChange={(e) => setFormData({ ...formData, captura2: e.target.value })} />
                    <input type="url" required placeholder="Estadísticas" className="bg-[#0a0a0a] border border-white/5 p-3 text-[11px] outline-none focus:border-[#c9a84c] font-barlow"
                        onChange={(e) => setFormData({ ...formData, captura3: e.target.value })} />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Crónica del Partido</label>
                <textarea
                    placeholder="Escribe brevemente lo que pasó en el partido..."
                    className="w-full bg-[#0a0a0a] border border-white/5 p-4 text-sm h-28 outline-none focus:border-[#c9a84c] font-barlow italic resize-none"
                    onChange={(e) => setFormData({ ...formData, comentario: e.target.value })}
                />
            </div>

            <button
                type="submit"
                disabled={subiendo}
                className="w-full bg-[#c9a84c] text-black font-bebas text-2xl py-4 skew-x-[-15deg] hover:bg-white transition-all disabled:opacity-50"
            >
                <span className="inline-block skew-x-[15deg]">
                    {subiendo ? "PROCESANDO DATOS..." : "ENVIAR REPORTE OFICIAL"}
                </span>
            </button>
        </form>
    );
}