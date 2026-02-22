import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <footer className="bg-brand-900 text-white pt-12 pb-6 px-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
                {/* Brand */}
                <div>
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                        <span className="text-2xl">🎓</span> Centre de Formation Continue
                    </h3>
                    <p className="text-slate-400 text-sm leading-7">
                        Le Centre de Formation Continue offre des programmes de formation diplômants
                        pluridisciplinaires au sein de l'université. Plus de 50 formations couvrant
                        l'ingénierie, le management, les langues et les sciences.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Liens rapides</h4>
                    <ul className="space-y-2.5">
                        {[
                            { to: '/', label: 'Accueil' },
                            { to: '/catalogue', label: 'Formations' },
                            { to: '/inscription', label: 'Pré-inscription' },
                            { to: '/login', label: 'Connexion' },
                        ].map(link => (
                            <li key={link.to}>
                                <Link to={link.to} className="text-slate-400 text-sm hover:text-brand-400 transition-colors">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Contact</h4>
                    <ul className="space-y-2.5 text-sm text-slate-400">
                        <li>
                            <a href="tel:+212523483793" className="hover:text-brand-400 transition-colors">
                                📞 +212 05-23-48-37-93
                            </a>
                        </li>
                        <li>
                            <a href="mailto:cfc@usms.ma" className="hover:text-brand-400 transition-colors">
                                ✉️ cfc@usms.ma
                            </a>
                        </li>
                        <li>📍 Beni Mellal, Maroc</li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-white/[0.06] pt-6 text-center text-slate-500 text-sm">
                &copy; {new Date().getFullYear()} Centre de Formation Continue — Tous droits réservés
            </div>
        </footer>
    )
}
