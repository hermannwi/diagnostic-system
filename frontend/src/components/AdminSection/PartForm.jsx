
import { useState } from "react"


export default function PartForm(props) {

    const [partName, setPartName] = useState('')
    const [selectedProduct, setSelectedProduct] = useState('')
    const [editPartName, setEditPartName] = useState('')
    const [editingID, setEditingID] = useState(null)
    

    const handleSubmit = async (event) => {
        
    event.preventDefault()
    
    try {
        
        const response = await fetch('http://localhost:5001/admin/parts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({part: partName, product_id: selectedProduct})  
        })
        
        if (response.ok) {
            setPartName('')  
            console.log('success')
            props.fetchParts()
            
        }
    } catch (error) {
        console.error('Error adding part:', error)
    }
}




    // const handleDelete = async (systemId) => {
    //         try {
    //             if (window.confirm('Are you sure you want to delete this item?')) {
    //                 const response = await fetch(`http://localhost:5001/admin/systems/${systemId}`, {
    //                 method: 'DELETE'
    //                 })
    //                 if (response.ok) {
    //                     // Refresh products list after successful delete
    //                     props.fetchSystems() // or whatever your refresh function is called
    //                     }
    //             }
                    
                
                
    //         } catch (error) {
    //             console.error('Error deleting system:', error)
    //   }
    // }
    
        function handleEdit(part) {
                setEditingID(part.id)
                setEditPartName(part.part)
            }
    
        const handleSave = async (part) => {
            try {
                const response = await fetch(`http://localhost:5001/admin/parts/${part.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({part: editPartName})  // Use state, not FormData
                })
                
                if (response.ok) {
                    setPartName('')  
                    setEditingID(null)
                    props.fetchSystems()
                    props.fetchProducts()
                    props.fetchParts()
                    console.log('success')
                    
                }
            } catch (error) {
                console.error('Error adding part:', error)
            }
        }

    return (
        <section>
            <h1>Part Form</h1>
            <form onSubmit={handleSubmit} method='post'>
                <label htmlFor="part">Part: </label>
                <input className='part-input'
                id='part'
                type="text"
                name='part'
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
                
            />
            <label htmlFor="product">Products: </label>
            <select 
            name="product" 
            id="product"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}>
                <option value=''>Select a product...</option>
                {props.allProducts.map(product => {
                        return (<option key={product.id} value={product.id}>
                            {product.product}
                        </option>)
                    })}
            </select>
                
            <button>ADD</button>
                
            </form>
                        
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Part_NO</th>
                        <th>Product</th>
                        <th>System</th>
                        <th>Created Date</th>
                        <th>Updated At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {props.allParts.map(part => {
                    
                    return <tr key={part.id}>
                        <td>{part.id}</td>
                        <td>{editingID === part.id ? <input 
                                                        name='edit-part' 
                                                        type='text' 
                                                        value={editPartName} 
                                                        onChange={(e) => setEditPartName(e.target.value)} /> : part.part}</td>
                        
                        <td>{part.product}</td>    
                        <td>{part.system}</td>                            
                        <td>{part.created_at}</td>
                        <td>{part.updated_at}</td>
                        <td>
                            {(editingID === part.id) ?
                            <>
                                {<button onClick={() => handleSave(part)}>Save</button>}
                                {<button onClick={() => {setEditingID(null)}}>Cancel</button>}
                            </>
                            :
                            <>
                                {<button onClick={() => handleEdit(part)}>Edit</button>}
                                {/* {<button onClick={() => handleDelete(part.id)}>Delete</button>} */}
                            </>}
                        </td>
                    </tr>
})}
                </tbody>
            </table>
        </section>
    )
}