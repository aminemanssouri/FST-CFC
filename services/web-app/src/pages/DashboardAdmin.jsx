import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../components/ui/Toast'
import { PageHeader, Badge, Button, Sidebar, Table, TableRow, TableCell, StatCard, EmptyState } from '../components/ui'
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
    DOSSIER_SOUMIS: { label: 'Soumis', color: 'blue' },
    EN_VALIDATION: { label: 'En validation', color: 'yellow' },
    ACCEPTE: { label: 'Accepté', color: 'green' },
    REFUSE: { label: 'Refusé', color: 'red' },
}

const formationEtatConfig = {
    BROUILLON: { label: 'Brouillon', color: 'gray' },
    PUBLIEE: { label: 'Publiée', color: 'green' },
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
        <div className="animate-fade-in">
            <PageHeader title="🏛️ Administration" subtitle="Gérez les formations et les dossiers de candidature" />

            <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
                <Sidebar title="Administration" items={sidebarItems} active={tab} onSelect={setTab} />

                <main>
                    {/* ── Formations ── */}
                    {tab === 'formations' && (
                        <div className="animate-fade-in">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl font-bold text-slate-800">📚 Gestion des Formations</h2>
                                <Button size="sm" onClick={() => setShowFormationForm(true)}>+ Nouvelle formation</Button>
                            </div>

                            <Table columns={['Formation', 'Coordinateur', 'État', 'Inscriptions', 'Candidatures', 'Actions']}>
                                {formationsData.map(f => {
                                    const { label, color } = formationEtatConfig[f.etat]
                                    return (
                                        <TableRow key={f.id}>
                                            <TableCell bold>{f.titre}</TableCell>
                                            <TableCell>{f.coordinateur}</TableCell>
                                            <TableCell><Badge color={color}>{label}</Badge></TableCell>
                                            <TableCell>
                                                <Badge color={f.inscriptions ? 'green' : 'red'}>
                                                    {f.inscriptions ? 'Ouvertes' : 'Fermées'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell bold>{f.candidatures}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button variant="subtle" size="sm" onClick={() => setShowFormationForm(true)}>Modifier</Button>
                                                    {f.etat === 'BROUILLON' && <Button size="sm" onClick={() => handlePublish(f)}>Publier</Button>}
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
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl font-bold text-slate-800">📋 Dossiers de Candidature</h2>
                                <span className="text-sm text-slate-500">{dossiers.length} dossier(s)</span>
                            </div>

                            <Table columns={['Candidat', 'Formation', 'Date', 'Statut', 'Actions']}>
                                {dossiers.map(d => {
                                    const { label, color } = etatConfig[d.etat]
                                    const canDecide = d.etat === 'DOSSIER_SOUMIS' || d.etat === 'EN_VALIDATION'
                                    return (
                                        <TableRow key={d.id}>
                                            <TableCell bold>{d.candidat}</TableCell>
                                            <TableCell>{d.formation}</TableCell>
                                            <TableCell>{d.date}</TableCell>
                                            <TableCell><Badge color={color}>{label}</Badge></TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Link to={`/admin/dossiers/${d.id}`}>
                                                        <Button variant="subtle" size="sm">Voir</Button>
                                                    </Link>
                                                    {canDecide && (
                                                        <>
                                                            <Button variant="accent" size="sm" onClick={() => toast.success(`${d.candidat} accepté !`)}>Accepter</Button>
                                                            <Button variant="danger" size="sm" onClick={() => toast.error(`${d.candidat} refusé.`)}>Refuser</Button>
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
                            <h2 className="text-xl font-bold text-slate-800 mb-5">📊 Statistiques</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                <StatCard value="5" label="Formations actives" color="brand" />
                                <StatCard value="83" label="Candidatures totales" color="accent" />
                                <StatCard value="12" label="En attente" color="amber" />
                                <StatCard value="68%" label="Taux d'acceptation" color="brand" />
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
