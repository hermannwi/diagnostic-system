import { useState, useEffect } from "react"
import SystemInfo from "./SystemInfo"

export default function DiagnosticSection() {

    const [allProducts, setAllProducts] = useState([])
    const [allSystems, setAllSystems] = useState([])
    const [allParts, setAllParts] = useState([])
    const [allRootCauses, setAllRootCauses] = useState([])
    const [allDiagnostic8ds, setAllDiagnostic8ds] = useState([])


    const fetchRootCauses = async () => {
        try {
            const response = await fetch('http://localhost:5001/admin/root-causes')
            const data = await response.json()
            setAllRootCauses(data)
        } catch (error) {
            console.error('Error fetching root causes:', error)
        }
    }
    
    
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

    const fetchParts = async () => {
        try {
            const response = await fetch('http://localhost:5001/admin/parts')
            const data = await response.json()
            setAllParts(data)
        } catch (error) {
            console.error('Error fetching parts:', error)
        }
    }

        useEffect(() => {
            fetchRootCauses()
        }, [])

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
            fetchParts()
        }, [])




    return (
        <div>
            <SystemInfo 
            
            fetchSystems={fetchSystems}
            fetchProducts={fetchProducts}
            fetchParts={fetchParts}
            allDiagnostic8ds={allDiagnostic8ds}
            allSystems={allSystems}
            allRootCauses={allRootCauses}
            />
        </div>
    )
}