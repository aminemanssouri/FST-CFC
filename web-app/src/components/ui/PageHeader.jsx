export default function PageHeader({ title, subtitle, children }) {
    return (
        <div className="bg-brand-700 text-white py-14 px-6 text-center shadow-sm relative overflow-hidden">
            <div className="relative z-10">
                {children}
                <h1 className="text-4xl font-bold mb-3 tracking-tight uppercase">{title}</h1>
                {subtitle && <p className="text-brand-100 text-lg max-w-2xl mx-auto font-light">{subtitle}</p>}
            </div>
        </div>
    )
}
