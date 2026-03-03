import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PageHeader, Badge, Button, Card } from '../components/ui'
import { institutionApi } from '../api'

const InfoRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-2">
        <span className="text-sm text-slate-500 font-medium">{label}</span>
        <span className="text-sm font-bold text-slate-800">{value || '—'}</span>
    </div>
)

export default function FormationDetail() {
    const { id } = useParams()
    const [f, setF] = useState(null)
    const [regStatus, setRegStatus] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        Promise.all([
            institutionApi.getFormation(id).catch(() => null),
            institutionApi.getRegistrationStatus(id).catch(() => null),
        ]).then(([formation, status]) => {
            const data = formation?.data || formation
            setF(data)
            setRegStatus(status?.data || status)
        }).finally(() => setLoading(false))
    }, [id])

    if (loading) {
        return <div className="text-center py-24 animate-fade-in text-slate-400">Chargement...</div>
    }

    if (!f) {
        return (
            <div className="text-center py-24 animate-fade-in">
                <p className="text-5xl mb-4">📭</p>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Formation non trouvée</h2>
                <Link to="/catalogue" className="text-brand-600 font-bold hover:underline">← Retour au catalogue</Link>
            </div>
        )
    }

    const titre = f.titre || f.title || f.nom || ''
    const description = f.description || ''
    const etablissement = f.etablissement || f.institution || ''
    const coordinateur = f.coordinateur || f.coordinator || ''
    const inscriptions = regStatus?.is_open ?? f.inscriptions_ouvertes ?? f.inscriptions ?? false
    const dateOuverture = regStatus?.start_date || f.date_ouverture || f.dateOuverture || ''
    const dateFermeture = regStatus?.end_date || f.date_fermeture || f.dateFermeture || ''
    const duree = f.duration_hours ? `${f.duration_hours}h` : (f.duree || '')
    const prix = f.price ? `${Number(f.price).toLocaleString('fr-FR')} MAD` : (f.frais || '')
    const places = f.capacity || f.places || ''

    const infoFields = [
        { label: 'Statut', value: f.status || f.etat || '' },
        { label: 'Durée', value: duree },
        { label: 'Frais', value: prix },
        { label: 'Places', value: places ? `${places} places` : '' },
    ]

    const dateFields = [
        { label: 'Ouverture', value: dateOuverture ? new Date(dateOuverture).toLocaleDateString('fr-FR') : '' },
        { label: 'Fermeture', value: dateFermeture ? new Date(dateFermeture).toLocaleDateString('fr-FR') : '' },
    ]

    return (
        <div className="animate-fade-in bg-slate-50 min-h-screen pb-10">
            <PageHeader title={titre} subtitle={`🏛️ ${etablissement}${coordinateur ? ` — Coordinateur : ${coordinateur}` : ''}`}>
                <Badge color={inscriptions ? 'green' : 'red'} className="mb-4">
                    {inscriptions ? '✅ Inscriptions ouvertes' : '⛔ Inscriptions fermées'}
                </Badge>
            </PageHeader>

            <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                    <Card className="p-8 border-slate-200">
                        <h2 className="text-xl font-bold text-brand-900 mb-4 uppercase tracking-widest text-sm border-b border-slate-100 pb-2">📝 Description</h2>
                        <p className="text-slate-600 leading-relaxed">{description}</p>
                        {f.objectives && (
                            <div className="mt-6">
                                <h3 className="font-bold text-brand-900 mb-2 text-sm uppercase tracking-widest">🎯 Objectifs</h3>
                                <ul className="list-disc list-inside text-slate-600 space-y-1 text-sm">
                                    {(Array.isArray(f.objectives) ? f.objectives : [f.objectives]).map((o, i) => (
                                        <li key={i}>{o}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {f.target_audience && (
                            <div className="mt-6">
                                <h3 className="font-bold text-brand-900 mb-2 text-sm uppercase tracking-widest">👥 Public cible</h3>
                                <p className="text-slate-600 text-sm">{f.target_audience}</p>
                            </div>
                        )}
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card className="p-6 sticky top-24 border-slate-200 flex flex-col gap-4">
                        <div>
                            <h3 className="font-bold text-brand-900 mb-4 uppercase tracking-widest text-sm border-b border-slate-100 pb-2">ℹ️ Informations</h3>
                            <div className="divide-y divide-slate-100">
                                {infoFields.map(row => <InfoRow key={row.label} {...row} />)}
                            </div>
                        </div>
                        <div>
                            <div className="divide-y divide-slate-100">
                                {dateFields.map(row => <InfoRow key={row.label} {...row} />)}
                            </div>
                        </div>
                        <div className="mt-4">
                            {inscriptions ? (
                                <Button to="/inscription" variant="accent" full>✏️ Postuler maintenant</Button>
                            ) : (
                                <Button variant="outline" full disabled>⛔ Inscriptions fermées</Button>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            <div className="text-center">
                <Link to="/catalogue" className="text-brand-600 font-bold hover:underline">← Retour au catalogue</Link>
            </div>
        </div>
    )
}
