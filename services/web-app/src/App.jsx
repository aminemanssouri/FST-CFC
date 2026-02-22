import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import Catalogue from './pages/Catalogue'
import FormationDetail from './pages/FormationDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import DashboardCandidat from './pages/DashboardCandidat'
import DashboardAdmin from './pages/DashboardAdmin'
import DashboardSuperAdmin from './pages/DashboardSuperAdmin'

function App() {
    return (
        <div className="app">
            <Navbar />
            <main className="main-content">
                <Routes>
                    {/* ── Public routes ── */}
                    <Route path="/" element={<Home />} />
                    <Route path="/catalogue" element={<Catalogue />} />
                    <Route path="/formations/:id" element={<FormationDetail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/inscription" element={<Register />} />

                    {/* ── Candidat only ── */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute roles={['CANDIDAT']}>
                            <DashboardCandidat />
                        </ProtectedRoute>
                    } />

                    {/* ── Admin Établissement + Coordinateur ── */}
                    <Route path="/admin" element={
                        <ProtectedRoute roles={['ADMIN_ETAB', 'COORDINATEUR']}>
                            <DashboardAdmin />
                        </ProtectedRoute>
                    } />

                    {/* ── Super Admin only ── */}
                    <Route path="/super-admin" element={
                        <ProtectedRoute roles={['SUPER_ADMIN']}>
                            <DashboardSuperAdmin />
                        </ProtectedRoute>
                    } />
                </Routes>
            </main>
            <Footer />
        </div>
    )
}

export default App
