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
    DOSSIER_SOUMIS: { label: 'Dossier soumis', color: 'blue' },
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
        <div className="animate-fade-in">
            <PageHeader title={`📋 Dossier #${id}`} subtitle={`${d.candidat.nom} — ${d.formation}`}>
                <Badge color={color} className="mb-3">{label}</Badge>
            </PageHeader>

            <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Candidat info + Documents */}
                <div className="lg:col-span-2 space-y-6">
                    <Card hover={false} className="p-6">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">👤 Informations du Candidat</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            {[
                                ['Nom complet', d.candidat.nom],
                                ['Email', d.candidat.email],
                                ['Téléphone', d.candidat.telephone],
                                ['Diplôme', d.candidat.diplome],
                                ['Année', d.candidat.annee],
                                ['Formation', d.formation],
                            ].map(([l, v]) => (
                                <div key={l} className="flex flex-col">
                                    <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">{l}</span>
                                    <span className="font-semibold text-slate-700 mt-0.5">{v}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card hover={false} className="p-6">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">📎 Documents ({d.documents.length})</h3>
                        <div className="space-y-2">
                            {d.documents.map((doc, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                    <span className="text-xl">{docIcons[doc.type] || '📄'}</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-slate-700">{doc.nom}</p>
                                        <p className="text-xs text-slate-400">{doc.type} · {doc.taille} · {doc.date}</p>
                                    </div>
                                    <Button variant="outline" size="sm">Télécharger</Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Right: Actions + Historique */}
                <div className="space-y-6">
                    {canDecide && (
                        <Card hover={false} className="p-6">
                            <h3 className="font-bold text-slate-800 mb-4">⚖️ Décision</h3>
                            <div className="space-y-3">
                                <Button full variant="accent" onClick={() => handleDecision('accept')}>✅ Accepter le dossier</Button>
                                <Button full variant="danger" onClick={() => handleDecision('refuse')}>❌ Refuser le dossier</Button>
                            </div>
                        </Card>
                    )}

                    <Card hover={false} className="p-6">
                        <h3 className="font-bold text-slate-800 mb-4">📜 Historique</h3>
                        <div className="space-y-3">
                            {d.historique.map((h, i) => (
                                <div key={i} className="relative pl-5 border-l-2 border-slate-200 pb-3 last:pb-0">
                                    <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-brand-600" />
                                    <p className="text-sm font-medium text-slate-700">{h.action}</p>
                                    <p className="text-xs text-slate-400">{h.date} · {h.par}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            <div className="text-center pb-8">
                <Link to="/admin" className="text-brand-600 font-semibold hover:underline">← Retour à l'administration</Link>
            </div>
        </div>
    )
}
