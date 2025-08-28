import {useState} from 'react'
import useSystems from '../../hooks/useSystems'

export default function SystemForm(props) {
        const [systemName, setSystemName] = useState('')
        const [editSystemName, setEditSystemName] = useState('')
        const [editingID, setEditingID] = useState(null)


        const {systems, fetchSystems, addSystem, updateSystem} = useSystems()
        
    
    
        const handleSubmit = async (event) => {
            event.preventDefault()
            


            try {
                const systemData = {system: systemName}
                const response = await addSystem(systemData)

                
                if (response.success) {
                    console.log(response.success)
                    setSystemName('')  
                }
            } catch (error) {
                console.error('Error adding system:', error)
            }
        }
    
   
    
        function handleEdit(system) {
                setEditingID(system.id)
                setEditSystemName(system.system)
            }
    
        const handleSave = async (system) => {
            try {
                const systemData = {system_id: system.id, system: editSystemName}
                const response = await updateSystem(systemData)
                
                
                if (response.success) {
                    setSystemName('')  
                    setEditingID(null)
                    
                    
                    
                }
            } catch (error) {
                console.error('Error updating system:', error)
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
                        {systems.map(system => (
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
                                    {/* {<button onClick={() => handleDelete(system.id)}>Delete</button>} */}
                                </>}
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        )
}