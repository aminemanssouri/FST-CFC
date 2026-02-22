export default function PageHeader({ title, subtitle, children }) {
    return (
        <div className="bg-gradient-to-r from-brand-900 to-brand-700 text-white py-12 px-6 text-center">
            {children}
            <h1 className="text-3xl font-extrabold mb-2">{title}</h1>
            {subtitle && <p className="text-slate-400">{subtitle}</p>}
        </div>
    )
}
