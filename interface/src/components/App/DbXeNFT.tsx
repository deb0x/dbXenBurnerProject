import "../../componentsStyling/dbxenft.scss";

export function DbXeNFT(): any {
    return (
        <>
            <div className="table-view table-responsive-xl">
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">Token ID</th>
                            <th scope="col">Status</th>
                            <th scope="col">VMUs</th>
                            <th scope="col">Term (days)</th>
                            <th scope="col">Maturiy</th>
                            <th scope="col">EAA</th>
                            <th scope="col">cRank</th>
                            <th scope="col">AMP</th>
                            <th scope="col">xenBurned</th>
                            <th scope="col">Category</th>
                            <th scope="col">Class</th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody>
                    <tr key="key">
                        <td>id</td>
                        <td>status</td>
                        <td>VMUs</td>
                        <td>term</td>
                        <td>maturity</td>
                        <td>EAA</td>
                        <td>cRank</td>
                        <td>AMP</td>
                        <td>xenBurned</td>
                        <td>category</td>
                        <td>class</td>
                        <td>
                            <button
                                className="detail-btn"
                                type="button"
                            >
                                Details
                            </button>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <div className="text-container">
                <div className="text-content">
                    <p>Fair crypto matters. We have taken a pause to think.</p> 
                    <p>We encourage you to do the same!</p>
                </div>
            </div>
        </>
    );
}