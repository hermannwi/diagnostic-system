import { useEffect, useState } from "react"

export default function SystemInfo(props) {
    const [selectedSystem, setSelectedSystem] = useState('')
    const [selectedIssue, setSelectedIssue] = useState('')
    const [issues, setIssues] = useState([])
    const [selectedRootCause, setSelectedRootCause] = useState('')
    const [questions, setQuestions] = useState([])
    const [rootCauses, setRootCauses] = useState([])

   
    console.log('selected_issues',selectedIssue)
    
    const fetchRootCauses = async () => {

        try {
            const response = await fetch(`http://localhost:5001/diagn/root-causes/${selectedIssue}`)
            const data = await response.json()
            setRootCauses(data)
        } catch (error) {
            console.error('Error fetching root causes:', error)
        }
    }

    const fetchIssues = async () => {
        
        try {
            const response = await fetch(`http://localhost:5001/diagn/issues/${Number(selectedSystem)}`)
            const data = await response.json()
            setIssues(data)
        } catch (error) {
            console.error('Error fetching issues:', error)
        }
    }

    useEffect(() => {
    if (selectedSystem) {
        fetchIssues()
    } else {
        setIssues([])  // Clear issues if no system selected
    }
}, [selectedSystem])

    
    return (
    <div>
    <h1>System Info</h1>
    <form className="system-info"> 
        
        <label htmlFor="system">System: </label>
            <select name="system" id="system"
                    value={selectedSystem}
                    onChange={(event) => setSelectedSystem(event.target.value)}>
                    <option value=''>Select a system...</option>
                    {props.allSystems.map(system => {
                        return (<option key={system.id} value={system.id}>
                            {system.system}
                        </option>)
                    })}
                    </select>

            <label htmlFor="issue">Issue: </label>
            
                    <select name="issue" id="issue"
                    value={selectedIssue}
                    onChange={(event) => setSelectedIssue(event.target.value)}>
                    <option value=''>Select an issue...</option>
                    {issues.map(issue => {return <option key={Math.floor(Math.random() * 10)}>{issue.issue}</option>})}
                    </select>
            <button onClick={(event) => {
                event.preventDefault()
                if (selectedIssue) {
                    fetchRootCauses()
                }
            }}>OK</button>
    </form>
    <div>
        <ul>
            {rootCauses.map(rc => {
                return <li key={rc.id}>{rc.root_cause}</li>
            })}
        </ul>
    </div>
    <div>
        <ul>
            
        </ul>
    </div>
    </div>)
}