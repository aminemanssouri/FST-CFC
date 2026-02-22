import { Link, useLocation } from 'react-router-dom'
import { Button } from './ui'

export default function Navbar() {
    const location = useLocation()
    const isActive = (path) => location.pathname === path

    const linkClass = (path) =>
        `relative py-1 text-sm font-medium transition-all duration-300 ${isActive(path)
            ? 'text-white after:absolute after:-bottom-0.5 after:left-0 after:w-full after:h-0.5 after:bg-brand-400'
            : 'text-slate-400 hover:text-white'
        }`

    return (
        <nav className="sticky top-0 z-50 bg-brand-900/95 backdrop-blur-xl border-b border-white/[0.08]">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-[72px]">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-accent-500 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-lg group-hover:scale-105 transition-transform">
                        CFC
                    </div>
                    <span className="text-white font-bold text-lg hidden md:block">
                        Centre de Formation Continue
                    </span>
                </Link>

                {/* Navigation Links */}
                <ul className="hidden lg:flex items-center gap-8">
                    <li><Link to="/" className={linkClass('/')}>Accueil</Link></li>
                    <li><Link to="/catalogue" className={linkClass('/catalogue')}>Formations</Link></li>
                    <li><Link to="/dashboard" className={linkClass('/dashboard')}>Mon Espace</Link></li>
                    <li><Link to="/admin" className={linkClass('/admin')}>Administration</Link></li>
                    <li><Link to="/super-admin" className={linkClass('/super-admin')}>Super Admin</Link></li>
                </ul>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <Button to="/login" variant="ghost" size="sm">Connexion</Button>
                    <Button to="/inscription" size="sm">S'inscrire</Button>
                </div>
            </div>
        </nav>
    )
}
