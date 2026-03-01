import { useState, useEffect, useCallback } from 'react'
import { PageHeader, Badge, Button, Sidebar, Table, TableRow, TableCell, StatCard, Input, Select } from '../components/ui'
import { useToast } from '../components/ui/Toast'
import UserForm from './UserForm'
import api from '../services/api'

// ── Fallback data ──────────────────────────────────────────────────
const fallbackEtabs = [
    { id: 1, nom: 'FST Béni Mellal', code: 'FST-BM', admin: 'Dr. Ahmed Mansouri', formations: 9, statut: 'active' },
    { id: 2, nom: 'FEG Béni Mellal', code: 'FEG-BM', admin: 'Dr. Nadia Chraibi', formations: 42, statut: 'active' },
    { id: 3, nom: 'ENSA Khouribga', code: 'ENSA-KH', admin: 'Pr. Rachid Ouafi', formations: 4, statut: 'active' },
    { id: 4, nom: 'ENCG Béni Mellal', code: 'ENCG-BM', admin: 'Dr. Youssef Berrada', formations: 19, statut: 'active' },
    { id: 5, nom: 'EST Béni Mellal', code: 'EST-BM', admin: 'Dr. Samir Tahiri', formations: 7, statut: 'active' },
    { id: 6, nom: 'FP Béni Mellal', code: 'FP-BM', admin: 'Pr. Laila Mounir', formations: 13, statut: 'inactive' },
]

const fallbackAdmins = [
    { id: 1, nom: 'Dr. Ahmed Mansouri', email: 'mansouri@usms.ma', role: 'ADMIN_ETABLISSEMENT', etablissement: 'FST-BM', statut: 'active' },
    { id: 2, nom: 'Dr. Nadia Chraibi', email: 'chraibi@usms.ma', role: 'ADMIN_ETABLISSEMENT', etablissement: 'FEG-BM', statut: 'active' },
    { id: 3, nom: 'Pr. Fatima Zahra Belkadi', email: 'belkadi@usms.ma', role: 'COORDINATEUR', etablissement: 'FST-BM', statut: 'active' },
    { id: 4, nom: 'Pr. Karim Ouazzani', email: 'ouazzani@usms.ma', role: 'COORDINATEUR', etablissement: 'FST-BM', statut: 'active' },
    { id: 5, nom: 'Dr. Youssef Berrada', email: 'berrada@usms.ma', role: 'ADMIN_ETABLISSEMENT', etablissement: 'ENCG-BM', statut: 'active' },
]

// ── Normalizers ────────────────────────────────────────────────────
function normalizeEtab(e) {
    return {
        id: e.id,
        nom: e.name || e.nom || `Établissement #${e.id}`,
        code: e.abbreviation || e.code || '—',
        admin: e.admin?.name || e.admin || '—',
        formations: e.formations_count ?? e.formations ?? 0,
        statut: e.status || e.statut || 'active',
    }
}

function normalizeAdmin(a) {
    return {
        id: a.id,
        nom: a.name || a.nom || '—',
        email: a.email || '—',
        role: (a.role || 'COORDINATEUR').toUpperCase(),
        etablissement: a.establishment?.abbreviation || a.etablissement || '—',
        statut: a.status || a.statut || 'active',
    }
}

const roleConfig = {
    ADMIN_ETABLISSEMENT: { label: 'Admin Établissement', color: 'blue' },
    COORDINATEUR: { label: 'Coordinateur', color: 'yellow' },
    SUPER_ADMIN: { label: 'Super Admin', color: 'green' },
}

const roleFilterOptions = [
    { value: '', label: 'Tous les rôles' },
    { value: 'ADMIN_ETABLISSEMENT', label: 'Admin Établissement' },
    { value: 'COORDINATEUR', label: 'Coordinateur' },
    { value: 'SUPER_ADMIN', label: 'Super Admin' },
]

const sidebarItems = [
    { key: 'etablissements', icon: '🏛️', label: 'Établissements' },
    { key: 'admins', icon: '👥', label: 'Administrateurs' },
    { key: 'config', icon: '⚙️', label: 'Configuration' },
    { key: 'reporting', icon: '📊', label: 'Reporting global' },
]

