import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageHeader, Card, Badge, Select, Pagination } from '../components/ui'
import { institutionApi } from '../api'

const PER_PAGE = 6

export default function Catalogue() {
    const [searchParams] = useSearchParams()
    const filterEtab = searchParams.get('etablissement') || ''

    const [search, setSearch] = useState('')
    const [etab, setEtab]     = useState(filterEtab)
    const [type, setType]     = useState('')
    const [page, setPage]     = useState(1)
    const [allFormations, setAllFormations] = useState([])
    const [loadingCat, setLoadingCat]       = useState(true)

    const etabOptions = useMemo(() => {
        const etabs = [...new Set(allFormations.map(f => f.etablissement).filter(Boolean))]
        return [{ value: '', label: 'Tous les établissements' }, ...etabs.map(e => ({ value: e, label: e }))]
    }, [allFormations])

    const typeOptions = useMemo(() => {
        const types = [...new Set(allFormations.map(f => f.type).filter(Boolean))]
        return [{ value: '', label: 'Tous les diplomes' }, ...types.map(t => ({ value: t, label: t }))]
    }, [allFormations])

    useEffect(() => {
        institutionApi.getCatalog()
            .then(data => {
                const list = Array.isArray(data) ? data : (data.data || [])
                setAllFormations(list.map(f => ({
                    id:            f.id,
                    titre:         f.titre || f.title || f.nom || '',
                    etablissement: f.etablissement || f.institution || '',
                    type:          f.type || f.niveau || '',
                    inscriptions:  f.inscriptions_ouvertes ?? f.inscriptions ?? true,
                    description:   f.description || '',
                    dateFermeture: f.date_fermeture || f.dateFermeture || null,
                })))
            })
            .catch(() => setAllFormations([]))
            .finally(() => setLoadingCat(false))
    }, [])

    const filtered = useMemo(() => {
        return allFormations.filter(f => {
            if (etab && f.etablissement !== etab) return false
            if (type && f.type !== type) return false
            if (search && !f.titre.toLowerCase().includes(search.toLowerCase())) return false
            return true
        })
    }, [allFormations, search, etab, type])

    const totalPages = Math.ceil(filtered.length / PER_PAGE)
    const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

    const handleFilterChange = (setter) => (e) => {
        setter(e.target.value)
        setPage(1)
    }

    return (
        <div className="animate-fade-in bg-slate-50 min-h-screen pb-20">
            <PageHeader title="Catalogue des Formations" subtitle="Explorez nos programmes certifiants et renforcez votre expertise professionnelle." />

            <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
                <div className="bg-white p-6 rounded-2xl mb-12 shadow-sm border border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="lg:col-span-2 relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500 font-bold">&#128269;</span>
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

                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-brand-900 tracking-tight">Programmes Disponibles</h2>
                    {loadingCat ? (
                        <span className="text-slate-400 text-sm">Chargement...</span>
                    ) : (
                        <Badge color="blue" className="px-4 py-1.5 text-sm uppercase">
                            {filtered.length} Resultat{filtered.length > 1 ? 's' : ''}
                        </Badge>
                    )}
                </div>

                {loadingCat ? (
                    <div className="text-center py-20 text-slate-400">Chargement des formations...</div>
                ) : paginated.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {paginated.map(f => (
                                <Link to={`/formations/${f.id}`} key={f.id} className="group outline-none">
                                    <Card className="h-full flex flex-col overflow-hidden">
                                        <div className="p-6 flex-grow flex flex-col">
                                            <div className="flex items-start justify-between gap-2 mb-4">
                                                <Badge color="gray" className="font-bold tracking-widest uppercase">{f.type}</Badge>
                                                <Badge color={f.inscriptions ? 'green' : 'red'}>
                                                    {f.inscriptions ? 'Ouvertes' : 'Fermees'}
                                                </Badge>
                                            </div>
                                            <h3 className="text-xl font-bold text-brand-900 mb-3 leading-snug tracking-tight group-hover:text-brand-600 transition-colors uppercase">{f.titre}</h3>
                                            <p className="text-sm text-slate-500 mb-6 flex-1 line-clamp-3 leading-relaxed">{f.description}</p>
                                        </div>
                                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-sm">
                                            <span className="font-semibold text-brand-700 flex items-center gap-2">
                                                <span className="text-lg">&#127963;</span> {f.etablissement}
                                            </span>
                                            {f.dateFermeture && (
                                                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                                                    <span>&#128197;</span> {new Date(f.dateFermeture).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', year: 'numeric' })}
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
                        <div className="text-6xl mb-4">&#128237;</div>
                        <h3 className="text-2xl font-bold text-brand-900 mb-2">Aucun programme trouve</h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                            Nous n avons trouve aucune formation correspondant a vos criteres.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
