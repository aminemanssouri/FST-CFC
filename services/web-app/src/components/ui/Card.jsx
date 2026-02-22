export default function Card({ children, hover = true, className = '', ...props }) {
    return (
        <div
            className={`bg-white rounded-xl border border-slate-200 transition-all duration-300 ${hover ? 'hover:-translate-y-1 hover:shadow-lg hover:border-brand-400' : ''
                } ${className}`}
            {...props}
        >
            {children}
        </div>
    )
}
