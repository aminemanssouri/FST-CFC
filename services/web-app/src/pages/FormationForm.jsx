import { useState, useEffect } from 'react'
import { useToast } from '../components/ui/Toast'
import { Modal, Input, Select, Button } from '../components/ui'
import { institutionApi } from '../api'

const diplomeOptions = [
    { value: 'LP', label: 'Licence Professionnelle' },
    { value: 'MS', label: 'Master Spécialisé' },
    { value: 'DUT', label: 'DUT' },
    { value: 'DU', label: "Diplôme d'Université" },
]

/**
 * @param {number|string} establishmentId  – auto-assigned (admin) or absent (super-admin picks)
 * @param {Array}          establishments   – list for dropdown when no fixed establishmentId
 */
export default function FormationForm({ isOpen, onClose, formation = null, onSaved, establishmentId, establishments = [] }) {
    const toast = useToast()
    const isEdit = !!formation
    const [saving, setSaving] = useState(false)

    const [form, setForm] = useState({
        titre: formation?.titre || formation?.title || '',
        description: formation?.description || '',
        diplome: formation?.diplome || '',
        duree: formation?.duration_hours || formation?.duree || '',
        frais: formation?.price || formation?.frais || '',
        places: formation?.capacity || formation?.places || '',
        establishment_id: formation?.establishment_id || establishmentId || '',
    })

    useEffect(() => {
        setForm({
            titre: formation?.titre || formation?.title || '',
            description: formation?.description || '',
            diplome: formation?.diplome || '',
            duree: formation?.duration_hours || formation?.duree || '',
            frais: formation?.price || formation?.frais || '',
            places: formation?.capacity || formation?.places || '',
            establishment_id: formation?.establishment_id || establishmentId || '',
        })
    }, [formation, establishmentId])

    const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.establishment_id) {
            toast.error('Veuillez sélectionner un établissement.')
            return
        }
        setSaving(true)
        try {
            const payload = {
                title: form.titre,
                description: form.description,
                establishment_id: Number(form.establishment_id),
                duration_hours: form.duree ? Number(form.duree) : undefined,
                price: form.frais ? Number(form.frais) : undefined,
                capacity: form.places ? Number(form.places) : undefined,
            }
            if (isEdit) {
                await institutionApi.updateFormation(formation.id, payload)
                toast.success('Formation modifiée avec succès !')
            } else {
                await institutionApi.createFormation(payload)
                toast.success('Formation créée avec succès !')
            }
            if (onSaved) onSaved()
            onClose()
        } catch (err) {
            toast.error(err.message || 'Erreur lors de l\'enregistrement.')
        } finally {
            setSaving(false)
        }
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

                {/* Establishment selector – shown only when no fixed establishmentId */}
                {!establishmentId && establishments.length > 0 && (
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-700">Établissement *</label>
                        <select
                            value={form.establishment_id}
                            onChange={e => update('establishment_id', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white transition-all focus:outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10"
                            required
                        >
                            <option value="">— Sélectionner un établissement —</option>
                            {establishments.map(et => <option key={et.id} value={et.id}>{et.name || et.nom}</option>)}
                        </select>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input label="Durée (heures)" type="number" placeholder="300" value={form.duree} onChange={e => update('duree', e.target.value)} />
                    <Input label="Frais (MAD)" type="number" placeholder="15000" value={form.frais} onChange={e => update('frais', e.target.value)} />
                    <Input label="Places disponibles" type="number" placeholder="40" value={form.places} onChange={e => update('places', e.target.value)} />
                </div>

                <div className="flex gap-3 pt-2 border-t border-slate-100">
                    <Button type="submit" full disabled={saving}>{saving ? 'Enregistrement...' : isEdit ? '💾 Enregistrer' : '➕ Créer la formation'}</Button>
                    <Button type="button" variant="outline" full onClick={onClose}>Annuler</Button>
                </div>
            </form>
        </Modal>
    )
}
