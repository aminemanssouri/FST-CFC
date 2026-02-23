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
        `relative py-1 text-sm font-bold tracking-wider uppercase transition-all duration-300 ${isActive(path)
            ? 'text-brand-600 after:absolute after:-bottom-1.5 after:left-0 after:w-full after:h-1 after:bg-primary-500 after:rounded-t-sm'
            : 'text-slate-600 hover:text-brand-600'
        }`

    const mobileLinkClass = (path) =>
        `block px-4 py-3 rounded-xl text-sm font-bold tracking-wider uppercase transition-all duration-300 ${isActive(path)
            ? 'bg-brand-50 text-brand-600 border border-brand-200'
            : 'text-slate-600 hover:bg-slate-50 hover:text-brand-600'
        }`

    const links = [
        { to: '/', label: 'Accueil', show: true },
        { to: '/catalogue', label: 'Formations', show: true },
        { to: '/dashboard', label: 'Mon Espace', show: isCandidat },
        { to: '/admin', label: 'Administration', show: isAdmin },
        { to: '/super-admin', label: 'Super Admin', show: isSuperAdmin },
    ]

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-[80px]">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3.5 group" onClick={() => setMobileOpen(false)}>
                    <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:bg-brand-700 transition-all duration-300">
                        <span className="text-xl">CFC</span>
                    </div>
                    <span className="text-brand-800 font-bold text-lg hidden md:block tracking-tight border-l-2 border-slate-200 pl-3 ml-1">
                        USMS
                    </span>
                </Link>

                {/* Desktop Nav */}
                <ul className="hidden lg:flex items-center gap-8">
                    {links.filter(l => l.show).map(l => (
                        <li key={l.to}><Link to={l.to} className={linkClass(l.to)}>{l.label}</Link></li>
                    ))}
                </ul>

                {/* Desktop Actions */}
                <div className="hidden lg:flex items-center gap-4">
                    {isAuthenticated ? (
                        <>
                            <Link to="/profil" className="text-sm font-bold tracking-wider uppercase text-slate-600 hover:text-brand-600 transition-colors flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs">👤</span>
                                {user.nom}
                            </Link>
                            <Button variant="outline" size="sm" onClick={logout}>Déconnexion</Button>
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
                    className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 focus:outline-none"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    <span className={`block w-6 h-0.5 rounded-full bg-slate-800 transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
                    <span className={`block w-6 h-0.5 rounded-full bg-slate-800 transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
                    <span className={`block w-6 h-0.5 rounded-full bg-slate-800 transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="lg:hidden bg-white border-b border-slate-200 absolute w-full left-0 shadow-lg pb-4">
                    <div className="px-5 py-4 space-y-2">
                        {links.filter(l => l.show).map(l => (
                            <Link key={l.to} to={l.to} className={mobileLinkClass(l.to)} onClick={() => setMobileOpen(false)}>
                                {l.label}
                            </Link>
                        ))}

                        <div className="border-t border-slate-200 pt-4 mt-4 space-y-2">
                            {isAuthenticated ? (
                                <>
                                    <Link to="/profil" className={mobileLinkClass('/profil')} onClick={() => setMobileOpen(false)}>
                                        👤 Mon Profil
                                    </Link>
                                    <button onClick={() => { logout(); setMobileOpen(false) }} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold tracking-wider uppercase text-rose-600 hover:bg-rose-50 border border-transparent transition-all">
                                        🚪 Déconnexion
                                    </button>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <Button to="/login" variant="ghost" full size="sm" onClick={() => setMobileOpen(false)}>Connexion</Button>
                                    <Button to="/inscription" full size="sm" onClick={() => setMobileOpen(false)}>S'inscrire</Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
