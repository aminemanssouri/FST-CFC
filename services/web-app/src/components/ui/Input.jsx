export default function Input({ label, id, className = '', ...props }) {
    return (
        <div className="space-y-1.5">
            {label && (
                <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
                    {label}
                </label>
            )}
            <input
                id={id}
                className={`w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-sans bg-white transition-all duration-300 focus:outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10 ${className}`}
                {...props}
            />
        </div>
    )
}
