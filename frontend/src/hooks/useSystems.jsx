import { useState, useEffect } from "react"
import { BASE_URL, API_ENDPOINTS } from '../constants/api'

export default function useSystems() {
    const [systems, setSystems] = useState([])
    
    const fetchSystems = async () => {
        try {
        const response = await fetch(`${BASE_URL}${API_ENDPOINTS.SYSTEMS}`)
        const data = await response.json()
        setSystems(data)
        console.log(data)

        } catch (error) {
            console.error('Error fetching systems:', error)
        }
    }

    const addSystem = async (systemData) => {
        try {
            const response = await fetch(`${BASE_URL}${API_ENDPOINTS.SYSTEMS}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({system: systemData.system})})
                
            if (response.ok) {
                console.log('success')
                const addedSystem = await response.json()
                fetchSystems()
                return { success: true, system: addedSystem }
            }
        } catch (error) {
            console.error('Error adding systems:', error)
        }
    }


    const updateSystem = async (systemData) => {
        try {
            const response = await fetch(`${BASE_URL}${API_ENDPOINTS.SYSTEMS}/${systemData.system_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({system: systemData.system})  // Use state, not FormData
            })
            
            if (response.ok) {
                console.log('success')
                const updatedSystem = response.json()
                fetchSystems()
                return { success: true, system: updatedSystem }
                
                
            }
        } catch (error) {
            console.error('Error adding system:', error)
        }
    }

    useEffect(() => {
        fetchSystems()
    }, [])

    return (
        {
            systems,
            fetchSystems,
            addSystem,
            updateSystem
            
        }
    )
}
