export default function Select({ label, id, options = [], placeholder, className = '', ...props }) {
    return (
        <div className="space-y-1.5">
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-slate-700">
                    {label}
                </label>
            )}
            <select
                id={id}
                className={`w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 transition-all duration-300 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:bg-white hover:border-slate-300 shadow-sm appearance-none ${className}`}
                {...props}
            >
                {placeholder && <option value="" disabled selected hidden>{placeholder}</option>}
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    )
}
