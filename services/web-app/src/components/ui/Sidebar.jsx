export default function Sidebar({ title, items, active, onSelect, children }) {
    return (
        <aside className="bg-brand-900 rounded-xl p-5 text-white h-fit lg:sticky lg:top-24">
            <h3 className="text-sm font-bold mb-4 text-slate-400 uppercase tracking-wider">{title}</h3>
            <nav className="space-y-1">
                {items.map(item => {
                    const isActive = item.key === active
                    const Component = onSelect ? 'button' : 'a'
                    return (
                        <Component
                            key={item.key}
                            href={onSelect ? undefined : '#'}
                            onClick={onSelect ? () => onSelect(item.key) : undefined}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left ${isActive ? 'bg-brand-600/20 text-brand-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <span>{item.icon}</span> {item.label}
                        </Component>
                    )
                })}
            </nav>
            {children && (
                <div className="mt-6 pt-5 border-t border-white/10">
                    {children}
                </div>
            )}
        </aside>
    )
}
