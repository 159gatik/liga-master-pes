import LoginForm from "../components/Auth/LoginForm";

export default function LoginPage() {
    return (
        <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Decoración de fondo (Opcional) */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/bg-pattern.png')] opacity-5 pointer-events-none"></div>

            <div className="z-10 w-full max-w-md">
                <LoginForm />
            </div>
        </main>
    );
}