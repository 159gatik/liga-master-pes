"use client";
import { useState } from "react";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/lib/hooks/useAuht";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Alert } from "@/src/lib/alerts";

export default function ReporteAusencia() {
    const { user, userData } = useAuth();
    const [motivo, setMotivo] = useState("");
    const [enviando, setEnviando] = useState(false);

    const reportar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!motivo.trim()) return;

        setEnviando(true);
        try {
            await addDoc(collection(db, "reportes_ausencias"), {
                dt: userData?.nombre || "Anónimo",
                equipo: userData?.nombreEquipo || "Sin equipo",
                uid: user?.uid,
                motivo: motivo.trim(),
                fecha: serverTimestamp(),
                estado: "pendiente" // Para que el Admin lo marque como "Visto"
            });
            setMotivo("");
            Alert.fire("Reporte enviado", "El comité de disciplina ha recibido tu aviso.", "success");
        } catch (error) {
            Alert.fire("Error", "No se pudo enviar el reporte.", "error");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <section className="bg-[#050505] border border-[#222] p-6 shadow-xl my-6">
            <h3 className="font-bebas text-2xl text-red-500 uppercase italic mb-4">
                ⚠️ Reporte de Ausencia / Abandono
            </h3>
            <p className="text-gray-400 text-sm mb-6">
                Si no podrás presentarte a tus compromisos, notifícalo aquí para evitar sanciones.
            </p>

            <form onSubmit={reportar} className="space-y-4">
                <textarea
                    className="w-full bg-black border border-[#333] p-3 text-white focus:border-red-500 outline-none h-24 resize-none"
                    placeholder="Describe brevemente el motivo de tu ausencia..."
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    required
                />
                <button
                    disabled={enviando}
                    className="w-full bg-red-900/30 border border-red-800 text-red-500 font-bold py-2 uppercase hover:bg-red-800 hover:text-white transition-all"
                >
                    {enviando ? "ENVIANDO..." : "NOTIFICAR AUSENCIA"}
                </button>
            </form>
        </section>
    );
}