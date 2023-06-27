import "../../componentsStyling/dbxenft.scss";
import nftPlaceholder from "../../photos/icons/nft-placeholder.png";

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
            <div className="text-container-nft">
                <div className="upper-container">
                    <div className="card">
                        <img className="card-img-top" src={nftPlaceholder} alt="Card image cap" />
                        <div className="card-body">
                            <h5 className="card-title"> DBXeNFT litepaper </h5>
                            <p className="card-text">
                                Thank you for all the feedback. <br/> 
                                We now have the final version of the lite paper available here.
                            </p>
                            <a href="https://dbxenft-litepaper.gitbook.io/dbxenft/" target="_blank" className="btn">Read the document</a>
                        </div>
                    </div>
                </div>
                <div className="text-down">
                    <p>Fair crypto matters.</p>
                </div>
            </div>
        </>
    );
}