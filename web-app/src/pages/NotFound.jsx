import { Link } from 'react-router-dom'
import { Button } from '../components/ui'

export default function NotFound() {
    return (
        <div className="min-h-[calc(100vh-72px)] bg-slate-50 flex items-center justify-center px-6 relative overflow-hidden animate-fade-in">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-primary-400/10 rounded-full blur-[120px] pointer-events-none mix-blend-multiply" />

            <div className="text-center max-w-lg relative z-10 glass-panel p-12 rounded-3xl border border-white/60 shadow-soft">
                <div className="text-9xl font-extrabold font-outfit bg-gradient-to-br from-primary-600 to-accent-600 bg-clip-text text-transparent mb-6 drop-shadow-sm">
                    404
                </div>
                <h1 className="text-3xl font-bold text-slate-800 mb-3 font-outfit tracking-tight">Oups! Page introuvable</h1>
                <p className="text-slate-500 mb-10 text-lg leading-relaxed">
                    Il semble que la page que vous recherchez n'existe pas ou ait été déplacée vers une nouvelle adresse.
                </p>
                <div className="flex justify-center">
                    <Button to="/" size="lg" variant="primary" className="shadow-glow px-8 rounded-full">
                        <span className="mr-2">←</span> Retourner à l'accueil
                    </Button>
                </div>
            </div>
        </div>
    )
}
