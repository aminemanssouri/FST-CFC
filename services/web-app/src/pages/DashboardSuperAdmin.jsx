import React, { useState, useEffect } from 'react'
import { useToast } from '../components/ui/Toast'
import { PageHeader, Badge, Button, Sidebar, Table, TableRow, TableCell, StatCard, Input, Modal } from '../components/ui'
import { institutionApi, userApi, configApi, reportingApi, applicationApi, documentApi } from '../api'

const roleConfig = {
    establishment_admin: { label: 'Admin Établissement', color: 'blue' },
    coordinator: { label: 'Coordinateur', color: 'yellow' },
    super_admin: { label: 'Super Admin', color: 'green' },
    candidate: { label: 'Candidat', color: 'gray' },
}
const roleOptions = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'establishment_admin', label: 'Admin Établissement' },
    { value: 'coordinator', label: 'Coordinateur' },
    { value: 'candidate', label: 'Candidat' },
]

const sidebarItems = [
    { key: 'etablissements', icon: '🏛️', label: 'Établissements' },
    { key: 'formations', icon: '📚', label: 'Formations' },
    { key: 'admins', icon: '👥', label: 'Utilisateurs' },
    { key: 'candidatures', icon: '📋', label: 'Candidatures' },
    { key: 'config', icon: '⚙️', label: 'Configuration' },
    { key: 'reporting', icon: '📊', label: 'Reporting' },
]

const emptyEtab = { name: '', code: '', description: '', city: '', email: '', phone: '', address: '', website: '' }
const emptyAdmin = { name: '', email: '', password: '', role: 'establishment_admin', establishment_id: '' }
const emptyFormation = { title: '', description: '', duration_hours: '', capacity: '', price: '', establishment_id: '' }
const emptyConfig = { key: '', value: '', description: '', type: 'string' }

