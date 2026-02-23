import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageHeader, Card, Badge, Select, Pagination } from '../components/ui'

const allFormations = [
    { id: 1, titre: 'Licence en Informatique et Numérique', etablissement: 'FST-BM', type: 'LP', inscriptions: true, description: 'Formation en développement logiciel, bases de données, réseaux et intelligence artificielle.', dateFermeture: '2026-06-30' },
    { id: 2, titre: 'Master en Énergies Renouvelables', etablissement: 'FST-BM', type: 'MS', inscriptions: true, description: 'Spécialisation en énergie solaire, éolienne et biomasse pour un développement durable.', dateFermeture: '2026-07-15' },
    { id: 3, titre: 'Licence en Management et Gestion', etablissement: 'ENCG-BM', type: 'LP', inscriptions: true, description: "Formation en gestion d'entreprise, marketing, finance et ressources humaines.", dateFermeture: '2026-05-31' },
    { id: 4, titre: 'Master en Génie Civil', etablissement: 'ENSA-KH', type: 'MS', inscriptions: false, description: 'Conception de structures, matériaux de construction et gestion de projets BTP.', dateFermeture: '2025-12-31' },
    { id: 5, titre: 'Licence en Commerce International', etablissement: 'FEG-BM', type: 'LP', inscriptions: true, description: 'Échanges internationaux, logistique, douane et négociation commerciale.', dateFermeture: '2026-08-31' },
    { id: 6, titre: 'DUT en Développement Web', etablissement: 'EST-BM', type: 'DUT', inscriptions: true, description: 'HTML, CSS, JavaScript, PHP, bases de données et frameworks web modernes.', dateFermeture: '2026-07-01' },
    { id: 7, titre: 'Master en Data Science', etablissement: 'FST-BM', type: 'MS', inscriptions: true, description: 'Analyse de données, machine learning, statistiques avancées et Python.', dateFermeture: '2026-07-30' },
    { id: 8, titre: "Licence en Sciences de l'Éducation", etablissement: 'FLSH-BM', type: 'LP', inscriptions: true, description: "Pédagogie, psychologie de l'éducation et didactique des disciplines.", dateFermeture: '2026-06-15' },
    { id: 9, titre: 'Master en Finance Islamique', etablissement: 'ENCG-BM', type: 'MS', inscriptions: true, description: 'Finance participative, fiqh al-muamalat et produits financiers islamiques.', dateFermeture: '2026-09-15' },
    { id: 10, titre: 'Licence en Logistique et Transport', etablissement: 'FEG-BM', type: 'LP', inscriptions: false, description: 'Supply chain management, transport international et systèmes logistiques.', dateFermeture: '2025-11-30' },
    { id: 11, titre: "DUT en Génie Électrique", etablissement: 'EST-BM', type: 'DUT', inscriptions: true, description: "Électronique de puissance, automatisme industriel et installations électriques.", dateFermeture: '2026-08-01' },
    { id: 12, titre: 'Master en Intelligence Artificielle', etablissement: 'FST-BM', type: 'MS', inscriptions: true, description: 'Deep learning, NLP, computer vision et systèmes multi-agents.', dateFermeture: '2026-09-30' },
]

const etabOptions = [
    { value: '', label: 'Tous les établissements' },
    { value: 'FST-BM', label: 'FST Béni Mellal' },
    { value: 'FEG-BM', label: 'FEG Béni Mellal' },
    { value: 'ENSA-KH', label: 'ENSA Khouribga' },
    { value: 'ENCG-BM', label: 'ENCG Béni Mellal' },
    { value: 'EST-BM', label: 'EST Béni Mellal' },
    { value: 'FLSH-BM', label: 'FLSH Béni Mellal' },
]

const typeOptions = [
    { value: '', label: 'Tous les diplômes' },
    { value: 'LP', label: 'Licence Professionnelle' },
    { value: 'MS', label: 'Master Spécialisé' },
    { value: 'DUT', label: 'DUT' },
]

const PER_PAGE = 6

export default function Catalogue() {
    const [searchParams] = useSearchParams()
    const filterEtab = searchParams.get('etablissement') || ''

    const [search, setSearch] = useState('')
    const [etab, setEtab] = useState(filterEtab)
    const [type, setType] = useState('')
    const [page, setPage] = useState(1)

    const filtered = useMemo(() => {
        return allFormations.filter(f => {
            if (etab && f.etablissement !== etab) return false
            if (type && f.type !== type) return false
            if (search && !f.titre.toLowerCase().includes(search.toLowerCase())) return false
            return true
        })
    }, [search, etab, type])

    const totalPages = Math.ceil(filtered.length / PER_PAGE)
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

    const handleFilterChange = (setter) => (e) => {
        setter(e.target.value)
        setPage(1) // reset to page 1 on filter change
    }

    return (
        <div className="animate-fade-in bg-slate-50 min-h-screen pb-20">
            <PageHeader title="Catalogue des Formations" subtitle="Explorez nos programmes certifiants et renforcez votre expertise professionnelle." />

            <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
                {/* ── Filters ── */}
                <div className="bg-white p-6 rounded-2xl mb-12 shadow-sm border border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="lg:col-span-2 relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500 font-bold">🔍</span>
                            <input
                                type="text"
                                placeholder="Rechercher une formation..."
                                value={search}
                                onChange={handleFilterChange(setSearch)}
                                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all duration-300 shadow-sm"
                            />
                        </div>
                        <Select options={etabOptions} value={etab} onChange={handleFilterChange(setEtab)} className="py-3" />
                        <Select options={typeOptions} value={type} onChange={handleFilterChange(setType)} className="py-3" />
                    </div>
                </div>

                {/* ── Results Info ── */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-brand-900 tracking-tight">
                        Programmes Disponibles
                    </h2>
                    <Badge color="blue" className="px-4 py-1.5 text-sm uppercase">
                        {filtered.length} Résultat{filtered.length > 1 ? 's' : ''}
                    </Badge>
                </div>

                {/* ── Grid ── */}
                {paginated.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {paginated.map(f => (
                                <Link to={`/formations/${f.id}`} key={f.id} className="group outline-none">
                                    <Card className="h-full flex flex-col overflow-hidden">
                                        <div className="p-6 flex-grow flex flex-col">
                                            <div className="flex items-start justify-between gap-2 mb-4">
                                                <Badge color="gray" className="font-bold tracking-widest uppercase">{f.type}</Badge>
                                                <Badge color={f.inscriptions ? 'green' : 'red'}>
                                                    {f.inscriptions ? 'Ouvertes' : 'Fermées'}
                                                </Badge>
                                            </div>
                                            <h3 className="text-xl font-bold text-brand-900 mb-3 leading-snug tracking-tight group-hover:text-brand-600 transition-colors uppercase">{f.titre}</h3>
                                            <p className="text-sm text-slate-500 mb-6 flex-1 line-clamp-3 leading-relaxed">{f.description}</p>
                                        </div>
                                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-sm">
                                            <span className="font-semibold text-brand-700 flex items-center gap-2">
                                                <span className="text-lg">🏛️</span> {f.etablissement}
                                            </span>
                                            {f.dateFermeture && (
                                                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                                                    <span>📅</span> {new Date(f.dateFermeture).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            )}
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                        <Pagination current={page} total={totalPages} onPageChange={setPage} />
                    </>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                        <div className="text-6xl mb-4">📭</div>
                        <h3 className="text-2xl font-bold text-brand-900 mb-2">Aucun programme trouvé</h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                            Nous n'avons trouvé aucune formation correspondant à vos critères. Essayez d'élargir votre recherche ou de modifier les filtres.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
