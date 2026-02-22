import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from './ui'

export default function Navbar() {
    const location = useLocation()
    const { user, isAuthenticated, isCandidat, isAdmin, isSuperAdmin, logout } = useAuth()
    const [mobileOpen, setMobileOpen] = useState(false)

    const isActive = (path) => location.pathname === path

    const linkClass = (path) =>
        `relative py-1 text-sm font-medium transition-all duration-300 ${isActive(path)
            ? 'text-white after:absolute after:-bottom-0.5 after:left-0 after:w-full after:h-0.5 after:bg-brand-400'
            : 'text-slate-400 hover:text-white'
        }`

    const mobileLinkClass = (path) =>
        `block px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive(path)
            ? 'bg-brand-600/20 text-brand-400'
            : 'text-slate-300 hover:bg-white/5 hover:text-white'
        }`

    const links = [
        { to: '/', label: 'Accueil', show: true },
        { to: '/catalogue', label: 'Formations', show: true },
        { to: '/dashboard', label: 'Mon Espace', show: isCandidat },
        { to: '/admin', label: 'Administration', show: isAdmin },
        { to: '/super-admin', label: 'Super Admin', show: isSuperAdmin },
    ]

    return (
        <nav className="sticky top-0 z-50 bg-brand-900/95 backdrop-blur-xl border-b border-white/[0.08]">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-[72px]">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-accent-500 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-lg group-hover:scale-105 transition-transform">
                        CFC
                    </div>
                    <span className="text-white font-bold text-lg hidden md:block">
                        Centre de Formation Continue
                    </span>
                </Link>

                {/* Desktop Nav */}
                <ul className="hidden lg:flex items-center gap-8">
                    {links.filter(l => l.show).map(l => (
                        <li key={l.to}><Link to={l.to} className={linkClass(l.to)}>{l.label}</Link></li>
                    ))}
                </ul>

                {/* Desktop Actions */}
                <div className="hidden lg:flex items-center gap-3">
                    {isAuthenticated ? (
                        <>
                            <Link to="/profil" className="text-sm text-slate-400 hover:text-white transition-colors">
                                👤 {user.nom}
                            </Link>
                            <Button variant="ghost" size="sm" onClick={logout}>Déconnexion</Button>
                        </>
                    ) : (
                        <>
                            <Button to="/login" variant="ghost" size="sm">Connexion</Button>
                            <Button to="/inscription" size="sm">S'inscrire</Button>
                        </>
                    )}
                </div>

                {/* Mobile Hamburger */}
                <button
                    className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
                    <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
                    <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="lg:hidden bg-brand-900 border-t border-white/[0.06] animate-fade-in">
                    <div className="px-4 py-4 space-y-1">
                        {links.filter(l => l.show).map(l => (
                            <Link key={l.to} to={l.to} className={mobileLinkClass(l.to)} onClick={() => setMobileOpen(false)}>
                                {l.label}
                            </Link>
                        ))}

                        <div className="border-t border-white/10 pt-3 mt-3 space-y-1">
                            {isAuthenticated ? (
                                <>
                                    <Link to="/profil" className={mobileLinkClass('/profil')} onClick={() => setMobileOpen(false)}>
                                        ⚙️ Mon Profil
                                    </Link>
                                    <button onClick={() => { logout(); setMobileOpen(false) }} className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
                                        🚪 Déconnexion
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className={mobileLinkClass('/login')} onClick={() => setMobileOpen(false)}>Connexion</Link>
                                    <Link to="/inscription" className={mobileLinkClass('/inscription')} onClick={() => setMobileOpen(false)}>S'inscrire</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