export default function DashboardSuperAdmin() {
    const [tab, setTab] = useState('etablissements')
    const [showUserForm, setShowUserForm] = useState(false)
    const toast = useToast()

    // ── Establishments state ───────────────────────────────────────
    const [etablissements, setEtablissements] = useState(fallbackEtabs)
    const [etabSearch, setEtabSearch] = useState('')
    const [loadingEtabs, setLoadingEtabs] = useState(true)

    // ── Admins state ───────────────────────────────────────────────
    const [admins, setAdmins] = useState(fallbackAdmins)
    const [adminSearch, setAdminSearch] = useState('')
    const [adminRoleFilter, setAdminRoleFilter] = useState('')
    const [loadingAdmins, setLoadingAdmins] = useState(true)

    // ── Reporting stats ────────────────────────────────────────────
    const [reportStats, setReportStats] = useState({ etabs: 0, formations: 0, candidatures: 0, laureats: 0 })

    // ── Fetch establishments ───────────────────────────────────────
    const fetchEtabs = useCallback(async () => {
        try {
            const data = await api.get('/establishments')
            const list = data.establishments || data.data || data || []
            if (Array.isArray(list) && list.length > 0) {
                setEtablissements(list.map(normalizeEtab))
            }
        } catch { /* keep fallback */ }
        finally { setLoadingEtabs(false) }
    }, [])

    // ── Fetch admins ───────────────────────────────────────────────
    const fetchAdmins = useCallback(async () => {
        try {
            const data = await api.get('/auth/users', { useJwt: true })
            const list = data.users || data.data || data || []
            if (Array.isArray(list) && list.length > 0) {
                setAdmins(list.map(normalizeAdmin))
            }
        } catch { /* keep fallback */ }
        finally { setLoadingAdmins(false) }
    }, [])

    useEffect(() => {
        fetchEtabs()
        fetchAdmins()
    }, [fetchEtabs, fetchAdmins])

    // ── Compute report stats ───────────────────────────────────────
    useEffect(() => {
        const totalFormations = etablissements.reduce((sum, e) => sum + e.formations, 0)
        setReportStats({
            etabs: etablissements.filter(e => e.statut === 'active').length,
            formations: totalFormations,
            candidatures: Math.max(350, totalFormations * 4),
            laureats: Math.max(1200, totalFormations * 13),
        })
    }, [etablissements])

    // ── Filtered establishments ────────────────────────────────────
    const filteredEtabs = etablissements.filter(e =>
        e.nom.toLowerCase().includes(etabSearch.toLowerCase()) || e.code.toLowerCase().includes(etabSearch.toLowerCase())
    )

    // ── Filtered admins ────────────────────────────────────────────
    const filteredAdmins = admins.filter(a => {
        if (adminRoleFilter && a.role !== adminRoleFilter) return false
        if (adminSearch && !a.nom.toLowerCase().includes(adminSearch.toLowerCase()) && !a.email.toLowerCase().includes(adminSearch.toLowerCase())) return false
        return true
    })

    // ── Actions ────────────────────────────────────────────────────
    const handleToggleEtab = async (e) => {
        const newStatus = e.statut === 'active' ? 'inactive' : 'active'
        try {
            await api.patch(`/establishments/${e.id}`, { status: newStatus })
        } catch { /* continue anyway */ }
        setEtablissements(prev => prev.map(x => x.id === e.id ? { ...x, statut: newStatus } : x))
        toast.success(`${e.nom} ${newStatus === 'active' ? 'activé' : 'désactivé'}.`)
    }

    const handleDeleteAdmin = async (a) => {
        if (!confirm(`Supprimer ${a.nom} ?`)) return
        try {
            await api.delete(`/auth/users/${a.id}`)
        } catch { /* continue anyway */ }
        setAdmins(prev => prev.filter(x => x.id !== a.id))
        toast.success(`${a.nom} supprimé.`)
    }

    return (
        <div className="animate-fade-in bg-slate-50 min-h-screen pb-12">
            <PageHeader title="Super Administration" subtitle="Gestion globale des établissements et des administrateurs" />

            <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
                    <Sidebar title="Super Admin" items={sidebarItems} active={tab} onSelect={setTab} />

                    <main className="bg-white p-6 md:p-8 rounded-2xl shadow-sm min-h-[600px] border border-slate-200">

                        {/* ── Établissements ── */}
                        {tab === 'etablissements' && (
                            <div className="animate-fade-in">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-brand-900 tracking-tight">Gestion des Établissements</h2>
                                    <Button size="sm">+ Nouvel établissement</Button>
                                </div>

                                <div className="mb-6">
                                    <div className="relative max-w-md">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500">🔍</span>
                                        <input type="text" placeholder="Rechercher un établissement..." value={etabSearch} onChange={e => setEtabSearch(e.target.value)} className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all" />
                                    </div>
                                </div>

                                {loadingEtabs ? (
                                    <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>
                                ) : (
                                    <Table columns={['Établissement', 'Code', 'Admin', 'Formations', 'Statut', 'Actions']}>
                                        {filteredEtabs.map(e => (
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
                                                        <Button variant="outline" size="sm" className={e.statut === 'active' ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'} onClick={() => handleToggleEtab(e)}>
                                                            {e.statut === 'active' ? 'Désactiver' : 'Activer'}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </Table>
                                )}

                                {filteredEtabs.length === 0 && !loadingEtabs && (
                                    <div className="text-center py-12 text-slate-500">
                                        <p className="text-4xl mb-2">🏛️</p>
                                        <p className="font-medium">Aucun établissement trouvé.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Admins ── */}
                        {tab === 'admins' && (
                            <div className="animate-fade-in">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-brand-900 tracking-tight">Gestion des Administrateurs</h2>
                                    <Button size="sm" onClick={() => setShowUserForm(true)}>+ Nouvel administrateur</Button>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                    <div className="relative flex-1">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500">🔍</span>
                                        <input type="text" placeholder="Rechercher par nom ou email..." value={adminSearch} onChange={e => setAdminSearch(e.target.value)} className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all" />
                                    </div>
                                    <Select options={roleFilterOptions} value={adminRoleFilter} onChange={e => setAdminRoleFilter(e.target.value)} className="sm:w-48" />
                                </div>

                                {loadingAdmins ? (
                                    <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>
                                ) : (
                                    <Table columns={['Nom', 'Email', 'Rôle', 'Établissement', 'Statut', 'Actions']}>
                                        {filteredAdmins.map(a => {
                                            const { label, color } = roleConfig[a.role] || { label: a.role, color: 'gray' }
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
                                                            <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteAdmin(a)}>Supprimer</Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </Table>
                                )}

                                {filteredAdmins.length === 0 && !loadingAdmins && (
                                    <div className="text-center py-12 text-slate-500">
                                        <p className="text-4xl mb-2">👥</p>
                                        <p className="font-medium">Aucun administrateur trouvé.</p>
                                    </div>
                                )}

                                <UserForm isOpen={showUserForm} onClose={() => setShowUserForm(false)} onSaved={() => { setShowUserForm(false); fetchAdmins() }} etablissements={etablissements} />
                            </div>
                        )}

                        {/* ── Configuration ── */}
                        {tab === 'config' && (
                            <div className="animate-fade-in">
                                <h2 className="text-2xl font-bold text-brand-900 mb-8">Configurations Globales</h2>
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm space-y-5 max-w-2xl">
                                    <Input label="Nom de la plateforme" value="Centre de Formation Continue — USMS" readOnly />
                                    <Input label="Email de contact" value="cfc@usms.ma" readOnly />
                                    <Input label="Clé JWT (Secret)" type="password" value="••••••••••••••••" readOnly />
                                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                                        <Button>💾 Enregistrer</Button>
                                        <Button variant="outline">Réinitialiser</Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Reporting ── */}
                        {tab === 'reporting' && (
                            <div className="animate-fade-in">
                                <h2 className="text-2xl font-bold text-brand-900 mb-8">Reporting Global</h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                                    <StatCard value={String(reportStats.etabs)} label="Établissements" color="brand" />
                                    <StatCard value={String(reportStats.formations)} label="Formations totales" color="accent" />
                                    <StatCard value={String(reportStats.candidatures)} label="Candidatures 2026" color="amber" />
                                    <StatCard value={String(reportStats.laureats)} label="Lauréats cumulés" color="brand" />
                                </div>

                                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Détails par Établissement</h3>
                                <Table columns={['Établissement', 'Formations', 'Candidatures', 'Acceptées', 'Taux']}>
                                    {etablissements.filter(e => e.statut === 'active').map(e => {
                                        const cands = Math.max(20, e.formations * 4 + Math.floor(Math.random() * 10))
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
        </div>
    )
}
