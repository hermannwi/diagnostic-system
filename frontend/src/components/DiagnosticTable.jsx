
export default function DiagnosticTable(props) {
    
    const handleDelete = async (id) => {
        try {
            if (window.confirm('Are you sure you want to delete this item?')) {
                const response = await fetch(`http://localhost:5001/admin/diagnostics8ds/${id}`, {
                method: 'DELETE'
                })
                if (response.ok) {
                    // Refresh products list after successful delete
                    props.fetchDiagnostics() 
                    }
            }
                
            
        } catch (error) {
            console.error('Error deleting 8D diagnostic report:', error)
  }
}
    return <>
    <h1>Diagnostics 8D Table</h1>
                <div className="scroll-box">
                        <table className="diagnostic-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Product Name</th>
                                            <th>From SN</th>
                                            <th>To SN</th>
                                            <th>From Version</th>
                                            <th>To Version</th>
                                            <th>From Supply Date</th>
                                            <th>To Supply Date</th>
                                            <th>From SW</th>
                                            <th>To SW</th>
                                            <th>Issue</th>
                                            <th>Questions</th>
                                            <th>Temporary Fix</th>
                                            <th>Root Cause</th>
                                            <th>Corrective Action</th>
                                            <th>Preventative Action</th>
                                            <th>Verified Fixed</th>
                                            <th>Closed</th>
                                            <th>Link to 8D Report</th>
                                            <th>Created At</th>
                                            <th>Updated At</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {props.allDiagnostic8ds.map(diagnostic8d => {
                                            console.log(diagnostic8d)
                                            console.log('quesiton: ', diagnostic8d.questions )
                                            console.log(diagnostic8d.closed)
                                            console.log(diagnostic8d.verified_fix)
                                        return <tr key={diagnostic8d.id}>
                                            <td>{diagnostic8d.id}</td>
                                            <td>{props.allProducts.find(product => product.id === diagnostic8d.product_id)?.product}</td>
                                            <td>{diagnostic8d.from_sn}</td>  
                                            <td>{diagnostic8d.to_sn}</td> 
                                            <td>{diagnostic8d.from_version}</td> 
                                            <td>{diagnostic8d.to_version}</td> 
                                            <td>{diagnostic8d.from_supply_date}</td> 
                                            <td>{diagnostic8d.to_supply_date}</td>  
                                            <td>{diagnostic8d.from_sw}</td> 
                                            <td>{diagnostic8d.to_sw}</td>     
                                            <td>{diagnostic8d.issue}</td>
                                            <td>
                                                <ul>
                                                    {diagnostic8d.questions && diagnostic8d.questions.map(question => {
                                                        return <li key={question.id}>{question.question}</li>
                                                    })}
                                                </ul>
                                            </td>
                                            <td>{diagnostic8d.temporary_fix}</td>
                                            <td>{diagnostic8d.root_cause_id}</td>   
                                            <td>{diagnostic8d.corrective_action}</td>   
                                            <td>{diagnostic8d.preventative_action}</td>   
                                            <td>
                                                {diagnostic8d.verified_fix === true ? 'Fixed' 
                                                : diagnostic8d.verified_fix === false ? 'Not fixed' 
                                                : 'Undetermined'}
                                            </td>
                                            
                                            <td>{diagnostic8d.closed ? 'Yes' : 'No'}</td>   
                                            <td>{diagnostic8d.link_8d}</td>                          
                                            <td>{diagnostic8d.created_at}</td>
                                            <td>{diagnostic8d.updated_at}</td>
                                            <td><button onClick={() => handleDelete(diagnostic8d.id)}>Delete</button><button>Edit</button></td>
                                        </tr>
} )}
                                    </tbody>
                                </table>
                            </div>
                    </>
        }