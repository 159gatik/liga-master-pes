"use client";
import { useState, useEffect } from "react";
import { db } from "../../src/lib/firebase";
import { collection, getDocs, doc, updateDoc, increment } from "firebase/firestore";

export default function AdminPanel() {
    const [players, setPlayers] = useState([]);
    const [winnerId, setWinnerId] = useState("");
    const [loserId, setLoserId] = useState("");
    const [loading, setLoading] = useState(false);

    // Cargar jugadores al entrar
    useEffect(() => {
        const fetchPlayers = async () => {
            const querySnapshot = await getDocs(collection(db, "users"));
            const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPlayers(docs);
        };
        fetchPlayers();
    }, []);

    const handleMatchResult = async (e) => {
        e.preventDefault();
        if (!winnerId || !loserId || winnerId === loserId) {
            alert("Selecciona dos jugadores distintos");
            return;
        }

        setLoading(true);
        try {
            // Referencias a los documentos en Firestore
            const winnerRef = doc(db, "users", winnerId);
            const loserRef = doc(db, "users", loserId);

            // Actualización atómica: suma 1 a cada campo correspondiente
            await updateDoc(winnerRef, { wins: increment(1) });
            await updateDoc(loserRef, { losses: increment(1) });

            alert("Resultado cargado con éxito. ¡Tabla actualizada!");
            setWinnerId("");
            setLoserId("");
        } catch (error) {
            console.error("Error al cargar resultado:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-10 bg-gray-900 min-h-screen text-white flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-8">Panel de Control - PES 6</h1>

            <form onSubmit={handleMatchResult} className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <div className="mb-4">
                    <label className="block mb-2">Ganador del Partido:</label>
                    <select
                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                        value={winnerId}
                        onChange={(e) => setWinnerId(e.target.value)}
                    >
                        <option value="">Seleccionar Ganador...</option>
                        {players.map(p => <option key={p.id} value={p.id}>{p.username}</option>)}
                    </select>
                </div>

                <div className="mb-6">
                    <label className="block mb-2">Perdedor del Partido:</label>
                    <select
                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                        value={loserId}
                        onChange={(e) => setLoserId(e.target.value)}
                    >
                        <option value="">Seleccionar Perdedor...</option>
                        {players.map(p => <option key={p.id} value={p.id}>{p.username}</option>)}
                    </select>
                </div>

                <button
                    disabled={loading}
                    className={`w-full p-3 rounded font-bold transition ${loading ? 'bg-gray-500' : 'bg-green-600 hover:bg-green-500'}`}
                >
                    {loading ? "Procesando..." : "Registrar Resultado"}
                </button>
            </form>
        </div>
    );
}