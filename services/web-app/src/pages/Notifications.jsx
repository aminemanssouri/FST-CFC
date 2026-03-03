import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { PageHeader, Card, Badge, Button } from '../components/ui'
import { applicationApi } from '../api'

const etatNotif = {
    PREINSCRIPTION: { type: 'info', title: 'Pré-inscription créée', msg: 'Votre pré-inscription a été enregistrée. Veuillez compléter votre dossier.' },
    DOSSIER_SOUMIS: { type: 'info', title: 'Dossier soumis', msg: 'Votre dossier a été soumis et est en attente d\'examen.' },
    EN_VALIDATION:  { type: 'warning', title: 'Dossier en validation', msg: 'Votre dossier est en cours d\'examen par l\'administration.' },
    ACCEPTE:        { type: 'success', title: 'Candidature acceptée', msg: 'Félicitations ! Votre candidature a été acceptée.' },
    REFUSE:         { type: 'error', title: 'Candidature refusée', msg: 'Votre candidature a été refusée.' },
    INSCRIT:        { type: 'success', title: 'Inscription confirmée', msg: 'Votre inscription est confirmée.' },
}

const typeIcons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
const typeBg = {
    success: 'border-l-green-500 bg-green-50 hover:bg-green-100 text-green-900',
    error: 'border-l-red-500 bg-red-50 hover:bg-red-100 text-red-900',
    info: 'border-l-brand-500 bg-brand-50 hover:bg-brand-100 text-brand-900',
    warning: 'border-l-yellow-500 bg-yellow-50 hover:bg-yellow-100 text-yellow-900',
}

export default function Notifications() {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)

    // Read state from localStorage
    const getReadIds = () => {
        try { return JSON.parse(localStorage.getItem('read_notifs') || '[]') } catch { return [] }
    }
    const saveReadIds = (ids) => localStorage.setItem('read_notifs', JSON.stringify(ids))

    useEffect(() => {
        if (!user?.id) { setLoading(false); return }
        applicationApi.getInscriptions({ candidat_id: user.id })
            .then(data => {
                const list = data.data || data || []
                const readIds = getReadIds()
                const notifs = list.map(ins => {
                    const cfg = etatNotif[ins.etat] || { type: 'info', title: ins.etat, msg: '' }
                    const notifId = `ins-${ins.id}-${ins.etat}`
                    return {
                        id: notifId,
                        type: cfg.type,
                        title: cfg.title,
                        message: `${cfg.msg} (Formation #${ins.formation_id})`,
                        date: ins.updated_at || ins.created_at || '',
                        read: readIds.includes(notifId),
                    }
                })
                setNotifications(notifs.sort((a, b) => new Date(b.date) - new Date(a.date)))
            })
            .catch(() => setNotifications([]))
            .finally(() => setLoading(false))
    }, [user?.id])

    const unread = notifications.filter(n => !n.read).length

    const markAllRead = () => {
        const allIds = notifications.map(n => n.id)
        saveReadIds(allIds)
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }
    const markRead = (id) => {
        const readIds = getReadIds()
        if (!readIds.includes(id)) { readIds.push(id); saveReadIds(readIds) }
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    }

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

                    {loading ? (
                        <div className="text-center py-12 text-slate-400">Chargement des notifications…</div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">Aucune notification pour le moment.</div>
                    ) : (
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
                                                <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded shadow-sm">{n.date ? new Date(n.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                            </div>
                                        </div>
                                        <p className={`text-sm leading-relaxed ${!n.read ? 'text-slate-800' : 'text-slate-600'}`}>{n.message}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
