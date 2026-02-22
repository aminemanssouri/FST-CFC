import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'
import { PageHeader, Button, Input, Card } from '../components/ui'

export default function Profile() {
    const { user, login } = useAuth()
    const toast = useToast()

    const [form, setForm] = useState({
        nom: user?.nom || '',
        prenom: '',
        email: user?.email || '',
        telephone: '',
        adresse: '',
    })

    const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

    const handleSubmit = (e) => {
        e.preventDefault()
        login({ ...user, nom: form.nom, email: form.email })
        toast.success('Profil mis à jour avec succès !')
    }

    return (
        <div className="animate-fade-in">
            <PageHeader title="⚙️ Mon Profil" subtitle="Gérez vos informations personnelles" />

            <div className="max-w-2xl mx-auto px-6 py-10">
                <Card hover={false} className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100">
                            <div className="w-20 h-20 bg-gradient-to-br from-brand-600 to-accent-500 rounded-full flex items-center justify-center text-3xl text-white shadow-lg">
                                {form.nom?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">{form.nom || 'Utilisateur'}</h3>
                                <p className="text-sm text-slate-500">{user?.role?.replace('_', ' ') || 'Non connecté'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input label="Nom" value={form.nom} onChange={e => update('nom', e.target.value)} required />
                            <Input label="Prénom" value={form.prenom} onChange={e => update('prenom', e.target.value)} />
                        </div>
                        <Input type="email" label="Adresse email" value={form.email} onChange={e => update('email', e.target.value)} required />
                        <Input type="tel" label="Téléphone" placeholder="+212 6XX-XXXXXX" value={form.telephone} onChange={e => update('telephone', e.target.value)} />
                        <Input label="Adresse" placeholder="Ville, Maroc" value={form.adresse} onChange={e => update('adresse', e.target.value)} />

                        <div className="flex gap-3 pt-2">
                            <Button type="submit">💾 Enregistrer</Button>
                            <Button type="button" variant="outline" onClick={() => setForm({ nom: user?.nom || '', prenom: '', email: user?.email || '', telephone: '', adresse: '' })}>
                                Annuler
                            </Button>
                        </div>
                    </form>
                </Card>

                <Card hover={false} className="p-6 mt-6">
                    <h3 className="font-bold text-slate-800 mb-3">🔒 Sécurité</h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-700">Mot de passe</p>
                            <p className="text-xs text-slate-400">Dernière modification : il y a 30 jours</p>
                        </div>
                        <Button variant="outline" size="sm">Modifier</Button>
                    </div>
                </Card>
            </div>
        </div>
    )
}
