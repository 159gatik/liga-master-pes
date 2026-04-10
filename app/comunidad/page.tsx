import ChatDTs from "../components/ChatDTs";


export default function ComunidadPage(equipoUsuario) {
    return (
        <main className="min-h-screen bg-[#0a0a0a] p-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Lado izquierdo: Reglas o Anuncios (1 columna) */}
                <div className="space-y-6">
                    <div className="bg-[#111] border border-[#c9a84c]/30 p-6">
                        <h2 className="font-bebas text-3xl text-[#c9a84c] mb-4">REGLAS DEL CHAT</h2>
                        <ul className="text-gray-400 text-sm space-y-2 italic">
                            <li>• Prohibido insultar a los rivales.</li>
                            <li>• Coordinar partidos con respeto.</li>
                           
                            <li>• No faltar el respeto</li>
                        </ul>
                    </div>
                </div>

                {/* Centro/Derecha: El Chat (2 columnas) */}
                <div className="lg:col-span-2">
                    <ChatDTs equipoUsuario={equipoUsuario} />
                </div>
            </div>
        </main>
    );
}