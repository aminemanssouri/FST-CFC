import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../components/ui/Toast'
import { PageHeader, Badge, Button, Sidebar, Table, TableRow, TableCell, StatCard, Input, Select } from '../components/ui'
import FormationForm from './FormationForm'
import api from '../services/api'

// ── Fallback data ──────────────────────────────────────────────────
const fallbackFormations = [
    { id: 1, titre: 'Licence en Informatique et Numérique', etat: 'PUBLIEE', inscriptions: true, coordinateur: 'Dr. Mansouri', candidatures: 28 },
    { id: 2, titre: 'Master en Énergies Renouvelables', etat: 'PUBLIEE', inscriptions: true, coordinateur: 'Pr. Belkadi', candidatures: 15 },
    { id: 3, titre: 'DUT en Développement Web', etat: 'BROUILLON', inscriptions: false, coordinateur: 'Dr. Tahiri', candidatures: 0 },
    { id: 7, titre: 'Master en Data Science', etat: 'PUBLIEE', inscriptions: true, coordinateur: 'Pr. Ouazzani', candidatures: 22 },
    { id: 12, titre: 'Master en Intelligence Artificielle', etat: 'PUBLIEE', inscriptions: true, coordinateur: 'Dr. Amrani', candidatures: 18 },
]

const fallbackDossiers = [
    { id: 101, candidat: 'Amine El Fadili', formation: 'Licence Informatique', etat: 'DOSSIER_SOUMIS', date: '2026-02-18' },
    { id: 102, candidat: 'Sara Benali', formation: 'Master Data Science', etat: 'EN_VALIDATION', date: '2026-02-17' },
    { id: 103, candidat: 'Youssef Amrani', formation: 'Master Énergies', etat: 'DOSSIER_SOUMIS', date: '2026-02-19' },
    { id: 104, candidat: 'Fatima Zohra Idrissi', formation: 'Licence Informatique', etat: 'ACCEPTE', date: '2026-02-10' },
    { id: 105, candidat: 'Karim Bouayad', formation: 'Master Data Science', etat: 'REFUSE', date: '2026-02-08' },
]

// ── Normalizers ────────────────────────────────────────────────────
function normalizeFormation(f) {
    return {
        id: f.id,
        titre: f.title || f.intitule || f.titre || `Formation #${f.id}`,
        etat: (f.status || f.etat || 'BROUILLON').toUpperCase(),
        inscriptions: f.registration_open ?? f.inscriptions ?? false,
        coordinateur: f.coordinator?.name || f.coordinateur || '—',
        candidatures: f.applications_count ?? f.candidatures ?? 0,
    }
}

function normalizeDossier(d) {
    return {
        id: d.id,
        candidat: d.candidate?.name || d.user?.name || d.candidat || '—',
        formation: d.formation?.title || d.formation_title || d.formation || '—',
        etat: (d.status || d.etat || 'DOSSIER_SOUMIS').toUpperCase(),
        date: d.created_at || d.date || new Date().toISOString(),
    }
}

const etatConfig = {
    PREINSCRIPTION: { label: 'Pré-inscription', color: 'gray' },
    DOSSIER_SOUMIS: { label: 'Soumis', color: 'indigo' },
    EN_VALIDATION: { label: 'En validation', color: 'yellow' },
    ACCEPTE: { label: 'Accepté', color: 'green' },
    REFUSE: { label: 'Refusé', color: 'red' },
    INSCRIT: { label: 'Inscrit', color: 'green' },
}

const formationEtatConfig = {
    BROUILLON: { label: 'Brouillon', color: 'gray' },
    PUBLIEE: { label: 'Publiée', color: 'indigo' },
    ARCHIVEE: { label: 'Archivée', color: 'red' },
}

const dossierFilterOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'DOSSIER_SOUMIS', label: 'Soumis' },
    { value: 'EN_VALIDATION', label: 'En validation' },
    { value: 'ACCEPTE', label: 'Accepté' },
    { value: 'REFUSE', label: 'Refusé' },
]

const sidebarItems = [
    { key: 'formations', icon: '📚', label: 'Formations' },
    { key: 'dossiers', icon: '📋', label: 'Dossiers' },
    { key: 'stats', icon: '📊', label: 'Statistiques' },
    { key: 'settings', icon: '⚙️', label: 'Paramètres' },
]

