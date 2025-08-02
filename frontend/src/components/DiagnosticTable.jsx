
export default function DiagnosticTable(props) {
    return <table className="diagnostic-table">
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
                        <th>Temporary Fix</th>
                        <th>Root Cause</th>
                        <th>Corrective Action</th>
                        <th>Preventative Action</th>
                        <th>Verified Fix</th>
                        <th>Closed</th>
                        <th>Link to 8D Report</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {props.allDiagnostic8ds.map(diagnostic8d => (
                    <tr key={diagnostic8d.id}>
                        <td>{diagnostic8d.id}</td>
                        <td>{diagnostic8d.product_id.product}</td>
                        <td>{diagnostic8d.from_sn}</td>  
                        <td>{diagnostic8d.to_sn}</td> 
                        <td>{diagnostic8d.from_version}</td> 
                        <td>{diagnostic8d.to_version}</td> 
                        <td>{diagnostic8d.from_supply_date}</td> 
                        <td>{diagnostic8d.to_supply_date}</td>  
                        <td>{diagnostic8d.from_sw}</td> 
                        <td>{diagnostic8d.to_sw}</td>     
                        <td>{diagnostic8d.temporary_fix}</td>
                        <td>{diagnostic8d.root_cause_id}</td>   
                        <td>{diagnostic8d.corrective_action}</td>   
                        <td>{diagnostic8d.preventative_action}</td>   
                        <td>{diagnostic8d.verified_fix}</td>   
                        <td>{diagnostic8d.closed}</td>   
                        <td>{diagnostic8d.link_8d}</td>                          
                        <td>{diagnostic8d.created_at}</td>
                        <td>{diagnostic8d.updated_at}</td>
                    </tr>
                    ))}
                </tbody>
            </table>
}