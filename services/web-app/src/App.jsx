import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import Catalogue from './pages/Catalogue'
import FormationDetail from './pages/FormationDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import DashboardCandidat from './pages/DashboardCandidat'
import DashboardAdmin from './pages/DashboardAdmin'
import DashboardSuperAdmin from './pages/DashboardSuperAdmin'
import DossierDetail from './pages/DossierDetail'

function App() {
    return (
        <div className="app">
            <Navbar />
            <main className="main-content">
                <Routes>
                    {/* ── Public ── */}
                    <Route path="/" element={<Home />} />
                    <Route path="/catalogue" element={<Catalogue />} />
                    <Route path="/formations/:id" element={<FormationDetail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/inscription" element={<Register />} />

                    {/* ── Authenticated (any role) ── */}
                    <Route path="/profil" element={
                        <ProtectedRoute roles={[]}>
                            <Profile />
                        </ProtectedRoute>
                    } />
                    <Route path="/notifications" element={
                        <ProtectedRoute roles={[]}>
                            <Notifications />
                        </ProtectedRoute>
                    } />

                    {/* ── Candidat ── */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute roles={['CANDIDAT']}>
                            <DashboardCandidat />
                        </ProtectedRoute>
                    } />

                    {/* ── Admin Établissement / Coordinateur ── */}
                    <Route path="/admin" element={
                        <ProtectedRoute roles={['ADMIN_ETABLISSEMENT', 'COORDINATEUR']}>
                            <DashboardAdmin />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/dossiers/:id" element={
                        <ProtectedRoute roles={['ADMIN_ETABLISSEMENT', 'COORDINATEUR']}>
                            <DossierDetail />
                        </ProtectedRoute>
                    } />

                    {/* ── Super Admin ── */}
                    <Route path="/super-admin" element={
                        <ProtectedRoute roles={['SUPER_ADMIN']}>
                            <DashboardSuperAdmin />
                        </ProtectedRoute>
                    } />

                    {/* ── 404 ── */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
            <Footer />
        </div>
    )
}

export default App