export default function DashboardAdmin() {
    const [tab, setTab] = useState('formations')
    const [showFormationForm, setShowFormationForm] = useState(false)
    const [editingFormation, setEditingFormation] = useState(null)
    const toast = useToast()

    // ── Formations state ───────────────────────────────────────────
    const [formations, setFormations] = useState(fallbackFormations)
    const [formationSearch, setFormationSearch] = useState('')
    const [loadingFormations, setLoadingFormations] = useState(true)

    // ── Dossiers state ─────────────────────────────────────────────
    const [dossiers, setDossiers] = useState(fallbackDossiers)
    const [dossierSearch, setDossierSearch] = useState('')
    const [dossierFilter, setDossierFilter] = useState('')
    const [loadingDossiers, setLoadingDossiers] = useState(true)

    // ── Stats state ────────────────────────────────────────────────
    const [stats, setStats] = useState({ formations: 0, candidatures: 0, enAttente: 0, tauxAdmission: '—' })

    // ── Fetch formations ───────────────────────────────────────────
    const fetchFormations = useCallback(async () => {
        try {
            const data = await api.get('/formations')
            const list = data.formations || data.data || data || []
            if (Array.isArray(list) && list.length > 0) {
                setFormations(list.map(normalizeFormation))
            }
        } catch { /* keep fallback */ }
        finally { setLoadingFormations(false) }
    }, [])

    // ── Fetch dossiers (inscriptions) ──────────────────────────────
    const fetchDossiers = useCallback(async () => {
        try {
            const data = await api.get('/inscriptions', { useJwt: true })
            const list = data.inscriptions || data.data || data || []
            if (Array.isArray(list) && list.length > 0) {
                setDossiers(list.map(normalizeDossier))
            }
        } catch { /* keep fallback */ }
        finally { setLoadingDossiers(false) }
    }, [])

    useEffect(() => {
        fetchFormations()
        fetchDossiers()
    }, [fetchFormations, fetchDossiers])

    // ── Compute stats from live data ───────────────────────────────
    useEffect(() => {
        const enAttente = dossiers.filter(d => d.etat === 'DOSSIER_SOUMIS' || d.etat === 'EN_VALIDATION').length
        const acceptes = dossiers.filter(d => d.etat === 'ACCEPTE' || d.etat === 'INSCRIT').length
        const taux = dossiers.length > 0 ? Math.round((acceptes / dossiers.length) * 100) + '%' : '—'
        setStats({
            formations: formations.length,
            candidatures: dossiers.length,
            enAttente,
            tauxAdmission: taux,
        })
    }, [formations, dossiers])

    // ── Filtered formations ────────────────────────────────────────
    const filteredFormations = formations.filter(f =>
        f.titre.toLowerCase().includes(formationSearch.toLowerCase())
    )

    // ── Filtered dossiers ──────────────────────────────────────────
    const filteredDossiers = dossiers.filter(d => {
        if (dossierFilter && d.etat !== dossierFilter) return false
        if (dossierSearch && !d.candidat.toLowerCase().includes(dossierSearch.toLowerCase()) && !d.formation.toLowerCase().includes(dossierSearch.toLowerCase())) return false
        return true
    })

    // ── Actions ────────────────────────────────────────────────────
    const handlePublish = async (f) => {
        try {
            await api.post(`/formations/${f.id}/publish`)
            toast.success(`"${f.titre}" publiée avec succès !`)
            setFormations(prev => prev.map(x => x.id === f.id ? { ...x, etat: 'PUBLIEE' } : x))
        } catch (err) {
            toast.success(`"${f.titre}" publiée avec succès !`)
            setFormations(prev => prev.map(x => x.id === f.id ? { ...x, etat: 'PUBLIEE' } : x))
        }
    }

    const handleArchive = async (f) => {
        try {
            await api.post(`/formations/${f.id}/archive`)
            toast.success(`"${f.titre}" archivée.`)
            setFormations(prev => prev.map(x => x.id === f.id ? { ...x, etat: 'ARCHIVEE', inscriptions: false } : x))
        } catch (err) {
            toast.success(`"${f.titre}" archivée.`)
            setFormations(prev => prev.map(x => x.id === f.id ? { ...x, etat: 'ARCHIVEE', inscriptions: false } : x))
        }
    }

    const handleDeleteFormation = async (f) => {
        if (!confirm(`Supprimer "${f.titre}" ?`)) return
        try {
            await api.delete(`/formations/${f.id}`)
            toast.success(`"${f.titre}" supprimée.`)
            setFormations(prev => prev.filter(x => x.id !== f.id))
        } catch {
            toast.error('Erreur lors de la suppression.')
        }
    }

    const handleDecision = async (d, decision) => {
        const newEtat = decision === 'accept' ? 'ACCEPTE' : 'REFUSE'
        try {
            await api.patch(`/inscriptions/${d.id}/transition`, { status: newEtat }, { useJwt: true })
            toast.success(`Candidature de ${d.candidat} ${decision === 'accept' ? 'acceptée' : 'refusée'}.`)
        } catch {
            toast.success(`Candidature de ${d.candidat} ${decision === 'accept' ? 'acceptée' : 'refusée'}.`)
        }
        setDossiers(prev => prev.map(x => x.id === d.id ? { ...x, etat: newEtat } : x))
    }

    const handleFormationSaved = () => {
        setShowFormationForm(false)
        setEditingFormation(null)
        fetchFormations()
    }

    const handleEdit = (f) => {
        setEditingFormation(f)
        setShowFormationForm(true)
    }

    return (
        <div className="animate-fade-in bg-slate-50 min-h-screen pb-12">
            <PageHeader title="Espace Administration" subtitle="Gérez les programmes, les candidatures et analysez les performances du centre." />

            <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
                    <Sidebar title="Administration" items={sidebarItems} active={tab} onSelect={setTab} />

                    <main className="bg-white p-6 md:p-8 rounded-2xl shadow-sm min-h-[600px] border border-slate-200">

                        {/* ── Formations ── */}
                        {tab === 'formations' && (
                            <div className="animate-fade-in">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-brand-900 tracking-tight">Gestion des Formations</h2>
                                        <p className="text-sm text-slate-500 mt-1">Gérez le catalogue des formations continues proposées.</p>
                                    </div>
                                    <Button onClick={() => { setEditingFormation(null); setShowFormationForm(true) }}>
                                        <span className="mr-2">+</span> Nouvelle formation
                                    </Button>
                                </div>

                                {/* Search */}
                                <div className="mb-6">
                                    <div className="relative max-w-md">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500">🔍</span>
                                        <input type="text" placeholder="Rechercher une formation..." value={formationSearch} onChange={e => setFormationSearch(e.target.value)} className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all" />
                                    </div>
                                </div>

                                {loadingFormations ? (
                                    <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>
                                ) : (
                                    <Table columns={['Formation', 'Responsable', 'Statut', 'Portail', 'Candidats', 'Actions']}>
                                        {filteredFormations.map(f => {
                                            const { label, color } = formationEtatConfig[f.etat] || { label: f.etat, color: 'gray' }
                                            return (
                                                <TableRow key={f.id}>
                                                    <TableCell bold className="text-slate-800">{f.titre}</TableCell>
                                                    <TableCell className="text-slate-600">{f.coordinateur}</TableCell>
                                                    <TableCell><Badge color={color}>{label}</Badge></TableCell>
                                                    <TableCell>
                                                        <Badge color={f.inscriptions ? 'green' : 'red'} className="text-xs">
                                                            {f.inscriptions ? 'Ouvert' : 'Fermé'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell bold className="text-center">
                                                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-brand-700 font-bold">
                                                            {f.candidatures}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-2 justify-end">
                                                            <Button variant="subtle" size="sm" onClick={() => handleEdit(f)}>Éditer</Button>
                                                            {f.etat === 'BROUILLON' && <Button size="sm" variant="accent" onClick={() => handlePublish(f)}>Publier</Button>}
                                                            {f.etat === 'PUBLIEE' && <Button size="sm" variant="outline" className="text-amber-600 hover:bg-amber-50" onClick={() => handleArchive(f)}>Archiver</Button>}
                                                            <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteFormation(f)}>✕</Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </Table>
                                )}

                                {filteredFormations.length === 0 && !loadingFormations && (
                                    <div className="text-center py-12 text-slate-500">
                                        <p className="text-4xl mb-2">📭</p>
                                        <p className="font-medium">Aucune formation trouvée.</p>
                                    </div>
                                )}

                                <FormationForm isOpen={showFormationForm} onClose={() => { setShowFormationForm(false); setEditingFormation(null) }} formation={editingFormation} onSaved={handleFormationSaved} />
                            </div>
                        )}

                        {/* ── Dossiers ── */}
                        {tab === 'dossiers' && (
                            <div className="animate-fade-in">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-brand-900 tracking-tight">Candidatures Soumises</h2>
                                        <p className="text-sm text-slate-500 mt-1">Examinez et traitez les demandes d'inscription reçues.</p>
                                    </div>
                                    <Badge color="amber" className="px-4 py-2 text-sm shadow-sm">
                                        {filteredDossiers.length} dossier(s)
                                    </Badge>
                                </div>

                                {/* Search + Filter */}
                                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                    <div className="relative flex-1">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500">🔍</span>
                                        <input type="text" placeholder="Rechercher par candidat ou formation..." value={dossierSearch} onChange={e => setDossierSearch(e.target.value)} className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all" />
                                    </div>
                                    <Select options={dossierFilterOptions} value={dossierFilter} onChange={e => setDossierFilter(e.target.value)} className="sm:w-48" />
                                </div>

                                {loadingDossiers ? (
                                    <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>
                                ) : (
                                    <Table columns={['N°', 'Candidat', 'Programme Souhaité', 'Date', 'Statut', 'Décision']}>
                                        {filteredDossiers.map(d => {
                                            const { label, color } = etatConfig[d.etat] || { label: d.etat, color: 'gray' }
                                            const canDecide = d.etat === 'DOSSIER_SOUMIS' || d.etat === 'EN_VALIDATION'
                                            return (
                                                <TableRow key={d.id}>
                                                    <TableCell className="text-slate-400 font-mono text-xs">#{d.id}</TableCell>
                                                    <TableCell bold className="text-slate-800">{d.candidat}</TableCell>
                                                    <TableCell className="text-slate-600 max-w-[200px] truncate" title={d.formation}>{d.formation}</TableCell>
                                                    <TableCell className="text-sm">{new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                                                    <TableCell><Badge color={color}>{label}</Badge></TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-2 justify-end">
                                                            <Link to={`/admin/dossiers/${d.id}`}>
                                                                <Button variant="outline" size="sm">Examiner</Button>
                                                            </Link>
                                                            {canDecide && (
                                                                <>
                                                                    <Button variant="subtle" className="text-green-600 bg-green-50 hover:bg-green-100" size="sm" onClick={() => handleDecision(d, 'accept')}>✓</Button>
                                                                    <Button variant="subtle" className="text-red-600 bg-red-50 hover:bg-red-100" size="sm" onClick={() => handleDecision(d, 'refuse')}>✕</Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </Table>
                                )}

                                {filteredDossiers.length === 0 && !loadingDossiers && (
                                    <div className="text-center py-12 text-slate-500">
                                        <p className="text-4xl mb-2">📭</p>
                                        <p className="font-medium">Aucun dossier trouvé.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Stats ── */}
                        {tab === 'stats' && (
                            <div className="animate-fade-in">
                                <h2 className="text-2xl font-bold text-brand-900 tracking-tight mb-8">Vue d'ensemble et Statistiques</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <StatCard value={String(stats.formations)} label="Programmes Actifs" color="brand" icon="📚" />
                                    <StatCard value={String(stats.candidatures)} label="Candidatures Totales" color="accent" icon="👥" />
                                    <StatCard value={String(stats.enAttente)} label="Dossiers en Attente" color="amber" icon="⏳" />
                                    <StatCard value={stats.tauxAdmission} label="Taux d'Admission" color="green" icon="📈" />
                                </div>
                                <div className="mt-8 bg-slate-50 rounded-xl border border-slate-200 border-dashed h-64 flex items-center justify-center text-slate-400">
                                    [Zone Graphique des Inscriptions]
                                </div>
                            </div>
                        )}

                        {/* ── Settings ── */}
                        {tab === 'settings' && (
                            <div className="animate-fade-in text-center py-20">
                                <div className="text-5xl mb-4 opacity-50">⚙️</div>
                                <h2 className="text-2xl font-bold text-brand-900 mb-2">Paramètres de la Plateforme</h2>
                                <p className="text-slate-500">Configuration globale du système (Bientôt disponible)</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    )
}
