import { useState } from 'react'
import { useToast } from '../components/ui/Toast'
import { Modal, Input, Select, Button } from '../components/ui'

const etablissementOptions = [
    { value: 'FST-BM', label: 'FST Béni Mellal' },
    { value: 'FEG-BM', label: 'FEG Béni Mellal' },
    { value: 'ENSA-KH', label: 'ENSA Khouribga' },
    { value: 'ENCG-BM', label: 'ENCG Béni Mellal' },
    { value: 'EST-BM', label: 'EST Béni Mellal' },
    { value: 'FP-BM', label: 'FP Béni Mellal' },
]

const diplomeOptions = [
    { value: 'LP', label: 'Licence Professionnelle' },
    { value: 'MS', label: 'Master Spécialisé' },
    { value: 'DUT', label: 'DUT' },
    { value: 'DU', label: "Diplôme d'Université" },
]

export default function FormationForm({ isOpen, onClose, formation = null }) {
    const toast = useToast()
    const isEdit = !!formation

    const [form, setForm] = useState({
        titre: formation?.titre || '',
        description: formation?.description || '',
        etablissement: formation?.etablissement || '',
        diplome: formation?.diplome || '',
        duree: formation?.duree || '',
        frais: formation?.frais || '',
        places: formation?.places || '',
        dateOuverture: formation?.dateOuverture || '',
        dateFermeture: formation?.dateFermeture || '',
    })

    const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

    const handleSubmit = (e) => {
        e.preventDefault()
        toast.success(isEdit ? 'Formation modifiée avec succès !' : 'Formation créée avec succès !')
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? '✏️ Modifier la formation' : '➕ Nouvelle formation'} size="lg">
            <form onSubmit={handleSubmit} className="space-y-5">
                <Input label="Titre de la formation" placeholder="Ex: Licence en Informatique et Numérique" value={form.titre} onChange={e => update('titre', e.target.value)} required />

                <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Description</label>
                    <textarea
                        rows={3}
                        placeholder="Décrivez le contenu et les objectifs de la formation..."
                        value={form.description}
                        onChange={e => update('description', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-sans bg-white transition-all duration-300 focus:outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10 resize-none"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select label="Établissement" placeholder="— Sélectionner —" options={etablissementOptions} value={form.etablissement} onChange={e => update('etablissement', e.target.value)} required />
                    <Select label="Type de diplôme" placeholder="— Sélectionner —" options={diplomeOptions} value={form.diplome} onChange={e => update('diplome', e.target.value)} required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input label="Durée" placeholder="Ex: 2 ans" value={form.duree} onChange={e => update('duree', e.target.value)} required />
                    <Input label="Frais (MAD/an)" type="number" placeholder="15000" value={form.frais} onChange={e => update('frais', e.target.value)} required />
                    <Input label="Places disponibles" type="number" placeholder="40" value={form.places} onChange={e => update('places', e.target.value)} required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input type="date" label="Date d'ouverture" value={form.dateOuverture} onChange={e => update('dateOuverture', e.target.value)} required />
                    <Input type="date" label="Date de fermeture" value={form.dateFermeture} onChange={e => update('dateFermeture', e.target.value)} required />
                </div>

                <div className="flex gap-3 pt-2 border-t border-slate-100">
                    <Button type="submit" full>{isEdit ? '💾 Enregistrer' : '➕ Créer la formation'}</Button>
                    <Button type="button" variant="outline" full onClick={onClose}>Annuler</Button>
                </div>
            </form>
        </Modal>
    )
}
