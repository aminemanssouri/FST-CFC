export function Table({ columns, children }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                        {columns.map(col => (
                            <th key={col} className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {children}
                </tbody>
            </table>
        </div>
    )
}

export function TableRow({ children }) {
    return (
        <tr className="hover:bg-brand-50/30 transition-colors">
            {children}
        </tr>
    )
}

export function TableCell({ children, bold, className = '' }) {
    return (
        <td className={`px-5 py-4 text-sm ${bold ? 'font-semibold text-slate-800' : 'text-slate-600'} ${className}`}>
            {children}
        </td>
    )
}
