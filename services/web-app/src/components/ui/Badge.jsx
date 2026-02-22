const styles = {
    green: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-100 text-blue-700',
    yellow: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
    gray: 'bg-slate-100 text-slate-600',
}

export default function Badge({ children, color = 'gray', className = '' }) {
    return (
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${styles[color]} ${className}`}>
            {children}
        </span>
    )
}
