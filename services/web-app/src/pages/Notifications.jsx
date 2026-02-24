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
    success: 'border-l-green-500 bg-green-50 hover:bg-green-100 text-green-900',
    error: 'border-l-red-500 bg-red-50 hover:bg-red-100 text-red-900',
    info: 'border-l-brand-500 bg-brand-50 hover:bg-brand-100 text-brand-900',
    warning: 'border-l-yellow-500 bg-yellow-50 hover:bg-yellow-100 text-yellow-900',
}

export default function Notifications() {
    const [notifications, setNotifications] = useState(allNotifications)
    const unread = notifications.filter(n => !n.read).length

    const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))

    return (
        <div className="animate-fade-in bg-slate-50 min-h-screen pb-12">
            <PageHeader title="Notifications" subtitle="Restez informé de l'évolution de vos candidatures.">
                {unread > 0 && (
                    <Badge color="accent" className="mt-4 px-4 py-1.5 text-sm shadow-sm">
                        {unread} message(s) non lu(s)
                    </Badge>
                )}
            </PageHeader>

            <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-20">
                <Card className="p-6 md:p-8 border-slate-200">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                        <h2 className="text-xl font-bold text-brand-900 flex items-center gap-2">
                            <span className="w-10 h-10 rounded-xl bg-slate-100 text-brand-600 flex items-center justify-center text-lg">🔔</span>
                            Boîte de Réception
                        </h2>
                        {unread > 0 && (
                            <Button variant="outline" size="sm" onClick={markAllRead} className="text-slate-500">
                                ✓ Tout marquer comme lu
                            </Button>
                        )}
                    </div>

                    <div className="space-y-4">
                        {notifications.map(n => (
                            <div
                                key={n.id}
                                onClick={() => markRead(n.id)}
                                className={`
                                    border-l-4 rounded p-5 transition-all duration-300 cursor-pointer border-y border-r border-slate-100 shadow-sm
                                    ${typeBg[n.type]} 
                                    ${!n.read ? 'ring-1 ring-slate-200 shadow-sm scale-[1.01]' : 'opacity-80 scale-100 grayscale hover:grayscale-0'}
                                `}
                            >
                                <div className="flex gap-4">
                                    <div className={`w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl shrink-0 ${!n.read ? 'animate-pulse' : ''}`}>
                                        {typeIcons[n.type]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                                            <h3 className={`font-bold text-lg ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>
                                                {n.title}
                                            </h3>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {!n.read && <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />}
                                                <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded shadow-sm">{n.date}</span>
                                            </div>
                                        </div>
                                        <p className={`text-sm leading-relaxed ${!n.read ? 'text-slate-800' : 'text-slate-600'}`}>{n.message}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    )
}
