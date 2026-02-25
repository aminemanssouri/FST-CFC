import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Input, Select } from '../components/ui'

const roleOptions = [
    { value: 'CANDIDAT', label: 'Candidat' },
    { value: 'ADMIN_ETABLISSEMENT', label: 'Admin Établissement' },
    { value: 'COORDINATEUR', label: 'Coordinateur' },
    { value: 'SUPER_ADMIN', label: 'Super Admin' },
]

const roleRedirects = {
    CANDIDAT: '/dashboard',
    ADMIN_ETABLISSEMENT: '/admin',
    COORDINATEUR: '/admin',
    SUPER_ADMIN: '/super-admin',
}

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('CANDIDAT')
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        // Demo login — in production this would call POST /api/auth/login
        login({ nom: email.split('@')[0] || 'Utilisateur', email, role })
        navigate(roleRedirects[role])
    }

    return (
        <div className="min-h-[calc(100vh-72px)] bg-slate-50 flex items-center justify-center px-6 py-12 animate-fade-in">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-brand-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <span className="text-3xl font-bold tracking-tight text-white uppercase">CFC</span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-brand-900 tracking-tight">Connexion</h2>
                    <p className="text-slate-500 mt-1">Accédez à votre espace personnel</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input id="email" type="email" label="Adresse email" placeholder="votre@email.ma" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <Input id="password" type="password" label="Mot de passe" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <Select id="role" label="Rôle (démo)" options={roleOptions} value={role} onChange={(e) => setRole(e.target.value)} />
                    <Button type="submit" full size="lg">Se connecter →</Button>
                </form>

                <p className="text-center mt-6 text-sm text-slate-500">
                    Pas encore de compte ?{' '}
                    <Link to="/inscription" className="text-brand-600 font-bold hover:underline">S'inscrire</Link>
                </p>
            </div>
        </div>
    )
}
