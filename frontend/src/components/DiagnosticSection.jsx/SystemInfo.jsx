import { useState } from "react"

export default function SystemInfo(props) {
    const [selectedSystem, setSelectedSystem] = useState('')
    const [selectedIssue, setSelectedIssue] = useState('')
    const [selectedRootCause, setSelectedRootCause] = useState('')
    const [questions, setQuestions] = useState([])
    
    const fetchQuestions = async () => {
        try {
            const response = await fetch('http://localhost:5001/diagnostics/questions/<int:id>')
            const data = await response.json()
            setQuestions(data)
        } catch (error) {
            console.error('Error fetching questions:', error)
        }
    }

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
                    {props.allDiagnostic8ds.filter(diagns => diagns.system_id === Number(selectedSystem))
                    .map(diagns => {
                        return (<option key={diagns.id} value={diagns.id}>
                            {diagns.issue}
                        </option>)
                    })}
                    </select>
            <button onClick={fetchQuestions}>OK</button>
    </form>
    <div>
        <ul>
            {props.allDiagnostic8ds.filter(diagns => diagns.id === Number(selectedIssue))
            .map(diagns => {
                const rootCause = props.allRootCauses?.find(rc => rc.id === diagns.root_cause_id)
                
                return <li key={rootCause.id}>{rootCause.root_cause || 'No root cause specified'}</li>
            })}
        </ul>
    </div>
    <div>
        <ul>
            
        </ul>
    </div>
    </div>)
}