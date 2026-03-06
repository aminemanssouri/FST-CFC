export default function Spinner({ size = 'md', className = '' }) {
    const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className={`${sizes[size]} border-[3px] border-slate-200 border-t-brand-600 rounded-full animate-spin`} />
        </div>
    )
}

export function PageLoader() {
    return (
        <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
            <Spinner size="lg" />
            <p className="text-sm text-slate-400 mt-4">Chargement...</p>
        </div>
    )
}

export function EmptyState({ icon = '📭', title, description }) {
    return (
        <div className="text-center py-16 animate-fade-in">
            <p className="text-5xl mb-3">{icon}</p>
            <h3 className="text-lg font-bold text-slate-600 mb-1">{title}</h3>
            {description && <p className="text-sm text-slate-400">{description}</p>}
        </div>
    )
}
