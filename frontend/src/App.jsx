import React, { useState, useEffect } from 'react'
import DiagnosticForm from './components/DiagnosticForm'
import DiagnosticTable from './components/DiagnosticTable'
import SystemsAndProducts from './components/SystemsAndProducts'

import './App.css'




export default function App() {
    const [showSystemsAndProducts, setShowSystemsAndProducts] = useState(false)
    const [showDiagnosticForm, setShowDiagnosticForm] = useState(false)
    const [showQuestionForm, setShowQuestionForm] = useState(false)
    const [selectedDiagnostic, setSelectedDiagnostic] = useState()
    const [allDiagnostic8ds, setAllDiagnostic8ds] = useState([])
    const [allProducts, setAllProducts] = useState([])
    const [allSystems, setAllSystems] = useState([])
    const [allParts, setAllParts] = useState([])
    const [allQuestions, setAllQuestions] = useState([])

    const fetchDiagnostics = async () => {
        try {
            const response = await fetch('http://localhost:5001/admin/diagnostics8ds')
            const data = await response.json()
            setAllDiagnostic8ds(data)
            
        } catch (error) {
            console.error('Error fetching diagnostics:', error)
        }
        }


    const fetchSystems = async () => {
        try {
            const response = await fetch('http://localhost:5001/admin/systems')
            const data = await response.json()
            setAllSystems(data)
            console.log(response)
        } catch (error) {
            console.error('Error fetching systems:', error)
        }
    }
    
    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:5001/admin/products')
            const data = await response.json()
            setAllProducts(data)
            
        } catch (error) {
            console.error('Error fetching products:', error)
        }
    }

    // const fetchParts = async () => {
    //     try {
    //         const response = await fetch('http://localhost:5001/admin/parts')
    //     } catch (error) {

    //     }
    // }

    const fetchQuestions = async () => {
        try {
            const response = await fetch('http://localhost:5001/admin/questions')
            const data = await response.json()
            setAllQuestions(data)
            

        } catch (error) {
            console.error('Error fetching questions:', error)
        }
    }


    useEffect(() => {
        fetchDiagnostics()
    }, [])

    useEffect(() => {
        fetchSystems()
    }, [])

    useEffect(() => {
        fetchProducts()
    }, [])

    useEffect(() => {
        fetchQuestions()
    }, [])

    


    

    function toggleSystemsAndProducts() {
        setShowDiagnosticForm(false)
        setShowSystemsAndProducts(prev => !prev)
    }

    function toggleDiagnosticForm() {
        setShowSystemsAndProducts(false)
        setShowDiagnosticForm(prev => !prev)
    }

    function toggleQuestionForm() {
        setShowDiagnosticForm(false)
        setShowProductForm(false)
        setShowQuestionForm(prev => !prev)
    }

    

    return (
        <>
        <header>
            <button onClick={toggleSystemsAndProducts}>Systems and Products</button>
            <button onClick={toggleDiagnosticForm}>Add 8D</button>
            
            {/* <button onClick={toggleQuestionForm}>Add Question</button> */}
        </header>
        <div className='forms'>
            {showSystemsAndProducts && <SystemsAndProducts toggleSystemsAndProducts={toggleSystemsAndProducts}
                                             allSystems={allSystems} 
                                             allProducts={allProducts}
                                             allParts={allParts}
                                             fetchSystems={fetchSystems}
                                             fetchProducts={fetchProducts}
                                            //  fetchParts={fetchParts}
                                             />
                                              }
            {showDiagnosticForm && <DiagnosticForm 
                                                allProducts={allProducts} fetchDiagnostics={fetchDiagnostics}/>
                                                }
            
                                                
                                                
        </div>
            <div className='diagnostic-table'>
                <DiagnosticTable 
                                 allDiagnostic8ds={allDiagnostic8ds}
                                 allProducts={allProducts}
                                 fetchDiagnostics={fetchDiagnostics}/>
            </div>
            
        </>
        

    )
}
