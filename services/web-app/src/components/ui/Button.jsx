import { Link } from 'react-router-dom'

const variants = {
    primary: 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-600/30 hover:shadow-xl hover:shadow-brand-600/40 hover:-translate-y-0.5',
    accent: 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-lg shadow-accent-500/30 hover:shadow-xl hover:shadow-accent-500/40 hover:-translate-y-0.5',
    outline: 'bg-transparent border border-slate-300 text-slate-600 hover:border-brand-500 hover:text-brand-600',
    ghost: 'bg-transparent text-slate-400 hover:bg-white/5 hover:text-white',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100',
    subtle: 'bg-brand-50 text-brand-600 hover:bg-brand-100',
}

const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
}

export default function Button({
    children, variant = 'primary', size = 'md', to, full, className = '', disabled, ...props
}) {
    const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-300 cursor-pointer border-none'
    const cls = `${base} ${variants[variant]} ${sizes[size]} ${full ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`

    if (to) {
        return <Link to={to} className={cls}>{children}</Link>
    }

    return <button className={cls} disabled={disabled} {...props}>{children}</button>
}
