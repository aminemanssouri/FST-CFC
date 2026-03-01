import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Input } from '../components/ui'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const { login, ROLE_REDIRECTS } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSubmitting(true)

        try {
            const user = await login(email, password)
            const redirectPath = ROLE_REDIRECTS[user.role] || '/dashboard'
            navigate(redirectPath, { replace: true })
        } catch (err) {
            setError(err.message || 'Identifiants incorrects.')
        } finally {
            setSubmitting(false)
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
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-start gap-3">
                        <span className="text-lg">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        id="email"
                        type="email"
                        label="Adresse email"
                        placeholder="votre@email.ma"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={submitting}
                    />
                    <Input
                        id="password"
                        type="password"
                        label="Mot de passe"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={submitting}
                    />

                    <Button type="submit" full size="lg" disabled={submitting}>
                        {submitting ? (
                            <span className="flex items-center justify-center gap-3">
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Connexion en cours...
                            </span>
                        ) : (
                            'Se connecter →'
                        )}
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
