import { useState, useEffect, createContext, useContext, useCallback } from 'react'

const ToastContext = createContext(null)

const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
}

const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }

function ToastItem({ toast, onRemove }) {
    useEffect(() => {
        const timer = setTimeout(() => onRemove(toast.id), 4000)
        return () => clearTimeout(timer)
    }, [toast.id, onRemove])

    return (
        <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-lg animate-slide-up ${styles[toast.type]}`}>
            <span className="text-lg">{icons[toast.type]}</span>
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button onClick={() => onRemove(toast.id)} className="text-current opacity-40 hover:opacity-100 transition-opacity">✕</button>
        </div>
    )
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, message, type }])
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const toast = {
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error'),
        info: (msg) => addToast(msg, 'info'),
        warning: (msg) => addToast(msg, 'warning'),
    }

    return (
        <ToastContext.Provider value={toast}>
            {children}
            {/* Toast container */}
            <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 max-w-sm">
                {toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={removeToast} />)}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error('useToast must be inside ToastProvider')
    return ctx
}
