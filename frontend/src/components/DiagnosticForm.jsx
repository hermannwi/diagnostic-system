import { useState } from "react"


export default function DiagnosticForm(props) {
    const [selectedProduct, setSelectedProduct] = useState('')
    
    const [fromSn, setFromSn] = useState('12')
    const [toSn, setToSn] = useState('12')
    const [fromVersion, setFromVersion] = useState('12')
    const [toVersion, setToVersion] = useState('12')
    const [fromSupplyDate, setFromSupplyDate] = useState('12')
    const [toSupplyDate, setToSupplyDate] = useState('12')
    const [fromSw, setFromSw] = useState('12')
    const [toSw, setToSw] = useState('12')
    const [issue, setIssue] = useState('issue')
    const [question, setQuestion] = useState('')
    const [allQuestions, setAllQuestions] = useState([])
    const [temporaryFix, setTemporaryFix] = useState('temp')
    const [rootCause, setRootCause] = useState('cause')
    const [correctiveAction, setCorrectiveAction] = useState('cor')
    const [preventativeAction, setPreventativeAction] = useState('cor')
    const [verifiedFix, setVerifiedFix] = useState(null)
    const [closed, setClosed] = useState(false)
    const [link8d, setLink8d] = useState('link')

    const handleVerifiedFix = (newValue) => {
    setVerifiedFix(prev => prev === newValue ? null : newValue); // toggle off if same value
    }

    const handleProductChange = (event) => {
        setSelectedProduct(event.target.value)
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        try {
            const rootCauseResponse = await fetch('http://localhost:5001/admin/root-causes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({root_cause: rootCause})
            })

            var rootCauseId = null
            if (rootCauseResponse.ok) {
                const rootCauseData =  await rootCauseResponse.json() 
                console.log(rootCauseData)
                rootCauseId = rootCauseData.id
            }
            
            const response = await fetch('http://localhost:5001/admin/diagnostics8ds', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    product: selectedProduct,
                    from_sn: fromSn,
                    to_sn: toSn,
                    from_version: fromVersion,
                    to_version: toVersion,
                    from_supply_date: fromSupplyDate,
                    to_supply_date: toSupplyDate,
                    from_sw: fromSw,
                    to_sw: toSw,
                    issue: issue,
                    temporary_fix: temporaryFix,
                    root_cause_id: rootCauseId,
                    corrective_action: correctiveAction,
                    preventative_action: preventativeAction,
                    verified_fix: verifiedFix,
                    closed: closed,
                    link_8d: link8d
                })
            })
            if (response.ok) {
            
            
                const data = await response.json() 
                const diagnostic8dId = data['id']
                console.log('--------------+++++++')
                console.log(diagnostic8dId)
                submitQuestion(diagnostic8dId)
            
            

            
            setSelectedProduct('')
            setFromSn('')
            setToSn('')
            setFromVersion('')
            setToVersion('')
            setToSupplyDate('')
            setFromSupplyDate('')
            setToSw('')
            setFromSw('')
            setIssue('')
            setTemporaryFix('')
            setRootCause('')
            setCorrectiveAction('')
            setPreventativeAction('')
            setVerifiedFix(null)
            setClosed(false)
            setLink8d('')
            props.fetchDiagnostics()  
        }
            else {
                const errorData = await response.json();
                console.log(errorData);
            }


        } catch (error) {
            console.error('Error adding 8d:', error)
        }
        


    }

    const submitQuestion = async (id) => {
        try {
            for (var i=0; i<allQuestions.length; i++) {
            const response = await fetch(`http://localhost:5001/admin/diagnostics8ds/${id}/questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({question: allQuestions[i].question})
            }) 
            if (response.ok) {
                setAllQuestions([])
            }
        }
        } catch (error) {
            console.error('Error adding question(s):', error)
        }
        
    }
    
    function addQuestion(event) {
        event.preventDefault()
        const questionObj = {
            id: Math.random().toString(16).slice(2),
            question: question
        }
        setAllQuestions(prev => [...prev, questionObj])
        
        setQuestion('')

    }

    function handleDeleteQuestion(id) {
        const newArray= allQuestions.filter(question => question.id !== id)
        setAllQuestions(newArray)
    }

    return (
    <section className="diagnostic-form">
        <h1>8D report form</h1>
        <form onSubmit={handleSubmit} method='post'>
            <label htmlFor="product">Product: </label>
            <select name="product" id="product"
                    value={selectedProduct}
                    onChange={handleProductChange}>
                    <option value=''>Select a product...</option>
                    {props.allProducts.map(product => {
                        return (<option key={product.id} value={product.id}>
                            {product.product}
                        </option>)
                    })}
                    </select>

            <label htmlFor="from_sn">From SN: </label>
            <input type="text" name="from_sn" id="from_sn"
                   value={fromSn}
                   onChange={(e) => setFromSn(e.target.value)}/>

            <label htmlFor="to_sn">To SN: </label>
            <input type="text" name="to_sn" id="to_sn"
                   value={toSn}
                   onChange={(e) => setToSn(e.target.value)}/>
                   

            <label htmlFor="from_version">From Version: </label>
            <input type="text" name="from_version" id="from_version"
                   value={fromVersion}
                   onChange={(e) => setFromVersion(e.target.value)}/>

            <label htmlFor="to_version">To Version: </label>
            <input type="text" name="to_version" id="to_version"
                   value={toVersion}
                   onChange={(e) => setToVersion(e.target.value)} />

            <label htmlFor="from_supply_date">From Supply Date: </label>
            <input type="text" name="from_supply_date" id="from_supply_date"
                   value={fromSupplyDate}
                   onChange={(e) => setFromSupplyDate(e.target.value)}/>

            <label htmlFor="to_supply_date">To Supply Date: </label>
            <input type="text" name="to_supply_date" id="to_supply_date"
                   value={toSupplyDate}
                   onChange={(e) => setToSupplyDate(e.target.value)}/>

            <label htmlFor="from_sw">From SW: </label>
            <input type="text" name="from_sw" id="from_sw"
                   value={fromSw}
                   onChange={(e) => setFromSw(e.target.value)}/>

            <label htmlFor="to_sw">To SW: </label>
            <input type="text" name="to_sw" id="to_sw"
                   value={toSw}
                   onChange={(e) => setToSw(e.target.value)}/>

            <label htmlFor="issue">Issue: </label>
            <input type="text" name="issue" id="issue"
                   value={issue}
                   onChange={(e) => setIssue(e.target.value)}/>
            
            <label htmlFor="question">Add Questions: </label>
            <input type="text"  name="question" id="question"
                   value={question} onChange={(e) => setQuestion(e.target.value)}/>
                    {<button disabled={question === '' ? true : false} className="add-question-button" type='button' onClick={addQuestion}>ADD</button>}
            <ol>
                {allQuestions.map(question => {
                    return <li key={question.id}>{question.question} <button onClick={() => handleDeleteQuestion(question.id)}>Delete</button></li>
                })}
            </ol>

            <label htmlFor="temporary_fix">Temporary Fix: </label>
            <input type="text" name="temporary_fix" id="temporary_fix"
                   value={temporaryFix}
                   onChange={(e) => setTemporaryFix(e.target.value)}/>

            <label htmlFor="root_cause">Root Cause: </label>
            <input type="text" name="root_cause" id="root_cause"
                   value={rootCause}
                   onChange={(e) => setRootCause(e.target.value)}/>

            <label htmlFor="corrective_action">Corrective Action: </label>
            <input type="text" name="corrective_action" id="corrective_action"
                   value={correctiveAction}
                   onChange={(e) => setCorrectiveAction(e.target.value)}/>

            <label htmlFor="preventative_action">Preventative Action: </label>
            <input type="text" name="preventative_action" id="preventative_action"
                   value={preventativeAction}
                   onChange={(e) => setPreventativeAction(e.target.value)}/>

            <label htmlFor="link_8d">Link 8D Report: </label>
            <input type="text" name="link_8d" id="link_8d"
                   value={link8d}
                   onChange={(e) => setLink8d(e.target.value)}/>
            <div className="last-part">
                <h3>Verified Fix:</h3>
                <label htmlFor="verified_fix-yes">Yes:</label>
                <input
                    type="checkbox"
                    name="verified_fix"
                    id="verified_fix-yes"
                    checked={verifiedFix === true}
                    onChange={() => handleVerifiedFix(true)}
                />

                <label htmlFor="verified_fix-no">No:</label>
                <input
                    type="checkbox"
                    name="verified_fix"
                    id="verified_fix-no"
                    checked={verifiedFix === false}
                    onChange={() => handleVerifiedFix(false)}
                />
                
            
            
            



            </div>

            <label htmlFor="closed" className='closed'>Closed: </label>
            <input type="checkbox" name="closed" id="closed"
                   value={closed}
                   checked={closed} onChange={() => {
                    setClosed(prev => !prev)
                   }}/>
        <button>ADD</button>
        </form>
    </section>)
}