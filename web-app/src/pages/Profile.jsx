import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'
import { PageHeader, Button, Input, Card } from '../components/ui'
import { authApi } from '../api'

export default function Profile() {
    const { user, login } = useAuth()
    const toast = useToast()
    const [saving, setSaving] = useState(false)

    const [form, setForm] = useState({
        nom:       user?.nom || user?.name || '',
        prenom:    '',
        email:     user?.email || '',
        telephone: user?.phone || user?.telephone || '',
        adresse:   '',
    })

    const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const data = await authApi.updateProfile({
                name:  `${form.prenom} ${form.nom}`.trim() || form.nom,
                phone: form.telephone,
            })
            // Update context with fresh user data (keep existing tokens)
            login(data.user || { ...user, nom: form.nom, email: form.email }, null, null)
            toast.success('Profil mis à jour avec succès !')
        } catch {
            toast.error('Erreur lors de la mise à jour du profil.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="animate-fade-in bg-slate-50 min-h-screen pb-12">
            <PageHeader title="Mon Profil" subtitle="Gérez vos informations personnelles et préférences." />

            <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-20">
                <Card className="p-8 md:p-10 border-slate-200">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-slate-100">
                            <div className="relative group cursor-pointer">
                                <div className="w-24 h-24 bg-brand-600 rounded-2xl flex items-center justify-center text-4xl text-white font-bold ring-4 ring-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                                    {form.nom?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="text-white text-xs font-bold uppercase tracking-widest">Modifier</span>
                                </div>
                            </div>

                            <div className="text-center sm:text-left">
                                <h3 className="text-2xl font-extrabold text-brand-900 tracking-tight">{form.nom || 'Utilisateur'}</h3>
                                <div className="inline-block mt-2 bg-brand-50 px-3 py-1 rounded border border-brand-200">
                                    <p className="text-sm font-bold text-brand-700 tracking-wide uppercase">
                                        {user?.role?.replace('_', ' ') || 'Profil Incomplet'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center">👤</span>
                                    Informations Personnelles
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-slate-50 p-6 rounded-xl border border-slate-100">
                                    <Input label="Nom complet" value={form.nom} onChange={e => update('nom', e.target.value)} required />
                                    <Input label="Prénom" value={form.prenom} onChange={e => update('prenom', e.target.value)} />
                                    <div className="sm:col-span-2">
                                        <Input label="Adresse résidentielle" placeholder="Ville, Maroc" value={form.adresse} onChange={e => update('adresse', e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center">📞</span>
                                    Coordonnées
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-slate-50 p-6 rounded-xl border border-slate-100">
                                    <Input type="email" label="Adresse email principale" value={form.email} onChange={e => update('email', e.target.value)} required />
                                    <Input type="tel" label="Numéro de téléphone" placeholder="+212 6XX-XXXXXX" value={form.telephone} onChange={e => update('telephone', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-4 border-t border-slate-100">
                            <Button type="submit" size="lg" className="sm:w-auto w-full px-8" disabled={saving}>
                                {saving ? 'Enregistrement...' : '💾 Mettre à jour le profil'}
                            </Button>
                            <Button type="button" size="lg" variant="outline" className="sm:w-auto w-full" onClick={() => setForm({ nom: user?.nom || '', prenom: '', email: user?.email || '', telephone: user?.phone || '', adresse: '' })}>
                                Rétablir
                            </Button>
                        </div>
                    </form>
                </Card>

                <Card className="p-8 mt-8 border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center text-xl shadow-sm border border-amber-100">
                                🔒
                            </div>
                            <div>
                                <h3 className="font-bold text-brand-900 text-lg">Sécurité du compte</h3>
                                <p className="text-sm text-slate-500 mt-0.5">Mot de passe modifié il y a 30 jours</p>
                            </div>
                        </div>
                        <Button variant="outline" className="bg-white shrink-0">Modifier le mot de passe</Button>
                    </div>
                </Card>
            </div>
        </div>
    )
}
