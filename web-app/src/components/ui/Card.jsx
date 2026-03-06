export default function Card({ children, hover = true, glass = false, className = '', ...props }) {
    const baseStyle = 'bg-white rounded-xl border border-slate-200 shadow-sm'

    return (
        <div
            className={`${baseStyle} transition-all duration-300 ${hover ? 'hover:-translate-y-1 hover:shadow-md' : ''} ${className}`}
            {...props}
        >
            {children}
        </div>
    )
}
