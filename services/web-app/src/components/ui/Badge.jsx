const styles = {
    green: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    blue: 'bg-brand-50 text-brand-700 border border-brand-200',
    yellow: 'bg-primary-50 text-primary-700 border border-primary-200',
    red: 'bg-rose-50 text-rose-700 border border-rose-200',
    gray: 'bg-slate-100 text-slate-700 border border-slate-200',
    indigo: 'bg-brand-50 text-brand-700 border border-brand-200',
}

export default function Badge({ children, color = 'gray', className = '' }) {
    return (
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${styles[color]} ${className}`}>
            {children}
        </span>
    )
}
