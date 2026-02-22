export default function Select({ label, id, options = [], placeholder, className = '', ...props }) {
    return (
        <div className="space-y-1.5">
            {label && (
                <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
                    {label}
                </label>
            )}
            <select
                id={id}
                className={`w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-sans bg-white transition-all duration-300 focus:outline-none focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10 ${className}`}
                {...props}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    )
}
