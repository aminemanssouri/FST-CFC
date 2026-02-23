export default function Input({ label, id, className = '', ...props }) {
    return (
        <div className="space-y-1.5">
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-slate-700">
                    {label}
                </label>
            )}
            <input
                id={id}
                className={`w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 transition-all duration-300 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:bg-white hover:border-slate-300 shadow-sm ${className}`}
                {...props}
            />
        </div>
    )
}
