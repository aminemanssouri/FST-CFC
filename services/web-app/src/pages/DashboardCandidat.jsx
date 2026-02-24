import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PageHeader, Badge, Button, Table, TableRow, TableCell, EmptyState } from '../components/ui'

const inscriptions = [
    { id: 1, formation: 'Licence en Informatique et Numérique', etablissement: 'FST Béni Mellal', etat: 'DOSSIER_SOUMIS', date: '2026-02-10' },
    { id: 2, formation: 'Master en Data Science', etablissement: 'FST Béni Mellal', etat: 'EN_VALIDATION', date: '2026-02-15' },
    { id: 3, formation: 'Licence en Commerce International', etablissement: 'FEG Béni Mellal', etat: 'ACCEPTE', date: '2026-01-25' },
]

const etatConfig = {
    PREINSCRIPTION: { label: 'Pré-inscription', color: 'gray' },
    DOSSIER_SOUMIS: { label: 'Dossier soumis', color: 'indigo' },
    EN_VALIDATION: { label: 'En validation', color: 'yellow' },
    ACCEPTE: { label: 'Accepté', color: 'green' },
    REFUSE: { label: 'Refusé', color: 'red' },
    INSCRIT: { label: 'Inscrit', color: 'green' },
}

const navItems = [
    { key: 'inscriptions', icon: '📋', label: 'Mes inscriptions', to: '/dashboard' },
    { key: 'notifications', icon: '🔔', label: 'Notifications', to: '/notifications' },
    { key: 'profil', icon: '⚙️', label: 'Mon profil', to: '/profile' },
]

export default function DashboardCandidat() {
    const { user } = useAuth()
    const location = useLocation()

    return (
        <div className="animate-fade-in bg-slate-50 min-h-screen pb-12">
            <PageHeader title={`Bienvenue, ${user?.nom || 'Candidat'}`} subtitle="Suivez l'état de vos candidatures et restez informé." />

            <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">

                    {/* Navigation Sidebar */}
                    <aside className="bg-brand-800 rounded-xl p-6 h-fit lg:sticky lg:top-24 shadow-md border border-brand-700">
                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-brand-700">
                            <div className="w-12 h-12 rounded-full bg-white text-brand-700 flex items-center justify-center text-xl font-bold ring-2 ring-brand-300">
                                {user?.nom?.charAt(0) || 'C'}
                            </div>
                            <div>
                                <h3 className="text-white font-bold">{user?.nom || 'Mon Espace'}</h3>
                                <p className="text-brand-300 text-xs font-medium">Candidat</p>
                            </div>
                        </div>

                        <h3 className="text-xs font-bold mb-4 text-brand-300 uppercase tracking-widest pl-2">Menu Principal</h3>
                        <nav className="space-y-2">
                            {navItems.map(item => {
                                const isActive = location.pathname === item.to || (item.key === 'inscriptions' && location.pathname === '/dashboard')
                                return (
                                    <Link
                                        key={item.key}
                                        to={item.to}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${isActive ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-300 hover:bg-brand-700 hover:text-white'
                                            }`}
                                    >
                                        <span className={`text-lg ${isActive ? 'text-brand-600' : 'text-slate-400'}`}>{item.icon}</span>
                                        {item.label}
                                    </Link>
                                )
                            })}
                        </nav>
                        <div className="mt-8 pt-6 border-t border-brand-700">
                            <Link to="/register">
                                <Button size="lg" variant="accent" full>
                                    <span className="mr-2">+</span> Nouvelle candidature
                                </Button>
                            </Link>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="bg-white p-6 md:p-8 rounded-2xl shadow-sm min-h-[500px] border border-slate-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-brand-900 tracking-tight">Mes Candidatures</h2>
                                <p className="text-sm text-slate-500 mt-1">Consultez l'historique et le statut de vos demandes.</p>
                            </div>
                            <Badge color="accent" className="px-4 py-2 text-sm">
                                {inscriptions.length} dossier(s)
                            </Badge>
                        </div>

                        {inscriptions.length > 0 ? (
                            <Table columns={['Programme Cible', 'Établissement', 'Date de Dépôt', 'Statut Actuel', 'Actions']}>
                                {inscriptions.map(ins => {
                                    const { label, color } = etatConfig[ins.etat] || { label: ins.etat, color: 'gray' }
                                    return (
                                        <TableRow key={ins.id}>
                                            <TableCell bold className="text-slate-800">{ins.formation}</TableCell>
                                            <TableCell className="text-slate-600">{ins.etablissement}</TableCell>
                                            <TableCell className="text-sm">{new Date(ins.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</TableCell>
                                            <TableCell><Badge color={color}>{label}</Badge></TableCell>
                                            <TableCell>
                                                <div className="flex justify-end">
                                                    <Link to={`/dossiers/${ins.id}`}>
                                                        <Button variant="outline" size="sm">Consulter</Button>
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </Table>
                        ) : (
                            <div className="py-12">
                                <EmptyState icon="📬" title="Aucune candidature en cours" description="Vous n'avez pas encore soumis de dossier d'inscription. Explorez notre catalogue pour trouver la formation qui vous correspond." />
                                <div className="text-center mt-6">
                                    <Link to="/catalogue">
                                        <Button>Explorer le Catalogue</Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    )
}
