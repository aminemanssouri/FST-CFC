export default function Pagination({ current, total, onPageChange }) {
    if (total <= 1) return null

    const pages = []
    for (let i = 1; i <= total; i++) pages.push(i)

    // Show limited pages with ellipsis
    const getVisible = () => {
        if (total <= 7) return pages
        if (current <= 3) return [...pages.slice(0, 5), '...', total]
        if (current >= total - 2) return [1, '...', ...pages.slice(total - 5)]
        return [1, '...', current - 1, current, current + 1, '...', total]
    }

    return (
        <div className="flex items-center justify-center gap-1 mt-8">
            <button
                onClick={() => onPageChange(current - 1)}
                disabled={current === 1}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
                ← Prev
            </button>

            {getVisible().map((p, i) =>
                p === '...' ? (
                    <span key={`e${i}`} className="px-2 text-slate-400">…</span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all duration-200 ${p === current
                                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        {p}
                    </button>
                )
            )}

            <button
                onClick={() => onPageChange(current + 1)}
                disabled={current === total}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
                Next →
            </button>
        </div>
    )
}
