import { useContext, useEffect, useState } from "react";
import ChainContext from "../Contexts/ChainContext";
import Moralis from "moralis";
import { useWeb3React } from '@web3-react/core';
import { useNavigate } from 'react-router-dom';
import "../../componentsStyling/dbXeNFTList.scss";
import { TablePagination } from '@mui/base/TablePagination';
import nftImage from "../../photos/Nft-dbxen.png";
import { Spinner } from './Spinner';
import { parse, compareAsc } from 'date-fns';

interface DBXENFTEntry {
    id: string;
    description: string
    name: string;
    image: string;
    maturity:string;
}

export function DbXeNFTList(): any {
    const context = useWeb3React();
    const { account } = context
    const { chain } = useContext(ChainContext);
    const [DBXENFTs, setDBXENFTs] = useState<DBXENFTEntry[]>([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false)
    let dbxenftEntries: DBXENFTEntry[] = [];
    let [orderByMaturity, setOrderByMaturity] = useState<boolean>(false)

    useEffect(() => {
        startMoralis();
        getDBXeNFTs();
    }, [chain, account])

    useEffect(() => {
        if (!orderByMaturity) {
            let sortedDBXENFTs = [...DBXENFTs].sort((a: DBXENFTEntry, b: DBXENFTEntry) => {
                let dateA: Date = new Date(a.maturity?.value);
                let dateB: Date = new Date(b.maturity?.value);
                return dateA.getTime() - dateB.getTime();
            });
            console.log(sortedDBXENFTs)
            setDBXENFTs(sortedDBXENFTs);
        } else {
            const sortedDBXENFTs = [...DBXENFTs].sort((a, b) =>
            parseInt(a.id) - parseInt(b.id)
        );
            console.log(sortedDBXENFTs)
            setDBXENFTs(sortedDBXENFTs);
        }
    }, [orderByMaturity]); 

    const startMoralis = () => {
        Moralis.start({ apiKey: process.env.REACT_APP_MORALIS_KEY_NFT })
            .catch(() => console.log("moralis error"))
    }

    const getDBXeNFTs = () => {
        let resultArray: any;
        setLoading(true)

        getWalletNFTsForUser(chain.chainId, chain.dbxenftAddress, null).then(async (getNFTResult: any) => {
            const results = getNFTResult.raw.result;
            let cursor = getNFTResult.raw.cursor;
            if (cursor != null) {
                while (cursor != null) {
                    let newPage: any = await getWalletNFTsForUser(chain.chainId, chain.dbxenftAddress, cursor);
                    cursor = newPage.raw.cursor;
                    if (newPage.result?.length != 0 && newPage.result != undefined) {
                        results?.push(newPage?.raw.result);
                    }
                }
            }
            resultArray = results?.flat();
            const nfts = [];
            console.log(results)
            if (resultArray?.length != 0 && resultArray != undefined) {
                for (let i = 0; i < resultArray?.length; i++) {
                    let resultArrayElement = resultArray[i];
                    if( resultArray[i].token_id === null ||
                        results[i].token_id > "2500" && results[i].token_id < "2525" ||
                        resultArrayElement.normalized_metadata.attributes.length === 0 ||
                        resultArrayElement.normalized_metadata.image === null ||
                        resultArrayElement.normalized_metadata.image.includes("beforeReveal"))
                    {
                        const syncMeta = await Moralis.EvmApi.nft.reSyncMetadata({
                            chain: chain.chainId,
                            "flag": "uri",
                            "mode": "async",
                            "address": chain.dbxenftAddress,
                            "tokenId": resultArray[i].token_id
                        });
                        const nftMeta = await Moralis.EvmApi.nft.getNFTMetadata({
                            chain: chain.chainId,
                            "format": "decimal",
                            "normalizeMetadata": true,
                            "mediaItems": false,
                            "address": chain.dbxenftAddress,
                            "tokenId": resultArray[i].token_id
                        });
                        if (!nftMeta) {
                            continue;
                        }
                        if(nftMeta?.raw?.normalized_metadata?.attributes && nftMeta?.raw?.normalized_metadata?.attributes?.length > 0) {
                            nfts.push({
                                id: nftMeta.raw.token_id,
                                name: nftMeta.raw.name,
                                description: nftMeta.raw.normalized_metadata.description || "",
                                image: nftMeta.raw.normalized_metadata.image || "",
                                maturity: nftMeta.raw.normalized_metadata.attributes[2]
                            });
                        } else {
                            nfts.push({
                                id: nftMeta.raw.token_id,
                                name: "UNREVEALED ARTWORK",
                                description: "",
                                image: nftImage,
                                maturity:""
                            });
                        }
                    } else {
                        nfts.push({
                            id: results[i].token_id,
                            name: results[i].normalized_metadata.name ,
                            description: results[i].normalized_metadata.description,
                            image: results[i].normalized_metadata.image,
                            maturity:results[i].normalized_metadata.attributes[2]
                        });
                    }
                }
            }
            nfts.sort(
                (objA: { maturity: { value: string } }, objB: { maturity: { value: string } }) => {
                    let dateA: Date = new Date(objA.maturity.value);
                    let dateB: Date = new Date(objB.maturity.value);
                    return dateA.getTime() - dateB.getTime();
                }
            );
            setDBXENFTs(nfts);
            setLoading(false);
        })
    }

    async function getWalletNFTsForUser(chain: any, nftAddress: any, cursor: any) {
        let cursorData;
        if (cursor != null)
            cursorData = cursor.toString()
        const response = await Moralis.EvmApi.nft.getWalletNFTs({
            chain: chain,
            format: "decimal",
            cursor: cursorData,
            normalizeMetadata: true,
            tokenAddresses: [nftAddress],
            address: account ? account : ""
        });
        return response;
    }

    const handleRedirect = (id: any) => {
        navigate(`/your-dbxenfts/${id}`)
    }

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(8);

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <div className={`content-box ${loading ? "loading" : ""}`}>
            { loading ? 
                <Spinner color={'white'} /> :
                <div className="card-view">
                      <button className="btn chain-switcher mb-4"
                            type="button"
                            onClick={() => setOrderByMaturity(!orderByMaturity)}>
                                {!orderByMaturity ? "Order by Token ID" : "Order by Maturity Date" }
                        </button>
                    <div className={`row g-5 ${DBXENFTs.length == 0 ? "empty" : ""}`}>
                        {DBXENFTs.length ?
                            (rowsPerPage > 0
                                ? DBXENFTs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                : DBXENFTs
                            ).map((xenft: any, i: any) => (
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
                    { DBXENFTs.length > 0 &&
                        <TablePagination
                            rowsPerPageOptions={[4, 8, 16, { label: 'All', value: -1 }]}
                            colSpan={3}
                            count={DBXENFTs.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            slotProps={{
                                select: {
                                    'aria-label': 'rows per page',
                                },
                                actions: {
                                    showFirstButton: true,
                                    showLastButton: true,
                                },
                            }}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage} />
                    }
                </div>
            }
        </div>
    );
}