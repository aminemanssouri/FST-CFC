import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader, Button, Input, Select, UploadZone } from '../components/ui'

const formationOptions = [
    { value: '1', label: 'Licence en Informatique et Numérique (FST)' },
    { value: '2', label: 'Master en Énergies Renouvelables (FST)' },
    { value: '3', label: 'Licence en Management et Gestion (ENCG)' },
    { value: '5', label: 'Licence en Commerce International (FEG)' },
    { value: '7', label: 'Master en Data Science (FST)' },
    { value: '8', label: "Licence en Sciences de l'Éducation (FLSH)" },
]

const diplomeOptions = [
    { value: 'bac', label: 'Baccalauréat' },
    { value: 'bac+2', label: 'Bac+2 (DUT/BTS/DEUG)' },
    { value: 'licence', label: 'Licence' },
    { value: 'master', label: 'Master' },
    { value: 'autre', label: 'Autre' },
]

const documents = [
    { icon: '📄', label: 'CV (PDF)', description: 'Glissez votre CV ici ou cliquez', accept: '.pdf' },
    { icon: '🎓', label: 'Copie du diplôme (PDF)', description: 'Glissez la copie de votre diplôme', accept: '.pdf' },
    { icon: '📷', label: "Photo d'identité (JPG/PNG)", description: "Glissez votre photo d'identité", accept: '.jpg,.jpeg,.png' },
]

const steps = [
    { num: 1, label: 'Informations', icon: '👤', color: 'bg-brand-100 text-brand-600' },
    { num: 2, label: 'Formation', icon: '🎓', color: 'bg-accent-500/10 text-accent-600' },
    { num: 3, label: 'Documents', icon: '📎', color: 'bg-amber-100 text-amber-600' },
]

function StepIndicator({ current }) {
    return (
        <div className="flex items-center justify-center gap-2 mb-10">
            {steps.map((s, i) => {
                const isActive = s.num === current
                const isDone = s.num < current
                return (
                    <div key={i} className="flex items-center gap-2">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${isActive ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' :
                                isDone ? 'bg-accent-500 text-white' : 'bg-slate-100 text-slate-400'
                            }`}>
                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-white/20">
                                {isDone ? '✓' : s.num}
                            </span>
                            <span className="hidden sm:inline">{s.label}</span>
                        </div>
                        {i < steps.length - 1 && <div className={`w-8 h-0.5 ${s.num < current ? 'bg-accent-500' : 'bg-slate-200'}`} />}
                    </div>
                )
            })}
        </div>
    )
}

export default function Register() {
    const [step, setStep] = useState(1)
    const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', formation: '', diplome: '', annee: '' })
    const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))
    const currentStep = steps[step - 1]

    const handleSubmit = (e) => {
        e.preventDefault()
        alert('Dossier soumis avec succès ! (→ POST /api/applications)')
    }

    return (
        <div className="animate-fade-in">
            <PageHeader title="✏️ Pré-inscription" subtitle="Complétez votre dossier en 3 étapes" />

            <div className="max-w-2xl mx-auto px-6 py-10">
                <StepIndicator current={step} />

                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                    <form onSubmit={handleSubmit}>
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <span className={`w-8 h-8 ${currentStep.color} rounded-lg flex items-center justify-center text-sm`}>
                                {currentStep.icon}
                            </span>
                            {step === 1 ? 'Informations personnelles' : step === 2 ? 'Choix de la formation' : 'Dépôt des documents'}
                        </h3>

                        {/* Step 1 */}
                        {step === 1 && (
                            <div className="animate-fade-in space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input label="Nom" placeholder="Votre nom" value={form.nom} onChange={e => update('nom', e.target.value)} required />
                                    <Input label="Prénom" placeholder="Votre prénom" value={form.prenom} onChange={e => update('prenom', e.target.value)} required />
                                </div>
                                <Input type="email" label="Email" placeholder="votre@email.ma" value={form.email} onChange={e => update('email', e.target.value)} required />
                                <Input type="tel" label="Téléphone" placeholder="+212 6XX-XXXXXX" value={form.telephone} onChange={e => update('telephone', e.target.value)} required />
                                <Button type="button" full onClick={() => setStep(2)}>Suivant →</Button>
                            </div>
                        )}

                        {/* Step 2 */}
                        {step === 2 && (
                            <div className="animate-fade-in space-y-4">
                                <Select label="Formation souhaitée" placeholder="— Sélectionner —" options={formationOptions} value={form.formation} onChange={e => update('formation', e.target.value)} required />
                                <Select label="Dernier diplôme obtenu" placeholder="— Sélectionner —" options={diplomeOptions} value={form.diplome} onChange={e => update('diplome', e.target.value)} required />
                                <Input type="number" label="Année d'obtention" placeholder="2024" min="1990" max="2026" value={form.annee} onChange={e => update('annee', e.target.value)} required />
                                <div className="flex gap-3">
                                    <Button type="button" variant="outline" full onClick={() => setStep(1)}>← Retour</Button>
                                    <Button type="button" full onClick={() => setStep(3)}>Suivant →</Button>
                                </div>
                            </div>
                        )}

                        {/* Step 3 */}
                        {step === 3 && (
                            <div className="animate-fade-in space-y-4">
                                {documents.map((doc, i) => (
                                    <UploadZone key={i} icon={doc.icon} label={doc.label} description={doc.description} accept={doc.accept} />
                                ))}
                                <div className="flex gap-3 mt-6">
                                    <Button type="button" variant="outline" full onClick={() => setStep(2)}>← Retour</Button>
                                    <Button type="submit" variant="accent" full>✅ Soumettre le dossier</Button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                <p className="text-center mt-6 text-sm text-slate-500">
                    Déjà inscrit ?{' '}
                    <Link to="/login" className="text-brand-600 font-semibold hover:underline">Se connecter</Link>
                </p>
            </div>
        </div>
    )
}
