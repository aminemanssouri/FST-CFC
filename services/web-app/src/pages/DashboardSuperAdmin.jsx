import { useState } from 'react'
import { PageHeader, Badge, Button, Sidebar, Table, TableRow, TableCell, StatCard, Input } from '../components/ui'

const etablissements = [
    { id: 1, nom: 'FST Béni Mellal', code: 'FST-BM', admin: 'Dr. Ahmed Mansouri', formations: 9, statut: 'active' },
    { id: 2, nom: 'FEG Béni Mellal', code: 'FEG-BM', admin: 'Dr. Nadia Chraibi', formations: 42, statut: 'active' },
    { id: 3, nom: 'ENSA Khouribga', code: 'ENSA-KH', admin: 'Pr. Rachid Ouafi', formations: 4, statut: 'active' },
    { id: 4, nom: 'ENCG Béni Mellal', code: 'ENCG-BM', admin: 'Dr. Youssef Berrada', formations: 19, statut: 'active' },
    { id: 5, nom: 'EST Béni Mellal', code: 'EST-BM', admin: 'Dr. Samir Tahiri', formations: 7, statut: 'active' },
    { id: 6, nom: 'FP Béni Mellal', code: 'FP-BM', admin: 'Pr. Laila Mounir', formations: 13, statut: 'inactive' },
]

const admins = [
    { id: 1, nom: 'Dr. Ahmed Mansouri', email: 'mansouri@usms.ma', role: 'ADMIN_ETAB', etablissement: 'FST-BM', statut: 'active' },
    { id: 2, nom: 'Dr. Nadia Chraibi', email: 'chraibi@usms.ma', role: 'ADMIN_ETAB', etablissement: 'FEG-BM', statut: 'active' },
    { id: 3, nom: 'Pr. Fatima Zahra Belkadi', email: 'belkadi@usms.ma', role: 'COORDINATEUR', etablissement: 'FST-BM', statut: 'active' },
    { id: 4, nom: 'Pr. Karim Ouazzani', email: 'ouazzani@usms.ma', role: 'COORDINATEUR', etablissement: 'FST-BM', statut: 'active' },
    { id: 5, nom: 'Dr. Youssef Berrada', email: 'berrada@usms.ma', role: 'ADMIN_ETAB', etablissement: 'ENCG-BM', statut: 'active' },
]

const roleConfig = {
    ADMIN_ETAB: { label: 'Admin Établissement', color: 'blue' },
    COORDINATEUR: { label: 'Coordinateur', color: 'yellow' },
    SUPER_ADMIN: { label: 'Super Admin', color: 'green' },
}

const sidebarItems = [
    { key: 'etablissements', icon: '🏛️', label: 'Établissements' },
    { key: 'admins', icon: '👥', label: 'Administrateurs' },
    { key: 'config', icon: '⚙️', label: 'Configuration' },
    { key: 'reporting', icon: '📊', label: 'Reporting global' },
]

export default function DashboardSuperAdmin() {
    const [tab, setTab] = useState('etablissements')

    return (
        <div className="animate-fade-in">
            <PageHeader title="🛡️ Super Administration" subtitle="Gestion globale des établissements et des administrateurs" />

            <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
                <Sidebar title="Super Admin" items={sidebarItems} active={tab} onSelect={setTab} />

                <main>
                    {/* ── Établissements (UC1) ── */}
                    {tab === 'etablissements' && (
                        <div className="animate-fade-in">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl font-bold text-slate-800">🏛️ Gestion des Établissements</h2>
                                <Button size="sm">+ Nouvel établissement</Button>
                            </div>

                            <Table columns={['Établissement', 'Code', 'Admin', 'Formations', 'Statut', 'Actions']}>
                                {etablissements.map(e => (
                                    <TableRow key={e.id}>
                                        <TableCell bold>{e.nom}</TableCell>
                                        <TableCell>{e.code}</TableCell>
                                        <TableCell>{e.admin}</TableCell>
                                        <TableCell bold>{e.formations}</TableCell>
                                        <TableCell>
                                            <Badge color={e.statut === 'active' ? 'green' : 'gray'}>
                                                {e.statut === 'active' ? 'Actif' : 'Inactif'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button variant="subtle" size="sm">Modifier</Button>
                                                <Button variant="danger" size="sm">Désactiver</Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </Table>
                        </div>
                    )}

                    {/* ── Admins (UC1) ── */}{/**dasdasdasdas */}
                    {tab === 'admins' && (
                        <div className="animate-fade-in">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl font-bold text-slate-800">👥 Gestion des Administrateurs</h2>
                                <Button size="sm">+ Nouvel administrateur</Button>
                            </div>

                            <Table columns={['Nom', 'Email', 'Rôle', 'Établissement', 'Statut', 'Actions']}>
                                {admins.map(a => {
                                    const { label, color } = roleConfig[a.role]
                                    return (
                                        <TableRow key={a.id}>
                                            <TableCell bold>{a.nom}</TableCell>
                                            <TableCell>{a.email}</TableCell>
                                            <TableCell><Badge color={color}>{label}</Badge></TableCell>
                                            <TableCell>{a.etablissement}</TableCell>
                                            <TableCell>
                                                <Badge color={a.statut === 'active' ? 'green' : 'gray'}>
                                                    {a.statut === 'active' ? 'Actif' : 'Inactif'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button variant="subtle" size="sm">Modifier</Button>
                                                    <Button variant="danger" size="sm">Supprimer</Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </Table>
                        </div>
                    )}

                    {/* ── Configuration (UC2) ── */}
                    {tab === 'config' && (
                        <div className="animate-fade-in">
                            <h2 className="text-xl font-bold text-slate-800 mb-5">⚙️ Configurations Globales</h2>

                            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
                                <Input label="Nom de la plateforme" value="Centre de Formation Continue — USMS" readOnly />
                                <Input label="Email de contact" value="cfc@usms.ma" readOnly />
                                <Input label="Clé JWT (Secret)" type="password" value="••••••••••••••••" readOnly />
                                <div className="flex gap-3 pt-2">
                                    <Button>💾 Enregistrer</Button>
                                    <Button variant="outline">Réinitialiser</Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Reporting (UC3) ── */}
                    {tab === 'reporting' && (
                        <div className="animate-fade-in">
                            <h2 className="text-xl font-bold text-slate-800 mb-5">📊 Reporting Global</h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                                <StatCard value="6" label="Établissements" color="brand" />
                                <StatCard value="94" label="Formations totales" color="accent" />
                                <StatCard value="350" label="Candidatures 2026" color="amber" />
                                <StatCard value="1200" label="Lauréats cumulés" color="brand" />
                            </div>

                            <h3 className="text-lg font-bold text-slate-800 mb-3">Par Établissement</h3>
                            <Table columns={['Établissement', 'Formations', 'Candidatures', 'Acceptées', 'Taux']}>
                                {etablissements.filter(e => e.statut === 'active').map(e => {
                                    const cands = Math.floor(Math.random() * 80) + 20
                                    const accepted = Math.floor(cands * (0.5 + Math.random() * 0.3))
                                    const rate = Math.round((accepted / cands) * 100)
                                    return (
                                        <TableRow key={e.id}>
                                            <TableCell bold>{e.nom}</TableCell>
                                            <TableCell>{e.formations}</TableCell>
                                            <TableCell>{cands}</TableCell>
                                            <TableCell>{accepted}</TableCell>
                                            <TableCell>
                                                <Badge color={rate > 70 ? 'green' : rate > 50 ? 'yellow' : 'red'}>{rate}%</Badge>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </Table>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
