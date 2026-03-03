import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'
import { PageHeader, Badge, Button, Card } from '../components/ui'
import { applicationApi, documentApi } from '../api'

const etatConfig = {
    PREINSCRIPTION: { label: 'Pré-inscription', color: 'gray' },
    DOSSIER_SOUMIS: { label: 'Dossier soumis', color: 'indigo' },
    EN_VALIDATION:  { label: 'En validation', color: 'yellow' },
    ACCEPTE:        { label: 'Accepté', color: 'green' },
    REFUSE:         { label: 'Refusé', color: 'red' },
    INSCRIT:        { label: 'Inscrit', color: 'green' },
}

const docIcons = { cv: '📄', diplom: '🎓', photo: '📷', CV: '📄', Diplôme: '🎓', Photo: '📷' }

function formatSize(bytes) {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DossierDetail() {
    const { id } = useParams()
    const { user, isAdmin } = useAuth()
    const toast = useToast()
    const [dossier, setDossier] = useState(null)
    const [documents, setDocuments] = useState([])
    const [loading, setLoading] = useState(true)
    const [deciding, setDeciding] = useState(false)

    const loadData = () => {
        setLoading(true)
        Promise.all([
            applicationApi.getInscription(id).catch(() => null),
            documentApi.getDocuments().catch(() => null),
        ]).then(([insRes, docsRes]) => {
            const ins = insRes?.data || insRes
            setDossier(ins)
            // Filter documents for this inscription
            const allDocs = docsRes?.data || docsRes || []
            const filtered = Array.isArray(allDocs)
                ? allDocs.filter(d => String(d.inscription_id) === String(id))
                : []
            setDocuments(filtered)
        }).finally(() => setLoading(false))
    }

    useEffect(() => { loadData() }, [id])

    const handleDecision = async (decision) => {
        setDeciding(true)
        try {
            await applicationApi.transition(id, decision, String(user?.id || user?.nom || 'Admin'))
            toast.success(decision === 'ACCEPTE' ? 'Candidature acceptée !' : 'Candidature refusée.')
            loadData()
        } catch (err) {
            toast.error(err.message || 'Erreur lors de la décision.')
        } finally {
            setDeciding(false)
        }
    }

    const handleDownload = async (doc) => {
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
        } catch {
            toast.error('Erreur lors du téléchargement.')
        }
    }

    if (loading) {
        return <div className="text-center py-24 animate-fade-in text-slate-400">Chargement...</div>
    }

    if (!dossier) {
        return (
            <div className="text-center py-24 animate-fade-in">
                <p className="text-5xl mb-4">📭</p>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Dossier introuvable</h2>
                <Link to={isAdmin ? '/admin' : '/dashboard'} className="text-brand-600 font-semibold hover:underline">← Retour</Link>
            </div>
        )
    }

    const etat = dossier.etat || 'PREINSCRIPTION'
    const { label, color } = etatConfig[etat] || { label: etat, color: 'gray' }
    const canDecide = isAdmin && (etat === 'DOSSIER_SOUMIS' || etat === 'EN_VALIDATION')
    const historique = dossier.historique || dossier.history || []
    const decisions = dossier.decisions || []
    const backLink = isAdmin ? '/admin' : '/dashboard'

    const candidatInfo = [
        ['Nom complet', dossier.nom_complet || ''],
        ['Email', dossier.email || ''],
        ['Téléphone', dossier.telephone || ''],
        ['Notes', dossier.notes || ''],
        ['Formation', dossier.formation || `Formation #${dossier.formation_id}`],
        ['Date de création', dossier.created_at ? new Date(dossier.created_at).toLocaleDateString('fr-FR') : ''],
    ]

    return (
        <div className="animate-fade-in bg-slate-50 min-h-screen pb-12">
            <PageHeader title={`Dossier #${id}`} subtitle={`${dossier.nom_complet || ''} — ${dossier.formation || `Formation #${dossier.formation_id}`}`}>
                <div className="mt-4">
                    <Badge color={color} className="px-4 py-1.5 text-sm shadow-sm">{label}</Badge>
                </div>
            </PageHeader>

            <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* Left: Candidat info + Documents */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="p-8 pb-10 border-slate-200">
                            <h3 className="text-xl font-bold text-brand-900 tracking-tight mb-6 pb-4 border-b border-slate-100 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-slate-100 text-brand-600 flex items-center justify-center text-lg">👤</span>
                                Informations du Candidat
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 text-sm">
                                {candidatInfo.map(([l, v]) => (
                                    <div key={l} className="flex flex-col">
                                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest pl-1 mb-1">{l}</span>
                                        <div className="bg-slate-50 px-4 py-2.5 rounded border border-slate-200 font-medium text-slate-800">
                                            {v || '—'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="p-8 border-slate-200">
                            <h3 className="text-xl font-bold text-brand-900 tracking-tight mb-6 pb-4 border-b border-slate-100 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-slate-100 text-amber-600 flex items-center justify-center text-lg">📎</span>
                                Pièces Justificatives ({documents.length})
                            </h3>
                            {documents.length > 0 ? (
                                <div className="space-y-3">
                                    {documents.map((doc, i) => (
                                        <div key={doc.id || i} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white transition-all duration-300">
                                            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl border border-slate-200 shrink-0">
                                                {docIcons[doc.type_document] || '📄'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800 truncate">{doc.nom_fichier || doc.filename || 'Document'}</p>
                                                <p className="text-xs font-medium text-slate-500 mt-0.5">
                                                    {doc.content_type || ''} · {formatSize(doc.size)} · {doc.created_at ? new Date(doc.created_at).toLocaleDateString('fr-FR') : ''}
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm" className="bg-white shrink-0" onClick={() => handleDownload(doc)}>
                                                Télécharger ↓
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 text-center py-6">Aucun document uploadé.</p>
                            )}
                        </Card>
                    </div>

                    {/* Right: Actions + Historique */}
                    <div className="space-y-8 lg:sticky lg:top-24">

                        {canDecide && (
                            <Card className="p-8 border-slate-200 bg-white">
                                <h3 className="text-lg font-bold text-brand-900 tracking-tight mb-6 pb-3 border-b border-slate-200 flex items-center gap-2">
                                    <span className="text-2xl">⚖️</span> Décision du Jury
                                </h3>
                                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                                    Veuillez examiner attentivement les pièces justificatives avant de prendre une décision finale.
                                </p>
                                <div className="space-y-3">
                                    <Button full size="lg" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleDecision('ACCEPTE')} disabled={deciding}>
                                        ✓ Accepter la candidature
                                    </Button>
                                    <Button full size="lg" variant="outline" className="text-red-700 border-red-200 hover:bg-red-50" onClick={() => handleDecision('REFUSE')} disabled={deciding}>
                                        ✕ Rejeter la candidature
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {/* Decisions History */}
                        {decisions.length > 0 && (
                            <Card className="p-8 border-slate-200">
                                <h3 className="text-lg font-bold text-brand-900 tracking-tight mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
                                    <span className="text-xl">⚖️</span> Décisions
                                </h3>
                                <div className="space-y-3">
                                    {decisions.map((dec, i) => (
                                        <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm">
                                            <div className="flex justify-between items-center">
                                                <Badge color={dec.etat === 'ACCEPTE' ? 'green' : dec.etat === 'REFUSE' ? 'red' : 'gray'}>{dec.etat}</Badge>
                                                <span className="text-xs text-slate-400">{dec.created_at ? new Date(dec.created_at).toLocaleString('fr-FR') : ''}</span>
                                            </div>
                                            {dec.commentaire && <p className="text-slate-600 mt-2">{dec.commentaire}</p>}
                                            {dec.decide_par && <p className="text-xs text-slate-400 mt-1">par {dec.decide_par}</p>}
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        <Card className="p-8 border-slate-200">
                            <h3 className="text-lg font-bold text-brand-900 tracking-tight mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
                                <span className="text-xl">📜</span> Historique d'Activité
                            </h3>
                            {historique.length > 0 ? (
                                <div className="space-y-5">
                                    {historique.map((h, i) => (
                                        <div key={i} className="relative pl-6 pb-1">
                                            {i !== historique.length - 1 && (
                                                <div className="absolute left-[5px] top-3 bottom-[-1.25rem] w-px bg-slate-200" />
                                            )}
                                            <div className="absolute left-0 top-1.5 w-[11px] h-[11px] rounded-full bg-slate-800 ring-4 ring-slate-100" />
                                            <p className="text-sm font-bold text-slate-800">{h.ancien_etat || ''} → {h.nouvel_etat || h.action || ''}</p>
                                            <p className="text-xs font-medium text-slate-500 mt-1">
                                                {h.created_at ? new Date(h.created_at).toLocaleString('fr-FR') : h.date || ''} · par <span className="text-brand-600">{h.modifie_par || h.par || ''}</span>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 text-center">Aucun historique disponible.</p>
                            )}
                        </Card>
                    </div>
                </div>

                <div className="text-center mt-12 mb-8">
                    <Link to={backLink} className="inline-flex items-center justify-center px-6 py-3 rounded text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-brand-700 transition-all">
                        ← Retourner à la liste
                    </Link>
                </div>
            </div>
        </div>
    )
}
