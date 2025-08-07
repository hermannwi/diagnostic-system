import React, { useState, useEffect } from 'react'
import DiagnosticForm from './components/DiagnosticForm'
import DiagnosticTable from './components/DiagnosticTable'
import ProductForm from './components/ProductForm'
import QuestionForm from './components/QuestionForm'
import './App.css'




export default function App() {
    const [showProductForm, setShowProductForm] = useState(false)
    const [showDiagnosticForm, setShowDiagnosticForm] = useState(false)
    const [showQuestionForm, setShowQuestionForm] = useState(false)
    const [selectedDiagnostic, setSelectedDiagnostic] = useState()
    const [allDiagnostic8ds, setAllDiagnostic8ds] = useState([])
    const [allProducts, setAllProducts] = useState([])
    const [allQuestions, setAllQuestions] = useState([])

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
        } catch (error) {
            console.error('Error fetching products:', error)
        }
    }

    const fetchQuestions = async () => {
        try {
            const response = await fetch('http://localhost:5001/admin/questions')
            const data = await response.json()
            setAllQuestions(data)
            console.log(response)

        } catch (error) {
            console.error('Error fetching questions:', error)
        }
    }


    useEffect(() => {
        fetchDiagnostics()
    }, [])

    useEffect(() => {
        fetchProducts()
    }, [])

    useEffect(() => {
        fetchQuestions()
    }, [])

    


    

    function toggleProductForm() {
        setShowQuestionForm(false)
        setShowDiagnosticForm(false)
        setShowProductForm(prev => !prev)
    }

    function toggleDiagnosticForm() {
        setShowQuestionForm(false)
        setShowProductForm(false)
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
            <button onClick={toggleProductForm}>Add Product</button>
            <button onClick={toggleDiagnosticForm}>Add 8D</button>
            {/* <button onClick={toggleQuestionForm}>Add Question</button> */}
        </header>
        <div className='forms'>
            {showProductForm && <ProductForm toggleProductForm={toggleProductForm}
                                             allProducts={allProducts}
                                             fetchProducts={fetchProducts}/> }
            {showDiagnosticForm && <DiagnosticForm 
                                                allProducts={allProducts} fetchDiagnostics={fetchDiagnostics}/>
                                                }
            {/* {showQuestionForm && <QuestionForm 
                                                allQuestions={allQuestions}
                                                fetchQuestions={fetchQuestions}/>} */}
                                                
                                                
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
