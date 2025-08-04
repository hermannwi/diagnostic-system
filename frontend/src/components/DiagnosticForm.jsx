import { useState } from "react"

export default function DiagnosticForm(props) {
    const [selectedProduct, setSelectedProduct] = useState('')
    const [fromSn, setFromSn] = useState('')
    const [toSn, setToSn] = useState('')
    const [fromVersion, setFromVersion] = useState('')
    const [toVersion, setToVersion] = useState('')
    const [fromSupplyDate, setFromSupplyDate] = useState('')
    const [toSupplyDate, setToSupplyDate] = useState('')
    const [fromSw, setFromSw] = useState('')
    const [toSw, setToSw] = useState('')
    const [issue, setIssue] = useState('')
    const [temporaryFix, setTemporaryFix] = useState('')
    const [rootCause, setRootCause] = useState('')
    const [correctiveAction, setCorrectiveAction] = useState('')
    const [preventativeAction, setPreventativeAction] = useState('')
    const [verifiedFix, setVerifiedFix] = useState(null)
    const [closed, setClosed] = useState(false)
    const [link8d, setLink8d] = useState('')

    const handleVerifiedFix = (newValue) => {
    setVerifiedFix(prev => prev === newValue ? null : newValue); // toggle off if same value
    }

    const handleProductChange = (event) => {
        setSelectedProduct(event.target.value)
    }
    

    return (
    <section className="diagnostic-form">
        <h1>8D report form</h1>
        <form>
            <label htmlFor="product">Product: </label>
            <select name="product" id="product"
                    value={selectedProduct}
                    onChange={handleProductChange}>
                    <option value=''>Select a product...</option>
                    {props.allProducts.map(product => {
                        <option key={product.id} value={product.id}>
                            {product.product}
                        </option>
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

        </form>
    </section>)
}