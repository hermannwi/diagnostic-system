import ProductForm from './ProductForm'
import SystemForm from './SystemForm'
import PartForm from './PartForm'
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
        <div className='systems-and-products'>
            <div>
                <button onClick={toggleSystemForm}>Add System</button>
                <button onClick={toggleProductForm}>Add Product</button>
                <button onClick={togglePartForm}>Add Part</button>
            </div>
            <div>
                {showSystemForm && <SystemForm 
                                              allSystems={props.allSystems}
                                              fetchSystems={props.fetchSystems}
                                              fetchProducts={props.fetchProducts}
                                              fetchParts={props.fetchParts}/>}
                {showProductForm && <ProductForm 
                                                allProducts={props.allProducts}
                                                allSystems={props.allSystems}
                                                fetchProducts={props.fetchProducts}
                                                fetchSystems={props.fetchSystems}
                                                fetchParts={props.fetchParts}/>}
                {showPartForm && <PartForm 
                                            allProducts={props.allProducts}
                                            allParts={props.allParts}
                                            fetchParts={props.fetchParts}
                                            fetchSystems={props.fetchSystems}
                                            fetchProducts={props.fetchProducts}/>}
            </div>
        </div>
        
            
        
    )
}