import { useState, useEffect } from "react"

export default function useProducts() {
    const [products, setProducts] = useState([])
    const [error, setError] = useState(null)


    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:5001/admin/products')
            const data = await response.json()
            setProducts(data)
            console.log(data)
        } catch (error) {
            console.error('Error fetching products:', error)
        }
    }

    const addProduct = async (productData) => {
        const response = await fetch('http://localhost:5001/admin/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({product: productData.product, system_id: productData.system})  
        })
        
        if (response.ok) {
            return response
            
        }
    }

    return (
        {
            fetchProducts,
            products
        }
    )
}