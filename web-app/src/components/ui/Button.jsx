import { Link } from 'react-router-dom'

const variants = {
    primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700',
    accent: 'bg-primary-500 text-white shadow-sm hover:bg-primary-600',
    outline: 'bg-white border-2 border-slate-200 text-slate-700 hover:border-brand-600 hover:text-brand-600 shadow-sm',
    ghost: 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900',
    danger: 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200',
    subtle: 'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200',
    glass: 'bg-white border border-slate-200 text-slate-800 shadow-sm hover:bg-slate-50',
}

const sizes = {
    sm: 'px-5 py-2 text-xs',
    md: 'px-8 py-3 text-sm',
    lg: 'px-10 py-4 text-base',
}

export default function Button({
    children, variant = 'primary', size = 'md', to, full, className = '', disabled, ...props
}) {
    const base = 'inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed'
    const cls = `${base} ${variants[variant]} ${sizes[size]} ${full ? 'w-full' : ''} ${className}`

    if (to && !disabled) {
        return <Link to={to} className={cls} {...props}>{children}</Link>
    }

    return <button className={cls} disabled={disabled} {...props}>{children}</button>
}
