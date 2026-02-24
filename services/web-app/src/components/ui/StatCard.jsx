import Card from './Card'

const colors = {
    brand: 'text-brand-600',
    accent: 'text-accent-500',
    amber: 'text-amber-500',
    red: 'text-red-500',
}

export default function StatCard({ value, label, color = 'brand' }) {
    return (
        <Card hover={false} className="p-6 text-center">
            <div className={`text-4xl font-extrabold ${colors[color]}`}>{value}</div>
            <div className="text-sm text-slate-500 mt-1">{label}</div>
        </Card>
    )
}
