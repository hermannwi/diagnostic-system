import React, { useState, useEffect } from 'react'
import DiagnosticForm from './components/DiagnosticForm'
import DiagnosticTable from './components/DiagnosticTable'
import ProductForm from './components/ProductForm'



export default function App() {
    const [showProductForm, setShowProductForm] = useState(false)
    const [showDiagnosticForm, setShowDiagnosticForm] = useState('none')
    const [selectedDiagnostic, setSelectedDiagnostic] = useState()
    const [allDiagnostic8ds, setAllDiagnostic8ds] = useState([])
    const [allProducts, setAllProducts] = useState([])

    const fetchDiagnostics = async () => {
        try {
            const response = await fetch('http://localhost:5001/admin/diagnostics8ds')
            const data = await response.json()
            setAllDiagnostic8ds(data)
            console.log(response)
        } catch (error) {
            console.error('Error fetching diagnostics:', error)
        }
        }

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:5001/admin/products')
            const data = await response.json()
            setAllProducts(data)
            console.log(data)
        } catch {
            console.error('Error fetching products:', error)
        }
    }

    useEffect(() => {
        fetchDiagnostics()
    }, [])

    useEffect(() => {
        fetchProducts()
    }, [])

    


    

    function toggleProductForm() {
        setShowProductForm(prev => !prev)
    }

    function openDiagnosticAddForm() {
        setShowDiagnosticForm('add')
        setSelectedDiagnostic(null)
    }

    function openDiagnosticViewForm(diagnostic) {
        setSelectedDiagnostic(diagnostic)
        setShowDiagnosticForm('view')
    }

    function switchToEditMode() {
        setShowDiagnosticForm('edit')
    }

    function closeDiagnosticForm() {
        setShowDiagnosticForm('none')
        setSelectedDiagnostic(null)
    }

    return (
        <>
        <header>
            <button onClick={toggleProductForm}>Add Product</button>
            <button onClick={openDiagnosticAddForm}>Add New 8D</button>
        </header>
        <div>
            {showProductForm && <ProductForm toggleProductForm={toggleProductForm}
                                             allProducts={allProducts}
                                             fetchProducts={fetchProducts}/> }
            {showDiagnosticForm != 'none' && <DiagnosticForm 
                                                selectedDiagnostic={selectedDiagnostic} 
                                                switchToEditMode={switchToEditMode}
                                                closeDiagnosticForm={closeDiagnosticForm}
                                                showDiagnosticForm={showDiagnosticForm}/>}
                                                
                                                
        </div>
            <div>
                <DiagnosticTable openDiagnosticViewForm={openDiagnosticViewForm}
                                 allDiagnostic8ds={allDiagnostic8ds}/>
            </div>
            
        </>
        

    )
}
