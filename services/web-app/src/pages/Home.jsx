import { Link } from 'react-router-dom'
import { Button } from '../components/ui'

const establishments = [
    { id: 1, name: 'FST Béni Mellal', code: 'FST-BM', count: 9, icon: '🔬', desc: 'Faculté des Sciences et Techniques' },
    { id: 2, name: 'FEG Béni Mellal', code: 'FEG-BM', count: 42, icon: '📊', desc: "Faculté d'Économie et de Gestion" },
    { id: 3, name: 'ENSA Khouribga', code: 'ENSA-KH', count: 4, icon: '⚙️', desc: 'École Nationale des Sciences Appliquées' },
    { id: 4, name: 'ENCG Béni Mellal', code: 'ENCG-BM', count: 19, icon: '💼', desc: 'École Nationale de Commerce et de Gestion' },
    { id: 5, name: 'EST Béni Mellal', code: 'EST-BM', count: 7, icon: '🖥️', desc: 'École Supérieure de Technologie' },
    { id: 6, name: 'FP Béni Mellal', code: 'FP-BM', count: 13, icon: '📚', desc: 'Faculté Polydisciplinaire' },
    { id: 7, name: 'EST Khénifra', code: 'EST-KH', count: 3, icon: '🏗️', desc: 'École Supérieure de Technologie' },
    { id: 8, name: 'FLSH Béni Mellal', code: 'FLSH-BM', count: 4, icon: '✍️', desc: 'Faculté des Lettres et des Sciences Humaines' },
]

const stats = [
    { number: '+1200', label: 'Lauréats', suffix: 'diplômés' },
    { number: '+350', label: 'Étudiants', suffix: 'par an' },
    { number: '+200', label: 'Intervenants', suffix: 'formateurs' },
    { number: '+50', label: 'Formations', suffix: 'accréditées' },
]

export default function Home() {
    return (
        <div className="animate-fade-in bg-slate-50 min-h-screen">
            {/* ── Official Hero Section ── */}
            <section className="relative overflow-hidden bg-brand-900 pt-32 pb-40 px-6 text-center lg:text-left flex items-center min-h-[85vh] border-b-[8px] border-primary-500">
                <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="animate-slide-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-800 rounded-full text-xs font-bold tracking-widest text-white mb-8 border border-brand-700 shadow-sm uppercase">
                            Université Sultan Moulay Slimane
                        </div>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6 text-white">
                            Découvrez nos <br className="hidden md:block" />
                            <span className="text-primary-500">
                                Formations Continues
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-brand-100 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed font-light">
                            Des programmes diplômants de haut niveau conçus pour propulser votre carrière. Excellence académique et expertise professionnelle au cœur de notre pédagogie.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                            <Button to="/catalogue" variant="accent" size="lg" className="text-lg shadow-md px-8 py-4">Explorer les programmes</Button>
                            <Button to="/inscription" variant="outline" size="lg" className="text-lg bg-transparent text-white border-white hover:bg-white hover:text-brand-900 px-8 py-4">Pré-inscription</Button>
                        </div>
                    </div>

                    {/* Simple Graphic */}
                    <div className="hidden lg:flex justify-center relative">
                        <div className="w-full max-w-lg aspect-[4/3] bg-brand-800 rounded-2xl border border-brand-700 shadow-lg flex items-center justify-center relative overflow-hidden">
                            <div className="z-10 text-center">
                                <span className="text-8xl block mb-4">🎓</span>
                                <h3 className="text-2xl font-bold text-white tracking-wide uppercase">CFC | USMS</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Solid Stats Banner ── */}
            <section className="relative z-20 px-6 -mt-16 mb-24 max-w-7xl mx-auto">
                <div className="bg-white rounded-xl p-8 shadow-md border border-slate-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x-0 md:divide-x divide-slate-100">
                        {stats.map((s, i) => (
                            <div key={i} className="text-center px-4">
                                <div className="text-4xl md:text-5xl font-black text-brand-800 tracking-tight mb-2">
                                    {s.number}
                                </div>
                                <div className="text-sm font-bold text-primary-600 tracking-widest uppercase mb-1">{s.label}</div>
                                <div className="text-xs text-slate-500">{s.suffix}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Establishments Grid ── */}
            <section className="py-24 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-brand-900 mb-6 tracking-tight">Notre Réseau d'Excellence</h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        8 établissements de prestige collaborant pour vous offrir une formation de qualité, adaptée aux exigences du marché du travail actuel.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {establishments.map((e, i) => (
                        <Link to={`/catalogue?etablissement=${e.code}`} key={e.id} className="group outline-none">
                            <div className="bg-white rounded-xl p-6 h-full border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all duration-300 relative overflow-hidden flex flex-col hover:-translate-y-1">
                                <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:bg-brand-50 group-hover:scale-110 transition-all duration-300 relative z-10">
                                    {e.icon}
                                </div>

                                <h3 className="text-xl font-bold text-brand-900 mb-2 tracking-tight relative z-10 group-hover:text-brand-600 transition-colors uppercase">{e.name}</h3>
                                <p className="text-xs text-slate-600 mb-6 line-clamp-2 relative z-10 flex-grow">{e.desc}</p>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 relative z-10">
                                    <span className="inline-block px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-full tracking-wide">
                                        {e.count} Formations
                                    </span>
                                    <span className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-600 group-hover:text-white transition-colors duration-300">
                                        →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── Premium CTA ── */}
            <section className="py-24 px-6 bg-brand-900 border-t-8 border-primary-500">
                <div className="max-w-5xl mx-auto relative rounded-3xl overflow-hidden text-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">Prêt à propulser votre carrière ?</h2>
                    <p className="text-xl text-brand-100 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
                        Rejoignez des centaines de professionnels et d'étudiants qui ont choisi le CFC de l'USMS pour atteindre leurs objectifs.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button to="/inscription" variant="accent" size="lg" className="px-10 py-4 shadow-md text-lg">
                            Créer mon dossier maintenant
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    )
}
