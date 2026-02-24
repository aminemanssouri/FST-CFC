import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../components/ui/Toast'
import { PageHeader, Badge, Button, Sidebar, Table, TableRow, TableCell, StatCard } from '../components/ui'
import FormationForm from './FormationForm'

const formationsData = [
    { id: 1, titre: 'Licence en Informatique et Numérique', etat: 'PUBLIEE', inscriptions: true, coordinateur: 'Dr. Mansouri', candidatures: 28 },
    { id: 2, titre: 'Master en Énergies Renouvelables', etat: 'PUBLIEE', inscriptions: true, coordinateur: 'Pr. Belkadi', candidatures: 15 },
    { id: 3, titre: 'DUT en Développement Web', etat: 'BROUILLON', inscriptions: false, coordinateur: 'Dr. Tahiri', candidatures: 0 },
    { id: 7, titre: 'Master en Data Science', etat: 'PUBLIEE', inscriptions: true, coordinateur: 'Pr. Ouazzani', candidatures: 22 },
    { id: 12, titre: 'Master en Intelligence Artificielle', etat: 'PUBLIEE', inscriptions: true, coordinateur: 'Dr. Amrani', candidatures: 18 },
]

const dossiers = [
    { id: 101, candidat: 'Amine El Fadili', formation: 'Licence Informatique', etat: 'DOSSIER_SOUMIS', date: '2026-02-18' },
    { id: 102, candidat: 'Sara Benali', formation: 'Master Data Science', etat: 'EN_VALIDATION', date: '2026-02-17' },
    { id: 103, candidat: 'Youssef Amrani', formation: 'Master Énergies', etat: 'DOSSIER_SOUMIS', date: '2026-02-19' },
    { id: 104, candidat: 'Fatima Zohra Idrissi', formation: 'Licence Informatique', etat: 'ACCEPTE', date: '2026-02-10' },
    { id: 105, candidat: 'Karim Bouayad', formation: 'Master Data Science', etat: 'REFUSE', date: '2026-02-08' },
]

const etatConfig = {
    DOSSIER_SOUMIS: { label: 'Soumis', color: 'indigo' },
    EN_VALIDATION: { label: 'En validation', color: 'yellow' },
    ACCEPTE: { label: 'Accepté', color: 'green' },
    REFUSE: { label: 'Refusé', color: 'red' },
}

const formationEtatConfig = {
    BROUILLON: { label: 'Brouillon', color: 'gray' },
    PUBLIEE: { label: 'Publiée', color: 'indigo' },
    ARCHIVEE: { label: 'Archivée', color: 'red' },
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
    const toast = useToast()

    const handlePublish = (f) => toast.success(`"${f.titre}" publiée avec succès !`)

    return (
        <div className="animate-fade-in bg-slate-50 min-h-screen pb-12">
            <PageHeader title="Espace Administration" subtitle="Gérez les programmes, les candidatures et analysez les performances du centre." />

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

                                <Table columns={['Formation', 'Responsable', 'Statut', 'Portail', 'Candidats', 'Actions']}>
                                    {formationsData.map(f => {
                                        const { label, color } = formationEtatConfig[f.etat]
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
                                                        <Button variant="subtle" size="sm" onClick={() => setShowFormationForm(true)}>Éditer</Button>
                                                        {f.etat === 'BROUILLON' && <Button size="sm" variant="accent" onClick={() => handlePublish(f)}>Publier</Button>}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </Table>

                                <FormationForm isOpen={showFormationForm} onClose={() => setShowFormationForm(false)} />
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
                                        {dossiers.length} dossier(s) total
                                    </Badge>
                                </div>

                                <Table columns={['N°', 'Candidat', 'Programme Souhaité', 'Date de Soumission', 'Statut Actuel', 'Décision']}>
                                    {dossiers.map(d => {
                                        const { label, color } = etatConfig[d.etat]
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
                                                                <Button variant="subtle" className="text-green-600 bg-green-50 hover:bg-green-100" size="sm" onClick={() => toast.success(`Candidature de ${d.candidat} validée.`)}>✓</Button>
                                                                <Button variant="subtle" className="text-red-600 bg-red-50 hover:bg-red-100" size="sm" onClick={() => toast.error(`Candidature de ${d.candidat} rejetée.`)}>✕</Button>
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
                                    <StatCard value="5" label="Programmes Actifs" color="brand" icon="📚" />
                                    <StatCard value="83" label="Candidatures Totales" color="accent" icon="👥" />
                                    <StatCard value="12" label="Dossiers en Attente" color="amber" icon="⏳" />
                                    <StatCard value="68%" label="Taux d'Admission" color="green" icon="📈" />
                                </div>
                                {/* Placeholder for charts */}
                                <div className="mt-8 bg-slate-50 rounded-xl border border-slate-200 border-dashed h-64 flex items-center justify-center text-slate-400">
                                    [Zone Graphique des Inscriptions]
                                </div>
                            </div>
                        )}

                        {/* ── Settings Placeholder ── */}
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
