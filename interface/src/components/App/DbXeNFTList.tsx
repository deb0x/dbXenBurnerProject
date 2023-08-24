import { useContext, useEffect, useState } from "react";
import ChainContext from "../Contexts/ChainContext";
import Moralis from "moralis";
import { useWeb3React } from '@web3-react/core';
import { useNavigate } from 'react-router-dom';
import "../../componentsStyling/dbXeNFTList.scss";

interface DBXENFTEntry {
    id: number;
    description: string
    name: string;
    image: string;
}

export function DbXeNFTList(): any {
    const context = useWeb3React();
    const { account } = context
    const { chain } = useContext(ChainContext);
    const [DBXENFTs, setDBXENFTs] = useState<DBXENFTEntry[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        startMoralis();
        getDBXeNFTs();
    }, [chain])

    const startMoralis = () => {
        Moralis.start({ apiKey: process.env.REACT_APP_MORALIS_KEY_NFT })
            .catch(() => console.log("moralis error"))
    }

    const getDBXeNFTs = () => {
        Moralis.EvmApi.nft.getWalletNFTs({
            chain: chain.chainId,
            format: "decimal",
            normalizeMetadata: true,
            tokenAddresses: [chain.dbxenftAddress],
            address: account ? account : ""
        }).then((result) => {
            
            const response = result.raw;
            console.log(response)
            const resultArray: any = response.result;
            let dbxenftEntries: DBXENFTEntry[] = [];

            if(response) {
                for (let i = 0; i < resultArray?.length; i++) {
                    let result = resultArray[i];
    
                    if(result.normalized_metadata.attributes === null || result.normalized_metadata.attributes.length === 0) {
                        Moralis.EvmApi.nft.reSyncMetadata({
                            chain: chain.chainId,
                            "flag": "uri",
                            "mode": "async",
                            "address": chain.dbxenftAddress,
                            "tokenId": resultArray[i].token_id
                        }).then(() => {
                            Moralis.EvmApi.nft.getNFTMetadata({
                                chain: chain.chainId,
                                "format": "decimal",
                                "normalizeMetadata": true,
                                "mediaItems": false,
                                "address": chain.dbxenftAddress,
                                "tokenId": resultArray[i].token_id
                            }).then((result: any) => {
                                if(result.raw.normalized_metadata.attributes.length > 0) {
                                    dbxenftEntries.push({
                                        id: result.raw.token_id,
                                        name: result.raw.name,
                                        description: result.raw.description,
                                        image: result.raw.image
                                    });
                                }
                            })
                            
                        });
                    } else {
                        dbxenftEntries.push({
                            id: result.token_id,
                            name: result.normalized_metadata.name,
                            description: result.normalized_metadata.description,
                            image: result.normalized_metadata.image
                        });
                    }
                    
                }
                setDBXENFTs(dbxenftEntries);

                console.log(DBXENFTs)
            }
            
        })
    }

    const handleRedirect = (id: any) => {
        navigate(`/your-dbxenfts/${id}`)
    }

    return (
        <div className="content-box">
            <div className="card-view">
                <div className="row g-5">
                    {DBXENFTs.length ?
                        DBXENFTs.map((xenft, i) => (
                            <div className="col col-md-3 card-col" key={i}>
                                <div className="nft-card">

                                <img src={xenft.image} alt="nft-image" />
                                    <div className="card-row card-header">
                                        <span className="label">tokenID</span>
                                        <span className="value">{xenft.id}</span>
                                    </div>
                                    <div className="divider"></div>
                                    <div className="card-row">
                                        <span className="label">name</span>
                                        <span className="value">{xenft.name}</span>
                                    </div>
                                    <div className="card-row">
                                        <span className="label">description</span>
                                        <span className="value">{xenft.description}</span>
                                    </div>
                                    <div className="detail-button-container">
                                        <button type="button" className="btn dbxenft-detail-btn"
                                            onClick={() => handleRedirect(xenft.id)}>
                                            Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) 
                        :
                        <div className="empty-container">
                            <span>You don't have any DBXENFTs</span>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}