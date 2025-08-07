import ProductForm from './ProductForm'
import SystemForm from './SystemForm'
import PartForm from './PartsForm'
import {useState} from 'react'

export default function SystemsAndProducts(props) {
    const [showSystemForm, setShowSystemForm] = useState(true)
    const [showProductForm, setShowProductForm] = useState(false)
    const [showPartForm, setShowPartForm] = useState(false)

    function toggleSystemForm() {
        setShowProductForm(false)
        setShowPartForm(false)
        setShowSystemForm(prev => !prev)
    }

    function toggleProductForm() {
        setShowSystemForm(false)
        setShowPartForm(false)
        setShowProductForm(prev => !prev)
    }

    function togglePartForm() {
        setShowProductForm(false)
        setShowSystemForm(false)
        setShowPartForm(prev => !prev)
    }

    return (
        <>
            <header>
                <button onClick={toggleSystemForm}>Add System</button>
                <button onClick={toggleProductForm}>Add Product</button>
                <button onClick={togglePartForm}>Add Part</button>
            </header>
            <div>
                {showSystemForm && <SystemForm 
                                              allSystems={props.allSystems}
                                              fetchSystems={props.fetchSystems}/>}
                {showProductForm && <ProductForm 
                                                allProducts={props.allProducts}
                                                fetchProducts={props.fetchProducts}/>}
                {showPartForm && <PartForm />}
            </div>
        </>
        
            
        
    )
}