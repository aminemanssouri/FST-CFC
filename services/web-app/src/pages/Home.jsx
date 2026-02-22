import { Link } from 'react-router-dom'
import { Button, Card } from '../components/ui'

const establishments = [
    { id: 1, name: 'FST Béni Mellal', code: 'FST-BM', count: 9, icon: '🔬' },
    { id: 2, name: 'FEG Béni Mellal', code: 'FEG-BM', count: 42, icon: '📊' },
    { id: 3, name: 'ENSA Khouribga', code: 'ENSA-KH', count: 4, icon: '⚙️' },
    { id: 4, name: 'ENCG Béni Mellal', code: 'ENCG-BM', count: 19, icon: '💼' },
    { id: 5, name: 'EST Béni Mellal', code: 'EST-BM', count: 7, icon: '🖥️' },
    { id: 6, name: 'FP Béni Mellal', code: 'FP-BM', count: 13, icon: '📚' },
    { id: 7, name: 'EST Khénifra', code: 'EST-KH', count: 3, icon: '🏗️' },
    { id: 8, name: 'FLSH Béni Mellal', code: 'FLSH-BM', count: 4, icon: '✍️' },
]

const stats = [
    { number: '+1200', label: 'Lauréats' },
    { number: '+350', label: 'Étudiants/an' },
    { number: '+200', label: 'Intervenants' },
    { number: '+50', label: 'Formations' },
]

export default function Home() {
    return (
        <div className="animate-fade-in">
            {/* ── Hero ── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white py-24 px-6 text-center">
                <div className="absolute -top-1/2 -right-[20%] w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-1/3 -left-[10%] w-[400px] h-[400px] bg-accent-500/10 rounded-full blur-3xl" />

                <div className="relative z-10 max-w-3xl mx-auto animate-slide-up">
                    <span className="inline-block px-4 py-1.5 bg-brand-500/15 border border-brand-500/30 rounded-full text-sm font-medium text-brand-300 mb-6">
                        🎓 Université Sultan Moulay Slimane
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-5">
                        Centre de{' '}
                        <span className="bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
                            Formation Continue
                        </span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
                        Découvrez nos programmes de formation diplômants pluridisciplinaires.
                        Ingénierie, management, langues et sciences — plus de 50 formations.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Button to="/catalogue" size="lg">📋 Explorer le catalogue</Button>
                        <Button to="/inscription" variant="accent" size="lg">✏️ Pré-inscription</Button>
                    </div>
                </div>
            </section>

            {/* ── Stats ── */}
            <section className="relative z-10 -mt-12 px-6">
                <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 bg-brand-900 rounded-xl overflow-hidden shadow-2xl">
                    {stats.map((s, i) => (
                        <div key={i} className="p-6 text-center border-r border-white/[0.06] last:border-r-0">
                            <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
                                {s.number}
                            </div>
                            <div className="text-sm text-slate-500 mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Establishments ── */}
            <section className="py-20 px-6">
                <h2 className="text-3xl font-extrabold text-center mb-3 tracking-tight">Nos Établissements</h2>
                <p className="text-center text-slate-500 max-w-xl mx-auto mb-12 text-lg">
                    Découvrez les formations proposées par chaque établissement
                </p>
                <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {establishments.map(e => (
                        <Link to={`/catalogue?etablissement=${e.code}`} key={e.id}>
                            <Card className="p-6 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-600 to-accent-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                                <div className="w-12 h-12 bg-gradient-to-br from-brand-600/10 to-accent-500/10 rounded-xl flex items-center justify-center text-2xl mb-4">
                                    {e.icon}
                                </div>
                                <h3 className="font-bold text-slate-800 mb-1">{e.name}</h3>
                                <p className="text-sm font-semibold text-brand-600">{e.count} Formations</p>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="bg-slate-50 py-20 px-6 text-center">
                <h2 className="text-3xl font-extrabold mb-3 tracking-tight">Rejoignez-Nous</h2>
                <p className="text-slate-500 max-w-xl mx-auto mb-8 text-lg">
                    Rejoignez une grande communauté d'étudiants au Centre de Formation Continue
                </p>
                <Button to="/inscription" size="lg">Commencer votre inscription →</Button>
            </section>
        </div>
    )
}
