import { useState, useRef } from 'react'

function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} o`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} Ko`
    return `${(bytes / 1048576).toFixed(1)} Mo`
}

export default function UploadZone({ icon, label, description, accept, onChange }) {
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const inputRef = useRef(null)

    const handleChange = (e) => {
        const selected = e.target.files?.[0] || null
        setFile(selected)
        if (selected && selected.type.startsWith('image/')) {
            const url = URL.createObjectURL(selected)
            setPreview(url)
        } else {
            setPreview(null)
        }
        if (onChange) onChange(selected)
    }

    const handleRemove = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setFile(null)
        setPreview(null)
        if (inputRef.current) inputRef.current.value = ''
        if (onChange) onChange(null)
    }

    return (
        <div className="space-y-1.5">
            {label && <p className="text-sm font-semibold text-slate-700">{label}</p>}
            {file ? (
                <div className="border-2 border-brand-300 bg-brand-50/60 rounded-xl p-4 flex items-center gap-4 transition-all duration-300">
                    {preview ? (
                        <img src={preview} alt={file.name} className="w-16 h-16 rounded-lg object-cover border border-brand-200 shadow-sm" />
                    ) : (
                        <div className="w-16 h-16 rounded-lg bg-white border border-brand-200 shadow-sm flex items-center justify-center text-2xl">📄</div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{file.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{formatSize(file.size)}</p>
                        <p className="text-xs text-green-600 font-semibold mt-1 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Fichier prêt
                        </p>
                    </div>
                    <button type="button" onClick={handleRemove} className="shrink-0 w-9 h-9 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 flex items-center justify-center transition-all text-lg font-bold" title="Supprimer">✕</button>
                </div>
            ) : (
                <label className="block border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/50 transition-all duration-300 group">
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{icon}</div>
                    <p className="text-sm text-slate-500">{description}</p>
                    <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
                </label>
            )}
        </div>
    )
}
