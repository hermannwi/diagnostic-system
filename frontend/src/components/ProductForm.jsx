import React, { useState } from 'react';

export default function ProductForm(props) {

    const [productName, setProductName] = useState('')
    const [editProductName, setEditProductName] = useState('')
    const [editingID, setEditingID] = useState(null)


    const handleSubmit = async (event) => {
        
    event.preventDefault()
    
    try {
        const response = await fetch('http://localhost:5001/admin/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({product: productName})  // Use state, not FormData
        })
        
        if (response.ok) {
            setProductName('')  
            console.log('success')
            props.fetchProducts()
            
        }
    } catch (error) {
        console.error('Error adding product:', error)
    }
}

    const handleDelete = async (productId) => {
        try {
            if (window.confirm('Are you sure you want to delete this item?')) {
                const response = await fetch(`http://localhost:5001/admin/products/${productId}`, {
                method: 'DELETE'
                })
                if (response.ok) {
                    // Refresh products list after successful delete
                    props.fetchProducts() // or whatever your refresh function is called
                    }
            }
                
            
            
        } catch (error) {
            console.error('Error deleting product:', error)
  }
}

    function handleEdit(product) {
            setEditingID(product.id)
            setEditProductName(product.product)
        }

    const handleSave = async (product) => {
        try {
            const response = await fetch(`http://localhost:5001/admin/products/${product.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({product: editProductName})  // Use state, not FormData
            })
            
            if (response.ok) {
                setProductName('')  
                setEditingID(null)
                props.fetchProducts()
                console.log('success')
                
            }
        } catch (error) {
            console.error('Error adding product:', error)
        }
    }
    

    
        
    
    return (
        <section>
            <h1>Product Form</h1>
            <form onSubmit={handleSubmit} method='post'>
                <label htmlFor="product">Product: </label>
                <input className='product-input'
                id='product'
                type="text"
                name='product'
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                
            />
            <button>ADD</button>
                
            </form>
                        
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Product Name</th>
                        <th>Created Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {props.allProducts.map(product => (
                    <tr key={product.id}>
                        <td>{product.id}</td>
                        <td>{editingID === product.id ? <input 
                                                        name='edit-product' 
                                                        type='text' 
                                                        value={editProductName} 
                                                        onChange={(e) => setEditProductName(e.target.value)} /> : product.product}</td>
                                                        
                        <td>{product.created_at}</td>
                        <td>
                            {(editingID === product.id) ?
                            <>
                                {<button onClick={() => handleSave(product)}>Save</button>}
                                {<button onClick={() => {setEditingID(null)}}>Cancel</button>}
                            </>
                            :
                            <>
                                {<button onClick={() => handleEdit(product)}>Edit</button>}
                                {<button onClick={() => handleDelete(product.id)}>Delete</button>}
                            </>}
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
        </section>
    )
    
}