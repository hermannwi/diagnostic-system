import './App.css'
import { Routes, Route, Link } from 'react-router-dom'
import AdminSection from './components/AdminSection/AdminSection'
import DiagnosticSection from './components/DiagnosticSection.jsx/DiagnosticSection'


export default function App() {



    return (
        <div>
            <nav>
                {/* <Link to="/">Home</Link> */}
                {/* <Link to="/admin" className='button-link'>Admin</Link>
                <Link to="/diagnostics" className='button-link'>Diagnostics</Link> */}
            </nav>

            <Routes>
                {/* <Route path='/' element={<HomePage />} /> */}
                <Route path="/admin" element={<AdminSection />} />
                <Route path="/diagnostics" element={<DiagnosticSection />} />
            </Routes>
        </div>
    )
} 