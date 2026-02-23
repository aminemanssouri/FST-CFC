import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <footer className="bg-brand-900 text-white pt-16 pb-8 px-6 border-t font-sans">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 relative z-10">
                {/* Brand */}
                <div className="md:col-span-2">
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-3 tracking-tight">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-800 font-bold text-sm shadow-sm relative overflow-hidden">
                            <span className="relative z-10">CFC</span>
                        </div>
                        CFC | USMS
                    </h3>
                    <p className="text-brand-100 text-sm leading-relaxed max-w-md">
                        Le Centre de Formation Continue offre des programmes de formation diplômants
                        pluridisciplinaires au sein de l'université. Plus de 50 formations couvrant
                        l'ingénierie, le management, les langues et les sciences.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-brand-300 mb-6">Liens rapides</h4>
                    <ul className="space-y-3">
                        {[
                            { to: '/', label: 'Accueil' },
                            { to: '/catalogue', label: 'Formations' },
                            { to: '/inscription', label: 'Pré-inscription' },
                            { to: '/login', label: 'Connexion' },
                        ].map(link => (
                            <li key={link.to}>
                                <Link to={link.to} className="text-brand-100 text-sm hover:text-white transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-brand-300 mb-6">Contact</h4>
                    <ul className="space-y-4 text-sm text-brand-100">
                        <li>
                            <a href="tel:+212523483793" className="hover:text-white transition-colors flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-brand-800 flex items-center justify-center text-primary-500">📞</span>
                                +212 05-23-48-37-93
                            </a>
                        </li>
                        <li>
                            <a href="mailto:cfc@usms.ma" className="hover:text-white transition-colors flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-brand-800 flex items-center justify-center text-primary-500">✉️</span>
                                cfc@usms.ma
                            </a>
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-brand-800 flex items-center justify-center text-primary-500">📍</span>
                            Beni Mellal, Maroc
                        </li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-brand-800 pt-8 text-center flex flex-col items-center justify-center gap-2 relative z-10">
                <p className="text-brand-300 text-sm">
                    &copy; {new Date().getFullYear()} Centre de Formation Continue USMS. Tous droits réservés.
                </p>
            </div>
        </footer>
    )
}
