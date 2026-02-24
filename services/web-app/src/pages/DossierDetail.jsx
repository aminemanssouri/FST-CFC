import { useParams, Link } from 'react-router-dom'
import { useToast } from '../components/ui/Toast'
import { PageHeader, Badge, Button, Card } from '../components/ui'

const dossiers = {
    101: {
        candidat: { nom: 'Amine El Fadili', email: 'amine@email.ma', telephone: '+212 612-345678', diplome: 'Licence en Mathématiques', annee: 2024 },
        formation: 'Licence en Informatique et Numérique',
        etablissement: 'FST Béni Mellal',
        date: '2026-02-18',
        etat: 'DOSSIER_SOUMIS',
        documents: [
            { nom: 'CV_Amine_ElFadili.pdf', type: 'CV', taille: '245 KB', date: '2026-02-18' },
            { nom: 'Diplome_Licence_Math.pdf', type: 'Diplôme', taille: '1.2 MB', date: '2026-02-18' },
            { nom: 'Photo_Identite.jpg', type: 'Photo', taille: '320 KB', date: '2026-02-18' },
        ],
        historique: [
            { date: '2026-02-18 14:30', action: 'Dossier soumis', par: 'Amine El Fadili' },
            { date: '2026-02-18 14:28', action: 'Documents uploadés (3 fichiers)', par: 'Amine El Fadili' },
            { date: '2026-02-18 14:20', action: 'Pré-inscription créée', par: 'Système' },
        ],
    },
    102: {
        candidat: { nom: 'Sara Benali', email: 'sara@email.ma', telephone: '+212 698-765432', diplome: 'Licence en Informatique', annee: 2025 },
        formation: 'Master en Data Science',
        etablissement: 'FST Béni Mellal',
        date: '2026-02-17',
        etat: 'EN_VALIDATION',
        documents: [
            { nom: 'CV_Sara_Benali.pdf', type: 'CV', taille: '198 KB', date: '2026-02-17' },
            { nom: 'Diplome_Licence_Info.pdf', type: 'Diplôme', taille: '980 KB', date: '2026-02-17' },
            { nom: 'Photo_Sara.jpg', type: 'Photo', taille: '280 KB', date: '2026-02-17' },
        ],
        historique: [
            { date: '2026-02-18 09:00', action: 'Examen en cours', par: 'Dr. Mansouri' },
            { date: '2026-02-17 16:45', action: 'Dossier soumis', par: 'Sara Benali' },
            { date: '2026-02-17 16:40', action: 'Documents uploadés (3 fichiers)', par: 'Sara Benali' },
            { date: '2026-02-17 16:30', action: 'Pré-inscription créée', par: 'Système' },
        ],
    },
}

const etatConfig = {
    DOSSIER_SOUMIS: { label: 'Dossier soumis', color: 'indigo' },
    EN_VALIDATION: { label: 'En validation', color: 'yellow' },
    ACCEPTE: { label: 'Accepté', color: 'green' },
    REFUSE: { label: 'Refusé', color: 'red' },
}

const docIcons = { CV: '📄', Diplôme: '🎓', Photo: '📷' }

export default function DossierDetail() {
    const { id } = useParams()
    const toast = useToast()
    const d = dossiers[id]

    if (!d) {
        return (
            <div className="text-center py-24 animate-fade-in">
                <p className="text-5xl mb-4">📭</p>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Dossier introuvable</h2>
                <Link to="/admin" className="text-brand-600 font-semibold hover:underline">← Retour à l'administration</Link>
            </div>
        )
    }

    const { label, color } = etatConfig[d.etat]
    const canDecide = d.etat === 'DOSSIER_SOUMIS' || d.etat === 'EN_VALIDATION'

    const handleDecision = (decision) => {
        toast.success(`Dossier ${decision === 'accept' ? 'accepté' : 'refusé'} avec succès !`)
    }

    return (
        <div className="animate-fade-in bg-slate-50 min-h-screen pb-12">
            <PageHeader title={`Dossier #${id}`} subtitle={`${d.candidat.nom} — ${d.formation}`}>
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
                                {[
                                    ['Nom complet', d.candidat.nom],
                                    ['Email', d.candidat.email],
                                    ['Téléphone mobile', d.candidat.telephone],
                                    ['Dernier diplôme', d.candidat.diplome],
                                    ['Année d\'obtention', d.candidat.annee],
                                    ['Programme visé', d.formation],
                                ].map(([l, v], i) => (
                                    <div key={l} className="flex flex-col">
                                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest pl-1 mb-1">{l}</span>
                                        <div className="bg-slate-50 px-4 py-2.5 rounded border border-slate-200 font-medium text-slate-800">
                                            {v}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="p-8 border-slate-200">
                            <h3 className="text-xl font-bold text-brand-900 tracking-tight mb-6 pb-4 border-b border-slate-100 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-slate-100 text-amber-600 flex items-center justify-center text-lg">📎</span>
                                Pièces Justificatives ({d.documents.length})
                            </h3>
                            <div className="space-y-3">
                                {d.documents.map((doc, i) => (
                                    <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white transition-all duration-300">
                                        <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl border border-slate-200 shrink-0">
                                            {docIcons[doc.type] || '📄'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-800 truncate">{doc.nom}</p>
                                            <p className="text-xs font-medium text-slate-500 mt-0.5">Type: {doc.type} · Taille: {doc.taille} · Uploadé le {doc.date}</p>
                                        </div>
                                        <Button variant="outline" size="sm" className="bg-white shrink-0">Télécharger ↓</Button>
                                    </div>
                                ))}
                            </div>
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
                                    <Button full size="lg" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleDecision('accept')}>
                                        ✓ Accepter la candidature
                                    </Button>
                                    <Button full size="lg" variant="outline" className="text-red-700 border-red-200 hover:bg-red-50" onClick={() => handleDecision('refuse')}>
                                        ✕ Rejeter la candidature
                                    </Button>
                                </div>
                            </Card>
                        )}

                        <Card className="p-8 border-slate-200">
                            <h3 className="text-lg font-bold text-brand-900 tracking-tight mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
                                <span className="text-xl">📜</span> Historique d'Activité
                            </h3>
                            <div className="space-y-5">
                                {d.historique.map((h, i) => (
                                    <div key={i} className="relative pl-6 pb-1">
                                        {/* Vertical line connecting timeline items, except for the last one */}
                                        {i !== d.historique.length - 1 && (
                                            <div className="absolute left-[5px] top-3 bottom-[-1.25rem] w-px bg-slate-200" />
                                        )}
                                        {/* Timeline dot */}
                                        <div className="absolute left-0 top-1.5 w-[11px] h-[11px] rounded-full bg-slate-800 ring-4 ring-slate-100" />

                                        <p className="text-sm font-bold text-slate-800">{h.action}</p>
                                        <p className="text-xs font-medium text-slate-500 mt-1">{h.date} · par <span className="text-brand-600">{h.par}</span></p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>

                <div className="text-center mt-12 mb-8">
                    <Link to="/admin" className="inline-flex items-center justify-center px-6 py-3 rounded text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-brand-700 transition-all">
                        ← Retourner à la liste des dossiers
                    </Link>
                </div>
            </div>
        </div>
    )
}
