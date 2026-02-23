export default function Sidebar({ title, items, active, onSelect, children }) {
    return (
        <aside className="bg-brand-800 rounded-xl p-5 text-white h-fit lg:sticky lg:top-24 shadow-md border border-brand-700">
            <h3 className="text-xs font-bold mb-5 text-brand-300 uppercase tracking-widest pl-2">{title}</h3>
            <nav className="space-y-1.5">
                {items.map(item => {
                    const isActive = item.key === active
                    const Component = onSelect ? 'button' : 'a'
                    return (
                        <Component
                            key={item.key}
                            href={onSelect ? undefined : '#'}
                            onClick={onSelect ? () => onSelect(item.key) : undefined}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 text-left relative overflow-hidden group ${isActive ? 'bg-primary-500 text-white font-bold' : 'text-brand-100 hover:bg-white/10 hover:text-white border border-transparent'
                                }`}
                        >
                            <span className={`text-lg transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
                            <span className="tracking-wide uppercase text-xs">{item.label}</span>
                        </Component>
                    )
                })}
            </nav>
            {children && (
                <div className="mt-8 pt-6 border-t border-brand-700">
                    {children}
                </div>
            )}
        </aside>
    )
}
