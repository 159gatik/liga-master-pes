"use client";
import { useState } from "react";
import { auth, db } from "../../src/lib/firebase"; // Usando el alias que configuramos
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function RegisterPage() {
    const [formData, setFormData] = useState({ email: "", password: "", username: "" });

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                username: formData.username,
                email: formData.email,
                team: "Libre",
                wins: 0,
                losses: 0
            });

            alert("¡Usuario registrado con éxito!");
        } catch (error) {
            if (error instanceof Error) {
                console.error("Error:", error.message);
                alert("Error al registrar: " + error.message);
            } else {
                console.error("Ocurrió un error desconocido");
            }
        } // <--- Aquí faltaba cerrar el catch
    }; // <--- Aquí faltaba cerrar la función

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white p-10">
            <h1 className="text-2xl font-bold mb-4 text-black">Registro Torneo PES 6</h1>
            <form onSubmit={handleRegister} className="flex flex-col gap-4 w-80">
                <input
                    type="text"
                    placeholder="Nombre de usuario (PES)"
                    className="border p-2 text-black border-gray-300 rounded"
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    className="border p-2 text-black border-gray-300 rounded"
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="border p-2 text-black border-gray-300 rounded"
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                />
                <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors">
                    Registrarse
                </button>
            </form>
        </div>
    );
}