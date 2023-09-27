import { useContext, useEffect, useState } from "react";
import ChainContext from "../Contexts/ChainContext";
import Moralis from "moralis";
import { useWeb3React } from '@web3-react/core';
import { useNavigate } from 'react-router-dom';
import "../../componentsStyling/dbXeNFTList.scss";
import { TablePagination } from '@mui/base/TablePagination';
import nftImage from "../../photos/Nft-dbxen.png";
import { Spinner } from './Spinner';

interface DBXENFTEntry {
    id: string;
    description: string
    name: string;
    image: string;
    maturity: string;
}

export function DbXeNFTList(): any {
    const context = useWeb3React();
    const { account } = context
    const { chain, setChain } = useContext(ChainContext);
    const [DBXENFTs, setDBXENFTs] = useState<DBXENFTEntry[]>([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false)
    let dbxenftEntries: DBXENFTEntry[] = [];
    let [orderByMaturity, setOrderByMaturity] = useState<boolean>(false)
    const [showOGDBXeNFT, setShowDBXeNFT] = useState<boolean>(false)

    useEffect(() => {
        startMoralis();
        getDBXeNFTs();
        console.log(showOGDBXeNFT)
    }, [chain, account])

    useEffect(() => {
        if (!orderByMaturity) {
            const sortedDBXENFTs = [...DBXENFTs].sort((a: DBXENFTEntry, b: DBXENFTEntry) => {
                    let dateA: Date = new Date(a.maturity);
                    let dateB: Date = new Date(b.maturity);
                    return dateA.getTime() - dateB.getTime();
            });
            setDBXENFTs(sortedDBXENFTs);
        } else {
            const sortedDBXENFTs = [...DBXENFTs].sort((a, b) =>
                parseInt(a.id) - parseInt(b.id)
            );
            setDBXENFTs(sortedDBXENFTs);
        }
    }, [orderByMaturity]);

    const startMoralis = () => {
        Moralis.start({ apiKey: process.env.REACT_APP_MORALIS_KEY_NFT })
            .catch(() => console.log("moralis error"))
    }

    useEffect(() => {
        showOGDBXeNFT ?
            setChain({
                deb0xAddress: "0x4F3ce26D9749C0f36012C9AbB41BF9938476c462",
                deb0xViewsAddress: "0x93CC648eE2fBf366DD5d8D354C0946bE6ee4936c",
                deb0xERC20Address: "0x47DD60FA40A050c0677dE19921Eb4cc512947729",
                xenCryptoAddress: "0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e",
                dbxenftFactoryAddress: "0xDeD0C0cBE8c36A41892C489fcbE659773D137C0e",
                dbxenftAddress: "0x618f9B6d3D1a55Eb90D72e4747d61AE6ecE95f97",
                xenftAddress: "0x726bB6aC9b74441Eb8FB52163e9014302D4249e5",
                mintInfoAddress: "0x2B7B1173e5f5a1Bc74b0ad7618B1f87dB756d7d4",
                chainId: 137,
                chainName: "polygon",
                currency: "MATIC",
                priceURL: "https://polygon-mainnet.infura.io/v3/6010818c577b4531b1886965421a91d3",
                dxnTokenName: "mDXN"
            }) :
            setChain({
                deb0xAddress: "0x4F3ce26D9749C0f36012C9AbB41BF9938476c462",
                deb0xViewsAddress: "0x93CC648eE2fBf366DD5d8D354C0946bE6ee4936c",
                deb0xERC20Address: "0x47DD60FA40A050c0677dE19921Eb4cc512947729",
                xenCryptoAddress: "0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e",
                dbxenftFactoryAddress: "0xAb2ff1CE92D377AeB58ECf1De209bbCd7d6e0152",
                dbxenftAddress: "0x2899557a09CFcE900afd76F399DeF9375FA909c9",
                xenftAddress: "0x726bB6aC9b74441Eb8FB52163e9014302D4249e5",
                mintInfoAddress: "0x2B7B1173e5f5a1Bc74b0ad7618B1f87dB756d7d4",
                chainId: 137,
                chainName: "polygon",
                currency: "MATIC",
                priceURL: "https://polygon-mainnet.infura.io/v3/6010818c577b4531b1886965421a91d3",
                dxnTokenName: "mDXN"
            })
    }, [showOGDBXeNFT])

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
                    if (resultArray[i].token_id === null ||
                        results[i].token_id > "2500" && results[i].token_id < "2525" ||
                        resultArrayElement.normalized_metadata.attributes.length === 0 ||
                        resultArrayElement.normalized_metadata.image === null ||
                        resultArrayElement.normalized_metadata.image.includes("beforeReveal")) {
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
                        if (nftMeta?.raw?.normalized_metadata?.attributes && nftMeta?.raw?.normalized_metadata?.attributes?.length > 0) {
                            nfts.push({
                                id: nftMeta.raw.token_id,
                                name: nftMeta.raw.name,
                                description: nftMeta.raw.normalized_metadata.description || "",
                                image: nftMeta.raw.normalized_metadata.image || "",
                                maturity: nftMeta.raw.normalized_metadata.attributes[2].value
                            });
                        } else {
                            nfts.push({
                                id: nftMeta.raw.token_id,
                                name: "UNREVEALED ARTWORK",
                                description: "",
                                image: nftImage,
                                maturity: ""
                            });
                        }
                    } else {
                        nfts.push({
                            id: results[i].token_id,
                            name: results[i].normalized_metadata.name,
                            description: results[i].normalized_metadata.description,
                            image: results[i].normalized_metadata.image,
                            maturity: results[i].normalized_metadata.attributes[2].value
                        });
                    }
                }
            }
            console.log(nfts)
            nfts.sort((a: DBXENFTEntry, b: DBXENFTEntry) => {
                let dateA: Date = new Date(a.maturity);
                let dateB: Date = new Date(b.maturity);
                return dateA.getTime() - dateB.getTime();
            });
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
            {loading ?
                <Spinner color={'white'} /> :
                <div className="card-view">
                    <button className="btn chain-switcher mb-4"
                        type="button"
                        onClick={() => setOrderByMaturity(!orderByMaturity)}>
                        {!orderByMaturity ? "Order by Token ID" : "Order by Maturity Date"}
                    </button>
                    { chain.chainId == "137" ? 
                        <button className="btn chain-switcher mb-4"
                            type="button"
                            onClick={() => setShowDBXeNFT(!showOGDBXeNFT)}>
                                {!showOGDBXeNFT ? "OG DBXeNFTs on Polygon" : "DBXeNFTs on Polygon" }
                        </button> : <></>
                    }
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
                    {DBXENFTs.length > 0 &&
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