export default function DashboardSuperAdmin() {
    const [tab, setTab] = useState('etablissements')
    const toast = useToast()

    // ── State ──
    const [etablissements, setEtablissements] = useState([])
    const [loadingEtab, setLoadingEtab] = useState(true)
    const [showEtabModal, setShowEtabModal] = useState(false)
    const [editEtab, setEditEtab] = useState(null)
    const [etabForm, setEtabForm] = useState({ ...emptyEtab })

    const [formations, setFormations] = useState([])
    const [loadingFormations, setLoadingFormations] = useState(true)
    const [showFormationModal, setShowFormationModal] = useState(false)
    const [editFormation, setEditFormation] = useState(null)
    const [formationForm, setFormationForm] = useState({ ...emptyFormation })

    const [users, setUsers] = useState([])
    const [loadingUsers, setLoadingUsers] = useState(true)
    const [showUserModal, setShowUserModal] = useState(false)
    const [editUser, setEditUser] = useState(null)
    const [userForm, setUserForm] = useState({ ...emptyAdmin })
    const [userFilter, setUserFilter] = useState('all')

    const [candidatures, setCandidatures] = useState([])
    const [loadingCandidatures, setLoadingCandidatures] = useState(true)
    const [candidatureFilter, setCandidatureFilter] = useState('all')
    const [expandedCandidature, setExpandedCandidature] = useState(null)
    const [candidatureDocuments, setCandidatureDocuments] = useState([])
    const [loadingDocs, setLoadingDocs] = useState(false)

    const [configs, setConfigs] = useState([])
    const [loadingConfig, setLoadingConfig] = useState(true)
    const [showConfigModal, setShowConfigModal] = useState(false)
    const [editConfig, setEditConfig] = useState(null)
    const [configForm, setConfigForm] = useState({ ...emptyConfig })

    const [report, setReport] = useState(null)
    const [loadingReport, setLoadingReport] = useState(true)

    const [search, setSearch] = useState('')

    // ── Loaders ──
    const loadEtablissements = () => { loadEtablissementsAsync() }
    const loadEtablissementsAsync = async () => {
        setLoadingEtab(true)
        try { const d = await institutionApi.getEstablishments(); setEtablissements(d.data || d || []) }
        catch { setEtablissements([]) }
        finally { setLoadingEtab(false) }
    }
    const loadFormations = () => { loadFormationsAsync() }
    const loadFormationsAsync = async () => {
        setLoadingFormations(true)
        try { const d = await institutionApi.getFormations(); setFormations(d.data || d || []) }
        catch { setFormations([]) }
        finally { setLoadingFormations(false) }
    }
    const loadUsers = () => {
        setLoadingUsers(true)
        userApi.getUsers()
            .then(d => setUsers(d.data || d || []))
            .catch(() => setUsers([]))
            .finally(() => setLoadingUsers(false))
    }
    const loadCandidatures = () => {
        setLoadingCandidatures(true)
        applicationApi.getInscriptions()
            .then(d => setCandidatures(d.data || d || []))
            .catch(() => setCandidatures([]))
            .finally(() => setLoadingCandidatures(false))
    }
    const loadConfigs = () => {
        setLoadingConfig(true)
        configApi.getConfigurations()
            .then(d => { const l = d.configurations || d.data || d || []; setConfigs(Array.isArray(l) ? l : []) })
            .catch(() => setConfigs([]))
            .finally(() => setLoadingConfig(false))
    }
    const loadReport = () => {
        setLoadingReport(true)
        reportingApi.getGlobalReport()
            .then(d => setReport(d.data || d))
            .catch(() => setReport(null))
            .finally(() => setLoadingReport(false))
    }

    useEffect(() => {
        // Load auth-service-direct calls first (no cross-service token validation)
        loadUsers(); loadConfigs(); loadCandidatures(); loadReport()
        // Institution-service calls must be serialized: each one triggers a
        // token-validation call to auth-service; doing them in parallel causes 503s
        const loadInstitutionData = async () => {
            await new Promise(r => setTimeout(r, 300))
            await loadEtablissementsAsync()
            await loadFormationsAsync()
        }
        loadInstitutionData()
    }, [])

    // ── Helpers ──
    const etabName = (id) => etablissements.find(e => e.id === Number(id))?.name || `#${id}`
    const q = search.toLowerCase().trim()
    const matchSearch = (...fields) => !q || fields.some(f => f && String(f).toLowerCase().includes(q))
    const filteredUsers = (userFilter === 'all' ? users : users.filter(u => u.role === userFilter)).filter(u => matchSearch(u.name, u.email, u.role))
    const filteredEtabs = etablissements.filter(e => matchSearch(e.name, e.code, e.city, e.email))
    const filteredFormations = formations.filter(f => matchSearch(f.title, f.titre, etabName(f.establishment_id), f.status))
    const filteredCandidatures = (candidatureFilter === 'all' ? candidatures : candidatures.filter(c => c.etat === candidatureFilter)).filter(c => matchSearch(c.nom_complet, c.email, c.telephone))
    const filteredConfigs = configs.filter(c => matchSearch(c.key, c.description, typeof c.value === 'string' ? c.value : ''))

    // ── Establishment CRUD ──
    const openEtabCreate = () => { setEditEtab(null); setEtabForm({ ...emptyEtab }); setShowEtabModal(true) }
    const openEtabEdit = (e) => { setEditEtab(e); setEtabForm({ name: e.name||'', code: e.code||'', description: e.description||'', city: e.city||'', email: e.email||'', phone: e.phone||'', address: e.address||'', website: e.website||'' }); setShowEtabModal(true) }
    const handleEtabSubmit = async (ev) => {
        ev.preventDefault()
        try {
            if (editEtab) { await institutionApi.updateEstablishment(editEtab.id, etabForm); toast.success('Établissement mis à jour !') }
            else { await institutionApi.createEstablishment(etabForm); toast.success('Établissement créé !') }
            setShowEtabModal(false); loadEtablissements()
        } catch (err) { toast.error(err.message || 'Erreur') }
    }
    const handleDeleteEtab = async (id) => {
        if (!confirm('Supprimer cet établissement ?')) return
        try { await institutionApi.deleteEstablishment(id); toast.success('Supprimé.'); loadEtablissements() }
        catch { toast.error('Erreur lors de la suppression.') }
    }

    // ── Formation CRUD ──
    const openFormationCreate = () => { setEditFormation(null); setFormationForm({ ...emptyFormation }); setShowFormationModal(true) }
    const openFormationEdit = (f) => { setEditFormation(f); setFormationForm({ title: f.title||'', description: f.description||'', duration_hours: f.duration_hours||'', capacity: f.capacity||'', price: f.price||'', establishment_id: f.establishment_id||'' }); setShowFormationModal(true) }
    const handleFormationSubmit = async (ev) => {
        ev.preventDefault()
        const payload = { ...formationForm, duration_hours: Number(formationForm.duration_hours), capacity: Number(formationForm.capacity), price: Number(formationForm.price), establishment_id: Number(formationForm.establishment_id) }
        try {
            if (editFormation) { await institutionApi.updateFormation(editFormation.id, payload); toast.success('Formation mise à jour !') }
            else { await institutionApi.createFormation(payload); toast.success('Formation créée !') }
            setShowFormationModal(false); loadFormations()
        } catch (err) { toast.error(err.message || 'Erreur') }
    }
    const handleDeleteFormation = async (id) => {
        if (!confirm('Supprimer cette formation ?')) return
        try { await institutionApi.deleteFormation(id); toast.success('Supprimée.'); loadFormations() }
        catch { toast.error('Erreur lors de la suppression.') }
    }
    const handleToggleFormation = async (f) => {
        try {
            if (f.status === 'published') { await institutionApi.archiveFormation(f.id); toast.success('Archivée.') }
            else { await institutionApi.publishFormation(f.id); toast.success('Publiée.') }
            loadFormations()
        } catch (err) { toast.error(err.message || 'Erreur') }
    }

    // ── User CRUD ──
    const openUserCreate = () => { setEditUser(null); setUserForm({ ...emptyAdmin }); setShowUserModal(true) }
    const openUserEdit = (u) => { setEditUser(u); setUserForm({ name: u.name||'', email: u.email||'', password: '', role: u.role||'candidate', establishment_id: u.establishment_id||'' }); setShowUserModal(true) }
    const handleUserSubmit = async (ev) => {
        ev.preventDefault()
        const payload = { ...userForm }
        if (!payload.password) delete payload.password
        if (payload.establishment_id) payload.establishment_id = Number(payload.establishment_id)
        else delete payload.establishment_id
        try {
            if (editUser) { await userApi.updateUser(editUser.id, payload); toast.success('Utilisateur mis à jour !') }
            else { await userApi.createUser(payload); toast.success('Utilisateur créé !') }
            setShowUserModal(false); loadUsers()
        } catch (err) { toast.error(err.message || 'Erreur') }
    }
    const handleDeleteUser = async (id) => {
        if (!confirm('Désactiver cet utilisateur ?')) return
        try { await userApi.deleteUser(id); toast.success('Désactivé.'); loadUsers() }
        catch { toast.error('Erreur.') }
    }
    const handleMakeCandidate = async (u) => {
        if (!confirm(`Convertir "${u.name}" en candidat ? Il perdra ses privilèges administratifs.`)) return
        try { await userApi.updateUser(u.id, { role: 'candidate', establishment_id: null }); toast.success(`${u.name} est maintenant candidat.`); loadUsers() }
        catch { toast.error('Erreur lors de la conversion.') }
    }

    // ── Config CRUD ──
    const openConfigCreate = () => { setEditConfig(null); setConfigForm({ ...emptyConfig }); setShowConfigModal(true) }
    const openConfigEdit = (c) => { setEditConfig(c); setConfigForm({ key: c.key||'', value: typeof c.value === 'object' ? JSON.stringify(c.value) : String(c.value||''), description: c.description||'', type: c.type||'string' }); setShowConfigModal(true) }
    const handleConfigSubmit = async (ev) => {
        ev.preventDefault()
        let val = configForm.value
        if (configForm.type === 'integer') val = Number(val)
        else if (configForm.type === 'array' || configForm.type === 'json') { try { val = JSON.parse(val) } catch { toast.error('JSON invalide'); return } }
        else if (configForm.type === 'boolean') val = val === 'true' || val === '1'
        const payload = { ...configForm, value: val }
        try {
            if (editConfig) { await configApi.updateConfiguration(editConfig.key, payload); toast.success('Configuration mise à jour !') }
            else { await configApi.createConfiguration(payload); toast.success('Configuration créée !') }
            setShowConfigModal(false); loadConfigs()
        } catch (err) { toast.error(err.message || 'Erreur') }
    }
    const handleDeleteConfig = async (key) => {
        if (!confirm('Supprimer cette configuration ?')) return
        try { await configApi.deleteConfiguration(key); toast.success('Supprimée.'); loadConfigs() }
        catch { toast.error('Erreur.') }
    }

    // ── Candidature actions ──
    const handleTransition = async (c, newEtat) => {
        if (!confirm(`Changer l'état de la candidature #${c.id} vers "${newEtat}" ?`)) return
        try { await applicationApi.transition(c.id, newEtat, 'super_admin'); toast.success('État mis à jour !'); loadCandidatures() }
        catch (err) { toast.error(err.message || 'Erreur lors de la transition.') }
    }
    const toggleCandidatureDetail = async (c) => {
        if (expandedCandidature === c.id) { setExpandedCandidature(null); return }
        setExpandedCandidature(c.id)
        setLoadingDocs(true)
        setCandidatureDocuments([])
        try {
            const docsRes = await documentApi.getDocuments()
            const allDocs = docsRes?.data || docsRes || []
            const filtered = Array.isArray(allDocs) ? allDocs.filter(d => String(d.inscription_id) === String(c.id)) : []
            setCandidatureDocuments(filtered)
        } catch { setCandidatureDocuments([]) }
        finally { setLoadingDocs(false) }
    }
    const handleDownloadDoc = async (doc) => {
        try {
            const res = await documentApi.downloadDocument(doc.id)
            if (res?.blob) {
                const url = URL.createObjectURL(res.blob)
                const a = document.createElement('a')
                a.href = url
                a.download = res.filename || doc.nom_fichier || 'document'
                document.body.appendChild(a)
                a.click()
                a.remove()
                URL.revokeObjectURL(url)
            } else {
                toast.error('Fichier non disponible.')
            }
        } catch { toast.error('Erreur lors du téléchargement.') }
    }

    // ── Status config ──
    const etatConfig = {
        PREINSCRIPTION: { label: 'Pré-inscription', color: 'gray' },
        DOSSIER_SOUMIS: { label: 'Dossier soumis', color: 'blue' },
        EN_VALIDATION: { label: 'En validation', color: 'yellow' },
        ACCEPTE: { label: 'Accepté', color: 'green' },
        REFUSE: { label: 'Refusé', color: 'red' },
        INSCRIT: { label: 'Inscrit', color: 'green' },
    }

    return (
        <div className="animate-fade-in bg-slate-50 min-h-screen pb-12">
            <PageHeader title="Super Administration" subtitle="Contrôle total — Établissements, formations, utilisateurs, candidatures et configuration" />

            <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
                    <Sidebar title="Super Admin" items={sidebarItems} active={tab} onSelect={t => { setTab(t); setSearch('') }} />

                    <main className="bg-white p-6 md:p-8 rounded-2xl shadow-sm min-h-[600px] border border-slate-200">

                        {/* ════════════════ ÉTABLISSEMENTS ════════════════ */}
                        {tab === 'etablissements' && (
                            <div className="animate-fade-in">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-brand-900">Gestion des Établissements</h2>
                                    <Button size="sm" onClick={openEtabCreate}>+ Nouvel établissement</Button>
                                </div>
                                <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un établissement…" />
                                {loadingEtab ? <Loader /> : filteredEtabs.length === 0 ? <Empty text="Aucun établissement trouvé." /> : (
                                    <Table columns={['Établissement', 'Code', 'Ville', 'Email', 'Statut', 'Actions']}>
                                        {filteredEtabs.map(e => (
                                            <TableRow key={e.id}>
                                                <TableCell bold>{e.name}</TableCell>
                                                <TableCell><span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{e.code}</span></TableCell>
                                                <TableCell>{e.city || '—'}</TableCell>
                                                <TableCell>{e.email || '—'}</TableCell>
                                                <TableCell><Badge color={e.is_active !== false ? 'green' : 'gray'}>{e.is_active !== false ? 'Actif' : 'Inactif'}</Badge></TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => openEtabEdit(e)}>✏️</Button>
                                                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteEtab(e.id)}>🗑️</Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </Table>
                                )}
                                {showEtabModal && (
                                    <Modal isOpen onClose={() => setShowEtabModal(false)} title={editEtab ? '✏️ Modifier l\'établissement' : '➕ Nouvel établissement'}>
                                        <form onSubmit={handleEtabSubmit} className="space-y-4">
                                            <Input label="Nom *" value={etabForm.name} onChange={e => setEtabForm(p => ({ ...p, name: e.target.value }))} required />
                                            <Input label="Code *" value={etabForm.code} onChange={e => setEtabForm(p => ({ ...p, code: e.target.value }))} required />
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input label="Ville" value={etabForm.city} onChange={e => setEtabForm(p => ({ ...p, city: e.target.value }))} />
                                                <Input label="Téléphone" value={etabForm.phone} onChange={e => setEtabForm(p => ({ ...p, phone: e.target.value }))} />
                                            </div>
                                            <Input label="Email" type="email" value={etabForm.email} onChange={e => setEtabForm(p => ({ ...p, email: e.target.value }))} />
                                            <Input label="Adresse" value={etabForm.address} onChange={e => setEtabForm(p => ({ ...p, address: e.target.value }))} />
                                            <Input label="Site web" value={etabForm.website} onChange={e => setEtabForm(p => ({ ...p, website: e.target.value }))} />
                                            <Input label="Description" value={etabForm.description} onChange={e => setEtabForm(p => ({ ...p, description: e.target.value }))} />
                                            <Button type="submit" full>{editEtab ? 'Mettre à jour' : 'Créer'}</Button>
                                        </form>
                                    </Modal>
                                )}
                            </div>
                        )}

                        {/* ════════════════ FORMATIONS ════════════════ */}
                        {tab === 'formations' && (
                            <div className="animate-fade-in">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-brand-900">Gestion des Formations</h2>
                                    <Button size="sm" onClick={openFormationCreate}>+ Nouvelle formation</Button>
                                </div>
                                <SearchBar value={search} onChange={setSearch} placeholder="Rechercher une formation…" />
                                {loadingFormations ? <Loader /> : filteredFormations.length === 0 ? <Empty text="Aucune formation trouvée." /> : (
                                    <Table columns={['Formation', 'Établissement', 'Durée', 'Places', 'Prix', 'Statut', 'Actions']}>
                                        {filteredFormations.map(f => (
                                            <TableRow key={f.id}>
                                                <TableCell bold>{f.title || f.titre}</TableCell>
                                                <TableCell><span className="text-xs">{etabName(f.establishment_id)}</span></TableCell>
                                                <TableCell>{f.duration_hours}h</TableCell>
                                                <TableCell>{f.capacity}</TableCell>
                                                <TableCell>{Number(f.price).toLocaleString('fr-FR')} MAD</TableCell>
                                                <TableCell>
                                                    <Badge color={f.status === 'published' ? 'green' : f.status === 'archived' ? 'gray' : 'yellow'}>
                                                        {f.status === 'published' ? 'Publiée' : f.status === 'archived' ? 'Archivée' : 'Brouillon'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <Button variant="outline" size="sm" onClick={() => openFormationEdit(f)}>✏️</Button>
                                                        <Button variant="outline" size="sm" onClick={() => handleToggleFormation(f)} title={f.status === 'published' ? 'Archiver' : 'Publier'}>{f.status === 'published' ? '📦' : '🚀'}</Button>
                                                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteFormation(f.id)}>🗑️</Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </Table>
                                )}
                                {showFormationModal && (
                                    <Modal isOpen onClose={() => setShowFormationModal(false)} title={editFormation ? '✏️ Modifier la formation' : '➕ Nouvelle formation'}>
                                        <form onSubmit={handleFormationSubmit} className="space-y-4">
                                            <Input label="Titre *" value={formationForm.title} onChange={e => setFormationForm(p => ({ ...p, title: e.target.value }))} required />
                                            <Input label="Description" value={formationForm.description} onChange={e => setFormationForm(p => ({ ...p, description: e.target.value }))} />
                                            <div className="space-y-1.5">
                                                <label className="block text-sm font-semibold text-slate-700">Établissement *</label>
                                                <select value={formationForm.establishment_id} onChange={e => setFormationForm(p => ({ ...p, establishment_id: e.target.value }))} className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white" required>
                                                    <option value="">— Sélectionner —</option>
                                                    {etablissements.map(et => <option key={et.id} value={et.id}>{et.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <Input label="Durée (h) *" type="number" value={formationForm.duration_hours} onChange={e => setFormationForm(p => ({ ...p, duration_hours: e.target.value }))} required />
                                                <Input label="Places *" type="number" value={formationForm.capacity} onChange={e => setFormationForm(p => ({ ...p, capacity: e.target.value }))} required />
                                                <Input label="Prix (MAD)" type="number" value={formationForm.price} onChange={e => setFormationForm(p => ({ ...p, price: e.target.value }))} />
                                            </div>
                                            <Button type="submit" full>{editFormation ? 'Mettre à jour' : 'Créer'}</Button>
                                        </form>
                                    </Modal>
                                )}
                            </div>
                        )}

                        {/* ════════════════ UTILISATEURS ════════════════ */}
                        {tab === 'admins' && (
                            <div className="animate-fade-in">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-brand-900">Gestion des Utilisateurs</h2>
                                    <Button size="sm" onClick={openUserCreate}>+ Nouvel utilisateur</Button>
                                </div>
                                {/* Role filter */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {[{ v: 'all', l: `Tous (${users.length})` }, ...roleOptions.map(r => ({ v: r.value, l: `${r.label} (${users.filter(u => u.role === r.value).length})` }))].map(f => (
                                        <button key={f.v} onClick={() => setUserFilter(f.v)} className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all ${userFilter === f.v ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'}`}>{f.l}</button>
                                    ))}
                                </div>
                                <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un utilisateur…" />
                                {loadingUsers ? <Loader /> : filteredUsers.length === 0 ? <Empty text="Aucun utilisateur trouvé." /> : (
                                    <Table columns={['Nom', 'Email', 'Rôle', 'Établissement', 'Statut', 'Créé le', 'Actions']}>
                                        {filteredUsers.map(u => {
                                            const rc = roleConfig[u.role] || { label: u.role, color: 'gray' }
                                            return (
                                                <TableRow key={u.id}>
                                                    <TableCell bold>{u.name}</TableCell>
                                                    <TableCell>{u.email}</TableCell>
                                                    <TableCell><Badge color={rc.color}>{rc.label}</Badge></TableCell>
                                                    <TableCell><span className="text-xs">{u.establishment_id ? etabName(u.establishment_id) : '—'}</span></TableCell>
                                                    <TableCell><Badge color={u.is_active !== false ? 'green' : 'gray'}>{u.is_active !== false ? 'Actif' : 'Inactif'}</Badge></TableCell>
                                                    <TableCell><span className="text-xs">{u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : '—'}</span></TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-1">
                                                            <Button variant="outline" size="sm" onClick={() => openUserEdit(u)}>✏️</Button>
                                                            {u.role !== 'candidate' && <Button variant="outline" size="sm" className="text-amber-600 hover:bg-amber-50" onClick={() => handleMakeCandidate(u)} title="Convertir en candidat">👤</Button>}
                                                            <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteUser(u.id)}>🗑️</Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </Table>
                                )}
                                {showUserModal && (
                                    <Modal isOpen onClose={() => setShowUserModal(false)} title={editUser ? '✏️ Modifier l\'utilisateur' : '➕ Nouvel utilisateur'}>
                                        <form onSubmit={handleUserSubmit} className="space-y-4">
                                            <Input label="Nom complet *" value={userForm.name} onChange={e => setUserForm(p => ({ ...p, name: e.target.value }))} required />
                                            <Input label="Email *" type="email" value={userForm.email} onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))} required />
                                            <Input label={editUser ? 'Nouveau mot de passe (laisser vide pour garder)' : 'Mot de passe *'} type="password" value={userForm.password} onChange={e => setUserForm(p => ({ ...p, password: e.target.value }))} required={!editUser} />
                                            <div className="space-y-1.5">
                                                <label className="block text-sm font-semibold text-slate-700">Rôle *</label>
                                                <select value={userForm.role} onChange={e => setUserForm(p => ({ ...p, role: e.target.value }))} className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white">
                                                    {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                                </select>
                                            </div>
                                            {(userForm.role === 'establishment_admin' || userForm.role === 'coordinator') && etablissements.length > 0 && (
                                                <div className="space-y-1.5">
                                                    <label className="block text-sm font-semibold text-slate-700">Établissement</label>
                                                    <select value={userForm.establishment_id} onChange={e => setUserForm(p => ({ ...p, establishment_id: e.target.value }))} className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white">
                                                        <option value="">— Aucun —</option>
                                                        {etablissements.map(et => <option key={et.id} value={et.id}>{et.name}</option>)}
                                                    </select>
                                                </div>
                                            )}
                                            <Button type="submit" full>{editUser ? 'Mettre à jour' : 'Créer'}</Button>
                                        </form>
                                    </Modal>
                                )}
                            </div>
                        )}

                        {/* ════════════════ CANDIDATURES ════════════════ */}
                        {tab === 'candidatures' && (
                            <div className="animate-fade-in">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-brand-900">Toutes les Candidatures</h2>
                                    <Badge color="brand">{candidatures.length} candidature(s)</Badge>
                                </div>
                                {/* Status filter */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {[{ v: 'all', l: `Toutes (${candidatures.length})` }, ...Object.entries(etatConfig).map(([k, v]) => ({ v: k, l: `${v.label} (${candidatures.filter(c => c.etat === k).length})` }))].map(f => (
                                        <button key={f.v} onClick={() => setCandidatureFilter(f.v)} className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all ${candidatureFilter === f.v ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'}`}>{f.l}</button>
                                    ))}
                                </div>
                                <SearchBar value={search} onChange={setSearch} placeholder="Rechercher une candidature…" />
                                {loadingCandidatures ? <Loader /> : filteredCandidatures.length === 0 ? <Empty text="Aucune candidature trouvée." /> : (
                                    <Table columns={['ID', 'Candidat', 'Formation', 'État', 'Date', 'Email', 'Actions']}>
                                        {filteredCandidatures.map(c => {
                                            const ec = etatConfig[c.etat] || { label: c.etat, color: 'gray' }
                                            return (
                                                <React.Fragment key={c.id}>
                                                <TableRow>
                                                    <TableCell><span className="font-mono text-xs">#{c.id}</span></TableCell>
                                                    <TableCell bold>{c.nom_complet || '—'}</TableCell>
                                                    <TableCell><span className="text-xs">{formations.find(f => f.id === c.formation_id)?.title || `#${c.formation_id}`}</span></TableCell>
                                                    <TableCell><Badge color={ec.color}>{ec.label}</Badge></TableCell>
                                                    <TableCell><span className="text-xs">{c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR') : '—'}</span></TableCell>
                                                    <TableCell>{c.email || '—'}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <Button variant="outline" size="sm" onClick={() => toggleCandidatureDetail(c)} title="Voir détails">{expandedCandidature === c.id ? '▲' : '👁️'}</Button>
                                                            <select
                                                                value=""
                                                                onChange={e => { if (e.target.value) handleTransition(c, e.target.value) }}
                                                                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white cursor-pointer hover:border-brand-300 transition-colors"
                                                            >
                                                                <option value="">Changer état…</option>
                                                                {Object.entries(etatConfig).filter(([k]) => k !== c.etat).map(([k, v]) => (
                                                                    <option key={k} value={k}>{v.label}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                                {expandedCandidature === c.id && (
                                                    <tr>
                                                        <td colSpan="7" className="px-6 py-5 bg-slate-50 border-b border-slate-100">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                {/* Candidat info */}
                                                                <div>
                                                                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">👤 Informations du candidat</h4>
                                                                    <div className="space-y-2 text-sm">
                                                                        <div className="flex justify-between"><span className="text-slate-500">Nom complet</span><span className="font-semibold">{c.nom_complet || '—'}</span></div>
                                                                        <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="font-semibold">{c.email || '—'}</span></div>
                                                                        <div className="flex justify-between"><span className="text-slate-500">Téléphone</span><span className="font-semibold">{c.telephone || '—'}</span></div>
                                                                        <div className="flex justify-between"><span className="text-slate-500">Formation</span><span className="font-semibold">{formations.find(f => f.id === c.formation_id)?.title || `#${c.formation_id}`}</span></div>
                                                                        <div className="flex justify-between"><span className="text-slate-500">État</span><Badge color={(etatConfig[c.etat] || {}).color || 'gray'}>{(etatConfig[c.etat] || {}).label || c.etat}</Badge></div>
                                                                        <div className="flex justify-between"><span className="text-slate-500">Candidat ID</span><span className="font-mono text-xs">{c.candidat_id || '—'}</span></div>
                                                                        <div className="flex justify-between"><span className="text-slate-500">Créé le</span><span>{c.created_at ? new Date(c.created_at).toLocaleString('fr-FR') : '—'}</span></div>
                                                                        {c.notes && <div><span className="text-slate-500 block">Notes</span><p className="text-slate-700 mt-1 text-xs bg-white p-2 rounded border">{c.notes}</p></div>}
                                                                    </div>
                                                                </div>
                                                                {/* Documents */}
                                                                <div>
                                                                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">📁 Documents ({candidatureDocuments.length})</h4>
                                                                    {loadingDocs ? <p className="text-xs text-slate-400">Chargement des documents…</p> : candidatureDocuments.length === 0 ? (
                                                                        <p className="text-xs text-slate-400 bg-white rounded-lg border border-dashed border-slate-200 p-4 text-center">Aucun document soumis</p>
                                                                    ) : (
                                                                        <div className="space-y-2">
                                                                            {candidatureDocuments.map(doc => (
                                                                                <div key={doc.id} className="flex items-center justify-between bg-white rounded-lg border border-slate-200 p-3 hover:border-brand-300 transition-colors">
                                                                                    <div className="flex items-center gap-3 min-w-0">
                                                                                        <span className="text-xl">{doc.type_document === 'cv' || doc.type_document === 'CV' ? '📄' : doc.type_document === 'diplom' || doc.type_document === 'Diplôme' ? '🎓' : doc.type_document === 'photo' || doc.type_document === 'Photo' ? '📷' : '📎'}</span>
                                                                                        <div className="min-w-0">
                                                                                            <p className="text-sm font-semibold text-slate-700 truncate">{doc.nom_fichier || doc.filename || doc.type_document}</p>
                                                                                            <p className="text-xs text-slate-400">{doc.type_document}{doc.taille ? ` — ${(doc.taille / 1024).toFixed(0)} KB` : ''}{doc.size ? ` — ${(doc.size / 1024).toFixed(0)} KB` : ''}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <Button variant="outline" size="sm" onClick={() => handleDownloadDoc(doc)}>⬇️</Button>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                                </React.Fragment>
                                            )
                                        })}
                                    </Table>
                                )}
                            </div>
                        )}

                        {/* ════════════════ CONFIGURATION ════════════════ */}
                        {tab === 'config' && (
                            <div className="animate-fade-in">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-bold text-brand-900">Configurations Globales</h2>
                                    <Button size="sm" onClick={openConfigCreate}>+ Nouvelle config</Button>
                                </div>
                                <SearchBar value={search} onChange={setSearch} placeholder="Rechercher une configuration…" />
                                {loadingConfig ? <Loader /> : filteredConfigs.length === 0 ? <Empty text="Aucune configuration trouvée." /> : (
                                    <div className="space-y-3">
                                        {filteredConfigs.map(c => (
                                            <div key={c.key || c.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-800">{c.key}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{c.description || '—'}</p>
                                                    <p className="text-sm text-brand-700 font-mono mt-1 truncate">{typeof c.value === 'object' ? JSON.stringify(c.value) : String(c.value)}</p>
                                                </div>
                                                <Badge color="blue">{c.type || 'string'}</Badge>
                                                <div className="flex gap-2 shrink-0">
                                                    <Button variant="outline" size="sm" onClick={() => openConfigEdit(c)}>✏️</Button>
                                                    <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteConfig(c.key)}>🗑️</Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {showConfigModal && (
                                    <Modal isOpen onClose={() => setShowConfigModal(false)} title={editConfig ? '✏️ Modifier la configuration' : '➕ Nouvelle configuration'}>
                                        <form onSubmit={handleConfigSubmit} className="space-y-4">
                                            <Input label="Clé *" value={configForm.key} onChange={e => setConfigForm(p => ({ ...p, key: e.target.value }))} required disabled={!!editConfig} />
                                            <Input label="Valeur *" value={configForm.value} onChange={e => setConfigForm(p => ({ ...p, value: e.target.value }))} required />
                                            <Input label="Description" value={configForm.description} onChange={e => setConfigForm(p => ({ ...p, description: e.target.value }))} />
                                            <div className="space-y-1.5">
                                                <label className="block text-sm font-semibold text-slate-700">Type</label>
                                                <select value={configForm.type} onChange={e => setConfigForm(p => ({ ...p, type: e.target.value }))} className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white">
                                                    <option value="string">String</option>
                                                    <option value="integer">Integer</option>
                                                    <option value="boolean">Boolean</option>
                                                    <option value="array">Array (JSON)</option>
                                                    <option value="json">JSON</option>
                                                </select>
                                            </div>
                                            <Button type="submit" full>{editConfig ? 'Mettre à jour' : 'Créer'}</Button>
                                        </form>
                                    </Modal>
                                )}
                            </div>
                        )}

                        {/* ════════════════ REPORTING ════════════════ */}
                        {tab === 'reporting' && (
                            <div className="animate-fade-in">
                                <h2 className="text-2xl font-bold text-brand-900 mb-8">Reporting Global</h2>
                                {loadingReport ? <Loader /> : (
                                    <>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
                                            <StatCard value={String(etablissements.length)} label="Établissements" color="brand" />
                                            <StatCard value={String(formations.length)} label="Formations" color="accent" />
                                            <StatCard value={String(users.filter(u => u.role === 'candidate').length)} label="Candidats" color="blue" />
                                            <StatCard value={String(candidatures.length)} label="Candidatures" color="amber" />
                                            <StatCard value={String(users.filter(u => u.role !== 'candidate').length)} label="Administrateurs" color="green" />
                                        </div>

                                        {/* Breakdown by establishment */}
                                        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Par Établissement</h3>
                                        <Table columns={['Établissement', 'Ville', 'Formations', 'Statut']}>
                                            {etablissements.map(e => (
                                                <TableRow key={e.id}>
                                                    <TableCell bold>{e.name}</TableCell>
                                                    <TableCell>{e.city || '—'}</TableCell>
                                                    <TableCell><Badge color="blue">{formations.filter(f => f.establishment_id === e.id).length}</Badge></TableCell>
                                                    <TableCell><Badge color={e.is_active ? 'green' : 'gray'}>{e.is_active ? 'Actif' : 'Inactif'}</Badge></TableCell>
                                                </TableRow>
                                            ))}
                                        </Table>

                                        {report?.users && (
                                            <div className="mt-8">
                                                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Statistiques Utilisateurs</h3>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                    <StatCard value={String(report.users.total || 0)} label="Total utilisateurs" color="brand" />
                                                    <StatCard value={String(report.users.active || 0)} label="Actifs" color="green" />
                                                    <StatCard value={String(report.users.new_this_month || 0)} label="Nouveaux ce mois" color="accent" />
                                                    <StatCard value={String(report.users.by_role?.candidate || 0)} label="Candidats inscrits" color="blue" />
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    )
}

function Loader() { return <div className="text-center py-12 text-slate-400">Chargement...</div> }
function Empty({ text }) { return <p className="text-slate-400 text-center py-12">{text}</p> }
function SearchBar({ value, onChange, placeholder }) {
    return (
        <div className="relative mb-6">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder || 'Rechercher…'}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
            />
            {value && <button onClick={() => onChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm">✕</button>}
        </div>
    )
}
