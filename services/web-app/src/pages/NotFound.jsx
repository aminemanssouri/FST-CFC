import { Link } from 'react-router-dom'
import { Button } from '../components/ui'

export default function NotFound() {
    return (
        <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-6 animate-fade-in">
            <div className="text-center max-w-md">
                <div className="text-8xl font-extrabold bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent mb-4">
                    404
                </div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Page introuvable</h1>
                <p className="text-slate-500 mb-8">
                    La page que vous recherchez n'existe pas ou a été déplacée.
                </p>
                <Button to="/" size="lg">← Retour à l'accueil</Button>
            </div>
        </div>
    )
}
