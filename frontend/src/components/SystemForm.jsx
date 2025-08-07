import {useState} from 'react'

export default function SystemForm(props) {
        const [systemName, setSystemName] = useState('')
        const [editSystemName, setEditSystemName] = useState('')
        const [editingID, setEditingID] = useState(null)
    
    
        const handleSubmit = async (event) => {
            event.preventDefault()
            
            try {
                const response = await fetch('http://localhost:5001/admin/systems', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({system: systemName})  
                })
                
                if (response.ok) {
                    setSystemName('')  
                    console.log('success')
                    props.fetchSystems()
                    
                }
            } catch (error) {
                console.error('Error adding system:', error)
            }
        }
    
        const handleDelete = async (systemId) => {
            try {
                if (window.confirm('Are you sure you want to delete this item?')) {
                    const response = await fetch(`http://localhost:5001/admin/systems/${systemId}`, {
                    method: 'DELETE'
                    })
                    if (response.ok) {
                        // Refresh products list after successful delete
                        props.fetchSystems() // or whatever your refresh function is called
                        }
                }
                    
                
                
            } catch (error) {
                console.error('Error deleting system:', error)
      }
    }
    
        function handleEdit(system) {
                setEditingID(system.id)
                setEditSystemName(system.system)
            }
    
        const handleSave = async (system) => {
            try {
                const response = await fetch(`http://localhost:5001/admin/systems/${system.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({system: editSystemName})  // Use state, not FormData
                })
                
                if (response.ok) {
                    setSystemName('')  
                    setEditingID(null)
                    props.fetchSystems()
                    console.log('success')
                    
                }
            } catch (error) {
                console.error('Error adding system:', error)
            }
        }
        
    
        
            
        
        return (
            <section>
                <h1>System Form</h1>
                <form onSubmit={handleSubmit} method='post'>
                    <label htmlFor="system">System: </label>
                    <input className='system-input'
                    id='system'
                    type="text"
                    name='system'
                    value={systemName}
                    onChange={(e) => setSystemName(e.target.value)}
                    
                />
                <button>ADD</button>
                    
                </form>
                            
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>System Name</th>
                            <th>Created Date</th>
                            <th>Updated At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.allSystems.map(system => (
                        <tr key={system.id}>
                            <td>{system.id}</td>
                            <td>{editingID === system.id ? <input 
                                                            name='edit-system' 
                                                            type='text' 
                                                            value={editSystemName} 
                                                            onChange={(e) => setEditSystemName(e.target.value)} /> : system.system}</td>
                                                            
                            <td>{system.created_at}</td>
                            <td>{system.updated_at}</td>
                            <td>
                                {(editingID === system.id) ?
                                <>
                                    {<button onClick={() => handleSave(system)}>Save</button>}
                                    {<button onClick={() => {setEditingID(null)}}>Cancel</button>}
                                </>
                                :
                                <>
                                    {<button onClick={() => handleEdit(system)}>Edit</button>}
                                    {<button onClick={() => handleDelete(system.id)}>Delete</button>}
                                </>}
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        )
}