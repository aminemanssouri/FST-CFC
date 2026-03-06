import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Input } from '../components/ui'
import { authApi } from '../api'

const roleRedirects = {
    CANDIDAT: '/dashboard',
    ADMIN_ETABLISSEMENT: '/admin',
    COORDINATEUR: '/admin',
    SUPER_ADMIN: '/super-admin',
}

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const data = await authApi.login(email, password)
            // data: { user: { id, name, email, role, ... }, token, jwt }
            login(data.user, data.token, data.jwt)
            const redirects = roleRedirects[data.user?.role] || roleRedirects
            // role from AuthContext is already mapped to uppercase French
            const mapped =
                data.user?.role === 'candidate' ? 'CANDIDAT' :
                data.user?.role === 'establishment_admin' ? 'ADMIN_ETABLISSEMENT' :
                data.user?.role === 'coordinator' ? 'COORDINATEUR' :
                data.user?.role === 'super_admin' ? 'SUPER_ADMIN' : data.user?.role
            navigate(roleRedirects[mapped] || '/dashboard')
        } catch (err) {
            setError(err.message || 'Email ou mot de passe incorrect.')
        } finally {
            setLoading(false)
        }
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

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input id="email" type="email" label="Adresse email" placeholder="votre@email.ma" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <Input id="password" type="password" label="Mot de passe" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <Button type="submit" full size="lg" disabled={loading}>
                        {loading ? 'Connexion...' : 'Se connecter →'}
                    </Button>
                </form>

                <p className="text-center mt-6 text-sm text-slate-500">
                    Pas encore de compte ?{' '}
                    <Link to="/inscription" className="text-brand-600 font-bold hover:underline">S'inscrire</Link>
                </p>
            </div>
        </div>
    )
}
