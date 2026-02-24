export default function UploadZone({ icon, label, description, accept }) {
    return (
        <div className="space-y-1.5">
            {label && <p className="text-sm font-semibold text-slate-700">{label}</p>}
            <label className="block border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/50 transition-all duration-300 group">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{icon}</div>
                <p className="text-sm text-slate-500">{description}</p>
                <input type="file" accept={accept} className="hidden" />
            </label>
        </div>
    )
}
