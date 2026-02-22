import { PageHeader, Badge, Button, Sidebar, Table, TableRow, TableCell } from '../components/ui'

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
    { key: 'inscriptions', icon: '📋', label: 'Mes inscriptions' },
    { key: 'documents', icon: '📎', label: 'Mes documents' },
    { key: 'notifications', icon: '🔔', label: 'Notifications' },
    { key: 'profil', icon: '⚙️', label: 'Mon profil' },
]

export default function DashboardCandidat() {
    return (
        <div className="animate-fade-in">
            <PageHeader title="👤 Mon Espace Candidat" subtitle="Suivez l'état de vos inscriptions" />

            <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
                <Sidebar title="Navigation" items={navItems} active="inscriptions">
                    <Button to="/inscription" size="sm" full>+ Nouvelle inscription</Button>
                </Sidebar>

                <main>
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-bold text-slate-800">Mes inscriptions</h2>
                        <span className="text-sm text-slate-500">{inscriptions.length} inscription(s)</span>
                    </div>

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
                </main>
            </div>
        </div>
    )
}
