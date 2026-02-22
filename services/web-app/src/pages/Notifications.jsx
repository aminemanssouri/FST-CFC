import { useState } from 'react'
import { PageHeader, Card, Badge, Button } from '../components/ui'

const allNotifications = [
    { id: 1, type: 'success', title: 'Dossier accepté', message: 'Votre candidature à la Licence en Informatique a été acceptée. Veuillez finaliser votre inscription.', date: '2026-02-20', read: false },
    { id: 2, type: 'info', title: 'Dossier en cours de validation', message: 'Votre dossier pour le Master en Data Science est en cours d\'examen par l\'administration.', date: '2026-02-18', read: false },
    { id: 3, type: 'warning', title: 'Document manquant', message: 'Veuillez ajouter une copie certifiée de votre diplôme pour compléter votre dossier.', date: '2026-02-15', read: true },
    { id: 4, type: 'info', title: 'Nouvelle formation disponible', message: 'Le Master en Intelligence Artificielle est maintenant ouvert aux inscriptions à la FST Béni Mellal.', date: '2026-02-10', read: true },
    { id: 5, type: 'error', title: 'Dossier refusé', message: 'Votre candidature au DUT en Réseaux a été refusée. Motif : diplôme non conforme.', date: '2026-02-05', read: true },
    { id: 6, type: 'info', title: 'Rappel de fermeture', message: 'Les inscriptions à la Licence en Commerce International ferment le 31 août 2026.', date: '2026-02-01', read: true },
]

const typeIcons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
const typeBg = {
    success: 'border-l-emerald-500 bg-emerald-50/50',
    error: 'border-l-red-500 bg-red-50/50',
    info: 'border-l-blue-500 bg-blue-50/50',
    warning: 'border-l-amber-500 bg-amber-50/50',
}

export default function Notifications() {
    const [notifications, setNotifications] = useState(allNotifications)
    const unread = notifications.filter(n => !n.read).length

    const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))

    return (
        <div className="animate-fade-in">
            <PageHeader title="🔔 Notifications" subtitle={`${unread} notification(s) non lue(s)`} />

            <div className="max-w-3xl mx-auto px-6 py-10">
                {unread > 0 && (
                    <div className="flex justify-end mb-4">
                        <Button variant="outline" size="sm" onClick={markAllRead}>Tout marquer comme lu</Button>
                    </div>
                )}

                <div className="space-y-3">
                    {notifications.map(n => (
                        <div
                            key={n.id}
                            onClick={() => markRead(n.id)}
                            className={`border-l-4 rounded-xl p-5 transition-all duration-200 cursor-pointer hover:shadow-md ${typeBg[n.type]} ${!n.read ? 'ring-2 ring-brand-200' : ''}`}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-xl mt-0.5">{typeIcons[n.type]}</span>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={`font-semibold text-slate-800 ${!n.read ? '' : 'opacity-70'}`}>{n.title}</h3>
                                        <div className="flex items-center gap-2">
                                            {!n.read && <Badge color="blue">Nouveau</Badge>}
                                            <span className="text-xs text-slate-400">{n.date}</span>
                                        </div>
                                    </div>
                                    <p className={`text-sm text-slate-600 ${!n.read ? '' : 'opacity-60'}`}>{n.message}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
