import { useParams, Link } from 'react-router-dom'
import { PageHeader, Badge, Button, Card } from '../components/ui'

const formations = {
    1: { titre: 'Licence en Informatique et Numérique', etablissement: 'FST Béni Mellal', coordinateur: 'Dr. Ahmed Mansouri', inscriptions: true, description: 'Formation en développement logiciel, bases de données, réseaux et intelligence artificielle. Cette licence prépare les étudiants aux métiers du numérique avec une approche pratique et professionnalisante.', dateOuverture: '2026-01-15', dateFermeture: '2026-06-30', duree: '3 ans', diplome: 'Licence Professionnelle', frais: '15 000 MAD/an', places: 40 },
    2: { titre: 'Master en Énergies Renouvelables', etablissement: 'FST Béni Mellal', coordinateur: 'Pr. Fatima Zahra Belkadi', inscriptions: true, description: 'Spécialisation en énergie solaire, éolienne et biomasse pour un développement durable.', dateOuverture: '2026-02-01', dateFermeture: '2026-07-15', duree: '2 ans', diplome: 'Master Spécialisé', frais: '20 000 MAD/an', places: 25 },
    3: { titre: 'Licence en Management et Gestion', etablissement: 'ENCG Béni Mellal', coordinateur: 'Dr. Youssef Berrada', inscriptions: true, description: 'Formation en gestion d\'entreprise, marketing, finance et ressources humaines.', dateOuverture: '2026-01-20', dateFermeture: '2026-05-31', duree: '3 ans', diplome: 'Licence Professionnelle', frais: '18 000 MAD/an', places: 50 },
    5: { titre: 'Licence en Commerce International', etablissement: 'FEG Béni Mellal', coordinateur: 'Dr. Nadia Chraibi', inscriptions: true, description: 'Échanges internationaux, logistique, douane et négociation commerciale.', dateOuverture: '2026-03-01', dateFermeture: '2026-08-31', duree: '3 ans', diplome: 'Licence Professionnelle', frais: '16 000 MAD/an', places: 35 },
    7: { titre: 'Master en Data Science', etablissement: 'FST Béni Mellal', coordinateur: 'Pr. Karim Ouazzani', inscriptions: true, description: 'Analyse de données, machine learning, statistiques avancées et Python.', dateOuverture: '2026-02-15', dateFermeture: '2026-07-30', duree: '2 ans', diplome: 'Master Spécialisé', frais: '22 000 MAD/an', places: 30 },
    8: { titre: 'Licence en Sciences de l\'Éducation', etablissement: 'FLSH Béni Mellal', coordinateur: 'Dr. Amina Fassi', inscriptions: true, description: 'Pédagogie, psychologie de l\'éducation et didactique des disciplines.', dateOuverture: '2026-01-10', dateFermeture: '2026-06-15', duree: '3 ans', diplome: 'Licence Professionnelle', frais: '12 000 MAD/an', places: 45 },
}

const infoFields = (f) => [
    { label: 'Diplôme', value: f.diplome },
    { label: 'Durée', value: f.duree },
    { label: 'Frais', value: f.frais },
    { label: 'Places', value: `${f.places} places` },
]

const dateFields = (f) => [
    { label: 'Ouverture', value: f.dateOuverture },
    { label: 'Fermeture', value: f.dateFermeture },
]

const InfoRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-2">
        <span className="text-sm text-slate-500">{label}</span>
        <span className="text-sm font-semibold text-slate-800">{value}</span>
    </div>
)

export default function FormationDetail() {
    const { id } = useParams()
    const f = formations[id]

    if (!f) {
        return (
            <div className="text-center py-24 animate-fade-in">
                <p className="text-5xl mb-4">📭</p>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Formation non trouvée</h2>
                <Link to="/catalogue" className="text-brand-600 font-semibold hover:underline">← Retour au catalogue</Link>
            </div>
        )
    }

    return (
        <div className="animate-fade-in">
            <PageHeader title={f.titre} subtitle={`🏛️ ${f.etablissement} — Coordinateur : ${f.coordinateur}`}>
                <Badge color={f.inscriptions ? 'green' : 'red'} className="mb-4">
                    {f.inscriptions ? '✅ Inscriptions ouvertes' : '⛔ Inscriptions fermées'}
                </Badge>
            </PageHeader>

            <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                    <Card hover={false} className="p-8">
                        <h2 className="text-xl font-bold mb-4">📝 Description</h2>
                        <p className="text-slate-600 leading-relaxed">{f.description}</p>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card hover={false} className="p-6 sticky top-24">
                        <h3 className="font-bold text-lg mb-5">ℹ️ Informations</h3>
                        <div className="divide-y divide-slate-100">
                            {infoFields(f).map(row => <InfoRow key={row.label} {...row} />)}
                        </div>
                        <div className="my-5 h-px bg-slate-200" />
                        <div className="divide-y divide-slate-100">
                            {dateFields(f).map(row => <InfoRow key={row.label} {...row} />)}
                        </div>
                        <div className="mt-6">
                            {f.inscriptions ? (
                                <Button to="/inscription" full>✏️ Postuler maintenant</Button>
                            ) : (
                                <Button variant="outline" full disabled>⛔ Inscriptions fermées</Button>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            <div className="text-center pb-10">
                <Link to="/catalogue" className="text-brand-600 font-semibold hover:underline">← Retour au catalogue</Link>
            </div>
        </div>
    )
}
