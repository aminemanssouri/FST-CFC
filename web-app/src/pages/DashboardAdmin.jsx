import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'
import { PageHeader, Badge, Button, Sidebar, Table, TableRow, TableCell, StatCard, Input } from '../components/ui'
import FormationForm from './FormationForm'
import { institutionApi, applicationApi, configApi } from '../api'

const roleDisplay = {
    establishment_admin: { label: 'Administrateur d\'Établissement', desc: 'Vous pouvez gérer les formations et les candidatures de votre établissement.' },
    coordinator: { label: 'Coordinateur', desc: 'Vous pouvez gérer les formations, publier, examiner et traiter les candidatures de votre établissement.' },
    super_admin: { label: 'Super Administrateur', desc: 'Accès complet — redirigé vers /super-admin.' },
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
    draft: { label: 'Brouillon', color: 'gray' },
    published: { label: 'Publiée', color: 'green' },
    archived: { label: 'Archivée', color: 'red' },
}

const sidebarItems = [
    { key: 'formations', icon: '📚', label: 'Formations' },
    { key: 'dossiers', icon: '📋', label: 'Dossiers' },
    { key: 'stats', icon: '📊', label: 'Statistiques' },
    { key: 'settings', icon: '⚙️', label: 'Paramètres' },
]

export default function DashboardAdmin() {
    const [tab, setTab] = useState('formations')
    const [showFormationForm, setShowFormationForm] = useState(false)
    const [formationsData, setFormationsData] = useState([])
    const [dossiers, setDossiers] = useState([])
    const [stats, setStats] = useState(null)
    const [loadingF, setLoadingF] = useState(true)
    const [loadingD, setLoadingD] = useState(true)
    const [editFormation, setEditFormation] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const { user } = useAuth()
    const toast = useToast()

    const loadFormations = () => {
        setLoadingF(true)
        institutionApi.getFormations('status=all')
            .then(data => setFormationsData(data.data || data || []))
            .catch(() => setFormationsData([]))
            .finally(() => setLoadingF(false))
    }

    const loadDossiers = () => {
        setLoadingD(true)
        applicationApi.getInscriptions()
            .then(data => setDossiers(data.data || data || []))
            .catch(() => setDossiers([]))
            .finally(() => setLoadingD(false))
    }

    useEffect(() => {
        loadFormations()
        loadDossiers()
        institutionApi.getStats()
            .then(data => setStats(data.data || data))
            .catch(() => setStats(null))
    }, [])

    const handlePublish = async (f) => {
        try {
            await institutionApi.publishFormation(f.id)
            toast.success(`"${f.title}" publiée avec succès !`)
            loadFormations()
        } catch {
            toast.error('Erreur lors de la publication.')
        }
    }

    const handleArchive = async (f) => {
        try {
            await institutionApi.archiveFormation(f.id)
            toast.success(`"${f.title}" archivée avec succès !`)
            loadFormations()
        } catch {
            toast.error('Erreur lors de l\'archivage.')
        }
    }

    const handleUnarchive = async (f) => {
        try {
            await institutionApi.unarchiveFormation(f.id)
            toast.success(`"${f.title}" désarchivée avec succès !`)
            loadFormations()
        } catch {
            toast.error('Erreur lors de la désarchivation.')
        }
    }

    const handleDecision = async (d, decision) => {
        try {
            await applicationApi.transition(d.id, decision, user?.nom || 'Admin')
            toast.success(decision === 'ACCEPTE' ? `Candidature de ${d.candidat || d.nom_complet} validée.` : `Candidature de ${d.candidat || d.nom_complet} rejetée.`)
            loadDossiers()
        } catch {
            toast.error('Erreur lors de la décision.')
        }
    }

    const q = searchQuery.trim().toLowerCase()
    const matchSearch = (...fields) => !q || fields.some(f => f && String(f).toLowerCase().includes(q))

    const filteredFormations = formationsData.filter(f =>
        matchSearch(f.title, f.titre, f.nom, f.coordinator, f.coordinateur, f.status)
    )

    const filteredDossiers = dossiers.filter(d =>
        matchSearch(d.nom_complet, d.candidat, d.formation, d.etat, (etatConfig[d.etat] || {}).label)
    )

    return (
        <div className="animate-fade-in bg-slate-50 min-h-screen pb-12">
            <PageHeader title="Espace Administration" subtitle={`${(roleDisplay[user?.role] || {}).label || 'Administration'} — Gérez les programmes, les candidatures et analysez les performances.`} />

            <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">

                    {/* Navigation Sidebar */}
                    <Sidebar title="Administration" items={sidebarItems} active={tab} onSelect={setTab} />

                    {/* Main Content Area */}
                    <main className="bg-white p-6 md:p-8 rounded-2xl shadow-sm min-h-[600px] border border-slate-200">
                        {/* ── Formations ── */}
                        {tab === 'formations' && (
                            <div className="animate-fade-in">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-brand-900 tracking-tight">Gestion des Formations</h2>
                                        <p className="text-sm text-slate-500 mt-1">Gérez le catalogue des formations continues proposées.</p>
                                    </div>
                                    <Button onClick={() => setShowFormationForm(true)}>
                                        <span className="mr-2">+</span> Nouvelle formation
                                    </Button>
                                </div>

                                <div className="mb-6">
                                    <Input placeholder="🔍 Rechercher une formation (titre, responsable, statut...)" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                                </div>

                                <Table columns={['Formation', 'Responsable', 'Statut', 'Portail', 'Candidats', 'Actions']}>
                                    {loadingF ? (
                                        <TableRow><TableCell colSpan={6} className="text-center text-slate-400">Chargement...</TableCell></TableRow>
                                    ) : filteredFormations.length === 0 ? (
                                        <TableRow><TableCell colSpan={6} className="text-center text-slate-400 py-8">{q ? 'Aucune formation ne correspond à votre recherche.' : 'Aucune formation.'}</TableCell></TableRow>
                                    ) : filteredFormations.map(f => {
                                        const status = f.status || 'draft'
                                        const { label, color } = formationEtatConfig[status] || { label: status, color: 'gray' }
                                        const isInscriptions = f.inscriptions_ouvertes ?? f.inscriptions ?? (f.registration_period?.status === 'open')
                                        return (
                                            <TableRow key={f.id}>
                                                <TableCell bold className="text-slate-800">{f.title || f.titre || f.nom}</TableCell>
                                                <TableCell className="text-slate-600">{f.coordinator || f.coordinateur || '—'}</TableCell>
                                                <TableCell><Badge color={color}>{label}</Badge></TableCell>
                                                <TableCell>
                                                    <Badge color={isInscriptions ? 'green' : 'red'} className="text-xs">
                                                        {isInscriptions ? 'Ouvert' : 'Fermé'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell bold className="text-center">
                                                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-brand-700 font-bold">
                                                        {f.candidatures ?? f.nombre_candidatures ?? 0}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2 justify-end">
                                                        <Button variant="subtle" size="sm" onClick={() => { setEditFormation(f); setShowFormationForm(true) }}>Éditer</Button>
                                                        {status === 'draft' && <Button size="sm" variant="accent" onClick={() => handlePublish(f)}>Publier</Button>}
                                                        {status === 'published' && <Button size="sm" variant="subtle" className="text-amber-600 bg-amber-50 hover:bg-amber-100" onClick={() => handleArchive(f)}>Archiver</Button>}
                                                        {status === 'archived' && <Button size="sm" variant="subtle" className="text-blue-600 bg-blue-50 hover:bg-blue-100" onClick={() => handleUnarchive(f)}>Désarchiver</Button>}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </Table>

                                <FormationForm
                                    isOpen={showFormationForm}
                                    onClose={() => { setShowFormationForm(false); setEditFormation(null) }}
                                    formation={editFormation}
                                    onSaved={loadFormations}
                                    establishmentId={user?.establishment_id}
                                />
                            </div>
                        )}

                        {/* ── Dossiers ── */}
                        {tab === 'dossiers' && (
                            <div className="animate-fade-in">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-brand-900 tracking-tight">Candidatures Soumises</h2>
                                        <p className="text-sm text-slate-500 mt-1">Examinez et traitez les demandes d'inscription reçues.</p>
                                    </div>
                                    <Badge color="amber" className="px-4 py-2 text-sm shadow-sm">
                                        {filteredDossiers.length} dossier(s){q ? ' trouvé(s)' : ' total'}
                                    </Badge>
                                </div>

                                <div className="mb-6">
                                    <Input placeholder="🔍 Rechercher un dossier (candidat, formation, statut...)" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                                </div>

                                <Table columns={['N°', 'Candidat', 'Programme Souhaité', 'Date de Soumission', 'Statut Actuel', 'Décision']}>
                                    {loadingD ? (
                                        <TableRow><TableCell colSpan={6} className="text-center text-slate-400">Chargement...</TableCell></TableRow>
                                    ) : filteredDossiers.length === 0 ? (
                                        <TableRow><TableCell colSpan={6} className="text-center text-slate-400 py-8">{q ? 'Aucun dossier ne correspond à votre recherche.' : 'Aucun dossier.'}</TableCell></TableRow>
                                    ) : filteredDossiers.map(d => {
                                        const etat = d.etat || 'DOSSIER_SOUMIS'
                                        const { label, color } = etatConfig[etat] || { label: etat, color: 'gray' }
                                        const canDecide = etat === 'DOSSIER_SOUMIS' || etat === 'EN_VALIDATION'
                                        const dateStr = d.created_at || d.date || ''
                                        return (
                                            <TableRow key={d.id}>
                                                <TableCell className="text-slate-400 font-mono text-xs">#{d.id}</TableCell>
                                                <TableCell bold className="text-slate-800">{d.nom_complet || d.candidat || '—'}</TableCell>
                                                <TableCell className="text-slate-600 max-w-[200px] truncate" title={d.formation}>{d.formation || `Formation #${d.formation_id}` || '—'}</TableCell>
                                                <TableCell className="text-sm">{dateStr ? new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</TableCell>
                                                <TableCell><Badge color={color}>{label}</Badge></TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2 justify-end">
                                                        <Link to={`/admin/dossiers/${d.id}`}>
                                                            <Button variant="outline" size="sm">Examiner</Button>
                                                        </Link>
                                                        {canDecide && (
                                                            <>
                                                                <Button variant="subtle" className="text-green-600 bg-green-50 hover:bg-green-100" size="sm" onClick={() => handleDecision(d, 'ACCEPTE')}>✓</Button>
                                                                <Button variant="subtle" className="text-red-600 bg-red-50 hover:bg-red-100" size="sm" onClick={() => handleDecision(d, 'REFUSE')}>✕</Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </Table>
                            </div>
                        )}

                        {/* ── Stats ── */}
                        {tab === 'stats' && (
                            <div className="animate-fade-in">
                                <h2 className="text-2xl font-bold text-brand-900 tracking-tight mb-8">Vue d'ensemble et Statistiques</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <StatCard value={String(formationsData.length)} label="Programmes Actifs" color="brand" icon="📚" />
                                    <StatCard value={String(dossiers.length)} label="Candidatures Totales" color="accent" icon="👥" />
                                    <StatCard value={String(dossiers.filter(d => d.etat === 'DOSSIER_SOUMIS' || d.etat === 'EN_VALIDATION').length)} label="Dossiers en Attente" color="amber" icon="⏳" />
                                    <StatCard value={dossiers.length > 0 ? `${Math.round(dossiers.filter(d => d.etat === 'ACCEPTE' || d.etat === 'INSCRIT').length / dossiers.length * 100)}%` : '0%'} label="Taux d'Admission" color="green" icon="📈" />
                                </div>
                                <div className="mt-8 bg-slate-50 rounded-xl border border-slate-200 p-6">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4">Répartition des candidatures</h3>
                                    <div className="space-y-3">
                                        {Object.entries(etatConfig).map(([key, { label, color }]) => {
                                            const count = dossiers.filter(d => d.etat === key).length
                                            if (count === 0) return null
                                            return (
                                                <div key={key} className="flex items-center justify-between">
                                                    <Badge color={color}>{label}</Badge>
                                                    <span className="font-bold text-slate-800">{count}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Settings ── */}
                        {tab === 'settings' && (
                            <div className="animate-fade-in">
                                <h2 className="text-2xl font-bold text-brand-900 tracking-tight mb-8">Paramètres & Rôle</h2>
                                <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 mb-6">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4">Mon profil administrateur</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between"><span className="text-slate-500">Nom</span><span className="font-semibold">{user?.name || user?.nom || '—'}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="font-semibold">{user?.email || '—'}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Rôle</span><Badge color="blue">{(roleDisplay[user?.role] || {}).label || user?.role}</Badge></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Établissement</span><span className="font-semibold">{user?.establishment_id ? `#${user.establishment_id}` : 'Global'}</span></div>
                                    </div>
                                </div>
                                <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4">Permissions</h3>
                                    <p className="text-sm text-slate-600 mb-4">{(roleDisplay[user?.role] || {}).desc || ''}</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[{ label: 'Voir les formations', ok: true }, { label: 'Créer/éditer des formations', ok: true }, { label: 'Publier/archiver des formations', ok: true }, { label: 'Examiner les candidatures', ok: true }, { label: 'Accepter/refuser des candidats', ok: true }, { label: 'Voir les statistiques', ok: true }, { label: 'Gérer les établissements', ok: false }, { label: 'Gérer les super admins', ok: false }].map((p, i) => (
                                            <div key={i} className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${p.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-400'}`}>
                                                <span>{p.ok ? '✅' : '❌'}</span>{p.label}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    )
}
