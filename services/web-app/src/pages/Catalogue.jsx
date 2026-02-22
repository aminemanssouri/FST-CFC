import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageHeader, Card, Badge, Input } from '../components/ui'

const allFormations = [
    { id: 1, titre: 'Licence en Informatique et Numérique', etablissement: 'FST-BM', inscriptions: true, description: 'Formation en développement logiciel, bases de données, réseaux et intelligence artificielle.', dateFermeture: '2026-06-30' },
    { id: 2, titre: 'Master en Énergies Renouvelables', etablissement: 'FST-BM', inscriptions: true, description: 'Spécialisation en énergie solaire, éolienne et biomasse pour un développement durable.', dateFermeture: '2026-07-15' },
    { id: 3, titre: 'Licence en Management et Gestion', etablissement: 'ENCG-BM', inscriptions: true, description: 'Formation en gestion d\'entreprise, marketing, finance et ressources humaines.', dateFermeture: '2026-05-31' },
    { id: 4, titre: 'Master en Génie Civil', etablissement: 'ENSA-KH', inscriptions: false, description: 'Conception de structures, matériaux de construction et gestion de projets BTP.', dateFermeture: '2025-12-31' },
    { id: 5, titre: 'Licence en Commerce International', etablissement: 'FEG-BM', inscriptions: true, description: 'Échanges internationaux, logistique, douane et négociation commerciale.', dateFermeture: '2026-08-31' },
    { id: 7, titre: 'Master en Data Science', etablissement: 'FST-BM', inscriptions: true, description: 'Analyse de données, machine learning, statistiques avancées et Python.', dateFermeture: '2026-07-30' },
    { id: 8, titre: 'Licence en Sciences de l\'Éducation', etablissement: 'FLSH-BM', inscriptions: true, description: 'Pédagogie, psychologie de l\'éducation et didactique des disciplines.', dateFermeture: '2026-06-15' },
]

export default function Catalogue() {
    const [searchParams] = useSearchParams()
    const filterEtab = searchParams.get('etablissement') || ''
    const [search, setSearch] = useState('')

    const filtered = allFormations.filter(f => {
        if (filterEtab && f.etablissement !== filterEtab) return false
        if (search && !f.titre.toLowerCase().includes(search.toLowerCase())) return false
        return true
    })

    return (
        <div className="animate-fade-in">
            <PageHeader title="📋 Catalogue des Formations" subtitle="Retrouvez toutes les formations publiées de nos établissements" />

            <div className="max-w-6xl mx-auto px-6 py-10">
                <div className="max-w-lg mx-auto mb-8 relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
                    <input
                        type="text"
                        placeholder="Rechercher une formation..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-14 pr-6 py-3.5 border-2 border-slate-200 rounded-full text-sm bg-white focus:outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10 transition-all duration-300"
                    />
                </div>

                {filterEtab && (
                    <p className="text-center text-sm text-slate-500 mb-6">
                        Filtré par : <span className="font-bold text-slate-700">{filterEtab}</span>
                        {' — '}
                        <Link to="/catalogue" className="text-brand-600 font-semibold hover:underline">Voir tout</Link>
                    </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map(f => (
                        <Link to={`/formations/${f.id}`} key={f.id}>
                            <Card className="p-6 h-full flex flex-col">
                                <Badge color={f.inscriptions ? 'green' : 'red'} className="mb-3 w-fit">
                                    {f.inscriptions ? '✅ Inscriptions ouvertes' : '⛔ Inscriptions fermées'}
                                </Badge>
                                <h3 className="font-bold text-slate-800 mb-2 leading-snug">{f.titre}</h3>
                                <p className="text-sm text-slate-500 mb-4 flex-1">{f.description}</p>
                                <div className="flex justify-between items-center pt-4 border-t border-slate-100 text-sm text-slate-400">
                                    <span>🏛️ {f.etablissement}</span>
                                    {f.dateFermeture && <span>📅 {f.dateFermeture}</span>}
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-16 text-slate-400">
                        <p className="text-4xl mb-2">📭</p>
                        <p className="font-medium">Aucune formation trouvée</p>
                    </div>
                )}
            </div>
        </div>
    )
}
