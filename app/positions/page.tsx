"use client";
import { useEffect, useState } from "react";
// Si usas el alias @, recordá que es "@/lib/firebase"
import { db } from "../../src/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

interface Player {
    id: string;
    username: string;
    wins: number;
    losses: number;
    team: string;
}

export default function PositionsPage() {
    const [players, setPlayers] = useState<Player[]>([]);

    useEffect(() => {
        const q = query(collection(db, "users"), orderBy("wins", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            // CORRECCIÓN AQUÍ: 
            // Usamos 'as Player[]' para que TS entienda que los datos coinciden con tu interfaz
            const playersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Player[];

            setPlayers(playersData);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="p-10 bg-gray-100 min-h-screen text-black">
            <h1 className="text-3xl font-bold mb-6 text-center">Tabla de Posiciones</h1>
            <table className="w-full max-w-2xl mx-auto bg-white rounded shadow">
                <thead>
                    <tr className="bg-blue-600 text-white">
                        <th className="p-3 text-left">Jugador</th>
                        <th className="p-3">Victorias</th>
                        <th className="p-3">Derrotas</th>
                    </tr>
                </thead>
                <tbody>
                    {players.map((player) => (
                        <tr key={player.id} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="p-3 font-medium">{player.username}</td>
                            <td className="p-3 text-center font-bold text-green-600">{player.wins}</td>
                            <td className="p-3 text-center font-bold text-red-600">{player.losses}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}