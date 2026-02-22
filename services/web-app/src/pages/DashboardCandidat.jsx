import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PageHeader, Badge, Button, Sidebar, Table, TableRow, TableCell, EmptyState } from '../components/ui'

const inscriptions = [
    { id: 1, formation: 'Licence en Informatique et Numérique', etablissement: 'FST Béni Mellal', etat: 'DOSSIER_SOUMIS', date: '2026-02-10' },
    { id: 2, formation: 'Master en Data Science', etablissement: 'FST Béni Mellal', etat: 'EN_VALIDATION', date: '2026-02-15' },
    { id: 3, formation: 'Licence en Commerce International', etablissement: 'FEG Béni Mellal', etat: 'ACCEPTE', date: '2026-01-25' },
]

const etatConfig = {
    PREINSCRIPTION: { label: 'Pré-inscription', color: 'gray' },
    DOSSIER_SOUMIS: { label: 'Dossier soumis', color: 'blue' },
    EN_VALIDATION: { label: 'En validation', color: 'yellow' },
    ACCEPTE: { label: 'Accepté', color: 'green' },
    REFUSE: { label: 'Refusé', color: 'red' },
    INSCRIT: { label: 'Inscrit', color: 'green' },
}

const navItems = [
    { key: 'inscriptions', icon: '📋', label: 'Mes inscriptions', to: '/dashboard' },
    { key: 'notifications', icon: '🔔', label: 'Notifications', to: '/notifications' },
    { key: 'profil', icon: '⚙️', label: 'Mon profil', to: '/profil' },
]

export default function DashboardCandidat() {
    const { user } = useAuth()

    return (
        <div className="animate-fade-in">
            <PageHeader title={`👤 Bienvenue, ${user?.nom || 'Candidat'}`} subtitle="Suivez l'état de vos inscriptions et notifications" />

            <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
                <aside className="bg-brand-900 rounded-xl p-5 text-white h-fit lg:sticky lg:top-24">
                    <h3 className="text-sm font-bold mb-4 text-slate-400 uppercase tracking-wider">Navigation</h3>
                    <nav className="space-y-1">
                        {navItems.map(item => (
                            <Link
                                key={item.key}
                                to={item.to}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left ${item.key === 'inscriptions' ? 'bg-brand-600/20 text-brand-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <span>{item.icon}</span> {item.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="mt-6 pt-5 border-t border-white/10">
                        <Button to="/inscription" size="sm" full>+ Nouvelle inscription</Button>
                    </div>
                </aside>

                <main>
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-bold text-slate-800">Mes inscriptions</h2>
                        <span className="text-sm text-slate-500">{inscriptions.length} inscription(s)</span>
                    </div>

                    {inscriptions.length > 0 ? (
                        <Table columns={['Formation', 'Établissement', 'Date', 'Statut', 'Action']}>
                            {inscriptions.map(ins => {
                                const { label, color } = etatConfig[ins.etat] || { label: ins.etat, color: 'gray' }
                                return (
                                    <TableRow key={ins.id}>
                                        <TableCell bold>{ins.formation}</TableCell>
                                        <TableCell>{ins.etablissement}</TableCell>
                                        <TableCell>{ins.date}</TableCell>
                                        <TableCell><Badge color={color}>{label}</Badge></TableCell>
                                        <TableCell><Button variant="subtle" size="sm">Détails</Button></TableCell>
                                    </TableRow>
                                )
                            })}
                        </Table>
                    ) : (
                        <EmptyState icon="📭" title="Aucune inscription" description="Vous n'avez pas encore d'inscription. Commencez par explorer le catalogue." />
                    )}
                </main>
            </div>
        </div>
    )
}
