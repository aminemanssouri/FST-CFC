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
    { num: 1, label: 'Informations', icon: '👤', color: 'text-brand-600 bg-brand-50 border border-brand-200' },
    { num: 2, label: 'Formation', icon: '🎓', color: 'text-brand-600 bg-brand-50 border border-brand-200' },
    { num: 3, label: 'Documents', icon: '📎', color: 'text-brand-600 bg-brand-50 border border-brand-200' },
]

function StepIndicator({ current }) {
    return (
        <div className="flex items-center justify-center gap-2 mb-12">
            {steps.map((s, i) => {
                const isActive = s.num === current
                const isDone = s.num < current
                return (
                    <div key={i} className="flex items-center gap-2 md:gap-4">
                        <div className={`flex items-center gap-3 px-3 py-2 md:px-5 md:py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 ${isActive ? 'bg-brand-600 text-white shadow-sm translate-y-[-2px]' :
                            isDone ? 'bg-brand-500 text-white shadow-sm' : 'bg-slate-50 text-slate-400 border border-slate-200'
                            }`}>
                            <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${isActive || isDone ? 'bg-white/20' : 'bg-white'}`}>
                                {isDone ? '✓' : s.num}
                            </span>
                            <span className="hidden sm:inline tracking-wide font-bold uppercase text-xs">{s.label}</span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className="w-6 md:w-16 h-1 rounded-full bg-slate-100 overflow-hidden">
                                <div className={`h-full transition-all duration-500 ease-out ${s.num < current ? 'w-full bg-brand-500' : 'w-0'}`}></div>
                            </div>
                        )}
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
        <div className="animate-fade-in bg-slate-50 min-h-screen pb-24">
            <PageHeader title="Pré-inscription en Ligne" subtitle="Complétez votre dossier de candidature en 3 étapes simples et sécurisées." />

            <div className="max-w-3xl mx-auto px-6 -mt-8 relative z-20">
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm mb-8 border border-slate-200">
                    <StepIndicator current={step} />

                    <form onSubmit={handleSubmit} className="relative">
                        {/* Header for current step */}
                        <div className="text-center mb-10">
                            <span className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 text-2xl ${currentStep.color}`}>
                                {currentStep.icon}
                            </span>
                            <h3 className="text-2xl font-bold text-brand-900 tracking-tight">
                                {step === 1 ? 'Vos Informations Personnelles' : step === 2 ? 'Choix de votre Programme' : 'Dépôt des Pièces Justificatives'}
                            </h3>
                            <p className="text-slate-500 mt-2 text-sm">
                                {step === 1 ? 'Veuillez saisir vos coordonnées exactes telles qu\'elles figurent sur vos documents officiels.' : step === 2 ? 'Sélectionnez la formation continue qui correspond à votre projet professionnel.' : 'Téléversez les documents requis en format PDF ou Image (max 5Mo/fichier).'}
                            </p>
                        </div>

                        {/* Step Form Wrapper for transitions */}
                        <div className="min-h-[300px] flex flex-col justify-center">

                            {/* Step 1 */}
                            {step === 1 && (
                                <div className="animate-fade-in space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input label="Nom" placeholder="Ex: El Fassi" value={form.nom} onChange={e => update('nom', e.target.value)} required />
                                        <Input label="Prénom" placeholder="Ex: Mohammed" value={form.prenom} onChange={e => update('prenom', e.target.value)} required />
                                    </div>
                                    <Input type="email" label="Adresse Email" placeholder="mohammed.elfassi@email.com" value={form.email} onChange={e => update('email', e.target.value)} required />
                                    <Input type="tel" label="Téléphone Mobile" placeholder="+212 6XX-XXXXXX" value={form.telephone} onChange={e => update('telephone', e.target.value)} required />

                                    <div className="pt-6">
                                        <Button type="button" full size="lg" onClick={() => setStep(2)}>Continuer vers l'Étape 2 →</Button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2 */}
                            {step === 2 && (
                                <div className="animate-fade-in space-y-6">
                                    <div className="p-5 bg-primary-50 rounded-2xl border border-primary-200 flex items-start gap-4 text-primary-800 mb-6">
                                        <span className="text-2xl">💡</span>
                                        <p className="text-sm leading-relaxed font-medium">Assurez-vous que le diplôme sélectionné correspond aux prérequis d'admission du programme souhaité.</p>
                                    </div>

                                    <Select label="Programme de Formation Souhaité" placeholder="— Sélectionnez un programme —" options={formationOptions} value={form.formation} onChange={e => update('formation', e.target.value)} required />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Select label="Dernier Diplôme Obtenu" placeholder="— Type de diplôme —" options={diplomeOptions} value={form.diplome} onChange={e => update('diplome', e.target.value)} required />
                                        <Input type="number" label="Année d'Obtention" placeholder="Ex: 2024" min="1990" max="2026" value={form.annee} onChange={e => update('annee', e.target.value)} required />
                                    </div>

                                    <div className="flex gap-4 pt-6">
                                        <Button type="button" variant="outline" className="w-1/3" size="lg" onClick={() => setStep(1)}>← Retour</Button>
                                        <Button type="button" className="w-2/3" size="lg" onClick={() => setStep(3)}>Continuer vers l'Étape 3 →</Button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3 */}
                            {step === 3 && (
                                <div className="animate-fade-in space-y-6">
                                    <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-4 mb-6">
                                        <span className="text-2xl">⚠️</span>
                                        <p className="text-sm text-amber-800 leading-relaxed font-medium">
                                            Veuillez vous assurer de la clarté et lisibilité de vos documents. Les dossiers incomplets ou illisibles pourront être rejetés.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        {documents.map((doc, i) => (
                                            <UploadZone key={i} icon={doc.icon} label={doc.label} description={doc.description} accept={doc.accept} />
                                        ))}
                                    </div>
                                    <div className="flex gap-4 pt-6">
                                        <Button type="button" variant="outline" className="w-1/3" size="lg" onClick={() => setStep(2)}>← Retour</Button>
                                        <Button type="submit" variant="accent" className="w-2/3 shadow-md" size="lg">✅ Confirmer la Candidature</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                <p className="text-center font-medium text-slate-500">
                    Vous avez déjà soumis un dossier ?{' '}
                    <Link to="/login" className="text-brand-600 font-bold hover:text-brand-800 hover:underline transition-all">
                        Suivez son statut ici
                    </Link>
                </p>
            </div>
        </div>
    )
}
