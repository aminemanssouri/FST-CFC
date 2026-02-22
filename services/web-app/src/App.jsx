import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
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
                    <Route path="/" element={<Home />} />
                    <Route path="/catalogue" element={<Catalogue />} />
                    <Route path="/formations/:id" element={<FormationDetail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/inscription" element={<Register />} />
                    <Route path="/dashboard" element={<DashboardCandidat />} />
                    <Route path="/admin" element={<DashboardAdmin />} />
                    <Route path="/super-admin" element={<DashboardSuperAdmin />} />
                </Routes>
            </main>
            <Footer />
        </div>
    )
}

export default App
