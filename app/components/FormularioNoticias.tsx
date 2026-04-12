"use client";
import { useState } from "react";
import { db } from "@/src/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/src/lib/hooks/useAuht";

export default function FormularioNoticia() {
    const { user, userData } = useAuth();
    const [titulo, setTitulo] = useState("");
    const [desc, setDesc] = useState("");
    const [categoria, setCategoria] = useState("Fichaje");
    const [enviando, setEnviando] = useState(false);

    if (!user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEnviando(true);

        try {
            const fechaActual = new Date();
            const meses = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

            await addDoc(collection(db, "novedades"), {
                titulo,
                desc,
                categoria,
                dia: fechaActual.getDate().toString().padStart(2, '0'),
                mes: meses[fechaActual.getMonth()],
                autor: userData?.nombre || "Anónimo",
                equipo: userData?.nombreEquipo || "Staff",
                timestamp: serverTimestamp(),
                uid: user.uid
            });

            setTitulo("");
            setDesc("");
            alert("Noticia publicada con éxito");
        } catch (error) {
            console.error(error);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-[#2a2a2a] p-6 space-y-4 mb-10">
            <h3 className="font-bebas text-2xl text-[#c9a84c] mb-2">Publicar Novedad</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    type="text"
                    placeholder="Título de la noticia..."
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="bg-black border border-[#333] p-3 text-sm text-white focus:border-[#c9a84c] outline-none"
                    required
                />
                <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="bg-black border border-[#333] p-3 text-sm text-[#c9a84c] outline-none"
                >
                    <option value="Fichaje">Fichaje</option>
                    <option value="Club">Actualidad del Club</option>
                    {userData?.rol === 'admin' && <option value="Torneo">Comunicado del Torneo</option>}
                    {userData?.rol === 'admin' && <option value="Campeonato">Nuevo Campeonato</option>}
                </select>
            </div>

            <textarea
                placeholder="Descripción o detalles..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full bg-black border border-[#333] p-3 text-sm text-gray-400 h-24 outline-none focus:border-[#c9a84c]"
                required
            />

            <button
                type="submit"
                disabled={enviando}
                className="bg-[#c9a84c] text-black font-bebas px-8 py-2 text-xl hover:bg-white transition-all disabled:opacity-50"
            >
                {enviando ? "Publicando..." : "Lanzar Noticia"}
            </button>
        </form>
    );
}